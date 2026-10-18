// SPDX-License-Identifier: Apache-2.0
// Engine worker (module worker). Runs the UDS-1x1 engine ahead of the speakers and feeds the AudioWorklet.
//
// Live mode: keeps `lead` ms rendered ahead of the worklet's playback position, splits render() at the
// sample positions of rhythm / MIDI events, sends transferred Float32Array chunks to the worklet over a
// MessagePort, reports status about 20 times a second.
// Offline mode (renderWav): a separate instance renders as fast as it can and returns a WAV.

import { loadMockEngine } from './mock-engine.js';
import { Scheduler } from './scheduler.js';
import { encodeWav } from './wav.js';
import { softLimit, KNEE } from './limiter.js';
import { packHit, paramList, defaultPatch } from './patch.js';

// Chip clock of the selected build (6 MHz for v1/v2, 12 MHz for v3): status.realtime = simHz / clockHz
let clockHz = 6000000;
// Make-up gain of the selected engine build (app/engine/builds.json): 3 for the chip as built (a full-level
// voice reaches about 1/6 of the pin's swing); the 2nd-order DAC preview is about 6 dB quieter.
const DEFAULT_GAIN = 3;
const FADE_MS = 20;             // crossfade from the old engine to the new one on a DAC switch

const CHUNK = 256;              // samples per chunk sent to the worklet (128..1024)
const LEAD_DEFAULT = 60, LEAD_FLOOR = 40, LEAD_MAX = 200;   // ms; the contract allows 30..200
const STATUS_MS = 50;
const SLICE_MS = 30;            // longest stretch of rendering before yielding to messages

let engine = null, mock = false, backend = 'none';
let gain = DEFAULT_GAIN, dac = '1st';
let build = null;               // the selected build of app/engine/builds.json (params, hit packing), or null
let fade = null;                // { engine, gain, left, total }: the previous engine, fading out after setDac
let filterHz = 15900;
const wasmCache = new Map();    // url -> Promise of the compiled WebAssembly.Module (a switch needs no fetch)
let sched = null;
let sampleRate = 48000;
let port = null;                // to the worklet
let running = false;
let rendered = 0;               // samples rendered and sent
let consumed = 0, consumedAt = 0, underruns = 0, lastUnderruns = 0;
let leadMs = LEAD_DEFAULT, lastUnderrunAt = 0, lastLeadDrop = 0;
let live = [];                  // live hits waiting for the next chunk
let dc = { x: 0, y: 0 }, dcR = 0.9987;
let busyMs = 0, busyCycles = 0, simHz = 0;
let lastStatus = 0, act = { busy: false, cs: false, hits: 0 }, dropped = 0;
let pumpTimer = null, statusTimer = null;
let midiWasPlaying = false;
let slowdown = 0;              // test hook (create({ slowdown })): 0 = off

function post(msg, transfer) { self.postMessage(msg, transfer || []); }

function wasmModule(url) {
  if (!wasmCache.has(url)) {
    const p = fetch(url).then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.arrayBuffer();
    }).then((b) => WebAssembly.compile(b));
    p.catch(() => wasmCache.delete(url));
    wasmCache.set(url, p);
  }
  return wasmCache.get(url);
}

// The mock engine of a build: the v1 port of the chip model, or the v3 synth (mock-engine-v3.js)
async function loadMockFor(b, rate) {
  if (b && b.version === 'v3') {
    const { loadMockV3Engine } = await import('./mock-engine-v3.js');
    return loadMockV3Engine({ sampleRate: rate, build: b });
  }
  return loadMockEngine({ sampleRate: rate });
}

async function loadWasm(wasmUrl, rate) {
  const mod = await import('../engine/uds-engine.js');
  const source = wasmUrl || new URL('../engine/uds_engine.wasm', import.meta.url).href;
  return mod.loadEngine(await wasmModule(source), { sampleRate: rate });
}

// Compile another build and run it for a moment in the background: a module's first runs use the browser's
// baseline WebAssembly code, several times slower than the optimized code it tiers up to, which made the
// first switch to a new DAC underrun. Small chunks, so the live pump keeps running in between.
async function warmUp(target) {
  const url = typeof target === 'string' ? target : target.wasmUrl;
  const b = typeof target === 'string' ? null : target.build;
  const e = await loadWasm(url, sampleRate);
  const hit = (ch, p) => (b && b.hit && b.version !== 'v1' && b.version !== 'v2'
    ? e.send(packHit(b, ch, { ...defaultPatch(paramList(b)), level: 12 })) : e.hit(ch, p));
  for (let i = 0; i < 100; i++) {
    if (i % 25 === 0) { hit(4, { pitch: 20, sweep: 6, decay: 9, balance: 1, level: 15 }); hit(6, { pitch: 255, decay: 6, balance: 15, level: 10 }); }
    e.render(480);
    await new Promise((r) => setTimeout(r, 5));
  }
}

