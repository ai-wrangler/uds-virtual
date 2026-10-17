// SPDX-License-Identifier: Apache-2.0
// Mock engine: the same interface as app/engine/uds-engine.js (CONTRACT section 3), in plain JS.
//
// It is a frame-level JavaScript port of the chip's golden model (chip/model/uds_model.py): a triangle
// oscillator plus LFSR or "metal" noise per voice, an exponential envelope, a pitch sweep, two voice slots
// with the chip's slot choice, and a first-order sigma-delta DAC. It does not simulate clocks or SPI bits;
// queued messages take effect a few frames later, like the virtual RP2040 of the real engine.

export const CLOCK_HZ = 6000000;
export const VOICES = 2;
export const FRAME_CLOCKS = 96;
export const FRAME_RATE = 62500;

const WORD = 48;
const FRAME_BITS = 13;
const PHASE_START = 0x4000;
const METAL = [false, false, false, false, false, true, true, true];
const DIGITS = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];
const QUEUE_MAX = 64;
const BITREV4 = Array.from({ length: 16 }, (_, i) => parseInt(i.toString(2).padStart(4, '0').split('').reverse().join(''), 2));

// WEIGHTS[env * 16 + balance] = [triangle weight, noise weight] over the voice's 48-clock window
const WT = new Int32Array(256 * 16);
const WN = new Int32Array(256 * 16);
for (let env = 0; env < 256; env++) {
  const q = env >> 3, r = env & 7;
  for (let bal = 0; bal < 16; bal++) {
    let wt = 0, wn = 0;
    for (let t = 0; t < WORD; t++) {
      const w = t < q ? 8 : (t < q + r ? 1 : 0);
      if (w) { if (BITREV4[t & 15] < bal) wn += w; else wt += w; }
    }
    WT[env * 16 + bal] = wt; WN[env * 16 + bal] = wn;
  }
}

function increment(pe) { return (32 + (pe & 31)) << (pe >> 5); }
function triangle(phase) {
  const p = phase >> 6;
  const t = (p & 0x1ff) ^ ((p & 0x200) ? 0x1ff : 0);
  return t - 256;
}
function group(ch) { return ch === 7 ? 6 : ch; }

class Slot {
  constructor() { this.ch = 0; this.pitch = 0; this.decay = 0; this.sweep = 0; this.balance = 0; this.env = 0; this.phase = 0; }
}

class MockEngine {
  constructor(sampleRate) {
    this.backend = 'mock';
    this.out = new Float32Array(8192);
    this.reset(sampleRate);
  }

  reset(sampleRate) {
    if (sampleRate) this.sampleRate = sampleRate;
    this.slots = Array.from({ length: VOICES }, () => new Slot());
    this.frame = 0; this.lfsr = 1;
    this.metalCount = [0, 0, 0]; this.metalSq = [0, 0, 0];
    this.acc = 0; this.pending = null; this.kill = false;
    this.queue = []; this.current = null; this.msgFrames = 0;
    this.lastCh = 0; this.ones = 48;
    this.cycles = 0; this.frames = 0;
    this.act = { busy: false, cs: false, hits: 0 };
    this.framePos = 0;            // fractional position between frames, for resampling
    this.prev = 0; this.cur = 0;  // filtered values of the last two frames
    this.lp = 0;
    if (this.filterHz === undefined) this.filterHz = 15900;
    this.setFilterHz(this.filterHz);
    this.step = FRAME_RATE / this.sampleRate;
  }

  setFilterHz(hz) {
    this.filterHz = hz;
    this.alpha = hz > 0 ? 1 - Math.exp(-2 * Math.PI * hz / FRAME_RATE) : 1;
  }

  send(bytes) {
    if (this.queue.length >= QUEUE_MAX) return false;
    this.queue.push(Uint8Array.from(bytes));
    return true;
  }
  hit(ch, p = {}) {
    const pitch = (p.pitch ?? 0) & 255, sweep = (p.sweep ?? 0) & 7, decay = (p.decay ?? 0) & 15;
    const balance = (p.balance ?? 0) & 15, level = (p.level ?? 0) & 15;
    return this.send([0x18 | (ch & 7), pitch, (decay << 4) | sweep, (balance << 4) | level]);
  }
  stop() { return this.send([0x40]); }
  queueLength() { return this.queue.length + (this.current ? 1 : 0); }

  get uoOut() { return DIGITS[this.lastCh] | (this.ones > 48 ? 0x80 : 0); }
  get uioOut() {
    const a = this.ones > 48 ? 0xc0 : 0;
    return a | (this.pending ? 0x20 : 0) | ((this.frame & 1) ? 0x10 : 0);
  }
  takeActivity() { const a = this.act; this.act = { busy: false, cs: false, hits: 0 }; return a; }

