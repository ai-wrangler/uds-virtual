// Loudness of each DAC build on a reference pattern, and the make-up gain that matches them.
//
//   node engine/test/loudness.mjs           print RMS levels and the suggested gains
//   node engine/test/loudness.mjs --write   also store the suggested gains in app/engine/builds.json
//
// The reference: 8 bars of a 16th-note groove at 120 bpm with every channel at its default knobs
// (app/data/channels.json), rendered at 48 kHz with the default RC filter, then the audio worker's
// 10 Hz DC blocker. The level is the RMS over the whole render (the tails are part of what is heard).
// The first build (1st order, as built) keeps its gain; every other build gets
// gain = gain_1st * rms_1st / rms_build, rounded to 0.01.
// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';

const APP = new URL('../../app/', import.meta.url);
const RATE = 48000, BPM = 120, BARS = 8, STEP = Math.round(RATE * 60 / BPM / 4);

const channels = JSON.parse(readFileSync(new URL('data/channels.json', APP))).channels;
// 16 steps per bar: channel lists per step (bar 4 has a tom fill, bar 1 and 5 open with the cymbal)
function stepHits(bar, s) {
  const h = [];
  if (s % 8 === 0 || s === 10) h.push(4);                     // bass drum
  if (s === 4 || s === 12) h.push(0);                         // snare
  if (s % 2 === 0 && s !== 14) h.push(6);                     // closed hat
  if (s === 14) h.push(7);                                    // open hat
  if (bar % 4 === 0 && s === 0) h.push(5);                    // cymbal
  if (bar % 4 === 3 && s >= 8) h.push([1, 1, 2, 2, 3, 3, 3, 3][s - 8]);   // tom fill
  return h;
}

/** RMS (linear, before make-up gain) of the reference pattern rendered by the engine in wasmBytes. */
export async function referenceRms(wasmBytes) {
  const e = await loadEngine(wasmBytes, { sampleRate: RATE });
  e.reset();
  const dcR = Math.exp(-2 * Math.PI * 10 / RATE);
  let x = 0, y = 0, sum = 0, n = 0, peak = 0;
  const total = BARS * 16 * STEP + RATE;                     // + 1 s of tail
  for (let pos = 0, k = 0; pos < total; k++) {
    if (k < BARS * 16) for (const ch of stepHits(Math.floor(k / 16), k % 16)) e.hit(ch, channels[ch].params);
    const len = Math.min(STEP, total - pos);
    const buf = e.render(len);
    for (let i = 0; i < len; i++) {
      y = buf[i] - x + dcR * y; x = buf[i];
      sum += y * y; n++; if (Math.abs(y) > peak) peak = Math.abs(y);
    }
    pos += len;
  }
  return { rms: Math.sqrt(sum / n), peak, backend: e.backend };
}

export function readBuilds() {
  return JSON.parse(readFileSync(new URL('engine/builds.json', APP)));
}

/** Level of every build that exists, with the gain that matches it to the first build. */
export async function measure() {
  const b = readBuilds();
  const out = [];
  let ref = null;
  for (const d of b.builds) {
    const f = new URL('engine/' + d.wasm, APP);
    if (!existsSync(f)) { out.push({ id: d.id, missing: true }); continue; }
    const m = await referenceRms(readFileSync(f));
    if (!ref) ref = { rms: m.rms, gain: d.gain };
    const suggested = Math.round(ref.gain * ref.rms / m.rms * 100) / 100;
    const db = (g) => 20 * Math.log10(m.rms * g);
    out.push({ id: d.id, rms: m.rms, peak: m.peak, gain: d.gain, suggested, dbOut: db(d.gain), dbRaw: 20 * Math.log10(m.rms) });
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = await measure();
  for (const r of res) {
    if (r.missing) { console.log(`${r.id}: not built`); continue; }
    console.log(`${r.id}: raw ${r.dbRaw.toFixed(2)} dBFS (peak ${r.peak.toFixed(3)}), gain ${r.gain} -> ` +
      `${r.dbOut.toFixed(2)} dBFS; matching gain ${r.suggested}`);
  }
  if (process.argv.includes('--write')) {
    const b = readBuilds();
    for (const r of res) if (!r.missing) b.builds.find((d) => d.id === r.id).gain = r.suggested;
    writeFileSync(new URL('engine/builds.json', APP), JSON.stringify(b, null, 2) + '\n');
    console.log('app/engine/builds.json updated');
  }
}
