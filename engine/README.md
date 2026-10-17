# UDS-1x1 engine: the chip's Verilog in WebAssembly

`app/engine/uds_engine.wasm` + `app/engine/uds-engine.js` are the chip `tt_um_ai_wrangler_uds1x1`
(`chip/src/*.v`) on its demo board, simulated clock by clock at 6 MHz. The API is in CONTRACT.md section 3.

## Measured speed

The test plays a bass drum and a snare every 250 ms and a closed hat every 100 ms, rendered in 480-sample
blocks at 48 kHz (`node engine/test/bench.mjs engine/wasm/*.wasm`; Chromium: `engine/test/browser/run.cjs`).
It ran on a 2.8 GHz Xeon vCPU in a cloud sandbox. Juris's Ryzen 7 8845HS should be faster per thread.

| Backend | Node 22 | Headless Chromium 141 (main thread / Worker) | Real time |
| --- | --- | --- | --- |
| **gen** (shipped) | **152 MHz** | **165 / 169 MHz** | **25x to 28x** |
| cxxrtl | 25 MHz | n/a | 4.2x |

While messages are on the SPI bus, the gen backend runs its generic per-clock path at about 26 MHz. That path
covers about 400 clocks per HIT, so it does not change the averages above.

The 6 MHz real-time figure is a hard requirement. The other speeds in `engine/NOTES.md` are native figures
from the setup session.

### The 2nd-order DAC preview (`uds_engine_sd2.wasm`)

The same test in the same sandbox, run back to back (`node engine/test/bench.mjs app/engine/*.wasm`): the as-built
engine 64 to 68 MHz, the sd2 engine 51 MHz (8.5x real time; about 22 % slower, with a wider DAC loop in the
netlist). That sandbox was about 2.3x slower than the one in the table, so on Juris's machine the sd2 build
should run at about 120 MHz (20x real time). Chromium truth test: 17.8 to 31.5 MHz on `runFrames(1)` per frame
(the as-built engine ran 22.9 to 25.3 MHz the same way).

## How it works

```
chip/src/*.v --yosys--> netlist.json --gen.py--> gen/uds_chip_gen.h ─┐
             --yosys write_cxxrtl-----------> gen/uds_chip_cxxrtl.cc ┼─ backend_*.h + harness.cc --zig c++ (wasm32-wasi)--> uds_engine.wasm
```

- **`gen.py`, the shipped backend.** Yosys flattens and optimises the design: `proc; flatten; opt -full;
  wreduce; opt_clean; memory; opt -full`. The result is 236 word-level cells of 26 types. `gen.py` turns that
  netlist into straight-line C++:
  - each combinational cell is one expression, in topological order;
  - each register is a plain `uint64_t` (the 96-bit voice ring is an `unsigned __int128`);
  - `step()` is one clock: combinational logic, then the outputs (the pins during this cycle), then all
    registers at once.

  The speed comes from `step_at<P, UIO>()`. The voice-window counters `core.t` (0..47) and `core.v` (0..1)
  run freely from reset, so during cycle c they equal `c % 48` and `(c / 48) % 2`. `step_at` folds them in as
  compile-time constants, with an idle SPI bus (`uio_in` = 0x01 or 0x03).

  The harness runs a whole idle frame as 96 unrolled `step_at` calls on a local copy of the state, which the
  compiler keeps in registers. That removes most of the t-dependent multiplexing and makes it about 6x faster
  than the per-clock path. The generic `step()` runs whenever the SPI bus is busy or a frame is part done.
- **cxxrtl.** Yosys `write_cxxrtl -O6` with one `eval()` + `commit()` per clock. It uses the vendored
  runtime headers in `third_party/cxxrtl` (ISC). It is kept as the independent reference for the
  cross-check.
- **Verilator** is not built. Its runtime is LGPL-3.0 or Artistic-2.0, which the CONTRACT license list
  (MIT, BSD, ISC, Apache) does not allow in the shipped file. The gen backend is already faster than its
  native figure in `NOTES.md`.
