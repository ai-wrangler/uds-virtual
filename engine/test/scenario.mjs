// Scripted SPI traffic for the model check, and helpers to run it.
// SPDX-License-Identifier: Apache-2.0
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const FRAME = 96;

/** Small deterministic PRNG (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEFAULTS = [
  [80, 4, 7, 11, 13], [84, 5, 8, 2, 12], [70, 5, 8, 2, 12], [56, 5, 9, 2, 12],
  [20, 6, 9, 1, 15], [255, 0, 11, 15, 11], [255, 0, 6, 15, 10], [255, 0, 9, 15, 10],
];
export const hitMsg = (ch, [pitch, sweep, decay, balance, level]) =>
  [0x18 | ch, pitch & 255, ((decay & 15) << 4) | (sweep & 15), ((balance & 15) << 4) | (level & 15)];

/**
 * The scripted sequence: [{ frame, msgs: [bytes...] }], messages queued
 * together go out back to back, each waiting for BUSY low.
 * @returns {{ actions: {frame: number, msgs: number[][]}[], frames: number }}
 */
export function script({ randomFrames = 120000, seed = 1 } = {}) {
  const r = rng(seed);
  const ri = (n) => Math.floor(r() * n);
  const actions = [];
  let f = 3;
  let phased = false;                 // start messages at random clocks within a frame
  const at = (msgs, gap) => {
    actions.push({ frame: f, offset: phased ? ri(FRAME) : 0, msgs });
    f += gap;
  };
  // registers
  at([[0x30, 0], [0x31, 0]], 20);
  // 1. every channel with its default sound
  for (let ch = 0; ch < 8; ch++) at([hitMsg(ch, DEFAULTS[ch])], 4000);
  // 2. parameter corners: every sweep and decay, pitch/balance/level corners
  let n = 0;
  for (let decay = 0; decay < 16; decay++) {
    for (let sweep = 0; sweep < 8; sweep++) {
      const pitch = [0, 255, 128, 31][n % 4];
      const balance = [0, 15][(n >> 2) & 1];
      const level = [15, 0, 15, 8][(n >> 3) & 3];
      at([hitMsg(n % 8, [pitch, sweep | (n % 16 === 5 ? 8 : 0), decay, balance, level])],
        decay < 8 ? 300 : 900);
      n++;
    }
  }
  // 3. voice stealing: 3 and 4 overlapping hits sent back to back
  for (let k = 0; k < 24; k++) {
    const msgs = [];
    const count = 3 + (k & 1);
    for (let i = 0; i < count; i++) {
      const ch = (k * 3 + i * 5) % 8;
      const p = [...DEFAULTS[ch]];
      p[4] = 4 + ((k + i * 3) % 12);
      msgs.push(hitMsg(ch, p));
    }
    at(msgs, 1500);
  }
  // 4. the hi-hat group: open cut by closed, closed retriggered by open
  for (let k = 0; k < 8; k++) {
    at([hitMsg(7, DEFAULTS[7])], 200 + k * 150);
    at([hitMsg(6, DEFAULTS[6])], 600);
    at([hitMsg(6, DEFAULTS[6]), hitMsg(7, DEFAULTS[7]), hitMsg(5, DEFAULTS[5])], 1200);
  }
  // 5. STOP: alone, in the middle of a queue, twice in a row
  for (let k = 0; k < 6; k++) {
    at([hitMsg(4, DEFAULTS[4]), hitMsg(0, DEFAULTS[0])], 100 + k * 400);
    at([[0x40]], 300);
    at([hitMsg(3, DEFAULTS[3]), [0x40], hitMsg(5, DEFAULTS[5]), [0x40], [0x40], hitMsg(1, DEFAULTS[1])], 2000);
  }
  // 6. random traffic, queued at any clock of a frame, including READs, back-to-back bursts and zero gaps
  phased = true;
  for (let ch = 0; ch < 8; ch++) at([hitMsg(ch, DEFAULTS[ch])], 500);
  const end = f + randomFrames;
  while (f < end) {
    const msgs = [];
    const count = [1, 1, 1, 2, 3, 5][ri(6)];
    for (let i = 0; i < count; i++) {
      const x = r();
      if (x < 0.04) msgs.push([0x40]);
      else if (x < 0.08) msgs.push([0x30 | ri(4), ri(256)]);
      else msgs.push(hitMsg(ri(8), [ri(256), ri(16), ri(16), ri(16), ri(16)]));
    }
    at(msgs, [0, 1, 2, 3, 5, 10, 40, 200, 1000][ri(9)]);
  }
  return { actions, frames: f + 6000 };
}

/**
 * Run a script on an engine (fresh from reset). Messages of an action are
 * queued before the engine runs frame `frame`, after `offset` of its clocks.
 * @returns {{ counts: Uint8Array, log: {lastSck:number, bytes:number[], rx:number[]}[] }}
 */
export function runScript(engine, { actions, frames }) {
  engine.reset();
  engine.takeLog();
  const counts = new Uint8Array(frames);
  const log = [];
  let done = 0, i = 0;
  while (done < frames) {
    let offset = 0;
    while (i < actions.length && actions[i].frame <= done) {
      if (actions[i].offset > offset) { engine.runCycles(actions[i].offset - offset); offset = actions[i].offset; }
      for (const m of actions[i].msgs) if (!engine.send(m)) throw new Error('queue full');
      i++;
    }
    const next = i < actions.length ? actions[i].frame : frames;
    let todo = Math.min(next, frames) - done;
    while (todo > 0) {
      const n = Math.min(todo, 8192);
      counts.set(engine.runCounts(n), done);
      done += n; todo -= n;
      log.push(...engine.takeLog());
    }
  }
  return { counts, log };
}

/** Model events from the engine's message log (alignment as in chip/test/test.py). */
export function modelEvents(log) {
  const events = [];
  for (const e of log) {
    const frame = Math.floor((e.lastSck + 3) / FRAME) + 1;
    if ((e.bytes[0] & 0xF8) === 0x18 && e.bytes.length === 4) {
      events.push({ frame, kind: 'hit', ch: e.bytes[0] & 7, payload: e.bytes.slice(1) });
    } else if (e.bytes[0] === 0x40) {
      events.push({ frame, kind: 'stop' });
    }
  }
  return events;
}

/** Per-frame 1s from chip/model/uds_model.py for these events. */
export function modelCounts(events, frames) {
  const py = fileURLToPath(new URL('./model_ref.py', import.meta.url));
  const res = spawnSync('python3', [py], {
    input: JSON.stringify({ frames, events }), maxBuffer: 1 << 28, encoding: 'utf8',
  });
  if (res.status !== 0) throw new Error('model_ref.py failed: ' + res.stderr);
  return Uint8Array.from(JSON.parse(res.stdout).counts);
}
