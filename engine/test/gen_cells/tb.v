// Icarus Verilog testbench for run.sh: the same random inputs as driver.cc, pins printed before each edge.
// SPDX-License-Identifier: Apache-2.0
`timescale 1ns/1ns
module tb;
  reg clk = 0, rst_n = 0; reg [7:0] ui = 0, uio = 0; wire [7:0] uo, uioo, oe;
  tt_um_ai_wrangler_uds1x1 d(.ui_in(ui), .uo_out(uo), .uio_in(uio), .uio_out(uioo), .uio_oe(oe),
                             .ena(1'b1), .clk(clk), .rst_n(rst_n));
  reg [63:0] x = 64'd88172645463325252; integer c, n;
  initial begin
    if (!$value$plusargs("N=%d", n)) n = 200000;
    for (c = 0; c < n; c = c + 1) begin
      x = x ^ (x << 13); x = x ^ (x >> 7); x = x ^ (x << 17);
      rst_n = !(c < 4 || x[63:60] == 0); ui = x[7:0]; uio = x[15:8];
      #1; $display("%0d %h%h", c, uioo, uo); clk = 1; #1; clk = 0;
    end
  end
endmodule
