// Writes fixtures/model_frames.json: a HIT schedule and the per-frame 1s the
// Python model expects, for the browser test (integrate session).
// Run: node engine/test/make_fixture.mjs
//
// Replay with the contract API only (all messages start on a frame boundary):
//   engine.reset();
//   for (let f = 0; f < fx.frames; f++) {
//     for (const a of actionsAt[f]) for (const m of a.msgs) engine.send(m);
//     counts[f] = engine.runFrames(1);      // must equal fx.counts[f]
//   }
// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';
import { rng, hitMsg, runScript, modelEvents, modelCounts } from './scenario.mjs';

const r = rng(7);
const ri = (n) => Math.floor(r() * n);
const actions = [];
let f = 2;
const at = (msgs, gap) => { actions.push({ frame: f, offset: 0, msgs }); f += gap; };
at([[0x30, 0], [0x31, 0]], 10);
for (let ch = 0; ch < 8; ch++) at([hitMsg(ch, [40 + ch * 25, ch, 6, ch * 2, 15])], 900);
at([hitMsg(4, [20, 6, 9, 1, 15]), hitMsg(0, [80, 4, 7, 11, 13]), hitMsg(5, [255, 0, 11, 15, 11])], 1500);
at([hitMsg(7, [255, 0, 9, 15, 10])], 300);
at([hitMsg(6, [255, 0, 6, 15, 10])], 600);
at([hitMsg(3, [56, 5, 9, 2, 12]), [0x40]], 600);
while (f < 20000) {
  const msgs = [];
  for (let i = 0, n = 1 + ri(3); i < n; i++) msgs.push(hitMsg(ri(8), [ri(256), ri(8), ri(14), ri(16), ri(16)]));
  at(msgs, [1, 3, 20, 100, 400][ri(5)]);
}
const frames = f + 2000;
const engine = await loadEngine(readFileSync(new URL('../../app/engine/uds_engine.wasm', import.meta.url)));
const { counts, log } = runScript(engine, { actions, frames });
const events = modelEvents(log);
const want = modelCounts(events, frames);
for (let i = 0; i < frames; i++) if (counts[i] !== want[i]) throw new Error(`engine differs from model at frame ${i}`);
mkdirSync(new URL('./fixtures/', import.meta.url), { recursive: true });
writeFileSync(new URL('./fixtures/model_frames.json', import.meta.url), JSON.stringify({
  description: 'UDS-1x1 engine fixture: queue each action\'s msgs (engine.send) just before engine.runFrames(1) ' +
    'runs frame `frame`; the returned 1s must equal counts[frame]. counts come from chip/model/uds_model.py; ' +
    'events are what the model was fed (frame = before which step).',
  frameClocks: 96, frames, actions: actions.map(({ frame, msgs }) => ({ frame, msgs })),
  events, counts: Array.from(want),
}));
console.log(`fixtures/model_frames.json: ${frames} frames, ${actions.length} actions, ${events.length} model events`);
