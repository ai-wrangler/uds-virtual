// fake-audio.js — the UDSAudio surface (CONTRACT.md section 5) with no sound.
// Used by the panel with ?fake=1, and as a fallback when ../audio/uds-audio.js cannot be loaded.
// It loads the real channel and pattern data, runs the rhythm and MIDI players on timers and emits
// simulated 'status', 'hit', 'step' and 'midi' events so every part of the panel can be exercised.

const DIGITS = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];
const CLOCK_HZ = 6000000;
const FRAME_RATE = 62500;

const NOTE_MAP = {};
for (const [notes, ch] of [
  [[35, 36], 4], [[37, 38, 39, 40], 0], [[41, 43], 3], [[45, 47], 2], [[48, 50], 1],
  [[42, 44], 6], [[46], 7], [[49, 51, 52, 55, 57, 59], 5],
]) for (const n of notes) NOTE_MAP[n] = ch;

export class FakeUDSAudio extends EventTarget {
  static async create(opts = {}) {
    const base = new URL('../data/', import.meta.url);
    const [cj, pj] = await Promise.all([
      fetch(new URL('channels.json', base)).then((r) => r.json()),
      fetch(new URL('patterns.json', base)).then((r) => r.json()),
    ]);
    return new FakeUDSAudio(cj, pj, opts);
  }

  constructor(cj, pj, opts) {
    super();
    this.fake = true;
    this._opts = opts;
    this.accentLevelDrop = cj.accentLevelDrop ?? 4;
    this.channels = cj.channels.map((c) => ({ ...c, params: { ...c.params } }));
    this.knobs = cj.knobs.map((k) => ({ ...k }));
    this.patterns = pj.patterns.map((p) => ({ ...p }));
    this._defaults = cj.channels.map((c) => ({ ...c.params }));
    this._params = cj.channels.map((c) => ({ ...c.params }));
    this.state = 'idle';
    this.info = { backend: 'fake', mock: true, clockHz: CLOCK_HZ, voices: 2, frameRate: FRAME_RATE, sampleRate: 48000 };
    this.analyser = null;
    this.volume = 0.8;
    this.filter = 'rc';
    this.pattern = this.patterns[0]?.id ?? 'A0';
    this.slots = new Array(16).fill(null);
    this.slot = null;
    this.tempo = 120;
    this.rhythmPlaying = false;
    this.midiPlaying = false;
    this.midiInputs = [];
    this._midi = null;
    this._midiLoop = false;
    this._uoOut = 0;
    this._cycles = 0;
    this._frames = 0;
    this._busyUntil = 0;
    this._t0 = 0;
  }

  _emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  _setState(s) { this.state = s; this._emit('state', { state: s }); }

  async start() {
    if (this.state === 'running') return;
    this._setState('starting');
    await new Promise((r) => setTimeout(r, 30));
    this._setState('running');
    this._last = performance.now();
    clearInterval(this._statusTimer);
    this._statusTimer = setInterval(() => this._tick(), 50);
  }

  async suspend() {
    clearInterval(this._statusTimer);
    this.stopRhythm();
    this.stopMidi();
    this._setState('suspended');
  }

  _tick() {
    const now = performance.now();
    const dt = (now - this._last) / 1000;
    this._last = now;
    const realtime = 1.9 + 0.15 * Math.sin(now / 1500);
    const cyc = Math.round(CLOCK_HZ * dt);
    this._cycles += cyc;
    this._frames = Math.floor(this._cycles / 96);
    const busy = now < this._busyUntil;
    const audio = Math.random() < 0.5 ? 0x80 : 0;
    const frame = Math.random() < 0.5 ? 0x10 : 0;
    this._emit('status', {
      simHz: CLOCK_HZ * realtime, realtime, cycles: this._cycles, frames: this._frames,
      uoOut: (this._uoOut & 0x7f) | audio,
      uioOut: frame | (busy ? 0x20 : 0) | (audio ? 0xc0 : 0),
      busy, cs: busy, queue: 0, leadMs: 80, underruns: 0,
    });
    if (this._midi && this.midiPlaying) this._midiTick();
  }

  // --- knobs ---
  getParams(ch) { return { ...this._params[ch] }; }
  setParams(ch, partial) {
    const p = this._params[ch];
    for (const k of this.knobs) {
      if (partial[k.key] !== undefined) p[k.key] = Math.max(k.min, Math.min(k.max, Math.round(partial[k.key])));
    }
    this.channels[ch].params = { ...p };
  }
  resetParams(ch) {
    const list = ch === undefined ? this.channels.map((c) => c.ch) : [ch];
    for (const c of list) { this._params[c] = { ...this._defaults[c] }; this.channels[c].params = { ...this._defaults[c] }; }
  }

