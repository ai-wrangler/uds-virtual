// SPDX-License-Identifier: Apache-2.0
// Mock UDS v3 engine: a JavaScript port of V3-CHIP's golden model (tt-uds-v3 model/uds3_model.py, CONTRACT 2),
// with the interface of app/engine/uds-engine.js (CONTRACT.md section 3).
//
// It runs the model at window granularity (2 voices x 64-clock windows = one 128-clock frame at 8 MHz), with the
// model's standard host (one SPI byte per window, a BUSY wait after every byte of a HIT), and turns the number
// of 1s per frame into sound like the real engine's Audio Pmod model (AC coupling, RC low-pass, resampling).
// tests/audio/v3.test.mjs checks its frame counts against the Python model's on engine/test/fixtures/
// model_frames_v3.json.
//
// It is NOT the chip's Verilog. The live site never offers it: the page uses it only with ?v3=mock (or
// ?engine=mock), and the v3 entry of the Chip selector stays "coming soon" until the real engine is built from
// V3-CHIP's RTL.

import { paramList, unpackHit } from './patch.js';

const DIGITS = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];
const QUEUE_MAX = 255;
const L = 64;                 // clocks per window
const DAC_FB = 256;

// CONTRACT 1/2 packing (the same), used when the loader gives no build (tests that load the mock directly)
export const CONTRACT1_BUILD = {
  version: 'v3', contract: 2, clockHz: 8000000, frameClocks: 128,
  params: [
    { id: 'pitch', bits: 8, default: 64 }, { id: 'decay', bits: 4, default: 8 }, { id: 'wave', bits: 2, default: 0 },
    { id: 'color', bits: 2, default: 1 }, { id: 'bend', bits: 2, default: 0 }, { id: 'res', bits: 1, default: 0 },
    { id: 'bendtime', bits: 3, default: 3 }, { id: 'mode', bits: 2, default: 0 }, { id: 'mix', bits: 3, default: 0 },
    { id: 'level', bits: 4, default: 12 }, { id: 'click', bits: 1, default: 0 },
  ],
  hit: { opcode: '0x18|ch', bytes: [['pitch'], ['decay', 'wave', 'color'], ['bend', 'res', 'bendtime', 'mode'], ['mix', 'level', 'click']] },
};

// ---- voice math (model/uds3_model.py) ----
const s8 = (v) => { v &= 0xff; return v & 0x80 ? v - 256 : v; };
const increment = (pe) => (32 + (pe & 31)) << (pe >> 5);
const bendoff = (aux, bend) => (((bend & 2) ? aux >> 1 : 0) + ((bend & 1) ? aux >> 2 : 0)) >> 1;
const effPitch = (pitch, aux, bend) => Math.min(255, pitch + bendoff(aux, bend));
function triangle(ph) {
  const fold = ((ph >> 7) & 0xff) ^ (ph & 0x8000 ? 0xff : 0);
  return s8((((~fold >> 7) & 1) << 7) | (fold & 0x7f));
}
function waveform(ph, wave, frame) {
  const tri = triangle(ph);
  if (wave === 0) return tri;
  if (wave === 1) return Math.max(-128, Math.min(127, 2 * tri));
  let sq = (ph >> 15) & 1;
  if (wave === 3) sq ^= (frame & 1) ^ ((frame >> 2) & 1);
  return sq ? -128 : 127;
}
// CONTRACT 2: the envelope mode moves the noise share with the aux envelope (both parts follow env)
function effMix(mix, mode, aux) {
  const a3 = aux >> 5;
  if (mode === 1) return Math.max(mix, 7 - a3);           // short tone: the noise takes over
  if (mode === 2) return Math.min(mix, a3);               // short noise: the noise share falls
  if (mode === 3) return aux >> 6 ? (aux >> 3) & 7 : mix; // clap: 3 bursts, then the tail
  return mix;
}
const POP4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
function noise(color, lfsr, frame) {
  if (color === 0) { const pc = POP4[lfsr & 15]; return pc === 4 ? 127 : pc * 64 - 128; }
  if (color === 1) return lfsr & 1 ? 127 : -128;
  if (color === 2) { const a = lfsr & 1, b = (lfsr >> 1) & 1; return a === b ? 0 : (a ? 127 : -128); }
  return ((frame >> 1) ^ (frame >> 3) ^ (frame >> 4)) & 1 ? 127 : -128;
}
function tz13(frame) {
  let f = frame & 0x1fff;
  if (f === 0) return 13;
  let n = 0;
  while (!(f & 1)) { f >>= 1; n++; }
  return n;
}
// noise slots of a window per mix value: SEL[mix][t]
const SEL = Array.from({ length: 8 }, (_, mix) => Array.from({ length: L }, (_, t) => {
  if (mix === 7) return true;
  const r = ((t & 1) << 2) | (t & 2) | ((t >> 2) & 1);
  return r < mix;
}));
const group = (ch) => (ch === 7 ? 6 : ch);

