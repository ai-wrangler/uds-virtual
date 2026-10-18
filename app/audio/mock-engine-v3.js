// SPDX-License-Identifier: Apache-2.0
// Mock UDS v3 engine: the interface of app/engine/uds-engine.js (CONTRACT.md section 3) in plain JS, for the
// v3 panel before the real v3 Verilog exists. It is NOT the chip: it is a float synthesizer that follows the
// meaning of the patch fields in params.json (DRAFT 0 of tt-uds-v3 docs/v3/CONTRACT.md), so the editor, the
// kits and the tests have something to play. The live site never offers it: the page only uses it with
// ?v3=mock (or ?engine=mock), and the v3 entry of the Chip selector stays "coming soon" until the real
// engine is built from V3-CHIP's RTL.
//
// Shape: 12 MHz, 192 clocks per frame (62.5 kHz), 2 voices, 5-byte HITs (0x18|ch + the bytes of the
// build's hit packing), READ/STOP as v1. Voice choice as v1: same channel (hats 6 and 7 as one), a free
// voice, then the quieter one.

import { paramList, unpackHit } from './patch.js';

const DIGITS = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];
const QUEUE_MAX = 255;
const BEND_MS = [5, 15, 40, 120];

// DRAFT 0 packing, used when the build gives none (tests that load the mock directly)
export const DRAFT0_BUILD = {
  version: 'v3',
  params: [
    { id: 'pitch', bits: 8, default: 64 }, { id: 'decay', bits: 4, default: 8 }, { id: 'level', bits: 4, default: 12 },
    { id: 'bend', bits: 3, default: 0 }, { id: 'bendtime', bits: 2, default: 1 }, { id: 'mix', bits: 3, default: 0 },
    { id: 'wave', bits: 2, default: 0 }, { id: 'color', bits: 2, default: 1 }, { id: 'clap', bits: 1, default: 0 },
    { id: 'snap', bits: 3, default: 0 },
  ],
  hit: { opcode: '0x18|ch', bytes: [['pitch'], ['decay', 'level'], ['bend', 'bendtime', 'mix'], ['wave', 'color', 'clap', 'snap']] },
};

const group = (ch) => (ch === 7 ? 6 : ch);
const v = (patch, id, d = 0) => (patch[id] ?? d);

class Voice {
  constructor() { this.on = false; this.ch = 0; this.p = {}; this.age = 0; this.amp = 0; this.phase = 0; this.lp = 0; this.lp2 = 0; }
}

class MockV3Engine {
  constructor(sampleRate, build) {
    this.backend = 'mock';
    this.mockOf = 'v3';
    this.build = build && build.hit ? build : DRAFT0_BUILD;
    this.params = paramList(this.build);
    this.hitLen = 1 + this.build.hit.bytes.length;
    this.clockHz = build?.clockHz || 12000000;
    this.frameClocks = build?.frameClocks || 192;
    this.frameRate = this.clockHz / this.frameClocks;
    this.maxMessage = 8;
    this.audioModel = 'mock';
    this.out = new Float32Array(8192);
    this.reset(sampleRate);
  }

  get sampleRate() { return this._rate; }