- **`harness.cc`, the demo board.** It is the same for every backend:
  - **Clock and reset:** rst_n is held low for 4 clocks. Cycle 0 is the cycle that ends with the first
    rising edge after reset, as in `chip/test/tb.v`.
  - **Virtual RP2040:** it sends a 256-entry queue of messages with CS low, mode 0, MSB first and
    SCK = clk/8. It reads MISO just before each rising SCK edge. Before each message it waits for BUSY low,
    polling the pins of the previous cycle.
  - **Message log:** each message records the cycle of its last SCK rising edge and the bytes read back on
    MISO. The tests use the log to feed the model exactly.
  - **takeActivity:** it latches BUSY seen high, CS seen low and HITs sent.
  - **Audio Pmod:**
    - the 1s on `uo_out[7]` are counted per frame of 96 clocks (frame k = cycles 96k+1 .. 96k+96);
    - each count maps to -1..1 around 48;
    - then 5 Hz AC coupling and an RC low-pass (default 15.9 kHz, `setFilterHz`);
    - then a 32-tap Hann-windowed sinc with 64 interpolated phases resamples 62.5 kHz to the output rate,
      with cutoff at 0.45 x the lower rate.
  - **render(n):** returns exactly n samples. It keeps any extra samples for the next call.
  - **Memory:** fixed at 1 MiB, with no growth.
- **`uds-engine.js`:**
  - It stubs every WASI import with `() => 0` and calls `_initialize`.
  - It instantiates synchronously, which works in a Window, a Worker, an AudioWorklet and Node.
  - URL sources are fetched, or read with `fs` for `file:` URLs in Node.
  - In an AudioWorklet, pass the `.wasm` **bytes**. Chrome does not deliver a `WebAssembly.Module` posted to
    a worklet port.
  - Beyond the contract, the tests use `runCycles`, `runCounts`, `runTrace` and `takeLog`.

## Rebuild

```sh
engine/build.sh          # gen backend -> engine/wasm/uds_engine_gen.wasm and app/engine/uds_engine.wasm
engine/build.sh all      # also cxxrtl (needed for the cross-check); ships gen
engine/build.sh cxxrtl   # build and ship cxxrtl instead
engine/build.sh all sd2  # the 2nd-order DAC preview: chip-sd2/ -> engine/wasm/sd2/*.wasm, app/engine/uds_engine_sd2.wasm
```

The second argument picks the chip variant: `base` (default, `chip/`) or `sd2` (`chip-sd2/`, the second-order
sigma-delta from tt-uds-1x1 branch `sd2`). The sd2 variant writes `engine/gen/uds_chip_gen_sd2.h` and
`uds_chip_cxxrtl_sd2.cc` and compiles the same harness with `-DGEN_HEADER` / `-DCXXRTL_SOURCE`; the base build
is unchanged and still byte-identical. `app/engine/builds.json` describes each build (chip commit, backend,
make-up gain); `node engine/test/loudness.mjs [--write]` measures the gain that matches the builds' loudness.

It installs `yosys` and `verilator` with apt (Yosys 0.33) and `ziglang` with pip (zig 0.17) if they are
missing. Then it compiles with `python3 -m ziglang c++ -target wasm32-wasi -mexec-model=reactor -O3 -flto`.
The generated sources (`engine/gen/`) and all `.wasm` files are committed. The build is reproducible: a
rebuild gives byte-identical `.wasm` files.

## Verification

Run `node --test engine/test/*.test.mjs`. It needs `python3`, and takes about 5 s.

- **Model check (`model.test.mjs`).**
  - 316 185 frames and 2 208 SPI messages (2 030 HITs) go through the WASM engine. The per-frame count of
    1s on the audio pin must equal `chip/model/uds_model.py` (`Engine.step`) on every frame.
  - The model is fed from the harness's message log. A message whose last SCK rising edge is in cycle X
    pulses on X + 2 and is acted on at the end of frame `m = (X + 3) // 96`. The model gets `hit`/`stop`
    before stepping frame m + 1, exactly as `chip/test/test.py` does (`engine/test/model_ref.py`).
  - The script covers:
    - all 8 channels with their defaults;
    - every sweep 0..7 (and the reserved bit 3) and every decay 0..15;
    - pitch 0/255/128/31, balance 0/15 and level 0/15/8;
    - 3 and 4 overlapping hits (voice stealing);
    - open and closed hi-hats cutting each other;
    - STOP alone, in a queue and twice in a row;
    - 325 back-to-back HITs paced only by BUSY;
    - READs of every register;
    - 120 000+ frames of random traffic queued at random clocks within a frame (24 messages end within 3
      clocks of a frame boundary).
  - It also checks READ ID = 0xD5 and VERSION = 0x12 through MISO.
  - A shifted alignment (m + 2) fails on about 78 000 frames, so the check is sensitive.
