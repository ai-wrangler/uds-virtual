// Cross-check: every backend in engine/wasm/ against the others, cycle by cycle
// (uo_out and uio_out on every clock), for 10 M clocks of random SPI traffic.
// The same for each chip variant in a subfolder (engine/wasm/sd2/: the 2nd-order DAC preview).
// UDS_CROSS_CLOCKS overrides the length.
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';
import { rng } from './scenario.mjs';

const CLOCKS = +(process.env.UDS_CROSS_CLOCKS || 10_000_000);
const ROOT = new URL('../wasm/', import.meta.url);
const VARIANTS = [['', ROOT], ...readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory())
  .map((d) => [d.name + '/', new URL(d.name + '/', ROOT)])];

for (const [label, DIR] of VARIANTS) {
const files = readdirSync(DIR).filter((f) => f.endsWith('.wasm')).sort();

test(`backends agree on every clock (${files.map((f) => label + f).join(', ')})`, { skip: files.length < 2 }, async () => {
  const engines = await Promise.all(files.map((f) => loadEngine(readFileSync(new URL(f, DIR)))));
  const r = rng(12345);
  const ri = (n) => Math.floor(r() * n);
  let clocks = 0, msgs = 0, active = 0;
  while (clocks < CLOCKS) {
    // random messages: HITs, STOPs, READs of any register, unknown commands, odd lengths
    const k = [0, 0, 0, 1, 1, 2, 4][ri(7)];
    for (let i = 0; i < k; i++) {
      const x = r();
      let m;
      if (x < 0.55) m = [0x18 | ri(8), ri(256), ri(256), ri(256)];
      else if (x < 0.65) m = [0x40];
      else if (x < 0.8) m = [0x30 | ri(16), ri(256)];
      else { m = []; for (let j = 0, n = 1 + ri(4); j < n; j++) m.push(ri(256)); }
      const ok = engines.map((e) => e.send(m));
      assert.ok(ok.every((v) => v === ok[0]));
      msgs++;
    }
    const n = 1 + ri([50, 500, 8192][ri(3)]);
    const t0 = engines[0].runTrace(n).slice();
    for (let j = 0; j < t0.length; j++) if (t0[j] & 0x80) active++;
    for (let e = 1; e < engines.length; e++) {
      const t = engines[e].runTrace(n);
      for (let j = 0; j < n; j++) {
        if (t[j] !== t0[j]) {
          assert.fail(`${files[e]} differs from ${files[0]} at clock ${clocks + j}: ` +
            `${t[j].toString(16)} vs ${t0[j].toString(16)}`);
        }
      }
    }
    clocks += n;
  }
  console.log(`# cross-check ${label || 'base'}: ${files.length} backends, ${clocks} clocks, ${msgs} messages, audio pin high on ${active} clocks: identical`);
});

test(`${label || 'base'}: backends agree frame by frame on the fast (idle) path and in render()`, { skip: files.length < 2 }, async () => {
  const engines = await Promise.all(files.map((f) => loadEngine(readFileSync(new URL(f, DIR)))));
  const r = rng(777);
  const ri = (n) => Math.floor(r() * n);
  let frames = 0;
  while (frames * 96 < CLOCKS) {
    for (let i = 0, k = ri(3); i < k; i++) {
      const m = [0x18 | ri(8), ri(256), ri(256), ri(256)];
      for (const e of engines) e.send(m);
    }
    if (ri(4) === 0) {
      // split render at an arbitrary sample: messages start mid-frame
      const n = 1 + ri(700);
      const a = Float32Array.from(engines[0].render(n));
      for (let e = 1; e < engines.length; e++) assert.deepEqual(engines[e].render(n), a);
    }
    const n = 1 + ri(2000);
    const c0 = engines[0].runCounts(n);
    for (let e = 1; e < engines.length; e++) {
      assert.deepEqual(engines[e].runCounts(n), c0, `${files[e]} frames ${frames}..${frames + n}`);
      assert.equal(engines[e].uoOut, engines[0].uoOut);
      assert.equal(engines[e].uioOut, engines[0].uioOut);
      assert.equal(engines[e].cycles, engines[0].cycles);
    }
    frames += n;
  }
  console.log(`# cross-check ${label || 'base'} (frames): ${frames} frames identical`);
});
}