class Voice {
  constructor() { this.pitch = 0; this.decay = 0; this.wave = 0; this.color = 0; this.bend = 0; this.res = 0; this.btime = 0; this.mode = 0; this.mix = 0; this.ch = 0; this.env = 0; this.aux = 0; this.phase = 0; }
}

class MockV3Engine {
  constructor(sampleRate, build) {
    this.backend = 'mock';
    this.mockOf = 'v3';
    this.build = build && build.hit ? build : CONTRACT1_BUILD;
    this.params = paramList(this.build);
    this.clockHz = this.build.clockHz || 8000000;
    this.frameClocks = this.build.frameClocks || 128;
    this.frameRate = this.clockHz / this.frameClocks;
    this.maxMessage = 8;
    this.audioModel = 'count';
    this.out = new Float32Array(8192);
    this.reset(sampleRate);
  }

  get sampleRate() { return this._rate; }

  reset(sampleRate) {
    if (sampleRate) this._rate = sampleRate;
    // model Engine
    this.v = [new Voice(), new Voice()];
    this.n = 0; this.frame = 0; this.lfsr = 1; this.d1 = 0; this.d2 = -1;
    this.pend = false; this.tgt = 0; this.hv = false; this.cb = 0; this.rx = 0; this.ch = 0;
    this.con = false; this.killPend = false; this.kill = false;
    // model Host
    this.queue = []; this.cur = null; this.ci = 0;
    this.lastCh = 0; this.cycles = 0; this.frames = 0; this.lastOnes = this.frameClocks / 2;
    this.act = { busy: false, cs: false, hits: 0 };
    // Audio Pmod (as the harness: count of 1s per frame, 5 Hz AC coupling, RC, linear resampling)
    this.dc = 0; this.lp = 0; this.prev = 0; this.cur0 = 0; this.framePos = 0;
    if (this.filterHz === undefined) this.filterHz = 15900;
    this.setFilterHz(this.filterHz);
    this.dcAlpha = 2 * Math.PI * 5 / this.frameRate;
    this.step = this.frameRate / this._rate;
  }

  setFilterHz(hz) {
    this.filterHz = +hz || 0;
    this.alpha = this.filterHz > 0 ? 1 - Math.exp(-2 * Math.PI * this.filterHz / this.frameRate) : 1;
  }

  send(bytes) {
    if (!(bytes.length >= 1 && bytes.length <= this.maxMessage) || this.queue.length >= QUEUE_MAX) return false;
    this.queue.push(Uint8Array.from(bytes));
    return true;
  }
  stop() { return this.send([0x40]); }
  queueLength() { return this.queue.length + (this.cur ? 1 : 0); }
  get uoOut() { return DIGITS[this.lastCh] | (this.lastOnes > this.frameClocks / 2 ? 0x80 : 0); }
  get uioOut() { return (this.busy() ? 0x20 : 0) | ((this.n & 1) ? 0 : 0x10); }
  takeActivity() { const a = this.act; this.act = { busy: false, cs: false, hits: 0 }; return a; }
  busy() { return this.pend || this.hv; }

  // the model's Host.next_event, at each window start. READ messages go out byte by byte but do nothing here.
  nextEvent() {
    if (this.busy()) return null;
    if (!this.cur) {
      if (!this.queue.length) return null;
      this.cur = this.queue.shift(); this.ci = 0;
    }
    const msg = this.cur, i = this.ci, c0 = msg[0];
    let ev = null;
    if (i === 0) {
      if (c0 === 0x40) ev = { kind: 'stop' };
      else if ((c0 & 0xf8) === 0x18) ev = { kind: 'hit', ch: c0 & 7 };
    } else if ((c0 & 0xf8) === 0x18) ev = { kind: 'byte', k: i, b: msg[i] };
    this.act.cs = true;
    if (++this.ci >= msg.length) {
      this.cur = null;
      if ((c0 & 0xf8) === 0x18 && msg.length >= 5) { this.act.hits++; this.lastCh = c0 & 7; }
    }
    return ev;
  }

