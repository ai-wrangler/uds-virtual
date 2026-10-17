# Engine notes from the setup session

Starting material for the engine part. `harness.cc` is a working draft; the benchmark sources are in `bench/`.

## Measured speed (native x86-64, Intel Xeon 2.8 GHz vCPU, 6 M clocks with two HITs)

| Backend | Clocking | Chip clock simulated | vs real time |
| --- | --- | --- | --- |
| CXXRTL (Yosys 0.33 `write_cxxrtl -O6`) | `step()` at both edges | 3.1 to 4.2 MHz | 0.5x to 0.7x |
| CXXRTL | one `eval()` + `commit()` per clock (`FAST_CLOCK`, below) | 6.6 MHz | 1.1x |
| Verilator 5.020 `-O3` | `eval()` at both edges | 8.5 MHz | 1.4x |
| Verilator | one `eval()` per clock (trigger trick, below) | 11.6 MHz | 1.9x |

All of them gave the same output. The user's laptop (Ryzen 7 8845HS, Zen 4, up to 5.1 GHz) is probably
1.5x to 2x faster per thread than this vCPU, and WebAssembly costs about 1.2x to 1.8x against native code.

- CXXRTL fast clock: `p_clk.set(true); eval(); commit(); p_clk.set(false); prev_p_clk = p_clk;`. This skips
  the falling-edge evaluation. The outputs read after `commit()` were computed before the edge, so they lag by
  one clock compared with two `step()` calls: shift the frame alignment to match the model.
- Verilator one-eval: `clk = 1; eval(); clk = 0; rootp->__Vtrigprevexpr___TOP__clk__0 = 0;` (needs the
  `___024root.h` header). The outputs are settled after the rising edge, as with two evals.
- Verilator to wasm32-wasi with `python3 -m ziglang c++` fails: `verilated.h` needs `std::mutex`,
  `std::thread` and `VL_CPU_RELAX`, which zig's single-threaded wasi libc++ does not have. A shim header
  (`-include`) or a trimmed runtime should fix it. The first zig compile for wasm takes about 90 s while it
  builds libc++; later builds are cached.
- The flattened netlist is small: 236 word-level cells after
  `proc; flatten; opt -full; wreduce; opt_clean; memory; opt -full`, of 26 types ($add $and $dff $dffe $eq $le
  $logic_and $logic_not $logic_or $lt $mux $ne $not $or $pmux $reduce_and $reduce_bool $reduce_or $sdff $sdffce
  $sdffe $shiftx $shl $shr $sub $xor). A generator from `write_json` to straight-line C (one function per clock,
  state in plain integers) could beat both.

## Tools in this environment

- `apt-get install -y yosys verilator` works (Yosys 0.33, Verilator 5.020). The apt Yosys has no CXXRTL
  runtime headers: they are vendored in `third_party/cxxrtl/` (from the yosys-0.33 tag, ISC license); compile
  with `-I engine/third_party/cxxrtl`.
- `pip install --break-system-packages ziglang` provides `python3 -m ziglang c++ -target wasm32-wasi
  -mexec-model=reactor` (zig 0.17.0 was used here).
- Node 22 is installed; Chromium for Playwright is in /opt/pw-browsers.
