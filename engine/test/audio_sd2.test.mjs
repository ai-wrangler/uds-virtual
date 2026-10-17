// Audio model of the 2nd-order DAC build: the sinc^3 decimator keeps the modulator's idle pattern (which
// is not frame-periodic after a sound) out of the audio band. With the plain count of 1s per frame that
// pattern aliased into a -30 dBFS tone near 14.7 kHz that the real pin (RC-filtered) does not have.
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';
import { VARIANTS } from './scenario.mjs';

const sd2 = VARIANTS.find((v) => v.name === 'sd2');
const base = VARIANTS.find((v) => v.name === 'base');
const builds = JSON.parse(readFileSync(new URL('../../app/engine/builds.json', import.meta.url)));
const gain = (id) => builds.builds.find((b) => b.id === id).gain;

function idleDb(e, g) {
  const s = Float32Array.from(e.render(8192));
  let m = 0; for (const v of s) m += v; m /= s.length;
  let q = 0; for (const v of s) q += (v - m) ** 2;
  return 20 * Math.log10(Math.sqrt(q / s.length) * g + 1e-12);
}

test('audio models: the as-built engine counts 1s per frame, the sd2 build uses sinc^3', { skip: !existsSync(sd2.wasm) && 'sd2 not built' }, async () => {
  assert.equal((await loadEngine(readFileSync(base.wasm))).audioModel, 'count');
  assert.equal((await loadEngine(readFileSync(sd2.wasm))).audioModel, 'sinc3');
});

test('sd2: silence after a hit and after STOP stays below -80 dBFS (after make-up gain)', { skip: !existsSync(sd2.wasm) && 'sd2 not built' }, async () => {
  const e = await loadEngine(readFileSync(sd2.wasm), { sampleRate: 48000 });
  e.render(8192);
  e.hit(4, { pitch: 20, sweep: 6, decay: 7, balance: 1, level: 15 });
  for (let i = 0; i < 24; i++) e.render(8192);          // about 4 s: the voice is over
  const a = idleDb(e, gain('2nd'));
  e.hit(0, { pitch: 80, sweep: 4, decay: 13, balance: 11, level: 13 });
  for (let i = 0; i < 3; i++) e.render(8192);
  e.stop();
  for (let i = 0; i < 3; i++) e.render(8192);
  const b = idleDb(e, gain('2nd'));
  console.log(`# sd2 idle after a hit ${a.toFixed(1)} dBFS, after STOP ${b.toFixed(1)} dBFS`);
  assert.ok(a < -80, `after a hit: ${a.toFixed(1)} dBFS`);
  assert.ok(b < -80, `after STOP: ${b.toFixed(1)} dBFS`);
});

test('loudness of the builds matches within 1 dB on the reference pattern', { skip: !existsSync(sd2.wasm) && 'sd2 not built' }, async () => {
  const { measure } = await import('./loudness.mjs');
  const r = await measure();
  const d = r[1].dbOut - r[0].dbOut;
  console.log(`# loudness: 1st ${r[0].dbOut.toFixed(2)} dBFS, 2nd ${r[1].dbOut.toFixed(2)} dBFS (gain ${r[1].gain})`);
  assert.ok(Math.abs(d) < 1, `${d.toFixed(2)} dB`);
});
