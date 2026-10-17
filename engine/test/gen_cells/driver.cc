// Native driver for run.sh: prints the pins (uio_out, uo_out) before every clock edge for random inputs,
// from gen.py's C++ (column 2) and from Yosys CXXRTL (column 3). Same input sequence as tb.v.
// SPDX-License-Identifier: Apache-2.0
#include <cstdio>
#include <cstdlib>
#include "cells_gen.h"
#include "cells_cxxrtl.cc"
int main(int argc, char **argv) {
  const long N = argc > 1 ? atol(argv[1]) : 200000;
  cxxrtl_design::p_tt__um__ai__wrangler__uds1x1 r;
  uint64_t x = 88172645463325252ull;
  gen::in_ena = 1; gen::in_clk = 1; r.p_ena.set<bool>(true);
  for (long c = 0; c < N; c++) {
    x ^= x << 13; x ^= x >> 7; x ^= x << 17;
    bool rst = c < 4 || (x >> 60) == 0;
    uint8_t ui = x & 255, uio = (x >> 8) & 255;
    gen::in_rst_n = !rst; gen::in_ui_in = ui; gen::in_uio_in = uio;
    gen::step();
    r.p_rst__n.set<bool>(!rst); r.p_ui__in.set<uint8_t>(ui); r.p_uio__in.set<uint8_t>(uio);
    r.p_clk.set<bool>(true); r.eval(); r.commit(); r.p_clk.set<bool>(false); r.prev_p_clk = r.p_clk;
    unsigned g = unsigned(gen::S.out_uo_out) | unsigned(gen::S.out_uio_out) << 8;
    unsigned w = r.p_uo__out.get<uint8_t>() | unsigned(r.p_uio__out.get<uint8_t>()) << 8;
    printf("%ld %04x %04x\n", c, g, w);
  }
  return 0;
}
