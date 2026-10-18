# v3 truth fixtures (requested from V3-CHIP)

`model_frames_v3.json` here is the v3 truth fixture: what V3-CHIP's bit-exact Python model
(`tt-uds-v3/model/uds3_*.py`) says the chip puts on its audio pin, frame by frame, for a schedule of SPI
messages. `engine/test/v3_truth.test.mjs` (Node) and `tests/e2e/v3-truth.spec.mjs` (Chromium) replay it on
`app/engine/uds_engine_v3.wasm` and require 0 mismatches. Both skip while the file or the engine is missing.

Format (the same as `model_frames.json` for v1, with v3's frame):

```json
{
  "chip": "tt-uds-v3@<commit>", "contract": 1, "clockHz": 12000000, "frameClocks": 192,
  "frames": 20000,
  "events": [{ "frame": 2, "bytes": [24, 64, 140, 9, 0] }],
  "counts": [96, 96, 97, ...],
  "regs": { "id": 213, "version": 50 }
}
```

- `counts[k]`: the number of 1s on `uo_out[7]` in frame k, where frame k is the pins during cycles
  `192k+1 .. 192k+192` and cycle 0 is the cycle that ends with the first rising edge after reset (rst_n low for
  4 clocks), as in `test/tb.v`.
- `events`: messages to queue before frame `frame` runs. The engine's virtual controller sends a queued
  message from the next clock: CS low, SPI mode 0, MSB first, SCK = clk/8 (4 clocks low, 4 high), CS high
  4 clocks after the last bit, and before each message it waits until BUSY (uio[5]) is low. So a message
  queued at the start of frame f has its last SCK rising edge at cycle `192f + 1 + 3 + 8*(8*len - 1) + 4`
  when the bus is free (`engine.takeLog()` reports the exact cycle). The model must see the message at
  the frame the RTL acts on it; `engine/test/model_ref.py` shows how v1 does this.
- `regs`: READ ID and READ VERSION answers.

If the model has the same shape as v1's `uds_model.Engine` (`hit(ch, bytes)`, `stop()`, `step()` -> count),
`node engine/test/make_fixture_v3.mjs` can make this file here instead.
