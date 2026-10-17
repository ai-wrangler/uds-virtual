// How well does each build's audio model (render()) match the real pin? Runs the same 16 hits through
// two instances of a build: one records the raw 1-bit audio pin clock by clock (3 s, 18 M clocks), the
// other renders 48 kHz audio with the RC filter off. pin_truth.py band-limits the raw pin to 20 Hz..20 kHz
// (what an ideal analog low-pass would pass) and reports the error of render() against it, overall and
// in the quiet tail (the last 1.4 s). Needs python3 with numpy.
//   node engine/test/pin_truth.mjs
// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadEngine } from '../../app/engine/uds-engine.js';
import { VARIANTS } from './scenario.mjs';

const ch = JSON.parse(readFileSync(new URL('../../app/data/channels.json', import.meta.url))).channels;
const seq = [4, 6, 0, 6, 4, 6, 0, 7];
const dir = fileURLToPath(new URL('../build/pin_truth/', import.meta.url));
mkdirSync(dir, { recursive: true });
const names = [];
for (const V of VARIANTS) {
  if (!existsSync(V.wasm)) continue;
  const bytes = readFileSync(V.wasm);
  const a = await loadEngine(bytes), r = await loadEngine(bytes);
  r.setFilterHz(0);
  const N = 6000000 * 3, bits = new Uint8Array(N), out = new Float32Array(144000);
  let p = 0, q = 0;
  for (let k = 0; p < N; k++) {
    if (k < 16) { const c = seq[k % 8]; a.hit(c, ch[c].params); r.hit(c, ch[c].params); }
    for (let j = 0; j < 47 && p < N; j++) {          // 47 x 8000 clocks = 47 x 64 samples between hits
      const t = a.runTrace(8000);
      for (let i = 0; i < 8000; i++) bits[p++] = (t[i] >> 7) & 1;
      out.set(r.render(64), q); q += 64;
    }
  }
  writeFileSync(dir + V.name + '.bits', bits);
  writeFileSync(dir + V.name + '.render', Buffer.from(out.buffer));
  names.push(`${V.name}:${r.audioModel}`);
}
const py = fileURLToPath(new URL('./pin_truth.py', import.meta.url));
const res = spawnSync('python3', [py, dir, ...names], { encoding: 'utf8' });
process.stdout.write(res.stdout + res.stderr);