// kind 'mock' (or a build marked mock: the v3 synth before the real v3 engine exists) -> the mock engine
async function loadAnyEngine(kind, wasmUrl, rate, b = build) {
  if (kind === 'mock' || (b && b.mock === true)) {
    engine = await loadMockFor(b, rate); mock = true; backend = engine.backend;
    return null;
  }
  try {
    engine = await loadWasm(wasmUrl, rate);
    mock = false; backend = engine.backend || 'wasm';
    return null;
  } catch (e) {
    engine = await loadMockFor(b, rate); mock = true; backend = engine.backend;
    return 'Real engine failed to load, using the mock engine: ' + (e && e.message || e);
  }
}

function setClock() { clockHz = engine && engine.clockHz ? engine.clockHz : (build && build.clockHz) || 6000000; }

function setDc(rate) { dcR = Math.exp(-2 * Math.PI * 10 / rate); dc = { x: 0, y: 0 }; }

// Render n samples into dst at offset, with make-up gain, a 10 Hz DC blocker (the Pmod's coupling cap)
// and the soft limiter
function renderInto(dst, off, n) {
  while (n > 0) {
    const k = Math.min(n, 8192);
    const t0 = performance.now(), c0 = engine.cycles;
    const src = engine.render(k);
    if (slowdown > 0) {             // test hook: make the engine look this many times real time
      const until = t0 + k / sampleRate * 1000 / slowdown;
      while (performance.now() < until) { /* spin */ }
    }
    busyMs += performance.now() - t0; busyCycles += engine.cycles - c0;
    let { x, y } = dc;
    if (fade) {
      // DAC switch: the old engine goes on for FADE_MS and fades out while the new one fades in.
      // Both are scaled by their own make-up gain before the (shared) DC blocker.
      const m = Math.min(k, fade.left);
      const old = fade.engine.render(m), r = fade.gain / gain;
      for (let i = 0; i < k; i++) {
        let s = src[i];
        if (i < m) { const a = (fade.total - fade.left + i) / fade.total; s = s * a + old[i] * r * (1 - a); }
        y = s - x + dcR * y; x = s;
        const v = y * gain;
        dst[off + i] = v > KNEE || v < -KNEE ? softLimit(v) : v;
      }
      fade.left -= m;
      if (fade.left <= 0) fade = null;
    } else {
      for (let i = 0; i < k; i++) {
        const s = src[i];
        y = s - x + dcR * y; x = s;
        const v = y * gain;
        dst[off + i] = v > KNEE || v < -KNEE ? softLimit(v) : v;
      }
    }
    dc.x = x; dc.y = y;
    off += k; n -= k;
  }
  const a = engine.takeActivity ? engine.takeActivity() : null;
  if (a) { act.busy = act.busy || a.busy; act.cs = act.cs || a.cs; act.hits += a.hits; }
}

// v1/v2: engine.hit (5 knobs, 4 bytes). Other builds: the build's own HIT packing (v3: 5 bytes).
function applyHit(ch, params) {
  const ok = build && build.hit && build.version !== 'v1' && build.version !== 'v2'
    ? engine.send(packHit(build, ch, params)) : engine.hit(ch, params);
  if (!ok) dropped++;
}

// Render one block [start, start+n) with events applied at their exact samples; returns { buf, marks }
function renderBlock(n) {
  const start = rendered, buf = new Float32Array(n), marks = [];
  const evs = [];
  for (const h of live) evs.push({ pos: start, kind: 'hit', ...h });
  live = [];
  for (const e of sched.nextEvents(start, start + n)) evs.push(e);
  let cur = start;
  for (const e of evs) {
    if (e.pos > cur) { renderInto(buf, cur - start, e.pos - cur); cur = e.pos; }
    if (e.kind === 'hit') {
      applyHit(e.ch, e.params);
      marks.push({ offset: e.pos - start, type: 'hit', ch: e.ch, level: e.params.level, source: e.source });
    } else if (e.kind === 'step') {
      marks.push({ offset: e.pos - start, type: 'step', index: e.index, length: e.length, patternId: e.patternId });
    } else if (e.kind === 'midi-end') {
      marks.push({ offset: e.pos - start, type: 'midi-end' });
    }
  }
  if (cur < start + n) renderInto(buf, cur - start, start + n - cur);
  rendered += n;
  return { buf, marks };
}

function playPos() {
  // consumed extrapolated from the last worklet report, at most 40 ms ahead of it
  const dt = Math.min(0.04, Math.max(0, (performance.now() - consumedAt) / 1000));
  return Math.min(rendered, consumed + Math.round(dt * sampleRate));
}

