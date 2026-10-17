// Model check: per-frame 1s on the audio pin, WASM engine vs chip/model/uds_model.py.
// Run: node --test engine/test/   (UDS_WASM=path picks another .wasm)
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';
import { script, runScript, modelEvents, modelCounts, modelRegs, FRAME, VARIANTS } from './scenario.mjs';

// base: chip/ and app/engine/uds_engine.wasm (UDS_WASM overrides); sd2: chip-sd2/ and uds_engine_sd2.wasm
for (const V of VARIANTS) {
const WASM = V.name === 'base' && process.env.UDS_WASM || V.wasm;
const ready = existsSync(WASM) && existsSync(V.chip + 'model/uds_model.py');
const label = V.name === 'base' ? '' : ` [${V.name}]`;

test('per-frame audio matches the Python model (>= 200 000 frames)' + label, { skip: !ready && `${V.name} not built` }, async () => {
  const engine = await loadEngine(readFileSync(WASM));
  const regs = modelRegs(V.chip);
  const sc = script({ randomFrames: 120000, seed: 1 });
  assert.ok(sc.frames >= 200000, `${sc.frames} frames`);
  const { counts, log } = runScript(engine, sc);
  const events = modelEvents(log);
  const want = modelCounts(events, sc.frames, V.chip);

  // coverage of the script
  const hits = events.filter((e) => e.kind === 'hit');
  const chans = new Set(hits.map((e) => e.ch));
  assert.equal(chans.size, 8, 'all 8 channels');
  assert.ok(events.some((e) => e.kind === 'stop'), 'STOP');
  const sweeps = new Set(hits.map((e) => e.payload[1] & 7));
  const decays = new Set(hits.map((e) => e.payload[1] >> 4));
  assert.equal(sweeps.size, 8); assert.equal(decays.size, 16);
  for (const p of [0, 255]) assert.ok(hits.some((e) => e.payload[0] === p), `pitch ${p}`);
  for (const b of [0, 15]) assert.ok(hits.some((e) => e.payload[2] >> 4 === b), `balance ${b}`);
  for (const l of [0, 15]) assert.ok(hits.some((e) => (e.payload[2] & 15) === l), `level ${l}`);
  // back to back: consecutive messages a few frames apart (paced by BUSY)
  let b2b = 0, nearEdge = 0;
  for (let i = 1; i < log.length; i++) if (log[i].lastSck - log[i - 1].lastSck < 4 * FRAME) b2b++;
  for (const e of log) { const p = (e.lastSck + 3) % FRAME; if (p < 3 || p > FRAME - 3) nearEdge++; }
  assert.ok(b2b > 100, `back-to-back messages: ${b2b}`);

  // registers through MISO
  const reads = log.filter((e) => e.bytes[0] === 0x30 || e.bytes[0] === 0x31);
  assert.equal(reads[0].rx[1], regs.id, 'READ ID');
  assert.equal(reads[1].rx[1], regs.version, 'READ VERSION');
  if (V.name === 'base') assert.deepEqual(regs, { id: 0xD5, version: 0x12 });
  for (const e of log) {
    if (e.bytes[0] === 0x30) assert.equal(e.rx[1], regs.id);
    if (e.bytes[0] === 0x31) assert.equal(e.rx[1], regs.version);
  }

  let bad = 0, first = -1;
  for (let i = 0; i < counts.length; i++) if (counts[i] !== want[i]) { bad++; if (first < 0) first = i; }
  console.log(`# ${V.name} ${engine.backend}: ${counts.length} frames, ${log.length} messages (${hits.length} HITs,` +
    ` ${b2b} back to back, ${nearEdge} ending within 3 clocks of a frame edge): ${bad} frames differ`);
  assert.equal(bad, 0, `first difference at frame ${first}`);
  // the script really makes sound
  let loud = 0;
  for (const c of counts) if (c !== 48) loud++;
  assert.ok(loud > counts.length / 4);
});
}