  reset(sampleRate) {
    if (sampleRate) this._rate = sampleRate;
    this.voices = [new Voice(), new Voice()];
    this.queue = []; this.current = null; this.msgFrames = 0; this.pending = null; this.kill = false;
    this.lastCh = 0; this.cycles = 0; this.frames = 0; this.lastOnes = this.frameClocks / 2;
    this.seed = 0x1ace1; this.metal = [0, 0, 0]; this.metalCnt = [0, 0, 0];
    this.act = { busy: false, cs: false, hits: 0 };
    this.framePos = 0; this.prev = 0; this.cur = 0; this.lpf = 0;
    if (this.filterHz === undefined) this.filterHz = 15900;
    this.setFilterHz(this.filterHz);
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
  queueLength() { return this.queue.length + (this.current ? 1 : 0); }
  get uoOut() { return DIGITS[this.lastCh] | (this.lastOnes > this.frameClocks / 2 ? 0x80 : 0); }
  get uioOut() { return (this.pending ? 0x20 : 0) | ((this.frames & 1) ? 0x10 : 0); }
  takeActivity() { const a = this.act; this.act = { busy: false, cs: false, hits: 0 }; return a; }

  // the virtual controller: SCK = clk/8, so 64 clocks per byte, then wait for BUSY low
  controller() {
    if (!this.current) {
      if (!this.queue.length || this.pending) return;
      this.current = this.queue.shift();
      this.msgFrames = Math.ceil((this.current.length * 64 + 16) / this.frameClocks);
    }
    this.act.cs = true;
    if (--this.msgFrames > 0) return;
    const m = this.current; this.current = null;
    const cmd = m[0];
    if ((cmd & 0xf8) === 0x18 && m.length >= this.hitLen) {
      this.pending = { ch: cmd & 7, patch: unpackHit(this.build, m.subarray(1)) };
      this.act.hits++; this.act.busy = true; this.lastCh = cmd & 7;
    } else if (cmd === 0x40) this.kill = true;
  }

  choose(ch) {
    const g = group(ch), vs = this.voices;
    for (let i = 0; i < vs.length; i++) if (vs[i].on && group(vs[i].ch) === g) return i;
    for (let i = 0; i < vs.length; i++) if (!vs[i].on) return i;
    return vs[0].amp <= vs[1].amp ? 0 : 1;
  }

  rnd() {   // 17-bit LFSR, as the v1 drum noise
    const s = this.seed, fb = ((s >> 16) ^ (s >> 13)) & 1;
    this.seed = ((s << 1) | fb) & 0x1ffff;
    return (s & 1) ? 1 : -1;
  }

  stepFrame() {
    const FR = this.frameRate;
    if (this.pending) {
      const i = this.choose(this.pending.ch), vo = this.voices[i];
      vo.on = true; vo.ch = this.pending.ch; vo.p = this.pending.patch; vo.age = 0; vo.phase = 0; vo.lp = 0; vo.lp2 = 0;
      this.pending = null;
    }
    if (this.kill) { for (const vo of this.voices) vo.on = false; this.kill = false; }
    // the fixed "metal" source: squares at fs/6, fs/10, fs/14, XORed
    const halves = [3, 5, 7];
    for (let k = 0; k < 3; k++) if (++this.metalCnt[k] >= halves[k]) { this.metalCnt[k] = 0; this.metal[k] ^= 1; }
    const metalFix = this.metal[0] ^ this.metal[1] ^ this.metal[2];
    const white = this.rnd();
    let total = 0;
    for (const vo of this.voices) {
      if (!vo.on) continue;
      const p = vo.p, t = vo.age / FR;
      const decay = v(p, 'decay', 8), level = v(p, 'level', 12);
      const env = Math.exp(-t / (8 * 2 ** decay / 62500));
      vo.amp = env * level / 15;
      if (vo.amp < 2e-4 || level === 0) { vo.on = false; continue; }
      // pitch: exponential, 32 steps per octave, as v1; the bend starts up to 3 octaves higher
      const pe = v(p, 'pitch', 64);
      const base = (32 + (pe & 31)) * 2 ** (pe >> 5) * 62500 / 65536;
      const bend = v(p, 'bend', 0) * 3 / 7 * Math.exp(-t * 1000 / BEND_MS[v(p, 'bendtime', 1) & 3]);
      vo.phase = (vo.phase + Math.min(0.45, base * 2 ** bend / FR)) % 1;
      const ph = vo.phase, tri = 1 - 4 * Math.abs(ph - 0.5);
      let tone;
      switch (v(p, 'wave', 0)) {
        case 1: tone = Math.max(-1, Math.min(1, tri * 3)); break;            // driven (clipped) triangle
        case 2: tone = ph < 0.5 ? 1 : -1; break;                              // square
        case 3: tone = ((ph < 0.5 ? 1 : 0) ^ metalFix) ? 1 : -1; break;       // metal: square XOR fixed squares
        default: tone = tri;
      }
      // noise colour
      vo.lp += 0.18 * (white - vo.lp);
      let noise;
      switch (v(p, 'color', 1)) {
        case 0: vo.lp2 += 0.25 * (vo.lp - vo.lp2); noise = vo.lp2 * 2.2; break;   // dark
        case 2: noise = (white - vo.lp) * 0.9; break;                             // bright (high-passed)
        case 3: noise = (metalFix ? 0.75 : -0.75) + 0.25 * white; break;           // metallic
        default: noise = white;
      }
      if (v(p, 'clap', 0)) {   // 4 bursts 10 ms apart, then the tail
        const ms = t * 1000;
        noise *= ms < 40 ? 0.25 + 0.75 * Math.exp(-(ms % 10) / 2.2) : 1;
      }
      const m = v(p, 'mix', 0) / 7;
      let s = tone * (1 - m) + noise * m;
      const snap = v(p, 'snap', 0);
      if (snap && t < 0.004) s += (snap / 7) * 1.5 * Math.exp(-t / 0.0007) * (t < 0.0003 ? 1 : white);
      total += s * vo.amp;
      vo.age++;
    }
    // a full-level voice reaches about 1/6 of the pin's swing, as on v1 (the worker's gain 3 makes up for it)
    const x = Math.max(-1, Math.min(1, total / 6));
    this.lastOnes = Math.round((x + 1) * this.frameClocks / 2);
    this.frames++; this.cycles += this.frameClocks;
    this.controller();
    if (this.pending) this.act.busy = true;
    return x;
  }

  advance(x) { this.lpf += this.alpha * (x - this.lpf); this.prev = this.cur; this.cur = this.lpf; }

  runFrames(n) {
    for (let i = 0; i < n; i++) this.advance(this.stepFrame());
    return this.lastOnes;
  }

  render(n) {
    n = Math.max(1, Math.min(8192, n | 0));
    const out = this.out;
    for (let i = 0; i < n; i++) {
      this.framePos += this.step;
      while (this.framePos >= 1) { this.framePos -= 1; this.advance(this.stepFrame()); }
      out[i] = this.prev + (this.cur - this.prev) * this.framePos;
    }
    return out.subarray(0, n);
  }
}

/** The mock v3 engine; build = the v3 entry of builds.json with its params and hit packing. */
export async function loadMockV3Engine({ sampleRate = 48000, build = null } = {}) {
  return new MockV3Engine(sampleRate, build);
}