  // --- hits ---
  _play(ch, v, source, accentDrop = 0) {
    if (v <= 0) return;
    let level = Math.round(this._params[ch].level * v);
    if (level < 1) level = 1;
    level = Math.max(0, level - accentDrop);
    this._uoOut = DIGITS[ch];
    this._busyUntil = performance.now() + 30;
    this._emit('hit', { ch, level, source });
  }
  hit(ch, { velocity = 1 } = {}) { this._play(ch, velocity, 'pad'); }
  stopAll() { this.stopRhythm(); this.stopMidi(); }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }
  setFilter(mode) { this.filter = mode; }

  // --- Autorhythm slots (same conversion as the real UDSAudio: ../audio/slots.js) ---
  _emitSlots() { this._emit('slots', { slots: this.slots.map((s) => (s ? { ...s } : null)), slot: this.slot }); }
  async loadSlot(index, buf, name = 'file.mid') {
    index = Number(index);
    if (!(Number.isInteger(index) && index >= 0 && index < 16)) throw new Error('slot index must be 0..15');
    const { midiBytesToSlot } = await import('../audio/slots.js');
    const c = midiBytesToSlot(buf, name);
    const slot = { index, name: c.name, bars: c.bars, steps: c.steps, stepsPerBeat: c.stepsPerBeat,
      stepsPerBar: c.stepsPerBar, beatSteps: c.beatSteps, meter: c.meter, notes: c.notes, bpm: c.bpm,
      truncated: c.truncated, unmapped: c.unmapped };
    this.slots[index] = slot;
    if (this.slot === index) this.setTempo(slot.bpm);
    this._emitSlots();
    return { ...slot };
  }
  clearSlot(index) {
    if (!this.slots[index]) return;
    if (this.slot === index) this.stopRhythm();
    this.slots[index] = null;
    this._emitSlots();
  }
  setSlot(index) {
    if (index === null || index === undefined) { this.slot = null; this._emitSlots(); return; }
    this.slot = Number(index);
    const s = this.slots[this.slot];
    if (s) { this._pendingSlot = true; this.setTempo(s.bpm); } else this.stopRhythm();
    this._emitSlots();
  }

  // --- rhythm ---
  setPattern(id) {
    const p = this.patterns.find((x) => x.id === id);
    if (!p) return;
    this.pattern = id;
    this.slot = null;
    if (p.bpm) this.tempo = p.bpm;
    this._step = 0;
  }
  setTempo(bpm) {
    this.tempo = Math.max(40, Math.min(240, Math.round(bpm)));
    if (this.rhythmPlaying) { clearTimeout(this._rt); this._scheduleStep(); }
  }
  startRhythm() {
    if (this.rhythmPlaying) return;
    if (this.slot !== null && !this.slots[this.slot]) return;
    this.rhythmPlaying = true;
    this._step = 0;
    this._runStep();
  }
  stopRhythm() { this.rhythmPlaying = false; clearTimeout(this._rt); }
  _scheduleStep() {
    const p = this.slot !== null ? this.slots[this.slot] : this.patterns.find((x) => x.id === this.pattern);
    const ms = 60000 / (this.tempo * (p?.stepsPerBeat || 4));
    this._rt = setTimeout(() => this._runStep(), ms);
  }
  _runStep() {
    if (!this.rhythmPlaying) return;
    if (this.slot !== null) {
      const s = this.slots[this.slot];
      if (!s) { this.rhythmPlaying = false; return; }
      if (this._pendingSlot && this._step % s.stepsPerBar === 0) { this._step = 0; this._pendingSlot = false; }
      const i = this._step % s.steps;
      this._emit('step', { index: i, length: s.steps, patternId: 'S' + this.slot, slot: this.slot });
      for (const n of s.notes) if (n.step === i) this._play(n.ch, n.v, 'rhythm');
      this._step = i + 1;
      this._scheduleStep();
      return;
    }
    const p = this.patterns.find((x) => x.id === this.pattern);
    const i = this._step % p.length;
    const bits = p.steps[i];
    const accented = p.accents.reduce((a, b) => a | b, 0);
    this._emit('step', { index: i, length: p.length, patternId: p.id, slot: null });
    for (let ch = 0; ch < 8; ch++) {
      if (bits & (1 << ch)) {
        const drop = (accented & (1 << ch)) && !(p.accents[i] & (1 << ch)) ? this.accentLevelDrop : 0;
        this._play(ch, 1, 'rhythm', drop);
      }
    }
    this._step = i + 1;
    this._scheduleStep();
  }

  // --- MIDI file ---
  async loadMidi(buf, name = 'file.mid') {
    const parsed = parseMidi(new Uint8Array(buf));
    const notes = [];
    const unmapped = {};
    const ch10 = parsed.notes.some((n) => n.channel === 9);
    for (const n of parsed.notes) {
      if (ch10 && n.channel !== 9) continue;
      const ch = NOTE_MAP[n.note];
      if (ch === undefined) { unmapped[n.note] = (unmapped[n.note] || 0) + 1; continue; }
      notes.push({ t: n.time, ch, v: n.velocity / 127 });
    }
    this.stopMidi();
    this._midi = { name, duration: parsed.duration, events: notes, idx: 0, pos: 0 };
    return { name, duration: parsed.duration, notes: notes.length, unmapped };
  }
  playMidi() {
    if (!this._midi) return;
    if (this._midi.pos >= this._midi.duration) { this._midi.pos = 0; this._midi.idx = 0; }
    this.midiPlaying = true;
    this._midiStart = performance.now() - this._midi.pos * 1000;
  }
  stopMidi() {
    if (!this.midiPlaying) return;
    this.midiPlaying = false;
    if (this._midi) { this._midi.pos = 0; this._midi.idx = 0; this._emit('midi', { position: 0, duration: this._midi.duration, playing: false }); }
  }
  setMidiLoop(on) { this._midiLoop = !!on; }
  _midiTick() {
    const m = this._midi;
    m.pos = (performance.now() - this._midiStart) / 1000;
    while (m.idx < m.events.length && m.events[m.idx].t <= m.pos) {
      const e = m.events[m.idx++];
      this._play(e.ch, e.v, 'midi');
    }
    if (m.pos >= m.duration) {
      if (this._midiLoop) { m.idx = 0; m.pos = 0; this._midiStart = performance.now(); }
      else { this.midiPlaying = false; m.pos = m.duration; }
    }
    this._emit('midi', { position: Math.min(m.pos, m.duration), duration: m.duration, playing: this.midiPlaying });
    if (!this.midiPlaying) { m.pos = 0; m.idx = 0; }
  }

  // --- live MIDI ---
  async enableMidiInput() {
    if (!navigator.requestMIDIAccess) throw new Error('Web MIDI is not available in this browser');
    const access = await navigator.requestMIDIAccess();
    const bind = () => {
      this.midiInputs = [...access.inputs.values()].map((i) => ({ id: i.id, name: i.name }));
      for (const input of access.inputs.values()) {
        input.onmidimessage = (ev) => {
          const [s, n, v] = ev.data;
          if ((s & 0xf0) === 0x90 && v > 0 && NOTE_MAP[n] !== undefined) this._play(NOTE_MAP[n], v / 127, 'midi-in');
        };
      }
      this._emit('midi-input', { inputs: this.midiInputs });
    };
    access.onstatechange = bind;
    bind();
    return this.midiInputs;
  }

  // --- offline render: a silent WAV of the right length (the fake has no sound) ---
  async renderWav({ what = 'rhythm', seconds = 8 } = {}) {
    await new Promise((r) => setTimeout(r, 400));
    const sr = 8000;
    const n = Math.round(sr * Math.min(seconds, 120));
    const buf = new ArrayBuffer(44 + n * 2);
    const dv = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * 2, true);
    return new Blob([buf], { type: 'audio/wav' });
  }
}

