#include "Vtt_um_ai_wrangler_uds1x1.h"
#include "verilated.h"
#include "Vtt_um_ai_wrangler_uds1x1___024root.h"
#include <chrono>
#include <cstdio>
#include <cstdint>
static Vtt_um_ai_wrangler_uds1x1 *top;
static uint8_t uio_in = 1;
static uint64_t cycles = 0;
#ifdef ONE_EVAL
static inline void cyc() { top->uio_in = uio_in; top->clk = 1; top->eval(); top->clk = 0; top->rootp->__Vtrigprevexpr___TOP__clk__0 = 0; cycles++; }
#else
static inline void cyc() { top->uio_in = uio_in; top->clk = 1; top->eval(); top->clk = 0; top->eval(); cycles++; }
#endif
struct Msg { int len; uint8_t b[4]; };
static Msg q[16]; static int qh = 0, qt = 0;
enum S { IDLE, SETUP, LOW, HIGH, HOLD, GAP }; static S st = IDLE; static int w = 0, bit = 0; static Msg cur;
static inline void pin(int p, int v) { uio_in = (uio_in & ~(1 << p)) | ((v & 1) << p); }
static void spi() {
  if (w > 0) { w--; return; }
  bool busy = (top->uio_out >> 5) & 1;
  switch (st) {
    case IDLE: if (qh != qt && !busy) { cur = q[qh]; qh = (qh + 1) % 16; pin(0, 0); st = SETUP; w = 3; bit = 0; } break;
    case SETUP: case HIGH:
      if (st == HIGH && bit == cur.len * 8) { pin(3, 0); st = HOLD; w = 3; break; }
      pin(3, 0); pin(1, (cur.b[bit >> 3] >> (7 - (bit & 7))) & 1); st = LOW; w = 3; break;
    case LOW: pin(3, 1); bit++; st = HIGH; w = 3; break;
    case HOLD: pin(0, 1); st = GAP; w = 3; break;
    case GAP: st = IDLE; break;
  }
}
static void send(uint8_t a, uint8_t b, uint8_t c, uint8_t d) { q[qt] = {4, {a, b, c, d}}; qt = (qt + 1) % 16; }
int main(int argc, char **argv) {
  Verilated::commandArgs(argc, argv);
  top = new Vtt_um_ai_wrangler_uds1x1;
  top->ena = 1; top->ui_in = 0; top->rst_n = 0;
  for (int i = 0; i < 4; i++) cyc();
  top->rst_n = 1; cycles = 0;
  long ones = 0; long frames_sum = 0;
  auto t0 = std::chrono::steady_clock::now();
  for (int f = 0; f < 62500; f++) {
    if (f % 15625 == 0) send(0x18 | 4, 20, 9 << 4 | 6, 1 << 4 | 15);
    if (f % 15625 == 7800) send(0x18 | 0, 80, 7 << 4 | 4, 11 << 4 | 13);
    int c1 = 0;
    for (int c = 0; c < 96; c++) { spi(); cyc(); c1 += (top->uo_out >> 7) & 1; }
    ones += c1; frames_sum += (c1 != 48);
  }
  double s = std::chrono::duration<double>(std::chrono::steady_clock::now() - t0).count();
  printf("verilator: cycles %llu time %.3f s -> %.2f MHz (%.2fx real time); ones %ld, non-silent frames %ld\n",
         (unsigned long long)cycles, s, cycles / s / 1e6, cycles / s / 6e6, ones, frames_sum);
  delete top;
}
