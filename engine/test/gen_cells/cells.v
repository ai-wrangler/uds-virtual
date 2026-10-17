// gen.py cell coverage: word-level operators the UDS-1x1 netlist does not use (yet), so that a new
// chip revision can rely on them. engine/test/gen_cells/run.sh compares gen.py's C++ with Yosys CXXRTL.
// SPDX-License-Identifier: Apache-2.0
`default_nettype none
module tt_um_ai_wrangler_uds1x1 (
    input  wire [7:0] ui_in, output wire [7:0] uo_out,
    input  wire [7:0] uio_in, output wire [7:0] uio_out, output wire [7:0] uio_oe,
    input  wire ena, input wire clk, input wire rst_n
);
  reg signed [15:0] a, b;
  reg        [15:0] u;
  reg signed [21:0] acc;
  reg        [7:0]  h;
  wire signed [15:0] sx = {{8{ui_in[7]}}, ui_in};
  wire [3:0] sh = uio_in[3:0];
  wire signed [15:0] sra  = a >>> sh;
  wire signed [15:0] sla  = b <<< uio_in[7:5];
  wire        [15:0] srl  = u >> sh;
  wire signed [15:0] ng   = -a;
  wire signed [21:0] pr   = a[10:0] * $signed(uio_in);
  wire [15:0]        prU  = u[7:0] * ui_in;
  wire               lt   = a < b, le = a <= b, gt = a > b, ge = a >= b;
  wire               ugt  = u > {ui_in, uio_in}, uge = u >= {uio_in, ui_in};
  wire               rx   = ^u, rxn = ~^a;
  wire [15:0]        xn   = u ~^ a;
  always @(posedge clk) begin
    if (!rst_n) begin
      a <= 0; b <= 0; u <= 0; acc <= 0; h <= 0;
    end else begin
      a   <= a + sx - (b >>> 3);
      b   <= gt ? b + {uio_in, ui_in} : b - sra;
      u   <= {u[14:0], u[15] ^ u[13] ^ ui_in[0]} + (uge ? prU : srl);
      acc <= acc + pr - (lt ? 22'sd100 : -22'sd77) + (le ? ng : sla);
      h   <= {h[6:0], ^h} ^ {lt, le, gt, ge, ugt, uge, rx, rxn} ^ xn[7:0] ^ acc[21:14];
    end
  end
  assign uo_out  = h ^ sra[7:0];
  assign uio_out = acc[7:0] ^ ng[15:8] ^ sla[15:8];
  assign uio_oe  = 8'hF0;
  wire _unused = &{ena, 1'b0};
endmodule
