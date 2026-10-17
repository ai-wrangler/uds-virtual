#include "Vtt_um_ai_wrangler_uds1x1.h"
#include "verilated.h"
#include "Vtt_um_ai_wrangler_uds1x1___024root.h"
#include <cstdint>
#define EXPORT(name) extern "C" __attribute__((export_name(#name)))
static Vtt_um_ai_wrangler_uds1x1 *top;
static uint8_t uio_in = 1;
static double cycles = 0;
static inline void cyc() { top->uio_in = uio_in; top->clk = 1; top->eval(); top->clk = 0; top->rootp->__Vtrigprevexpr___TOP__clk__0 = 0; cycles++; }
EXPORT(init) void init() { top = new Vtt_um_ai_wrangler_uds1x1; top->ena = 1; top->rst_n = 0; for (int i = 0; i < 4; i++) cyc(); top->rst_n = 1; }
EXPORT(run) int run(int n) { int ones = 0; for (int i = 0; i < n; i++) { cyc(); ones += top->uo_out >> 7; } return ones; }
EXPORT(hit) void hit() { /* bit-bang one HIT: bass drum */
  uint8_t b[4] = {0x18 | 4, 20, 9 << 4 | 6, 1 << 4 | 15};
  auto pin = [](int p, int v) { uio_in = (uio_in & ~(1 << p)) | ((v & 1) << p); };
  pin(0, 0); for (int k = 0; k < 4; k++) cyc();
  for (int i = 0; i < 32; i++) { pin(3, 0); pin(1, (b[i >> 3] >> (7 - (i & 7))) & 1); for (int k = 0; k < 4; k++) cyc(); pin(3, 1); for (int k = 0; k < 4; k++) cyc(); }
  pin(3, 0); for (int k = 0; k < 4; k++) cyc(); pin(0, 1); for (int k = 0; k < 4; k++) cyc(); }
