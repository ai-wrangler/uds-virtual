// SPDX-License-Identifier: Apache-2.0
// UDSAudio: the audio part's public API (CONTRACT.md section 5).
//
// Main thread: AudioContext -> AudioWorkletNode (player-worklet.js) -> GainNode -> AnalyserNode -> speakers.
// The engine, the Autorhythm sequencer and the MIDI-file player run in engine-worker.js, which sends audio
// chunks straight to the worklet over a MessagePort. 'hit' and 'step' events fire when the worklet plays them.

import { parseMidi, midiToHits, mapNote, velocityToV } from './midi.js';
import { TEMPO_MIN, TEMPO_MAX, TEMPO_DEFAULT } from './scheduler.js';
import { SLOT_COUNT, midiBytesToSlot, slotToPattern, slotPatternId, slotIndexOf } from './slots.js';

const HERE = import.meta.url;
const FILTER_HZ = { rc: 15900, warm: 4000, off: 0 };
// Used when app/engine/builds.json is missing: only the chip as built
const BUILDS_FALLBACK = { default: '1st', builds: [{ id: '1st', name: '1st order (as built)', wasm: 'uds_engine.wasm', gain: 3, available: true }] };

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
  return r.json();
}

function workerCall(worker, msg, transfer, expect) {
  return new Promise((resolve, reject) => {
    const on = (e) => {
      const m = e.data;
      if (msg.id !== undefined && m.id !== undefined && m.id !== msg.id) return;   // another call's reply
      if (m.type === expect || (m.type === 'error' && m.id === msg.id)) {
        worker.removeEventListener('message', on);
        if (m.type === 'error') reject(new Error(m.message)); else resolve(m);
      }
    };
    worker.addEventListener('message', on);
    worker.postMessage(msg, transfer || []);
  });
}

export class UDSAudio extends EventTarget {
  static async create(options = {}) {
    const u = new UDSAudio(options);
    await u._init();
    return u;
  }

  constructor({ engine = 'wasm', wasmUrl = null, dataUrl = null, slowdown = 0, dac = null, buildsUrl = null } = {}) {
    super();
    // DAC builds (app/engine/builds.json): '1st' = the chip as built, '2nd' = the 2nd-order DAC preview
    this.buildsUrl = buildsUrl || new URL('../engine/builds.json', HERE).href;
    this.builds = [];
    this.dac = '1st';
    this._dacWanted = dac;
    this._slowdown = slowdown;   // test hook: pretend the engine runs at this many times real time
    this.engineKind = engine === 'mock' ? 'mock' : 'wasm';
    this.wasmUrl = wasmUrl;
    this.dataUrl = dataUrl || new URL('../data/', HERE).href;
    this.state = 'idle';
    this.info = { backend: null, mock: this.engineKind === 'mock', clockHz: 6000000, voices: 2, frameRate: 62500, sampleRate: null, dac: '1st' };
    this.analyser = null;
    this.ctx = null; this.node = null; this.gain = null;
    this.channels = []; this.knobs = []; this.patterns = [];
    this.accentLevelDrop = 4;
    this._params = [];
    this.pattern = 'A0';
    this.slots = new Array(SLOT_COUNT).fill(null);   // Autorhythm slots (MIDI loops), see loadSlot
    this.slot = null;                                // selected slot index, or null (then the pattern plays)
    this._slotPatterns = new Array(SLOT_COUNT).fill(null);
    this.tempo = TEMPO_DEFAULT;
    this.rhythmPlaying = false;
    this.midiPlaying = false;
    this.midiLoop = true;
    this.midiInfo = null;
    this._midiHits = null;
    this.midiInputs = [];
    this.volume = 0.8;
    this.filter = 'rc';
    this.lastStatus = null;
    this.lastError = null;
    this._midiAccess = null;
  }

