// Replays fixtures/model_frames.json with the contract API only, as the browser test does.
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';

test('fixture replays with send() + runFrames(1)', async () => {
  const fx = JSON.parse(readFileSync(new URL('./fixtures/model_frames.json', import.meta.url)));
  const engine = await loadEngine(readFileSync(process.env.UDS_WASM || new URL('../../app/engine/uds_engine.wasm', import.meta.url)));
  engine.reset();
  let a = 0, bad = 0;
  for (let f = 0; f < fx.frames; f++) {
    while (a < fx.events.length && fx.events[a].frame <= f) assert.ok(engine.send(fx.events[a++].bytes));
    if (engine.runFrames(1) !== fx.counts[f]) bad++;
  }
  assert.equal(bad, 0);
});
