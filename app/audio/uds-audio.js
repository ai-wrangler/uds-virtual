// SPDX-License-Identifier: Apache-2.0
// UDSAudio: the audio part's public API (CONTRACT.md section 5).
//
// Main thread: AudioContext -> AudioWorkletNode (player-worklet.js) -> GainNode -> AnalyserNode -> speakers.
// The engine, the Autorhythm sequencer and the MIDI-file player run in engine-worker.js, which sends audio
// chunks straight to the worklet over a MessagePort. 'hit' and 'step' events fire when the worklet plays them.

import { parseMidi, midiToHits, mapNote, velocityToV, setNoteMap } from './midi.js';
import { paramList, clampPatch, defaultPatch, validateKit, kitNoteMap } from './patch.js';
import { TEMPO_MIN, TEMPO_MAX, TEMPO_DEFAULT } from './scheduler.js';
import { SLOT_COUNT, midiBytesToSlot, slotToPattern, slotPatternId, slotIndexOf } from './slots.js';

const HERE = import.meta.url;
const FILTER_HZ = { rc: 15900, warm: 4000, off: 0 };
// Used when app/engine/builds.json is missing: only the chip as built
const BUILDS_FALLBACK = { default: '1st', builds: [{ id: '1st', version: 'v1', label: 'v1 (1st-order DAC, as built)', name: '1st order (as built)', wasm: 'uds_engine.wasm', gain: 3, available: true, clockHz: 6000000, frameClocks: 96, patchSet: 'v1' }] };
// Chip versions of the Chip selector, and the old DAC ids (?dac=1st|2nd, setDac('1st')) as aliases
const CHIP_ALIAS = { v1: '1st', v2: '2nd', v3: 'v3', '1st': '1st', '2nd': '2nd' };

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

  constructor({ engine = 'wasm', wasmUrl = null, dataUrl = null, slowdown = 0, dac = null, chip = null, buildsUrl = null, v3Mock = false, kitsUrl = null } = {}) {
    super();
    // v3Mock: the v3 entry plays the mock v3 synth while its real engine is not built (?v3=mock; never on
    // the live site's default). With engine 'mock' every build is a mock anyway.
    this._v3Mock = !!v3Mock || engine === 'mock';
    this.kitsUrl = kitsUrl;
    this.kits = [];              // [{ id, name, file, source, url }] from app/kits/index.json (v3)
    this._kitCache = new Map();
    this._sets = {};             // patch sets by build.patchSet: { patches: [8], names: [8], kit }
    this._slotBytes = new Array(SLOT_COUNT).fill(null);
    this._midiBytes = null;
    this._mapKey = 'gm';
    // DAC builds (app/engine/builds.json): '1st' = the chip as built, '2nd' = the 2nd-order DAC preview
    this.buildsUrl = buildsUrl || new URL('../engine/builds.json', HERE).href;
    this.builds = [];
    this.dac = '1st';
    this._dacWanted = chip ? CHIP_ALIAS[chip] || chip : dac ? CHIP_ALIAS[dac] || dac : null;
    this._slowdown = slowdown;   // test hook: pretend the engine runs at this many times real time
    this.engineKind = engine === 'mock' ? 'mock' : 'wasm';
    this.wasmUrl = wasmUrl;
    this.dataUrl = dataUrl || new URL('../data/', HERE).href;
    this.state = 'idle';
    this.info = { backend: null, mock: this.engineKind === 'mock', clockHz: 6000000, voices: 2, frameRate: 62500, sampleRate: null, dac: '1st' };
    this.analyser = null;
    this.ctx = null; this.node = null; this.gain = null;
    this._v1channels = []; this._v1knobs = []; this.patterns = [];
    this.accentLevelDrop = 4;
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
    this.builds = bl.builds.map(b => ({ ...b, version: b.version || (b.id === '2nd' ? 'v2' : 'v1'), patchSet: b.patchSet || 'v1', url: new URL(b.wasm, this.buildsUrl).href }));
    // builds that keep their parameter list in the chip's params.json (v3)
    await Promise.all(this.builds.map(async (b) => {
      if (!b.paramsUrl) return;
      try {
        const pj = await fetchJson(new URL(b.paramsUrl, this.buildsUrl));
        b.params = pj.params; b.hit = pj.hit; b.contract = pj.contract;
        b.clockHz = b.clockHz || pj.clockHz; b.frameClocks = b.frameClocks || pj.frameClocks;
      } catch (e) { b.available = false; b.error = String(e && e.message || e); }
    }));
    for (const b of this.builds) {
      if (b.version === 'v3' && !b.available && this._v3Mock && b.params) { b.available = true; b.mock = true; }
    }
    const want = this._build(this._dacWanted);
    this.dac = want && want.available ? want.id : (this._build(bl.default) || this.builds[0]).id;
    this.accentLevelDrop = ch.accentLevelDrop ?? 4;
    this._v1channels = ch.channels;
    this._v1knobs = ch.knobs;
    this._patternsFull = pt.patterns;
    this.patterns = pt.patterns.map(p => ({
      id: p.id, bank: p.bank, index: p.index, name: p.name, nameRu: p.nameRu, meter: p.meter,
      stepsPerBeat: p.stepsPerBeat, length: p.length, bpm: p.bpm, steps: p.steps, accents: p.accents,
    }));
    this._sets.v1 = { patches: ch.channels.map(c => ({ ...c.params })), names: ch.channels.map(c => c.name), kit: null };
    const v3 = this.builds.find(b => b.patchSet === 'v3' && b.params);
    if (v3) await this._initV3Set(v3);
    this.pattern = this.patterns[0].id;
    this.worker = this._spawn();
    this.worker.addEventListener('message', (e) => this._onWorker(e.data));
    const ready = await workerCall(this.worker, {
      type: 'init', engine: this.engineKind, ...this._dacInit(this.dac), sampleRate: 48000, slowdown: this._slowdown,
      prefetch: this.builds.filter(b => b.available && !b.mock && b.id !== this.dac).map(b => ({ wasmUrl: this._dacInit(b.id).wasmUrl, build: this._buildMsg(b) })),
      channels: this.channels, patterns: this._patternsFull, accentLevelDrop: this.accentLevelDrop,
    }, null, 'ready');
    this.info.backend = ready.info.backend;
    this.info.mock = ready.info.mock;
    this.dac = this.info.dac = ready.info.dac || '1st';
    this._setInfo(ready.info);
    this._applyNoteMap();
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
  // what the worker needs of a build: shape, params and HIT packing (plain JSON)
  _buildMsg(b) {
    return { id: b.id, version: b.version, clockHz: b.clockHz, frameClocks: b.frameClocks, params: b.params, hit: b.hit, mock: b.mock === true };
  }
  // worker fields for a build: the wasmUrl option replaces the first build's file (tests)
  _dacInit(id) {
    const b = this._build(id) || this.builds[0];
    const wasmUrl = this.wasmUrl && b === this.builds[0] ? this.wasmUrl : b.url;
    return { dac: b.id, wasmUrl, gain: b.gain, build: this._buildMsg(b) };
  }
  _setInfo(i) {
    const b = this.currentBuild;
    this.info.clockHz = (i && i.clockHz) || b.clockHz || 6000000;
    this.info.frameRate = this.info.clockHz / ((i && i.frameClocks) || b.frameClocks || 96);
    this.info.voices = b.voices || 2;
    this.info.chip = b.version;
  }
  /** The selected build (an entry of builds.json). */
  get currentBuild() { return this._build(this.dac) || this.builds[0]; }
  /** The selected chip version: 'v1' | 'v2' | 'v3'. */
  get chip() { return this.currentBuild.version; }
  /** Select the chip: 'v1' | 'v2' | 'v3' (or the build ids '1st' | '2nd'). The same as setDac. */
  setChip(v) { return this.setDac(v); }
  /**
   * Select the engine build: '1st' (v1, the chip as built), '2nd' (v2, the 2nd-order DAC preview) or 'v3';
   * 'v1' | 'v2' are aliases. Works while playing; a switch to another patch set (v3) brings its patches.
   */
  async setDac(id) {
    id = CHIP_ALIAS[id] || id;
    const b = this._build(id);
    if (!b) throw new Error('unknown DAC ' + id + ' (expected ' + this.builds.map(x => x.id).join(' or ') + ')');
    if (!b.available) throw new Error('the ' + b.name + ' DAC is not available yet');
    if (id === this.dac && !this._dacBusy) return this.dac;
    const seq = (this._dacSeq = (this._dacSeq || 0) + 1);
    this._dacBusy = true;
    try {
      const set = this._sets[b.patchSet] || this._sets.v1;
      const r = await workerCall(this.worker, {
        type: 'dac', id: 'dac' + seq, ...this._dacInit(id), kind: this.engineKind, params: set.patches.map(p => ({ ...p })),
      }, null, 'dac');
      this.dac = this.info.dac = r.dac;
      this.info.backend = r.backend;
      if (this.engineKind !== 'mock') this.info.mock = !!r.mock;
      this._setInfo(r);
      this._applyNoteMap();
    } finally {
      if (seq === this._dacSeq) this._dacBusy = false;
    }
    this._emit('dac', { dac: this.dac, name: this._build(this.dac).name, chip: this.chip });
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

  // ---- knobs: the patch of each channel, in the selected build's patch set ----
  get _set() { return this._sets[this.currentBuild.patchSet] || this._sets.v1; }
  get _params() { return this._set.patches; }
  /**
   * The parameters of the selected chip: [{ key, label, min, max, note, ... }]. v1/v2: the 5 knobs of
   * data/channels.json; v3: params.json ({ bits, default, options, group, unit, help } too).
   */
  get knobs() {
    const b = this.currentBuild;
    if (b.patchSet === 'v1' || !b.params) return this._v1knobs;
    return paramList(b).map(p => ({ ...p, key: p.id, note: p.help || p.note || '' }));
  }
  /** The 8 channels of the selected chip: [{ ch, id, name, group, params (the defaults: kit patch) }]. */
  get channels() {
    const b = this.currentBuild;
    if (b.patchSet === 'v1' || !this._sets[b.patchSet]) return this._v1channels;
    const set = this._sets[b.patchSet], kit = set.kit;
    return set.names.map((name, ch) => ({
      ch, id: 'ch' + ch, name, group: ch === 7 ? 6 : ch,
      params: kit ? { ...kit.channels[ch].patch } : defaultPatch(paramList(b)),
      notes: kit ? kit.channels[ch].notes : null,
    }));
  }
  getParams(ch) { return { ...this._params[ch] }; }
  setParams(ch, partial) {
    const p = this._params[ch];
    for (const k of this.knobs) {
      if (partial[k.key] === undefined) continue;
      const v = Math.round(Number(partial[k.key]));
      if (Number.isFinite(v)) p[k.key] = Math.max(k.min, Math.min(k.max, v));
    }
    this.worker.postMessage({ type: 'params', ch, params: { ...p } });
    this._emit('patches', { set: this.currentBuild.patchSet, ch });
  }
  resetParams(ch) {
    const list = ch === undefined ? this.channels.map(c => c.ch) : [ch];
    const defs = this.channels;
    for (const c of list) this.setParams(c, defs[c].params);
  }
  /** Reset one channel to the patch of the current kit (v3) or to its default (v1/v2). */
  resetChannel(ch) { this.resetParams(ch); }
  /** The channel's name: the kit's name for it (v3) or the drum's name (v1/v2). */
  channelName(ch) { return this.channels[ch]?.name ?? 'Ch ' + ch; }

  // ---- patch sets (stored by the panel in localStorage) ----
  /** A copy of a patch set: { patches: [8], names: [8], kit: id | null }. */
  getPatchSet(set) {
    const s = this._sets[set];
    return s ? { patches: s.patches.map(p => ({ ...p })), names: [...s.names], kit: s.kit ? s.kit.id : null } : null;
  }
  /** Restore a patch set saved with getPatchSet. Values are clamped; bad entries keep the current patch. */
  setPatchSet(set, data) {
    const s = this._sets[set];
    if (!s || !data || !Array.isArray(data.patches)) return false;
    const b = this.builds.find(x => x.patchSet === set && x.params);
    const params = set === 'v1' ? this._v1knobs.map(k => ({ ...k, id: k.key, default: 0 })) : paramList(b);
    if (data.kitData && b) {
      try { s.kit = validateKit(data.kitData, b); } catch { /* an old or broken kit: keep the current one */ }
    }
    data.patches.slice(0, 8).forEach((p, ch) => { if (p && typeof p === 'object') s.patches[ch] = clampPatch(params, p, s.patches[ch]); });
    if (Array.isArray(data.names)) data.names.slice(0, 8).forEach((n, ch) => { if (typeof n === 'string' && n) s.names[ch] = n.slice(0, 24); });
    if (this.currentBuild.patchSet === set) { this._pushPatches(); this._applyNoteMap(); }
    this._emit('patches', { set });
    return true;
  }
  _pushPatches() {
    this._params.forEach((p, ch) => this.worker.postMessage({ type: 'params', ch, params: { ...p }, replace: true }));
  }

  // ---- kits (v3): V3-SOUND's kits/<id>.json, copied into app/kits/ ----
  async _initV3Set(b) {
    const params = paramList(b);
    this._sets.v3 = { patches: Array.from({ length: 8 }, () => defaultPatch(params)), names: Array.from({ length: 8 }, (_, ch) => 'Ch ' + ch), kit: null };
    const kitsUrl = this.kitsUrl || new URL(b.kits || '../kits/index.json', this.buildsUrl).href;
    try {
      const idx = await fetchJson(kitsUrl);
      this.kits = (idx.kits || []).map(k => ({ id: k.id, name: k.name || k.id, file: k.file || k.id + '.json', source: k.source || '', inspiredBy: k.inspiredBy || '', url: new URL(k.file || k.id + '.json', kitsUrl).href }));
      const def = this.kits.find(k => k.id === idx.default) || this.kits[0];
      if (def) this._useKit(validateKit(await this._fetchKit(def), b), b);
    } catch (e) {
      console.warn('v3 kits unavailable:', e);
    }
  }
  async _fetchKit(entry) {
    if (!this._kitCache.has(entry.id)) {
      const p = fetchJson(entry.url);
      p.catch(() => this._kitCache.delete(entry.id));
      this._kitCache.set(entry.id, p);
    }
    return this._kitCache.get(entry.id);
  }
  _v3Build() { return this.builds.find(b => b.patchSet === 'v3' && b.params) || null; }
  _useKit(kit, b) {
    const set = this._sets[b.patchSet];
    set.kit = kit;
    set.patches = kit.channels.map(c => ({ ...c.patch }));
    set.names = kit.channels.map(c => c.name);
  }
  /** The current v3 kit: { id, name, inspiredBy, description, contract, tempo, channels }, or null. */
  get kit() {
    const k = this._sets.v3 && this._sets.v3.kit;
    return k ? JSON.parse(JSON.stringify(k)) : null;
  }
  /**
   * Load a v3 kit: an id of uds.kits, or a kit object (kits/<id>.json format). Replaces all 8 patches and
   * names of the v3 patch set and, when v3 is selected, the note map of MIDI, slots and live MIDI.
   * Throws an Error with a plain message when the kit does not fit the v3 parameters.
   */
  async loadKit(idOrKit) {
    const b = this._v3Build();
    if (!b) throw new Error('this site has no v3 build');
    let raw = idOrKit;
    if (typeof idOrKit === 'string') {
      const e = this.kits.find(k => k.id === idOrKit);
      if (!e) throw new Error('unknown kit ' + idOrKit);
      raw = await this._fetchKit(e);
    }
    const kit = validateKit(raw, b);
    this._useKit(kit, b);
    if (this.currentBuild.patchSet === b.patchSet) { this._pushPatches(); this._applyNoteMap(); }
    this._emit('kit', { kit: this.kit });
    this._emit('patches', { set: b.patchSet });
    return this.kit;
  }
  /** The v3 patch set as a kit (kits/<id>.json format), for export. */
  exportKit({ id, name } = {}) {
    const b = this._v3Build();
    if (!b) throw new Error('this site has no v3 build');
    const set = this._sets[b.patchSet], k = set.kit;
    return {
      id: id || (k ? k.id + '-edit' : 'my-kit'), name: name || (k ? k.name + ' (edited)' : 'My kit'),
      inspiredBy: k?.inspiredBy || '', description: k ? 'Edited in the virtual UDS from the kit ' + k.name + '.' : 'Made in the virtual UDS.',
      contract: b.contract ?? null, tempo: this.tempo,
      channels: set.patches.map((p, ch) => {
        const c = { ch, name: set.names[ch], patch: { ...p } };
        const notes = k && k.channels[ch].notes;
        if (notes) c.notes = [...notes];
        return c;
      }),
    };
  }
  /** Import a kit from JSON text or an object: the same as loadKit(object). */
  async importKit(json) {
    let obj = json;
    if (typeof json === 'string') {
      try { obj = JSON.parse(json); } catch (e) { throw new Error('not a JSON file: ' + e.message); }
    }
    return this.loadKit(obj);
  }

  // The note map follows the kit while v3 is selected; MIDI and slots already loaded are mapped again.
  _applyNoteMap() {
    const set = this.currentBuild.patchSet === 'v3' ? this._sets.v3 : null;
    const map = set && set.kit && set.kit.channels.some(c => c.notes) ? kitNoteMap(set.kit) : null;
    const key = map ? JSON.stringify(map) : 'gm';
    if (key === this._mapKey) return;
    this._mapKey = key;
    setNoteMap(map);
    for (let i = 0; i < SLOT_COUNT; i++) {
      if (!this._slotBytes[i]) continue;
      try { this._loadSlotNow(i, this._slotBytes[i].slice(0), this.slots[i] ? this.slots[i].name : 'file.mid', false); } catch {
        // nothing maps any more: the slot stays as it was
      }
    }
    if (this._midiBytes) {
      const playing = this.midiPlaying;
      this._loadMidiNow(this._midiBytes.slice(0), this._midiHits ? this._midiHits.name : 'file.mid', true);
      if (playing) { this.midiPlaying = true; this.worker.postMessage({ type: 'midi', on: true }); }
    }
    this._emitSlots();
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
    const bytes = arrayBuffer instanceof ArrayBuffer ? arrayBuffer.slice(0) : new Uint8Array(arrayBuffer).slice().buffer;
    const r = this._loadSlotNow(index, arrayBuffer, name, true);
    this._slotBytes[index] = bytes;
    return r;
  }
  _loadSlotNow(index, arrayBuffer, name, emit) {
    const c = midiBytesToSlot(arrayBuffer, name);     // throws a clear Error when nothing maps
    const slot = { index, name: c.name, bars: c.bars, steps: c.steps, stepsPerBeat: c.stepsPerBeat,
      stepsPerBar: c.stepsPerBar, beatSteps: c.beatSteps, meter: c.meter, notes: c.notes, bpm: c.bpm,
      truncated: c.truncated, unmapped: c.unmapped };
    this.slots[index] = slot;
    const pat = slotToPattern(index, slot);
    this._slotPatterns[index] = pat;
    this.worker.postMessage({ type: 'addPattern', pattern: pat });
    if (emit) {
      if (this.slot === index) this.setTempo(slot.bpm);
      this._emitSlots();
    }
    return this._slotInfo(index);
  }
  clearSlot(index) {
    if (!this.slots[index]) return;
    if (this.slot === index && this.rhythmPlaying) this.stopRhythm();
    this.slots[index] = null; this._slotPatterns[index] = null; this._slotBytes[index] = null;
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
    const bytes = arrayBuffer instanceof ArrayBuffer ? arrayBuffer.slice(0) : new Uint8Array(arrayBuffer).slice().buffer;
    const r = this._loadMidiNow(arrayBuffer, name, false);
    this._midiBytes = bytes;
    return r;
  }
  _loadMidiNow(arrayBuffer, name, quiet) {
    const parsed = parseMidi(arrayBuffer);
    const m = midiToHits(parsed);
    this._midiHits = { hits: m.hits, duration: m.duration, name };
    this.midiInfo = { name, duration: m.duration, notes: m.notes, unmapped: m.unmapped };
    if (this.midiPlaying) { this.midiPlaying = false; if (!quiet) this._emitMidi(0); }
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