  async _init() {
    const [ch, pt, bl] = await Promise.all([
      fetchJson(new URL('channels.json', this.dataUrl)),
      fetchJson(new URL('patterns.json', this.dataUrl)),
      fetchJson(this.buildsUrl).catch(() => BUILDS_FALLBACK),
    ]);
    this.builds = bl.builds.map(b => ({ ...b, url: new URL(b.wasm, this.buildsUrl).href }));
    const want = this._build(this._dacWanted);
    this.dac = want && want.available ? want.id : (this._build(bl.default) || this.builds[0]).id;
    this.accentLevelDrop = ch.accentLevelDrop ?? 4;
    this.channels = ch.channels;
    this.knobs = ch.knobs;
    this._patternsFull = pt.patterns;
    this.patterns = pt.patterns.map(p => ({
      id: p.id, bank: p.bank, index: p.index, name: p.name, nameRu: p.nameRu, meter: p.meter,
      stepsPerBeat: p.stepsPerBeat, length: p.length, bpm: p.bpm, steps: p.steps, accents: p.accents,
    }));
    this._params = this.channels.map(c => ({ ...c.params }));
    this.pattern = this.patterns[0].id;
    this.worker = this._spawn();
    this.worker.addEventListener('message', (e) => this._onWorker(e.data));
    const ready = await workerCall(this.worker, {
      type: 'init', engine: this.engineKind, ...this._dacInit(this.dac), sampleRate: 48000, slowdown: this._slowdown,
      prefetch: this.builds.filter(b => b.available && b.id !== this.dac).map(b => this._dacInit(b.id).wasmUrl),
      channels: this.channels, patterns: this._patternsFull, accentLevelDrop: this.accentLevelDrop,
    }, null, 'ready');
    this.info.backend = ready.info.backend;
    this.info.mock = ready.info.mock;
    this.dac = this.info.dac = ready.info.dac || '1st';
    if (ready.error) {
      // Delivered after create() resolves, to the first 'error' listener (the page adds it after create)
      this.lastError = ready.error;
      this._pendingError = ready.error;
      setTimeout(() => this._flushPendingError(), 0);
    }
  }

  addEventListener(type, fn, opts) {
    super.addEventListener(type, fn, opts);
    if (type === 'error') { this._hasErrorListener = true; if (this._pendingError) setTimeout(() => this._flushPendingError(), 0); }
  }
  _flushPendingError() {
    if (!this._pendingError || !this._hasErrorListener) return;
    const message = this._pendingError; this._pendingError = null;
    this._emit('error', { message });
  }

  _spawn() { return new Worker(new URL('./engine-worker.js', HERE), { type: 'module' }); }

  // ---- DAC (engine build) ----
  _build(id) { return this.builds.find(b => b.id === id) || null; }
  // worker fields for a build: the wasmUrl option replaces the first build's file (tests)
  _dacInit(id) {
    const b = this._build(id) || this.builds[0];
    const wasmUrl = this.wasmUrl && b === this.builds[0] ? this.wasmUrl : b.url;
    return { dac: b.id, wasmUrl, gain: b.gain };
  }
  /** Select the audio DAC: '1st' (the chip as built) or '2nd' (2nd-order preview). Works while playing. */
  async setDac(id) {
    const b = this._build(id);
    if (!b) throw new Error('unknown DAC ' + id + ' (expected ' + this.builds.map(x => x.id).join(' or ') + ')');
    if (!b.available) throw new Error('the ' + b.name + ' DAC is not available yet');
    if (id === this.dac && !this._dacBusy) return this.dac;
    const seq = (this._dacSeq = (this._dacSeq || 0) + 1);
    this._dacBusy = true;
    try {
      const r = await workerCall(this.worker, { type: 'dac', id: 'dac' + seq, ...this._dacInit(id) }, null, 'dac');
      this.dac = this.info.dac = r.dac;
      if (!this.info.mock) this.info.backend = r.backend;
    } finally {
      if (seq === this._dacSeq) this._dacBusy = false;
    }
    this._emit('dac', { dac: this.dac, name: this._build(this.dac).name });
    return this.dac;
  }