const yieldChan = new MessageChannel();
yieldChan.port1.onmessage = () => pump();

function pump() {
  pumpTimer = null;
  if (!running || !port) return;
  const t0 = performance.now();
  const target = Math.round(leadMs / 1000 * sampleRate);
  while (rendered - playPos() < target && performance.now() - t0 < SLICE_MS) {
    const { buf, marks } = renderBlock(CHUNK);
    port.postMessage({ buf, marks }, [buf.buffer]);
  }
  maybeStatus();
  if (rendered - playPos() < target) { pumpTimer = 1; yieldChan.port2.postMessage(0); }   // behind: yield, no 4 ms clamp
  else pumpTimer = setTimeout(pump, 3);
}

function maybeStatus(force) {
  const now = performance.now();
  if (!force && now - lastStatus < STATUS_MS) return;
  lastStatus = now;
  // accumulate until there is enough busy time to measure (a fast engine may be busy < 2 ms per window)
  if (busyMs > 2) { const s = busyCycles / (busyMs / 1000); simHz = simHz ? simHz * 0.7 + s * 0.3 : s; busyMs = 0; busyCycles = 0; }
  // adapt the lead
  if (underruns > lastUnderruns) {
    leadMs = Math.min(LEAD_MAX, Math.round(leadMs * 1.25 + 5)); lastUnderrunAt = now;
  } else if (now - lastUnderrunAt > 8000 && now - lastLeadDrop > 4000 && simHz > 1.5 * clockHz) {
    // a fast engine and no underruns for a while: shorten the lead (lower pad latency), not below LEAD_FLOOR
    const floor = leadMs > LEAD_DEFAULT ? LEAD_DEFAULT : LEAD_FLOOR;
    if (leadMs > floor) leadMs = Math.max(floor, leadMs - 5);
    lastLeadDrop = now;
  }
  lastUnderruns = underruns;
  const pp = playPos();
  const st = {
    simHz: Math.round(simHz), realtime: simHz / clockHz, clockHz, chip: build ? build.version : 'v1',
    cycles: engine.cycles, frames: engine.frames, uoOut: engine.uoOut, uioOut: engine.uioOut,
    busy: act.busy, cs: act.cs, queue: engine.queueLength(),
    leadMs: Math.round((rendered - pp) / sampleRate * 1000), leadTargetMs: leadMs, underruns, dropped,
    hits: act.hits, sampleRate, backend, mock, dac, gain,
  };
  act = { busy: false, cs: false, hits: 0 };
  const midi = sched.midi ? { position: sched.midiPosition(pp), duration: sched.midi.duration, playing: sched.midiPlaying } : null;
  if (midi && (midi.playing || midiWasPlaying)) st.midi = midi;
  midiWasPlaying = !!(midi && midi.playing);
  post({ type: 'status', status: st });
}

function startLive() {
  if (running) return;
  running = true;
  lastStatus = performance.now();
  pump();
  if (!statusTimer) statusTimer = setInterval(() => { if (running) maybeStatus(); }, STATUS_MS);
}

// ---- offline (renderWav) ----
function renderOffline({ what, seconds }) {
  const total = Math.max(1, Math.round(seconds * sampleRate));
  const out = new Float32Array(total);
  rendered = 0;
  if (what === 'midi') sched.playMidi(0); else sched.startRhythm(0);
  sched.midiLoop = what === 'midi' ? false : sched.midiLoop;
  const B = 4096;
  for (let p = 0; p < total; p += B) {
    const n = Math.min(B, total - p);
    const { buf } = renderBlock(n);
    out.set(buf, p);
  }
  return encodeWav(out, sampleRate);
}