- **Cross-check (`cross.test.mjs`).**
  - gen and cxxrtl agree on `uo_out` and `uio_out` on every one of 10 004 294 clocks of random SPI traffic
    (7 944 messages, including unknown commands and odd lengths).
  - They also agree frame by frame over 105 650 frames on the fast idle path, and on `render()` output
    split at random samples.
- **gen.py cell coverage (`test/gen_cells/run.sh`).** A small design with word-level operators that the chip
  does not use yet (signed compares, `$gt`/`$ge`, `$sshr`/`$sshl`, `$neg`, `$mul`, `$xnor`, `$reduce_xor`/`xnor`)
  goes through gen.py and through Icarus Verilog; the pins agree on 199 999 clocks of random inputs. (Yosys
  0.33 CXXRTL differs on that design: it gets a sign-extended `<<<` wrong, so Icarus is the reference there.)
  It needs yosys, iverilog and g++, so it is not part of `node --test`.
- **2nd-order DAC preview (`chip-sd2/`, `engine/wasm/sd2/`).** The same checks run for the sd2 build:
  - **Model check.** 316 185 frames, 0 differences against the sd2 model's per-frame counts.
  - **Cross-check.** gen and CXXRTL agree on all 10 004 294 clocks (`uo_out` and `uio_out`) and on 105 650 frames.
  - **Fixture.** `fixtures/model_frames_sd2.json` replays in Node, and in Chromium (`tests/e2e/dac.spec.mjs`).
  - **READ VERSION.** It answers 0x22.

  `tools/vendor_sd2.sh` vendors, builds and verifies a new commit of branch `sd2`. `audio_sd2.test.mjs` checks the
  silence after a sound (below -80 dBFS; it is -92 dBFS) and the loudness match.
- **Pin truth (`pin_truth.mjs`, needs numpy).** It records the raw audio pin clock by clock for 3 s of hits, then
  band-limits it to 20 Hz..20 kHz, which is what an ideal analog filter passes. It compares that with
  `render()`:
  - as built (count of 1s): error -41 dB overall and -77 dB in the quiet tail, where the pin is at -65 dB;
  - sd2 (sinc³): error -45 dB overall and -79 dB in the tail, where the pin is at -71 dB.

  With the count of 1s, the sd2 build's tail error was -42 dB, 34 dB above the pin's own tail. That aliasing is
  why the sd2 build uses sinc³.
- **Fixture (`fixture.test.mjs`).** `fixtures/model_frames.json` has 22 019 frames. Its `events` are
  `{frame, bytes}` messages to queue before `runFrames(1)` runs frame `frame`, and `counts` are the model's
  1s per frame. It replays with the contract API alone. `tests/e2e/truth.spec.mjs` runs it in Chromium.
  Regenerate it with `node engine/test/make_fixture.mjs`.
- **API test (`api.test.mjs`).** It covers:
  - loading from bytes, a Uint8Array, an ArrayBuffer, a Module, a file URL (string or URL object), an http
    URL and the default URL;
  - `render` sizes 1..8192 at 22.05 to 192 kHz, with the clock count matching the samples;
  - silence, sound and STOP;
  - the full queue (255 messages) and draining it;
  - `reset` and `reset(rate)`, `takeActivity`, and sample-accurate message start;
  - static memory.
- **Browser (`browser/run.cjs`).** It loads and runs the engine in Chromium in a Window, a module Worker and
  an AudioWorklet, which has no TextDecoder. Run it with
  `PLAYWRIGHT_MODULE=/path/to/playwright node engine/test/browser/run.cjs`.