  _emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  _setState(s) { if (this.state !== s) { this.state = s; this._emit('state', { state: s }); } }

  // ---- lifecycle ----
  async start() {
    if (this.state === 'running') return;
    if (this.state === 'suspended' && this.ctx) {
      await this.ctx.resume(); this._setState('running'); return;
    }
    if (this.state === 'starting') return this._starting;
    this._setState('starting');
    this._starting = (async () => {
      try {
        const ctx = new AudioContext({ latencyHint: 'interactive' });
        this.ctx = ctx;
        await ctx.audioWorklet.addModule(new URL('./player-worklet.js', HERE));
        const node = new AudioWorkletNode(ctx, 'uds-player', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
        const gain = ctx.createGain(); gain.gain.value = this.volume;
        const an = ctx.createAnalyser(); an.fftSize = 2048;
        node.connect(gain); gain.connect(an); an.connect(ctx.destination);
        this.node = node; this.gain = gain; this.analyser = an;
        node.port.onmessage = (e) => this._onWorklet(e.data);
        const ch = new MessageChannel();
        node.port.postMessage({ type: 'port', port: ch.port2 }, [ch.port2]);
        this.info.sampleRate = ctx.sampleRate;
        this.worker.postMessage({ type: 'start', sampleRate: ctx.sampleRate, port: ch.port1 }, [ch.port1]);
        if (ctx.state !== 'running') await ctx.resume();
        this._setState('running');
      } catch (e) {
        this._setState('error');
        this._fail(e);
        throw e;
      }
    })();
    return this._starting;
  }

  async suspend() {
    if (this.ctx && this.state === 'running') { await this.ctx.suspend(); this._setState('suspended'); }
  }

  _fail(e) {
    const message = String(e && e.message || e);
    this.lastError = message;
    this._emit('error', { message });
  }

  // ---- knobs ----
  getParams(ch) { return { ...this._params[ch] }; }
  setParams(ch, partial) {
    const p = this._params[ch];
    for (const k of this.knobs) {
      if (partial[k.key] === undefined) continue;
      const v = Math.round(Number(partial[k.key]));
      if (Number.isFinite(v)) p[k.key] = Math.max(k.min, Math.min(k.max, v));
    }
    this.worker.postMessage({ type: 'params', ch, params: { ...p } });
  }
  resetParams(ch) {
    const list = ch === undefined ? this.channels.map(c => c.ch) : [ch];
    for (const c of list) this.setParams(c, this.channels[c].params);
  }

  // ---- playing ----
  hit(ch, { velocity = 1, source = 'pad' } = {}) {
    if (!(ch >= 0 && ch < 8)) return;
    this.worker.postMessage({ type: 'hit', ch, v: velocity, source });
  }
  stopAll() {
    this.worker.postMessage({ type: 'stopAll' });
    this.rhythmPlaying = false;
    if (this.midiPlaying) { this.midiPlaying = false; this._emitMidi(0); }
  }
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, Number(v)));
    if (this.gain) this.gain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
  }
  setFilter(mode) {
    if (!(mode in FILTER_HZ)) throw new Error('filter mode must be rc, warm or off');
    this.filter = mode;
    this.worker.postMessage({ type: 'filter', hz: FILTER_HZ[mode] });
  }

  // ---- rhythm ----
  setPattern(id) {
    const p = this.patterns.find(x => x.id === id);
    if (!p) throw new Error('unknown pattern ' + id);
    this.pattern = id;
    if (this.slot !== null) { this.slot = null; this._emitSlots(); }
    this.worker.postMessage({ type: 'pattern', id });
    if (p.bpm) this.setTempo(p.bpm);
  }

  // ---- Autorhythm slots: a .mid file as the rhythm loop (slots.js has the conversion rules) ----
  _slotInfo(i) {
    const s = this.slots[i];
    return s ? { ...s, notes: s.notes.map(n => ({ ...n })) } : null;
  }
  _emitSlots() { this._emit('slots', { slots: this.slots.map((_, i) => this._slotInfo(i)), slot: this.slot }); }
  async loadSlot(index, arrayBuffer, name = 'file.mid') {
    index = Number(index);
    if (!(index >= 0 && index < SLOT_COUNT) || !Number.isInteger(index)) throw new Error('slot index must be 0..' + (SLOT_COUNT - 1));
    const c = midiBytesToSlot(arrayBuffer, name);     // throws a clear Error when nothing maps
    const slot = { index, name: c.name, bars: c.bars, steps: c.steps, stepsPerBeat: c.stepsPerBeat,
      stepsPerBar: c.stepsPerBar, beatSteps: c.beatSteps, meter: c.meter, notes: c.notes, bpm: c.bpm,
      truncated: c.truncated, unmapped: c.unmapped };
    this.slots[index] = slot;
    const pat = slotToPattern(index, slot);
    this._slotPatterns[index] = pat;
    this.worker.postMessage({ type: 'addPattern', pattern: pat });
    if (this.slot === index) this.setTempo(slot.bpm);
    this._emitSlots();
    return this._slotInfo(index);
  }
  clearSlot(index) {
    if (!this.slots[index]) return;
    if (this.slot === index && this.rhythmPlaying) this.stopRhythm();
    this.slots[index] = null; this._slotPatterns[index] = null;
    this.worker.postMessage({ type: 'removePattern', id: slotPatternId(index) });
    this._emitSlots();
  }
  // Select a slot (or null). An empty slot can be selected; the rhythm then does not start. While the
  // rhythm plays, the switch happens at the next bar line. The file's tempo is applied.
  setSlot(index) {
    if (index === null || index === undefined) { this.slot = null; this._emitSlots(); return; }
    index = Number(index);
    if (!(index >= 0 && index < SLOT_COUNT)) throw new Error('slot index must be 0..' + (SLOT_COUNT - 1));
    this.slot = index;
    const s = this.slots[index];
    if (s) {
      this.worker.postMessage({ type: 'pattern', id: slotPatternId(index) });
      this.setTempo(s.bpm);
    } else if (this.rhythmPlaying) this.stopRhythm();
    this._emitSlots();
  }
  setTempo(bpm) {
    this.tempo = Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, Math.round(Number(bpm)) || TEMPO_DEFAULT));
    this.worker.postMessage({ type: 'tempo', bpm: this.tempo });
  }
  startRhythm() {
    if (this.slot !== null && !this.slots[this.slot]) return;     // the selected slot is empty
    this.rhythmPlaying = true; this.worker.postMessage({ type: 'rhythm', on: true }); }
  stopRhythm() { this.rhythmPlaying = false; this.worker.postMessage({ type: 'rhythm', on: false }); }

  // ---- MIDI file ----
  async loadMidi(arrayBuffer, name = 'file.mid') {
    const parsed = parseMidi(arrayBuffer);
    const m = midiToHits(parsed);
    this._midiHits = { hits: m.hits, duration: m.duration, name };
    this.midiInfo = { name, duration: m.duration, notes: m.notes, unmapped: m.unmapped };
    if (this.midiPlaying) { this.midiPlaying = false; this._emitMidi(0); }
    this.worker.postMessage({ type: 'midiLoad', midi: this._midiHits });
    return { ...this.midiInfo };
  }
  playMidi() {
    if (!this._midiHits) return;
    this.midiPlaying = true;
    this.worker.postMessage({ type: 'midi', on: true });
    this._emitMidi(0);
  }
  stopMidi() {
    this.midiPlaying = false;
    this.worker.postMessage({ type: 'midi', on: false });
    this._emitMidi(0);
  }
  setMidiLoop(on) { this.midiLoop = !!on; this.worker.postMessage({ type: 'midiLoop', on: this.midiLoop }); }
  _emitMidi(position) {
    this._emit('midi', { position, duration: this.midiInfo ? this.midiInfo.duration : 0, playing: this.midiPlaying });
  }

  // ---- live MIDI ----
  async enableMidiInput() {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) throw new Error('Web MIDI is not available in this browser');
    if (!this._midiAccess) {
      this._midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this._midiAccess.addEventListener('statechange', () => this._scanMidi());
    }
    this._scanMidi();
    return this.midiInputs;
  }
  _scanMidi() {
    const inputs = [];
    for (const input of this._midiAccess.inputs.values()) {
      if (input.state === 'disconnected') continue;
      input.onmidimessage = (e) => this._onMidiMessage(e.data);
      inputs.push({ id: input.id, name: input.name || input.id });
    }
    const changed = JSON.stringify(inputs) !== JSON.stringify(this.midiInputs);
    this.midiInputs = inputs;
    if (changed || !this._midiScanned) this._emit('midi-input', { inputs });
    this._midiScanned = true;
  }
  _onMidiMessage(d) {
    if (!d || d.length < 3) return;
    if ((d[0] & 0xf0) === 0x90 && d[2] > 0) {
      const ch = mapNote(d[1]);
      if (ch >= 0) this.hit(ch, { velocity: velocityToV(d[2]), source: 'midi-in' });
    }
  }

  // ---- offline WAV ----
  async renderWav({ what = 'rhythm', seconds } = {}) {
    if (what === 'midi' && !this._midiHits) throw new Error('no MIDI file loaded');
    if (what === 'rhythm' && this.slot !== null && !this.slots[this.slot]) throw new Error('the selected slot is empty');
    const slotPat = what === 'rhythm' && this.slot !== null ? this._slotPatterns[this.slot] : null;
    if (!seconds) {
      if (what === 'midi') seconds = this._midiHits.duration + 1.5;
      else if (this.slot !== null && this.slots[this.slot]) {
        const sl = this.slots[this.slot];
        seconds = 8 * sl.stepsPerBar * 60 / (this.tempo * sl.stepsPerBeat) + 1;
      } else {
        const p = this._patternsFull.find(x => x.id === this.pattern);
        seconds = 2 * p.length * 60 / (this.tempo * p.stepsPerBeat) + 1;
      }
    }
    seconds = Math.min(600, Math.max(0.1, seconds));
    const sampleRate = this.ctx ? this.ctx.sampleRate : 48000;
    const w = this._spawn();
    try {
      await workerCall(w, {
        type: 'init', engine: this.info.mock ? 'mock' : 'wasm', ...this._dacInit(this.dac), sampleRate,
        channels: this.channels, patterns: this._patternsFull, accentLevelDrop: this.accentLevelDrop,
      }, null, 'ready');
      const res = await workerCall(w, {
        type: 'offline', id: 'wav', what, seconds,
        state: {
          params: this._params, pattern: slotPat ? slotPat.id : this.pattern, tempo: this.tempo, midi: this._midiHits,
          extraPatterns: slotPat ? [slotPat] : [],
          midiLoop: false, filterHz: FILTER_HZ[this.filter],
        },
      }, null, 'wav');
      return new Blob([res.wav], { type: 'audio/wav' });
    } finally {
      w.terminate();
    }
  }

  // ---- reports ----
  _onWorker(m) {
    if (m.type === 'status') {
      const s = m.status;
      this.lastStatus = s;
      this._emit('status', s);
      if (s.midi) {
        this._emit('midi', { position: s.midi.position, duration: s.midi.duration, playing: this.midiPlaying });
      }
    } else if (m.type === 'error' && !m.id) {
      this._fail(m.message);
    }
  }

  _onWorklet(m) {
    if (m.type !== 'marks') return;
    for (const k of m.marks) {
      if (k.type === 'hit') this._emit('hit', { ch: k.ch, level: k.level, source: k.source });
      else if (k.type === 'step') this._emit('step', { index: k.index, length: k.length, patternId: k.patternId, slot: slotIndexOf(k.patternId) });
      else if (k.type === 'midi-end') {
        this.midiPlaying = false;
        this._emitMidi(this.midiInfo ? this.midiInfo.duration : 0);
      }
    }
  }
}

export default UDSAudio;
