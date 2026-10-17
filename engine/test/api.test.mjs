// API test for app/engine/uds-engine.js (CONTRACT.md section 3).
// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { loadEngine, CLOCK_HZ, VOICES, FRAME_CLOCKS, FRAME_RATE } from '../../app/engine/uds-engine.js';

const URLW = process.env.UDS_WASM ? new URL(process.env.UDS_WASM, 'file://' + process.cwd() + '/')
  : new URL('../../app/engine/uds_engine.wasm', import.meta.url);
const bytes = readFileSync(URLW);

test('constants', () => {
  assert.equal(CLOCK_HZ, 6000000); assert.equal(VOICES, 2);
  assert.equal(FRAME_CLOCKS, 96); assert.equal(FRAME_RATE, 62500);
});

test('load from bytes, Uint8Array, ArrayBuffer, Module, file URL, http URL', async () => {
  const u8 = new Uint8Array(bytes);
  const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  const mod = await WebAssembly.compile(u8);
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/wasm' }); res.end(bytes);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const http = `http://127.0.0.1:${server.address().port}/uds_engine.wasm`;
  try {
    for (const src of [bytes, u8, ab, mod, URLW, URLW.href, http, new URL(http), undefined]) {
      if (src === undefined && process.env.UDS_WASM) continue;
      const e = await loadEngine(src, { sampleRate: 44100 });
      assert.match(e.backend, /^(cxxrtl|verilator|gen)$/);
      assert.equal(e.sampleRate, 44100);
      assert.equal(e.render(64).length, 64);
    }
  } finally { server.close(); }
});

test('render returns exactly n samples at any rate; timing follows the clock', async () => {
  for (const rate of [22050, 44100, 48000, 96000, 192000]) {
    const e = await loadEngine(bytes, { sampleRate: rate });
    let total = 0;
    for (const n of [1, 2, 3, 127, 128, 480, 1000, 8192, 7, 1]) {
      const s = e.render(n);
      assert.ok(s instanceof Float32Array);
      assert.equal(s.length, n);
      total += n;
    }
    const want = total / rate * CLOCK_HZ;
    assert.ok(Math.abs(e.cycles - want) < 2 * 96 * Math.ceil(rate / FRAME_RATE + 1), `${rate}: ${e.cycles} vs ${want}`);
  }
  const e = await loadEngine(bytes);
  assert.equal(e.render(0).length, 1);
  assert.equal(e.render(100000).length, 8192);
});

test('silence is silent, a hit makes sound, STOP silences it', async () => {
  const e = await loadEngine(bytes, { sampleRate: 48000 });
  e.setFilterHz(0);
  let peak = 0;
  for (const v of e.render(4800)) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak < 1e-3, `silence peak ${peak}`);
  assert.equal(e.hit(4, { pitch: 20, sweep: 6, decay: 9, balance: 1, level: 15 }), true);
  peak = 0;
  for (const v of e.render(4800)) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak > 0.1 && peak <= 1, `bass peak ${peak}`);
  e.setFilterHz(15900);
  assert.equal(e.stop(), true);
  e.render(480);
  assert.equal(e.runFrames(1), 48);
  assert.equal(e.uoOut & 0x7F, 0x66, 'display shows 4');
});

test('queue: full queue returns false, drains in order', async () => {
  const e = await loadEngine(bytes);
  let n = 0;
  while (e.send([0x30, 0])) n++;
  assert.equal(n, 255);
  assert.equal(e.hit(0, {}), false);
  assert.equal(e.stop(), false);
  assert.equal(e.send([]), false);
  assert.equal(e.send([1, 2, 3, 4, 5]), false);
  assert.equal(e.queueLength(), 255);
  e.runFrames(10);
  assert.ok(e.queueLength() < 255);
  e.runFrames(2000);
  assert.equal(e.queueLength(), 0);
  const log = e.takeLog();
  assert.equal(log.length, 255);
  assert.ok(log.every((m) => m.rx[1] === 0xD5));
});

test('reset clears chip, queue, counters', async () => {
  const e = await loadEngine(bytes);
  e.hit(4, { pitch: 20, decay: 9, level: 15 });
  for (let i = 0; i < 20; i++) e.send([0x31, 0]);
  e.render(2000);
  assert.ok(e.cycles > 0 && e.frames > 0);
  e.reset();
  assert.equal(e.cycles, 0); assert.equal(e.frames, 0); assert.equal(e.queueLength(), 0);
  assert.equal(e.runFrames(50), 48);
  e.reset(96000);
  assert.equal(e.sampleRate, 96000);
  assert.equal(e.render(96).length, 96);
});

test('takeActivity latches BUSY, CS and HITs', async () => {
  const e = await loadEngine(bytes);
  e.render(100);
  assert.deepEqual(e.takeActivity(), { busy: false, cs: false, hits: 0 });
  e.hit(1, { level: 10 }); e.hit(2, { level: 10 }); e.send([0x30, 0]);
  e.runFrames(20);
  assert.deepEqual(e.takeActivity(), { busy: true, cs: true, hits: 2 });
  e.runFrames(5);
  assert.deepEqual(e.takeActivity(), { busy: false, cs: false, hits: 0 });
  e.send([0x30, 0]);
  e.runFrames(5);
  assert.deepEqual(e.takeActivity(), { busy: false, cs: true, hits: 0 });
});

test('a message queued between render calls starts on the next clock', async () => {
  const e = await loadEngine(bytes);
  e.render(333);
  const c = e.cycles;
  e.send([0x30, 0]);
  e.runCycles(200);
  const [m] = e.takeLog();
  // CS low in cycle c, SCK of bit i rises 8i + 8 cycles later
  assert.equal(m.lastSck, c + 8 * 15 + 8);
});

test('memory stays static while rendering', async () => {
  const e = await loadEngine(bytes);
  const before = e._mem.buffer.byteLength;
  for (let i = 0; i < 50; i++) { e.hit(i & 7, { level: 15, decay: 5 }); e.render(8192); }
  assert.equal(e._mem.buffer.byteLength, before);
});
