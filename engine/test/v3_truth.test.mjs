// v3 truth test: the v3 engine (app/engine/uds_engine_v3.wasm, built from tt-uds-v3 RTL) replays the frame
// counts of V3-CHIP's bit-exact model (fixtures/model_frames_v3.json, see fixtures/V3_FIXTURES.md) with
// 0 mismatches. Skips while the engine or the fixture is missing.
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEngine } from '../../app/engine/uds-engine.js';

const WASM = fileURLToPath(new URL('../../app/engine/uds_engine_v3.wasm', import.meta.url));
const FIX = fileURLToPath(new URL('./fixtures/model_frames_v3.json', import.meta.url));
const skip = !existsSync(WASM) ? 'v3 engine not built yet' : !existsSync(FIX) ? 'v3 fixture not delivered yet (fixtures/V3_FIXTURES.md)' : false;

test('v3 engine: shape of the build (12 MHz, 192-clock frames, 5-byte HITs)', { skip: !existsSync(WASM) && 'v3 engine not built yet' }, async () => {
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