  // The virtual controller: one message at a time, about 64 clocks per byte, then wait for BUSY low.
  controller() {
    if (!this.current) {
      if (!this.queue.length || this.pending) return;
      this.current = this.queue.shift();
      this.msgFrames = Math.ceil(this.current.length * 64 / FRAME_CLOCKS);
    }
    this.act.cs = true;
    if (--this.msgFrames > 0) return;
    const m = this.current; this.current = null;
    const cmd = m[0];
    if ((cmd & 0xf8) === 0x18 && m.length >= 4) {
      this.pending = [cmd & 7, m[1], m[2], m[3]];
      this.act.hits++; this.act.busy = true;
      this.lastCh = cmd & 7;
    } else if (cmd === 0x40) {
      this.kill = true;
    }
  }

  choose(ch) {
    const g = group(ch), s = this.slots;
    for (let i = 0; i < s.length; i++) if (s[i].env && group(s[i].ch) === g) return i;
    for (let i = 0; i < s.length; i++) if (s[i].env === 0) return i;
    let best = 0;
    for (let i = 1; i < s.length; i++) if ((s[i].env >> 5) < (s[best].env >> 5)) best = i;
    return best;
  }

  stepFrame() {
    const f = this.frame;
    let commit = -1, payload = null;
    if (this.pending) { payload = this.pending; commit = this.choose(payload[0]); this.pending = null; }
    const kill = this.kill; this.kill = false;
    // noise
    let pc = 0, l = this.lfsr & 15; while (l) { pc += l & 1; l >>= 1; }
    const drum = Math.min(pc * 128 - 256, 255);
    const metal = (this.metalSq[0] ^ this.metalSq[1] ^ this.metalSq[2] ^ ((f >> 2) & 1)) ? 255 : -256;
    let total = 0;
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i];
      const env = s.env;
      if (env) {
        const k = env * 16 + s.balance;
        total += WT[k] * triangle(s.phase) + WN[k] * (METAL[s.ch] ? metal : drum);
      }
      let off = 0;
      if (s.sweep && env >= 128) off = (env - 128) >> (7 - s.sweep);
      const pe = Math.min(s.pitch + off, 255);
      s.phase = (s.phase + increment(pe)) & 0xffff;
      if (env && (f & ((1 << Math.min(s.decay, FRAME_BITS)) - 1)) === 0) {
        const d = env >> 3;
        s.env = env - (d ? d : 1);
      }
      if (kill) s.env = 0;
      if (commit === i) {
        s.ch = payload[0]; s.pitch = payload[1]; s.decay = payload[2] >> 4; s.sweep = payload[2] & 15;
        s.balance = payload[3] >> 4; s.env = 17 * (payload[3] & 15); s.phase = PHASE_START;
      }
    }
    const lf = this.lfsr;
    const fb = ((lf >> 16) ^ (lf >> 13)) & 1;
    this.lfsr = ((lf << 1) | fb) & 0x1ffff;
    const halves = [3, 5, 7];
    for (let k = 0; k < 3; k++) {
      if (this.metalCount[k] === halves[k] - 1) { this.metalCount[k] = 0; this.metalSq[k] ^= 1; }
      else this.metalCount[k]++;
    }
    this.frame = (f + 1) & ((1 << FRAME_BITS) - 1);
    const x = this.acc + FRAME_CLOCKS * 2048 + total;
    this.acc = x & 0xfff;
    this.ones = x >> 12;
    this.frames++; this.cycles += FRAME_CLOCKS;
    this.controller();
    if (this.pending) this.act.busy = true;
    return this.ones;
  }

  runFrames(n) {
    let ones = 0;
    for (let i = 0; i < n; i++) { ones = this.stepFrame(); this.advanceFilter(ones); }
    return ones;
  }

  advanceFilter(ones) {
    const v = ones / 48 - 1;           // pin duty over the frame, full swing -> -1..1
    this.lp += this.alpha * (v - this.lp);
    this.prev = this.cur; this.cur = this.lp;
  }

  render(n) {
    n = Math.max(1, Math.min(8192, n | 0));
    const out = this.out;
    for (let i = 0; i < n; i++) {
      this.framePos += this.step;
      while (this.framePos >= 1) { this.framePos -= 1; this.advanceFilter(this.stepFrame()); }
      out[i] = this.prev + (this.cur - this.prev) * this.framePos;
    }
    return out.subarray(0, n);
  }
}

export async function loadMockEngine({ sampleRate = 48000 } = {}) {
  return new MockEngine(sampleRate);
}
