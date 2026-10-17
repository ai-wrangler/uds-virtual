// Replays fixtures/model_frames*.json with the contract API only, as the browser test does.
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';
import { VARIANTS } from './scenario.mjs';

for (const V of VARIANTS) {
  const wasm = V.name === 'base' && process.env.UDS_WASM || V.wasm;
  const ready = existsSync(wasm) && existsSync(V.fixture);
  test('fixture replays with send() + runFrames(1)' + (V.name === 'base' ? '' : ` [${V.name}]`),
    { skip: !ready && `${V.name} not built` }, async () => {
      const fx = JSON.parse(readFileSync(V.fixture));
      const engine = await loadEngine(readFileSync(wasm));
      engine.reset();
      let a = 0, bad = 0;
      for (let f = 0; f < fx.frames; f++) {
        while (a < fx.events.length && fx.events[a].frame <= f) assert.ok(engine.send(fx.events[a++].bytes));
        if (engine.runFrames(1) !== fx.counts[f]) bad++;
      }
      assert.equal(bad, 0);
    });
}