self.onmessage = async (e) => {
  const m = e.data;
  try {
    switch (m.type) {
      case 'init': {
        sampleRate = m.sampleRate || 48000;
        slowdown = Number(m.slowdown) || 0;
        if (m.dac) dac = m.dac;
        if (m.gain > 0) gain = m.gain;
        if (m.build) build = m.build;
        const err = await loadAnyEngine(m.engine, m.wasmUrl, sampleRate);
        setClock();
        sched = new Scheduler({ sampleRate, patterns: m.patterns, channels: m.channels, accentLevelDrop: m.accentLevelDrop });
        if (m.state) restoreState(m.state);
        setDc(sampleRate);
        if (err && (!build || build.version !== 'v3')) { dac = '1st'; gain = DEFAULT_GAIN; }
        // compile the other DAC builds in the background, so a switch while playing is instant
        else if (!mock && m.prefetch) for (const u of m.prefetch) warmUp(u).catch(() => {});
        post({ type: 'ready', info: { backend, mock, sampleRate, dac, gain, clockHz, frameClocks: engine.frameClocks || 96 }, error: err });
        break;
      }
      case 'start': {
        if (m.sampleRate && m.sampleRate !== sampleRate) {
          sampleRate = m.sampleRate; engine.reset(sampleRate); engine.setFilterHz(filterHz); sched.sampleRate = sampleRate; setDc(sampleRate);
        }
        if (m.port) { port = m.port; port.onmessage = onWorklet; }
        startLive();
        break;
      }
      case 'params': if (m.replace) sched.params[m.ch] = { ...m.params }; else sched.setParams(m.ch, m.params); break;
      case 'hit': {
        const params = sched.hitParams(m.ch, m.v ?? 1);
        if (params.level > 0 && running) live.push({ ch: m.ch, params, source: m.source || 'pad' });   // no sound before start()
        if (running && !pumpTimer) pump();
        break;
      }
      case 'stopAll': sched.stopRhythm(); sched.stopMidi(); live = []; engine.stop(); break;
      case 'filter': filterHz = m.hz; engine.setFilterHz(m.hz); break;
      case 'dac': dacChain = dacChain.then(() => switchDac(m)); await dacChain; break;
      case 'pattern': sched.setPattern(m.id); break;
      case 'addPattern': sched.addPattern(m.pattern); break;
      case 'removePattern': sched.removePattern(m.id); break;
      case 'tempo': sched.setTempo(m.bpm); break;
      case 'rhythm': if (m.on) sched.startRhythm(rendered); else sched.stopRhythm(); break;
      case 'midiLoad': sched.loadMidi(m.midi); break;
      case 'midi': if (m.on) sched.playMidi(rendered); else sched.stopMidi(); maybeStatus(true); break;
      case 'midiLoop': sched.midiLoop = !!m.on; break;
      case 'offline': {
        restoreState(m.state);
        const wav = renderOffline(m);
        post({ type: 'wav', id: m.id, wav }, [wav]);
        break;
      }
      case 'ping': post({ type: 'pong', id: m.id }); break;
    }
  } catch (err) {
    post({ type: 'error', message: String(err && err.message || err), id: m.id });
  }
};

// Switch to another engine build (another DAC), one switch at a time (dacChain). The chip restarts from
// reset: sounding voices are cut (with a short crossfade); the rhythm and the MIDI file go on.
let dacChain = Promise.resolve();
// Another chip version (v3) also brings its own patches (m.params: one per channel) and clock.
async function switchDac(m) {
  try {
    const nb = m.build || build;
    const family = (b) => (b && b.version === 'v3' ? 'v3' : 'v1');
    // the v1 mock plays v1 and v2 alike (as before); a switch to or from v3 always changes the engine
    if (!mock || family(nb) !== family(build) || nb.mock === true) {
      const prev = engine, prevMock = mock, prevBackend = backend;
      const kind = mock && family(nb) === family(build) ? 'mock' : (nb.mock === true ? 'mock' : (m.kind || 'wasm'));
      const err = await loadAnyEngine(kind, m.wasmUrl, sampleRate, nb);
      const next = engine;
      engine = prev; mock = prevMock; backend = prevBackend;
      if (err) throw new Error(err);
      next.setFilterHz(filterHz);
      const n = Math.round(FADE_MS / 1000 * sampleRate);
      if (running) fade = { engine, gain, left: n, total: n };
      engine = next; mock = next.backend === 'mock'; backend = engine.backend || 'wasm';
    }
    build = nb;
    setClock();
    if (m.params) m.params.forEach((p, ch) => { sched.params[ch] = { ...p }; });
    dac = m.dac; gain = m.gain > 0 ? m.gain : DEFAULT_GAIN;
    post({ type: 'dac', id: m.id, dac, gain, backend, mock, clockHz, frameClocks: engine.frameClocks || 96 });
    maybeStatus(true);
  } catch (err) {
    post({ type: 'error', message: String(err && err.message || err), id: m.id });
  }
}

function restoreState(s) {
  if (!s) return;
  if (s.params) s.params.forEach((p, ch) => { sched.params[ch] = { ...p }; });
  if (s.extraPatterns) for (const p of s.extraPatterns) sched.addPattern(p);
  if (s.pattern) sched.setPattern(s.pattern);
  if (s.tempo) sched.setTempo(s.tempo);
  if (s.midi) sched.loadMidi(s.midi);
  if (s.midiLoop !== undefined) sched.midiLoop = s.midiLoop;
  if (s.filterHz !== undefined) { filterHz = s.filterHz; engine.setFilterHz(s.filterHz); }
}

function onWorklet(e) {
  const m = e.data;
  if (m.consumed !== undefined) {
    consumed = m.consumed; consumedAt = performance.now(); underruns = m.underruns;
    if (running && !pumpTimer) pump();
  }
}