  // the model's Engine.step_window: one 64-clock window; returns its number of 1s on the audio pin
  stepWindow(ev) {
    const n = this.n, vi = n & 1, clearing = (n >> 1) === 0;
    const voc = this.v[vi];
    const capFrame = vi === 1 ? this.frame : (this.frame - 1) & 0x1fff;
    const tone = waveform(voc.phase, voc.wave, capFrame);
    const env0 = voc.env, meff = effMix(voc.mix, voc.mode, voc.aux), clap = voc.mode === 3;
    const color = voc.color;
    const tz = tz13(this.frame);
    const dec = voc.env !== 0 && (tz >= voc.decay || tz === 13);
    const lin = voc.mode === 3;
    const ad = lin ? voc.btime : voc.btime + 3;
    const adec = voc.aux !== 0 && tz >= ad;
    // output through the 2nd-order sigma-delta
    let ones = 0, v1 = this.d1, v2 = this.d2;
    if (clearing) {
      for (let t = 0; t < L; t++) { const y = v2 >= 0 ? 1 : 0, fb = y ? DAC_FB : -DAC_FB; ones += y; const nv1 = v1 - fb; v2 = v2 + v1 - 2 * fb; v1 = nv1; }
    } else {
      const nz = noise(color, this.lfsr, this.frame), sel = SEL[meff], q = env0 >> 3, r = env0 & 7;
      const tn = clap ? 0 : tone;
      for (let t = 0; t < L; t++) {
        const src = sel[t] ? nz : tn;
        const x = t < q ? src : (t < q + r ? src >> 3 : 0);
        const y = v2 >= 0 ? 1 : 0, fb = y ? DAC_FB : -DAC_FB;
        ones += y;
        const nv1 = v1 + x - fb; v2 = v2 + v1 - 2 * fb; v1 = nv1;
      }
    }
    this.d1 = v1; this.d2 = v2;
    if (ev) {
      if (ev.kind === 'hit') { this.pend = true; this.ch = ev.ch & 7; this.act.busy = true; }
      else if (ev.kind === 'byte') { this.hv = true; this.cb = ev.k; this.rx = ev.b & 255; this.act.busy = true; }
      else if (ev.kind === 'stop') this.killPend = true;
    }
    if (clearing) this.v[vi] = new Voice();
    else {
      if (dec) voc.env -= voc.env < 8 ? 1 : voc.env >> 3;
      if (this.kill) voc.env = 0;
      if (adec) voc.aux -= (voc.aux < 8 || lin) ? 1 : voc.aux >> 3;
      const p3 = this.con && this.cb === 4;
      if (this.con) this.commit(voc);
      if (!p3) voc.phase = (voc.phase + increment(effPitch(voc.pitch, voc.aux, voc.bend))) & 0xffff;   // the new aux
    }
    if (this.hv && !this.pend && (1 - vi) === this.tgt) this.con = true;
    else if (this.con) { this.con = false; this.hv = false; }
    if (vi === 1) {
      const a0 = this.v[0].env !== 0, a1 = this.v[1].env !== 0;
      this.kill = this.killPend; this.killPend = false;
      if (this.pend) { this.tgt = this.choose(a0, a1); this.pend = false; }
      if (!a0 && !a1) { this.d1 = 0; this.d2 = -1; }
      const l = this.lfsr;
      this.lfsr = ((l << 1) | (((l >> 16) ^ (l >> 13)) & 1)) & 0x1ffff;
      this.frame = (this.frame + 1) & 0x1fff;
    }
    this.n++;
    return ones;
  }

  choose(a0, a1) {
    const hg = group(this.ch), [v0, v1] = this.v;
    if (a0 && group(v0.ch) === hg) return 0;
    if (a1 && group(v1.ch) === hg) return 1;
    if (!a0) return 0;
    if (!a1) return 1;
    return (v1.env >> 5) < (v0.env >> 5) ? 1 : 0;
  }

  commit(voc) {
    const b = this.rx, k = this.cb;
    if (k === 1) { voc.pitch = b; voc.env = 0; }
    else if (k === 2) { voc.decay = b >> 4; voc.wave = (b >> 2) & 3; voc.color = b & 3; }
    else if (k === 3) { voc.bend = b >> 6; voc.res = (b >> 5) & 1; voc.btime = (b >> 2) & 7; voc.mode = b & 3; }
    else if (k === 4) {
      voc.mix = b >> 5; voc.ch = this.ch; voc.env = ((b >> 1) & 15) * 17; voc.aux = 255;
      voc.phase = b & 1 ? 0x8000 : 0x4000;
    }
  }

  /** One frame: two windows. Returns its 1s (0..128). */
  stepFrame() {
    let ones = 0;
    for (let w = 0; w < 2; w++) ones += this.stepWindow(this.nextEvent());
    this.lastOnes = ones; this.frames++; this.cycles += this.frameClocks;
    return ones;
  }

  advance(ones) {
    const h = this.frameClocks / 2;
    let x = (ones - h) / h;
    this.dc += (x - this.dc) * this.dcAlpha;
    x -= this.dc;
    this.lp += this.alpha * (x - this.lp);
    this.prev = this.cur0; this.cur0 = this.lp;
  }

  runFrames(n) {
    for (let i = 0; i < n; i++) this.advance(this.stepFrame());
    return this.lastOnes;
  }

  /** Frame counts of n frames (tests). */
  runCounts(n) {
    const c = new Uint8Array(n);
    for (let i = 0; i < n; i++) { c[i] = this.stepFrame(); this.advance(c[i]); }
    return c;
  }

  render(n) {
    n = Math.max(1, Math.min(8192, n | 0));
    const out = this.out;
    for (let i = 0; i < n; i++) {
      this.framePos += this.step;
      while (this.framePos >= 1) { this.framePos -= 1; this.advance(this.stepFrame()); }
      out[i] = this.prev + (this.cur0 - this.prev) * this.framePos;
    }
    return out.subarray(0, n);
  }
}

/** The mock v3 engine; build = the v3 entry of builds.json with its params and hit packing. */
export async function loadMockV3Engine({ sampleRate = 48000, build = null } = {}) {
  return new MockV3Engine(sampleRate, build);
}

export { unpackHit };
