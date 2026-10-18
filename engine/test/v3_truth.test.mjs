// v3 truth test: the v3 engine (app/engine/uds_engine_v3.wasm, built from tt-uds-v3 RTL) replays the frame
// counts of V3-CHIP's bit-exact model (fixtures/model_frames_v3.json, made by make_fixture_v3.py; see fixtures/V3_FIXTURES.md) with
// 0 mismatches. Skips while the engine or the fixture is missing.
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEngine } from '../../app/engine/uds-engine.js';

const WASM = fileURLToPath(new URL('../../app/engine/uds_engine_v3.wasm', import.meta.url));
const FIX = fileURLToPath(new URL('./fixtures/model_frames_v3.json', import.meta.url));
const skip = !existsSync(WASM) ? 'v3 engine not built yet' : !existsSync(FIX) ? 'v3 fixture missing: python3 engine/test/make_fixture_v3.py' : false;

test('v3 engine: shape of the build (clock, frame and HIT length of params.json)', { skip: !existsSync(WASM) && 'v3 engine not built yet' }, async () => {
  const e = await loadEngine(readFileSync(WASM));
  const pj = JSON.parse(readFileSync(new URL('../../app/engine/params_v3.json', import.meta.url)));
  assert.equal(e.clockHz, pj.clockHz);
  assert.equal(e.frameClocks, pj.frameClocks);
  assert.ok(e.maxMessage >= 1 + pj.hit.bytes.length);
  // READ ID / VERSION through MISO
  e.send([0x30, 0]); e.send([0x31, 0]);
  e.runFrames(20);
  const rx = e.takeLog().map((m) => m.rx[1]);
  assert.equal(rx[0], 0xD5);
  assert.equal(rx[1] >> 4, 3, 'VERSION 0x3V');
});

test('v3 engine matches the v3 model frame by frame', { skip }, async () => {
  const fx = JSON.parse(readFileSync(FIX));
  const e = await loadEngine(readFileSync(WASM));
  e.reset();
  let a = 0, bad = 0, first = -1;
  const t0 = performance.now();
  for (let f = 0; f < fx.counts.length; f++) {
    while (a < fx.events.length && fx.events[a].frame <= f) assert.ok(e.send(fx.events[a++].bytes), 'queue full');
    if (e.runFrames(1) !== fx.counts[f]) { bad++; if (first < 0) first = f; }
  }
  const mhz = fx.counts.length * e.frameClocks / (performance.now() - t0) / 1000;
  console.log(`# v3 truth: ${fx.counts.length} frames, ${fx.events.length} messages, ${bad} mismatches, ${mhz.toFixed(1)} MHz`);
  assert.equal(bad, 0, `first mismatch at frame ${first}`);
  if (fx.regs) {
    e.reset(); e.send([0x30, 0]); e.send([0x31, 0]); e.runFrames(20);
    assert.deepEqual(e.takeLog().map((m) => m.rx[1]), [fx.regs.id, fx.regs.version]);
  }
});

// V3-CHIP's own fixtures (tt-uds-v3 test/make_fixtures.py, vendored in chip-v3/test/fixtures/): the SPI pins
// clock by clock, and the model's 1s per 64-clock window, BUSY at each window start, the channel digit and the
// CRC of the whole audio bitstream.
const PIN_FIX = fileURLToPath(new URL('../../chip-v3/test/fixtures/', import.meta.url));
const pinFixtures = existsSync(PIN_FIX) ? readdirSync(PIN_FIX).filter((f) => f.endsWith('.json')) : [];
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const SEG7 = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];
for (const f of pinFixtures.length ? pinFixtures : ['(none)']) {
  test(`v3 engine replays V3-CHIP's pin-level fixture ${f}`, { skip: !existsSync(WASM) ? 'v3 engine not built yet' : !pinFixtures.length && 'no pin-level fixtures in chip-v3/test/fixtures' }, async () => {
    const fx = JSON.parse(readFileSync(PIN_FIX + f));
    const e = await loadEngine(readFileSync(WASM));
    e.reset();
    const changes = new Map(fx.spi.map(([c, cs, sck, mosi]) => [c, cs | (mosi << 1) | (sck << 3)]));
    const W = fx.windowClocks, n = fx.windowOnes.length * W;
    let pins = 0x01, crc = -1, ones = 0, badOnes = 0, badBusy = 0, badDigit = 0;
    for (let c = 0; c < n; c++) {
      if (changes.has(c)) pins = changes.get(c);
      e.setPins(pins);
      const t = e.runTrace(1)[0];
      const bit = (t >> 7) & 1;
      crc = CRC[(crc ^ bit) & 255] ^ (crc >>> 8);
      ones += bit;
      const w = Math.floor(c / W);
      if (c % W === 0 && ((t >> 13) & 1) !== fx.busy[w]) badBusy++;
      if (c % W === W - 1) {
        if (ones !== fx.windowOnes[w]) badOnes++;
        if ((t & 0x7f) !== SEG7[fx.digit[w]]) badDigit++;
        ones = 0;
      }
    }
    console.log(`# ${f}: ${fx.windowOnes.length} windows, ${fx.spi.length} pin changes: ${badOnes} count, ${badBusy} BUSY, ${badDigit} digit mismatches`);
    assert.equal(badOnes, 0, '1s per window');
    assert.equal((crc ^ -1) >>> 0, fx.crc32, 'CRC of the audio bitstream');
    assert.equal(badDigit, 0, '7-segment digit');
    assert.equal(badBusy, 0, 'BUSY at window starts');
  });
}
