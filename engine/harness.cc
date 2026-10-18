// UDS-1x1 browser simulator: the chip's Verilog, simulated clock by clock.
//
// The chip itself comes from one of the backends (backend_*.h), each generated
// from chip/src/*.v by engine/build.sh. This file wraps it in what the demo
// board provides: a 6 MHz clock, reset, an RP2040 that sends SPI messages and
// waits for BUSY, and an Audio Pmod that turns the 1-bit audio pin into sound.
//
// Pin timing (the same as chip/test/tb.v): cycle 0 is the cycle that ends with
// the first rising edge after reset. Inputs set for cycle c are sampled by the
// edge that ends it. "The pins during cycle c" are the outputs after the edge
// that ends cycle c - 1; every backend's clock() leaves exactly those in
// backend::uo / backend::uio. Frame k is the pins during cycles
// k*FRAME+1 .. (k+1)*FRAME (the audio pin carries the sigma-delta carry of
// the cycle before).
//
// SPDX-License-Identifier: Apache-2.0

#include <cmath>
#include <cstdint>
#include <cstring>

#if defined(BACKEND_VERILATOR)
#include "backend_verilator.h"
#elif defined(BACKEND_GEN)
#include "backend_gen.h"
#else
#include "backend_cxxrtl.h"
#endif

#define EXPORT(name) extern "C" __attribute__((export_name(#name)))

