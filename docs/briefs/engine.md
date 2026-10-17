# Brief: engine

**Goal:** the chip's real Verilog, simulated clock by clock, as a WebAssembly module with the JS API in
CONTRACT.md section 3. It must be fast enough to play live and proven bit-exact against the Python model.

You own `engine/` and `app/engine/`. Read `engine/NOTES.md` first: it has measured speeds of four
simulator setups, the tricks behind them, and the toolchain facts for this environment.

## Deliverables (branch `engine`)

1. **`engine/build.sh`**
   - One command takes `chip/src/*.v` to `app/engine/uds_engine.wasm` and installs what it needs:
     - `apt-get install -y yosys verilator`;
     - `pip install --break-system-packages ziglang`.
   - Commit the generated C++ and the `.wasm`, so the site and CI need no toolchain.
2. **`engine/harness.cc`** (draft provided; keep its structure, improve it)
   - The demo board around the chip:
     - a 6 MHz clock and reset;
     - a virtual RP2040 that sends queued SPI messages with SCK = clk/8 and waits for BUSY low before each
       message;
     - an Audio Pmod model: the 1s on the audio pin are averaged per frame, then go through 5 Hz AC coupling,
       an RC low-pass and a 32-tap windowed-sinc resampler from 62.5 kHz to the output rate.
   - Add latches for `takeActivity()`: BUSY seen, CS seen, HITs sent.
3. **`app/engine/uds-engine.js`**
   - The loader and wrapper, exactly as in CONTRACT section 3, plus a JSDoc comment for each member.
   - WASI imports: enumerate `WebAssembly.Module.imports(module)` and stub each one with a function returning
     0. For a reactor build, call `_initialize` before anything else.
   - No `TextDecoder` is needed in the AudioWorklet scope.
4. **`engine/test/`**: Node tests (`node --test`), plus a Python helper that drives `chip/model/uds_model.py`.
   - **Model check.** The per-frame count of 1s on the audio pin from the WASM engine must equal the model's
     for a scripted HIT sequence.
     - The sequence covers all 8 channels, parameter corners (pitch 0 and 255, sweep 0..7, decay 0..13,
       balance 0 and 15, level 0 and 15), voice stealing with 3 or more overlapping hits, the hi-hat group,
       STOP, and back-to-back HITs paced by BUSY.
     - Run at least 200 000 frames.
     - The alignment rules are in `chip/test/test.py` and `chip/test/tb.v`. Frame k is the samples taken at
       the ends of cycles k*FRAME+1 .. (k+1)*FRAME. A HIT acts at a frame computed from the cycle of its last
       SCK rising edge; take the exact formula from `test.py`.
     - Have the harness report the cycle of each HIT's last SCK rising edge, so the test can feed the model
       exactly.
     - Also check READ ID (0xD5) and VERSION (0x12) through MISO.
   - **Cross-check.** If you build more than one backend, compare them cycle by cycle (uo_out and uio_out on
     every clock) for at least 10 M clocks of random SPI traffic.
   - **Speed benchmark.** Report MHz of chip clock in Node.
   - **API test.** Render sizes, a full queue, reset, `takeActivity`, and loading from bytes, from a Module
     and from a URL.
   - Commit a small fixture for the integration session's browser test: `engine/test/fixtures/model_frames.json`,
     with a HIT schedule and the expected per-frame counts from the model.
5. **`engine/README.md`**: how it works, how to rebuild, how it is verified, and measured speeds.

## Plan, in this order

1. **First 60 to 75 minutes: a correct engine, end to end.**
   - CXXRTL with the one-eval-per-clock trick compiles with zig as is: the runtime is header-only and
     vendored. Get the model check passing.
   - Open the PR as soon as the API works, so the audio part can wire up the real engine. Note the speed in
     the PR.
2. **Speed.** The target is at least 3x real time in Chrome on Juris's laptop, which means roughly 12 MHz or
   more in Node in this environment. Candidates, best guess first:
   - **(a) Verilator with one eval per clock**, compiled to wasm32-wasi with zig. This needs a shim for
     `std::mutex`, `std::thread` and `VL_CPU_RELAX`, or a trimmed `verilated.cpp`.
   - **(b) A small generator from Yosys `write_json` to straight-line C.** The netlist has 236 cells of 26
     types. Emit one `step()` per clock, keep state in plain integers, and compile it freestanding.
   - **(c) Harness tuning:**
     - a tight inner loop over whole frames while the SPI is idle;
     - no per-clock calls through accessors;
     - `-O3`, `-flto`.

   Keep the backends selectable at build time. Ship the fastest one that passes the model check and the
   cross-check. `engine.backend` names the one in use.
3. **Keep the PR description current** with speeds per backend and test results.

## Notes

- Output scale: map the frame average of the pin (0..96 ones) to -1..1 around mid-scale (48), as the draft
  does. The audio part applies the 3x make-up gain.
- `render(n)` must return exactly n samples; at 48 kHz that is about 1.3 frames per sample.
- Memory: keep everything static. No growth of WASM memory while rendering.
- If time runs short, a verified engine that is slower than you hoped is worth much more than a fast
  unverified one.