// Minimal Standard MIDI File reader: note-ons with their times in seconds (tempo map applied).
export function parseMidi(d) {
  let p = 0;
  const u32 = () => ((d[p++] << 24) | (d[p++] << 16) | (d[p++] << 8) | d[p++]) >>> 0;
  const u16 = () => (d[p++] << 8) | d[p++];
  const vlq = () => { let v = 0, b; do { b = d[p++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; };
  const tag = () => String.fromCharCode(d[p], d[p + 1], d[p + 2], d[p + 3]);
  if (tag() !== 'MThd') throw new Error('Not a MIDI file');
  p += 4;
  const hlen = u32();
  const hstart = p;
  u16();
  const ntracks = u16();
  const division = u16();
  p = hstart + hlen;
  if (division & 0x8000) throw new Error('SMPTE time division is not supported');
  const raw = [];
  const tempos = [{ tick: 0, us: 500000 }];
  for (let t = 0; t < ntracks && p < d.length; t++) {
    const id = tag(); p += 4;
    const len = u32();
    const end = p + len;
    if (id !== 'MTrk') { p = end; continue; }
    let tick = 0, status = 0;
    while (p < end) {
      tick += vlq();
      let b = d[p];
      if (b & 0x80) { status = b; p++; } else b = status;
      if (status === 0xff) {
        const type = d[p++]; const l = vlq();
        if (type === 0x51 && l === 3) tempos.push({ tick, us: (d[p] << 16) | (d[p + 1] << 8) | d[p + 2] });
        p += l;
      } else if (status === 0xf0 || status === 0xf7) {
        p += vlq();
      } else {
        const hi = status & 0xf0;
        const a = d[p++];
        const bb = hi === 0xc0 || hi === 0xd0 ? 0 : d[p++];
        if (hi === 0x90 && bb > 0) raw.push({ tick, channel: status & 0x0f, note: a, velocity: bb });
      }
      raw.maxTick = Math.max(raw.maxTick || 0, tick);
    }
    p = end;
  }
  tempos.sort((a, b) => a.tick - b.tick);
  const toSec = (tick) => {
    let s = 0, lastTick = 0, us = 500000;
    for (const tp of tempos) {
      if (tp.tick >= tick) break;
      s += ((tp.tick - lastTick) * us) / division / 1e6;
      lastTick = tp.tick; us = tp.us;
    }
    return s + ((tick - lastTick) * us) / division / 1e6;
  };
  const notes = raw.map((n) => ({ ...n, time: toSec(n.tick) })).sort((a, b) => a.time - b.time);
  return { notes, duration: toSec(raw.maxTick || 0) };
}

export const UDSAudio = FakeUDSAudio;