namespace {

// Chip variants set these with -D (build.sh v3): clocks per audio frame, chip clock, longest SPI message.
// The defaults are the UDS-1x1 (v1, v2): 2 voices x 48 clocks, 6 MHz, 4-byte messages. Such builds also
// set UDS_EXPORT_SHAPE, which exports sim_clock_hz / sim_frame_clocks / sim_msg_max / sim_log_stride (the
// v1 and v2 builds stay byte-identical; uds-engine.js assumes the defaults when those exports are missing).
#ifndef UDS_FRAME
#define UDS_FRAME 96
#endif
#ifndef UDS_CLOCK_HZ
#define UDS_CLOCK_HZ 6000000.0
#endif
#ifndef UDS_MSG_MAX
#define UDS_MSG_MAX 4
#endif
#if defined(AUDIO_SINC3) && UDS_FRAME != 96
#error "AUDIO_SINC3 assumes 96-clock frames"
#endif
constexpr int FRAME = UDS_FRAME;     // clocks per audio frame
constexpr int HALF = 4;              // SPI: clocks per SCK half period (SCK = clk / 8)
constexpr double CLOCK_HZ = UDS_CLOCK_HZ;
constexpr int MSG_MAX = UDS_MSG_MAX;
#if UDS_MSG_MAX > 4
typedef uint64_t RxWord;             // MISO shift register: up to 8 bytes
#else
typedef uint32_t RxWord;
#endif

uint64_t cycles = 0;                 // clocks since reset = number of the next cycle
uint32_t frames = 0;                 // complete frames since reset
int fpos = 0;                        // cycles of the current frame already counted (0..FRAME-1)
int ones = 0;                        // 1s on the audio pin in the current frame
int last_frame_ones = 48;            // 1s in the last complete frame
#ifdef AUDIO_SINC3
int m1 = 0, m2 = 0;                  // sum of j and of j^2 over the 1s of the current frame (j = 0..95)
#endif
uint8_t uio_in = 0x01;               // CS high

// takeActivity() latches
uint8_t uio_or = 0;                  // OR of uio_out over all cycles since the last take
int cs_seen = 0;                     // CS went low
int hits_sent = 0;                   // HIT messages completed

// ---- the virtual RP2040: a queue of messages sent over SPI --------------
struct Message {
  uint8_t len;
  uint8_t bytes[MSG_MAX];
};
constexpr int QUEUE = 256;           // ring buffer: holds QUEUE - 1 messages
Message queue[QUEUE];
int q_head = 0, q_tail = 0;

// A log of finished messages for the tests: the cycle of the last SCK rising
// edge (the cycle in which SCK is driven high for the last bit) and the bytes
// sent and read back on MISO.
struct LogEntry {
  double last_sck;                   // cycle number (a double keeps the JS side simple)
  uint32_t sent;                     // bytes, first byte in bits 7:0
  uint32_t recv;
  uint32_t len;
  uint32_t pad;
#if UDS_MSG_MAX > 4
  uint32_t sent_hi;                  // bytes 4..7
  uint32_t recv_hi;
#endif
};
constexpr int LOG = 1024;
LogEntry log_buf[LOG];
int log_count = 0;                   // entries since the last sim_log_take

// SPI state machine, advanced once per clock before the clock.
enum State { IDLE, CS_SETUP, BIT_LOW, BIT_HIGH, CS_HOLD, CS_GAP };
State st = IDLE;
int wait = 0, bit = 0;
RxWord rx = 0;
uint64_t last_rise = 0;
Message cur;

// The RP2040 polls the pins as they were during the previous cycle.
uint8_t seen_uio = 0;

inline bool busy() { return (seen_uio >> 5) & 1; }
#ifdef UDS_HOST_WINDOW
inline bool spi_idle() { return st == IDLE && q_head == q_tail; }
#else
inline bool spi_idle() { return st == IDLE && wait == 0 && q_head == q_tail; }
#endif

inline void set_pin(int pin, int v) { uio_in = (uio_in & ~(1 << pin)) | ((v & 1) << pin); }

#ifdef UDS_HOST_WINDOW
// UDS v3 host (tt-uds-v3 model/uds3_model.py, class Host: "the standard host, as the tests and the browser
// twin drive the chip"): at most one byte per voice window of WIN clocks. A byte goes out in the first window
// that starts with BUSY low: CS low (for the whole message), GAP clocks into the window, 8 bits at
// SCK = clk / SCK_DIV (MOSI changes with SCK low, the chip samples on the rising edge). CS goes high after the
// last byte of a message. So every byte of a HIT waits for BUSY low, as CONTRACT 1 requires.
constexpr int WIN = FRAME / 2, GAP = 8, SCK_DIV = 6;
int h_byte = 0;                       // byte of cur being sent
bool h_active = false;                // a byte is on the wire in this window
void spi_tick() {
  const int pos = int(cycles % WIN);
  // The host decides on the window's second clock: the BUSY it reads then (the pins of the clock before) is
  // the BUSY of the new window, and a message queued between two frames (render, runFrames) is in time for
  // the window that starts the next frame, as in the model's run().
  if (pos == 1 && !h_active) {
    if (st == IDLE && q_head != q_tail && !busy()) {          // a new message
      cur = queue[q_head];
      q_head = (q_head + 1) % QUEUE;
      st = BIT_LOW; h_byte = 0; rx = 0; bit = 0;
      set_pin(0, 0);                                         // CS low
      cs_seen = 1;
      h_active = true;
    } else if (st != IDLE && !busy()) {                       // the next byte of the current message
      h_active = true;
    }
    return;
  }
  if (!h_active) return;
  const int k = pos - GAP;
  if (k < 0) return;
  const int b = k / SCK_DIV, ph = k % SCK_DIV;
  if (b < 8) {
    if (ph == 0) {                                           // SCK low, next MOSI bit
      set_pin(3, 0);
      set_pin(1, (cur.bytes[h_byte] >> (7 - b)) & 1);
    } else if (ph == SCK_DIV / 2) {                          // MISO read just before SCK rises
      rx = (rx << 1) | ((seen_uio >> 2) & 1);
      set_pin(3, 1);
      last_rise = cycles;
      bit++;
    }
    return;
  }
  if (b == 8 && ph == 0) {                                   // the byte is done
    set_pin(3, 0);
    h_active = false;
    if (++h_byte < cur.len) return;                          // more bytes: wait for the next window
    set_pin(0, 1);                                           // CS high after the last byte
    if ((cur.bytes[0] & 0xF8) == 0x18) hits_sent++;
    if (log_count < LOG) {
      LogEntry &e = log_buf[log_count++];
      e.last_sck = double(last_rise);
      e.sent = 0; e.recv = 0;
#if UDS_MSG_MAX > 4
      e.sent_hi = 0; e.recv_hi = 0;
#endif
      for (int i = 0; i < cur.len; i++) {
        uint32_t sb = cur.bytes[i], rb = uint32_t((rx >> (8 * (cur.len - 1 - i))) & 0xFF);
#if UDS_MSG_MAX > 4
        if (i >= 4) { e.sent_hi |= sb << (8 * (i - 4)); e.recv_hi |= rb << (8 * (i - 4)); continue; }
#endif
        e.sent |= sb << (8 * i); e.recv |= rb << (8 * i);
      }
      e.len = cur.len;
    }
    st = IDLE;
  }
}
#else
void spi_tick() {
  if (wait > 0) { wait--; return; }
  switch (st) {
    case IDLE:
      if (q_head != q_tail && !busy()) {
        cur = queue[q_head];
        q_head = (q_head + 1) % QUEUE;
        set_pin(0, 0);                       // CS low
        cs_seen = 1;
        st = CS_SETUP; wait = HALF - 1; bit = 0; rx = 0;
      }
      break;
    case CS_SETUP:
    case BIT_HIGH:
      if (st == BIT_HIGH && bit == cur.len * 8) {
        set_pin(3, 0);                       // SCK low after the last bit
        st = CS_HOLD; wait = HALF - 1;
        break;
      }
      set_pin(3, 0);                         // SCK low, next MOSI bit
      set_pin(1, (cur.bytes[bit >> 3] >> (7 - (bit & 7))) & 1);
      st = BIT_LOW; wait = HALF - 1;
      break;
    case BIT_LOW:
      // MISO is read just before SCK rises (mode 0)
      rx = (rx << 1) | ((seen_uio >> 2) & 1);
      set_pin(3, 1);                         // SCK rises: the chip samples MOSI
      last_rise = cycles;
      bit++;
      st = BIT_HIGH; wait = HALF - 1;
      break;
    case CS_HOLD: {
      set_pin(0, 1);                         // CS high
      if ((cur.bytes[0] & 0xF8) == 0x18) hits_sent++;
      if (log_count < LOG) {
        LogEntry &e = log_buf[log_count++];
        e.last_sck = double(last_rise);
        e.sent = 0; e.recv = 0;
#if UDS_MSG_MAX > 4
        e.sent_hi = 0; e.recv_hi = 0;
        for (int i = 0; i < cur.len; i++) {
          uint32_t sb = cur.bytes[i], rb = uint32_t((rx >> (8 * (cur.len - 1 - i))) & 0xFF);
          if (i < 4) { e.sent |= sb << (8 * i); e.recv |= rb << (8 * i); }
          else { e.sent_hi |= sb << (8 * (i - 4)); e.recv_hi |= rb << (8 * (i - 4)); }
        }
#else
        for (int i = 0; i < cur.len; i++) {
          e.sent |= uint32_t(cur.bytes[i]) << (8 * i);
          e.recv |= ((rx >> (8 * (cur.len - 1 - i))) & 0xFF) << (8 * i);
        }
#endif
        e.len = cur.len;
      }
      st = CS_GAP; wait = HALF - 1;
      break;
    }
    case CS_GAP:
      st = IDLE;                             // the next message waits for BUSY low
      break;
  }
}

#endif  // UDS_HOST_WINDOW

// ---- the Audio Pmod: averaging, AC coupling, RC filter, resampling --------
constexpr int MAX_OUT = 8192;
constexpr int OUT_SLACK = 16;
float out_buf[MAX_OUT + OUT_SLACK];
int out_count = 0;                   // samples ready in out_buf
float carry_buf[OUT_SLACK];          // samples made beyond the last request
int carry = 0;
double dc = 0.0;                     // AC-coupling capacitor (high-pass ~5 Hz)
double dc_alpha = 0.0;
double rc = 0.0;                     // RC low-pass state
double rc_alpha = 1.0;               // 1.0 = filter off
double filter_hz = 15900.0;
double out_rate = 48000.0;
double phase = 0.0;                  // resampler position in input samples
double phase_step = 1.0;
constexpr int TAPS = 32, PHASES = 64;
float kernel[PHASES + 1][TAPS];
constexpr int HIST = 64;             // power of two
float hist[HIST * 2];                // doubled so a window never wraps
int hist_pos = 0;

constexpr double FS_IN = CLOCK_HZ / FRAME;

void build_kernel() {
  // Windowed sinc, cutoff at 0.45 x the lower of the two rates.
  double ratio = out_rate / FS_IN;
  double fc = 0.45 * (ratio < 1.0 ? ratio : 1.0) * 2.0;   // relative to fs_in Nyquist
  for (int p = 0; p <= PHASES; p++) {
    double frac = double(p) / PHASES;
    double sum = 0.0;
    double k[TAPS];
    for (int t = 0; t < TAPS; t++) {
      double x = (t - TAPS / 2 + 1) - frac;
      double s = (x == 0.0) ? fc : std::sin(M_PI * fc * x) / (M_PI * x);
      double w = 0.5 + 0.5 * std::cos(M_PI * x / (TAPS / 2));  // Hann
      if (std::fabs(x) >= TAPS / 2) w = 0.0;
      k[t] = s * w;
      sum += s * w;
    }
    for (int t = 0; t < TAPS; t++) kernel[p][t] = float(k[t] / sum);
  }
}

#ifdef AUDIO_SINC3
// sinc^3 decimator (three cascaded 96-clock boxcars, a CIC of order 3) in place of the plain count of 1s
// per frame, for chip variants whose 1-bit stream has strong noise near multiples of the frame rate (the
// 2nd-order sigma-delta): the plain count (one boxcar) aliases that noise into the audio band. Its
// impulse response h[n], n = 0..3R-3 (n = clocks before the last clock of the newest frame), is quadratic within
// each of the three frames it spans, so a frame's contribution is c0*S0 + c1*S1 + c2*S2 with the frame's
// moments S0 = sum b_j, S1 = sum j b_j, S2 = sum j^2 b_j. Scaled so that all 1s give FRAME.
double sinc3_c[3][3];                // [frame age 0..2][power of j]
int sinc3_h[3][3];                   // moments of the two previous frames (and the current one)
inline double cic3(int n) {          // h[n] of three boxcars of length FRAME
  const int R = FRAME;
  if (n < 0 || n > 3 * R - 1) return 0;           // h[3R-2] = h[3R-1] = 0 come out of the formula
  double v = (n + 1.0) * (n + 2.0) / 2;
  if (n >= R) v -= 3.0 * (n - R + 1.0) * (n - R + 2.0) / 2;
  if (n >= 2 * R) v += 3.0 * (n - 2 * R + 1.0) * (n - 2 * R + 2.0) / 2;
  return v;
}
void sinc3_init() {
  const double norm = double(FRAME) * FRAME;          // sum of h = R^3; all 1s -> R
  for (int age = 0; age < 3; age++) {
    // weight of the bit at position j of a frame this many frames old: h[(age + 1) * R - 1 - j]
    double h0 = cic3((age + 1) * FRAME - 1), h1 = cic3((age + 1) * FRAME - 2), h2 = cic3((age + 1) * FRAME - 3);
    double c2 = (h2 - 2 * h1 + h0) / 2, c1 = h1 - h0 - c2;
    sinc3_c[age][0] = h0 / norm; sinc3_c[age][1] = c1 / norm; sinc3_c[age][2] = c2 / norm;
  }
  // history: the idle pattern 0101... (1s at odd j)
  for (int a = 0; a < 3; a++) { sinc3_h[a][0] = 48; sinc3_h[a][1] = 2304; sinc3_h[a][2] = 147440; }
}
inline double sinc3_push(int s0, int s1, int s2) {
  for (int k = 0; k < 3; k++) { sinc3_h[2][k] = sinc3_h[1][k]; sinc3_h[1][k] = sinc3_h[0][k]; }
  sinc3_h[0][0] = s0; sinc3_h[0][1] = s1; sinc3_h[0][2] = s2;
  double y = 0;
  for (int a = 0; a < 3; a++)
    y += sinc3_c[a][0] * sinc3_h[a][0] + sinc3_c[a][1] * sinc3_h[a][1] + sinc3_c[a][2] * sinc3_h[a][2];
  return y;
}
#endif

void set_filter(double hz) {
  filter_hz = hz;
  rc_alpha = hz <= 0.0 ? 1.0 : 1.0 - std::exp(-2.0 * M_PI * hz / FS_IN);
}

// One frame done: turn its count of 1s into a sample and resample it.
void frame_done(int n) {
  last_frame_ones = n;
  frames++;
#ifdef AUDIO_SINC3
  double x = (sinc3_push(n, m1, m2) - FRAME / 2) / double(FRAME / 2);
  m1 = 0; m2 = 0;
#else
  double x = (n - FRAME / 2) / double(FRAME / 2);     // -1..1, mid-scale = 0
#endif
  dc += (x - dc) * dc_alpha;                          // AC coupling
  x -= dc;
  rc += (x - rc) * rc_alpha;                          // RC low-pass
  float v = float(rc);
  hist[hist_pos] = v;
  hist[hist_pos + HIST] = v;
  hist_pos = (hist_pos + 1) & (HIST - 1);
  // emit every output sample that falls before this input sample
  while (phase < 1.0) {
    if (out_count < MAX_OUT + OUT_SLACK) {
      double pos = phase * PHASES;
      int p = int(pos);
      float a = float(pos - p);
      const float *h = &hist[hist_pos + HIST - TAPS];
      const float *k0 = kernel[p], *k1 = kernel[p + 1];
      float acc0 = 0.0f, acc1 = 0.0f;
      for (int t = 0; t < TAPS; t++) {
        acc0 += h[t] * k0[t];
        acc1 += h[t] * k1[t];
      }
      out_buf[out_count++] = acc0 + a * (acc1 - acc0);
    }
    phase += phase_step;
  }
  phase -= 1.0;
}

// ---- the clock loop --------------------------------------------------------

// One cycle with the SPI controller running.
inline void cycle_spi() {
  spi_tick();
  backend::clock(uio_in);
  uint8_t u = backend::uio;
  seen_uio = u;
  uio_or |= u;
  if (cycles != 0) {
    ones += backend::uo >> 7;
#ifdef AUDIO_SINC3
    if (backend::uo >> 7) { m1 += fpos; m2 += fpos * fpos; }
#endif
    if (++fpos == FRAME) {
      fpos = 0;
      int n = ones;
      ones = 0;
      frame_done(n);
    }
  }
  cycles++;
}

// Run until the end of the current frame. While the SPI is idle the inputs
// do not change, so the loop is just the clock and the audio count.
void run_to_frame_end() {
  if (cycles == 0) cycle_spi();
  for (;;) {
    if (spi_idle()) {
#ifdef BACKEND_HAS_FRAME_IDLE
      // a whole frame from its first cycle (cycle number = 1 mod FRAME)
      if (fpos == 0) {
        int n = 0;
        uint8_t o = uio_or;
#ifdef AUDIO_SINC3
        if (backend::frame_idle(uio_in, n, o, m1, m2)) {
#else
        if (backend::frame_idle(uio_in, n, o)) {
#endif
          uio_or = o;
          seen_uio = backend::uio;
          cycles += FRAME;
          ones = 0;
          frame_done(n);
          return;
        }
      }
#endif
      int left = FRAME - fpos;
      int n = ones;
      uint8_t o = uio_or;
      const uint8_t in = uio_in;
      for (int i = 0; i < left; i++) {
        backend::clock(in);
        n += backend::uo >> 7;
#ifdef AUDIO_SINC3
        if (backend::uo >> 7) { m1 += fpos + i; m2 += (fpos + i) * (fpos + i); }
#endif
        o |= backend::uio;
      }
      seen_uio = backend::uio;
      uio_or = o;
      cycles += left;
      fpos = 0;
      ones = 0;
      frame_done(n);
      return;
    }
    uint32_t f = frames;
    cycle_spi();
    if (frames != f) return;
  }
}

void do_reset(double rate) {
  if (rate > 0) out_rate = rate;
  build_kernel();
#ifdef AUDIO_SINC3
  sinc3_init();
  m1 = 0; m2 = 0;
#endif
  phase_step = FS_IN / out_rate;
  dc_alpha = 2.0 * M_PI * 5.0 / FS_IN;
  set_filter(filter_hz);
  backend::init();
  uio_in = 0x01;
  backend::set_rst_n(false);
  for (int i = 0; i < 4; i++) backend::clock(uio_in);
  backend::set_rst_n(true);
  cycles = 0; frames = 0; ones = 0; fpos = 0; last_frame_ones = 48;
  q_head = q_tail = 0; st = IDLE; wait = 0; bit = 0;
#ifdef UDS_HOST_WINDOW
  h_active = false; h_byte = 0;
#endif
  seen_uio = backend::uio; uio_or = 0; cs_seen = 0; hits_sent = 0;
  log_count = 0;
  dc = rc = 0.0; phase = 0.0;
  out_count = 0; carry = 0;
  std::memset(hist, 0, sizeof(hist));
}

}  // namespace

// ---- exported API ---------------------------------------------------------
EXPORT(sim_backend_id) int sim_backend_id() { return BACKEND_ID; }

EXPORT(sim_reset) void sim_reset(double rate) { do_reset(rate); }

EXPORT(sim_sample_rate) double sim_sample_rate() { return out_rate; }

// Analog filter cutoff in Hz (0 = off).
EXPORT(sim_set_filter) void sim_set_filter(double hz) { set_filter(hz); }

EXPORT(sim_send) int sim_send(int len, int b0, int b1, int b2, int b3) {
  int next = (q_tail + 1) % QUEUE;
  if (next == q_head || len < 1 || len > 4) return 0;
  Message &m = queue[q_tail];
  m.len = uint8_t(len);
  m.bytes[0] = uint8_t(b0); m.bytes[1] = uint8_t(b1);
  m.bytes[2] = uint8_t(b2); m.bytes[3] = uint8_t(b3);
  q_tail = next;
  return 1;
}

#if UDS_MSG_MAX > 4
// Messages longer than 4 bytes: write the bytes to sim_msg_ptr(), then call sim_send_buf(len).
uint8_t msg_in[MSG_MAX];
EXPORT(sim_msg_ptr) uint8_t *sim_msg_ptr() { return msg_in; }
EXPORT(sim_send_buf) int sim_send_buf(int len) {
  int next = (q_tail + 1) % QUEUE;
  if (next == q_head || len < 1 || len > MSG_MAX) return 0;
  Message &m = queue[q_tail];
  m.len = uint8_t(len);
  for (int i = 0; i < len; i++) m.bytes[i] = msg_in[i];
  q_tail = next;
  return 1;
}
#endif
#ifdef UDS_EXPORT_SHAPE
EXPORT(sim_clock_hz) double sim_clock_hz() { return CLOCK_HZ; }
EXPORT(sim_frame_clocks) int sim_frame_clocks() { return FRAME; }
EXPORT(sim_msg_max) int sim_msg_max() { return MSG_MAX; }
EXPORT(sim_log_stride) int sim_log_stride() { return int(sizeof(LogEntry)); }
#endif

EXPORT(sim_queue_len) int sim_queue_len() {
  return (q_tail - q_head + QUEUE) % QUEUE + (st != IDLE ? 1 : 0);
}

// Run until n audio samples (at the output rate) are ready; returns n.
// The samples are at sim_out_ptr().
EXPORT(sim_run) int sim_run(int n) {
  if (n < 1) n = 1;
  if (n > MAX_OUT) n = MAX_OUT;
  out_count = carry;
  for (int i = 0; i < carry; i++) out_buf[i] = carry_buf[i];
  while (out_count < n) run_to_frame_end();
  carry = out_count - n;
  for (int i = 0; i < carry; i++) carry_buf[i] = out_buf[n + i];
  return n;
}

// Run whole frames and return the 1s of the last one (for the model check).
// If the current frame is part done, the first "frame" ends at its boundary.
EXPORT(sim_run_frames) int sim_run_frames(int n) {
  for (int f = 0; f < n; f++) {
    out_count = 0;
    run_to_frame_end();
  }
  out_count = 0;
  return last_frame_ones;
}

// Run exactly n clocks (for the cross-check); returns nothing.
EXPORT(sim_run_cycles) void sim_run_cycles(int n) {
  for (int i = 0; i < n; i++) {
    cycle_spi();
    out_count = 0;
  }
}

// Ones of each frame, for tests: runs n frames and writes their counts to
// sim_counts_ptr() (n <= 8192).
uint8_t counts_buf[8192];
EXPORT(sim_counts_ptr) uint8_t *sim_counts_ptr() { return counts_buf; }
EXPORT(sim_run_counts) int sim_run_counts(int n) {
  if (n > 8192) n = 8192;
  for (int f = 0; f < n; f++) {
    out_count = 0;
    run_to_frame_end();
    counts_buf[f] = uint8_t(last_frame_ones);
  }
  out_count = 0;
  return n;
}

// Trace of the pins for the cross-check: runs n clocks and writes
// uo_out | uio_out << 8 of each to sim_trace_ptr() (n <= 8192).
uint16_t trace_buf[8192];
EXPORT(sim_trace_ptr) uint16_t *sim_trace_ptr() { return trace_buf; }
EXPORT(sim_run_trace) int sim_run_trace(int n) {
  if (n > 8192) n = 8192;
  for (int i = 0; i < n; i++) {
    cycle_spi();
    out_count = 0;
    trace_buf[i] = uint16_t(backend::uo | (backend::uio << 8));
  }
  return n;
}

// takeActivity(): bit 0 BUSY seen high, bit 1 CS seen low, bits 8.. HITs sent.
EXPORT(sim_take_activity) int sim_take_activity() {
  int r = ((uio_or >> 5) & 1) | (cs_seen << 1) | (hits_sent << 8);
  uio_or = 0;
  cs_seen = !(uio_in & 1);
  hits_sent = 0;
  return r;
}

EXPORT(sim_log_ptr) LogEntry *sim_log_ptr() { return log_buf; }
EXPORT(sim_log_count) int sim_log_count() { return log_count; }
EXPORT(sim_log_clear) void sim_log_clear() { log_count = 0; }

EXPORT(sim_out_ptr) float *sim_out_ptr() { return out_buf; }
EXPORT(sim_uo_out) int sim_uo_out() { return backend::uo; }
EXPORT(sim_uio_out) int sim_uio_out() { return backend::uio; }
EXPORT(sim_cycles) double sim_cycles() { return double(cycles); }
EXPORT(sim_frames) double sim_frames() { return double(frames); }

#ifdef AUDIO_SINC3
// Which decimator turns the audio pin into samples: 3 = sinc^3 (this build), absent = the count per frame.
EXPORT(sim_audio_order) int sim_audio_order() { return 3; }
#endif
