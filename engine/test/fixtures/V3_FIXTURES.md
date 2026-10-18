# v3 truth fixture

`model_frames_v3.json` is what V3-CHIP's bit-exact golden model (`chip-v3/model/uds3_model.py`, CONTRACT 1)
puts on the audio pin, frame by frame, for a schedule of HITs and STOPs. It is made here from the vendored model:

```sh
python3 engine/test/make_fixture_v3.py            # chip-v3/ -> engine/test/fixtures/model_frames_v3.json
```

Format: `{ chip, contract, clockHz, frameClocks, frames, events: [{ frame, bytes }], counts, crc, regs }`.
`events` are messages queued at the start of frame `frame`; `counts[k]` is the number of 1s on `uo_out[7]` in
frame k (128 clocks). The model's own `run()` sends them with its standard host (one SPI byte per 64-clock
window, a BUSY wait after every HIT byte), the host the engine's harness implements for v3 (`UDS_HOST_WINDOW`).

Checks that use it:

- `tests/audio/v3.test.mjs`: the mock v3 engine (a JavaScript port of the model) gives the same counts;
- `engine/test/v3_truth.test.mjs` (Node) and `tests/e2e/v3-truth.spec.mjs` (Chromium): the v3 engine built from
  V3-CHIP's RTL gives the same counts, 0 mismatches. They skip until `app/engine/uds_engine_v3.wasm` exists.
