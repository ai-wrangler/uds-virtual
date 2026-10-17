// SPDX-License-Identifier: Apache-2.0
// Sample-accurate event scheduling for the Autorhythm sequencer and the MIDI-file player.
// Pure logic (no engine, no DOM): used by the engine worker, the offline WAV renderer and the Node tests.
//
// Times are absolute output-sample positions (integers). nextEvents(from, to) returns every event with
// from <= pos < to, in order, and advances the players past them.

import { scaleLevel } from './midi.js';

export const TEMPO_MIN = 40, TEMPO_MAX = 240, TEMPO_DEFAULT = 120;

export function stepSeconds(tempo, stepsPerBeat) { return 60 / (tempo * stepsPerBeat); }

export class Scheduler {
  constructor({ sampleRate, patterns, channels, accentLevelDrop = 4 }) {
    this.sampleRate = sampleRate;
    this.patterns = patterns;                     // as in patterns.json
    this.byId = new Map(patterns.map(p => [p.id, p]));
    this.accentLevelDrop = accentLevelDrop;
    this.defaults = channels.map(c => ({ ...c.params }));
    this.params = channels.map(c => ({ ...c.params }));
    // rhythm
    this.pattern = patterns[0];
    this.pendingPattern = null;
    this.tempo = TEMPO_DEFAULT;
    this.rhythmPlaying = false;
    this.k = 0;                 // number of the next step since start
    this.stepIndex = -1;        // index of the last step played in the pattern
    this.anchorPos = 0;         // float sample position of step anchorK
    this.anchorK = 0;
    this.lastStepPos = 0;
    // midi
    this.midi = null;           // { hits: [{ time, ch, v, note }], duration, name }
    this.midiPlaying = false;
    this.midiLoop = true;
    this.midiStart = 0;         // sample position of time 0 of the current pass
    this.midiIdx = 0;
    this.onMidiEnd = null;
  }

  setParams(ch, partial) { Object.assign(this.params[ch], partial); }

  // Level of a hit after velocity scaling
  hitParams(ch, v = 1, levelDrop = 0) {
    const p = { ...this.params[ch] };
    p.level = Math.max(0, p.level - levelDrop);
    p.level = scaleLevel(p.level, v);
    return p;
  }

  // ---- rhythm ----
  stepSamples(tempo = this.tempo, pattern = this.pattern) {
    return stepSeconds(tempo, pattern.stepsPerBeat) * this.sampleRate;
  }

  setPattern(id) {
    const p = this.byId.get(id);
    if (!p) throw new Error('unknown pattern ' + id);
    if (this.rhythmPlaying) {
      this.pendingPattern = p;                 // takes effect at the next step
      if (p.stepsPerBeat !== this.pattern.stepsPerBeat) this.reanchor();
    } else this.pattern = p;
    return p;
  }

  setTempo(bpm) {
    bpm = Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, Number(bpm) || TEMPO_DEFAULT));
    if (this.rhythmPlaying) this.reanchor();
    this.tempo = bpm;
    return bpm;
  }

  // Make the next step count from the last one played, so a tempo change applies to the interval in progress
  reanchor() {
    if (this.k > 0) { this.anchorPos = this.lastStepPos; this.anchorK = this.k - 1; }
    this.reanchorPending = true;
  }

  startRhythm(pos) {
    if (this.pendingPattern) { this.pattern = this.pendingPattern; this.pendingPattern = null; }
    this.rhythmPlaying = true;
    this.k = 0; this.stepIndex = -1; this.anchorPos = pos; this.anchorK = 0; this.lastStepPos = pos;
  }
  stopRhythm() {
    this.rhythmPlaying = false;
    if (this.pendingPattern) { this.pattern = this.pendingPattern; this.pendingPattern = null; }
  }

  nextStepPos(from) {
    // the step length of the interval comes from the pattern that will play after it
    const pat = this.pendingPattern || this.pattern;
    let f = this.anchorPos + (this.k - this.anchorK) * this.stepSamples(this.tempo, pat);
    if (this.reanchorPending && f < from) {     // a faster tempo put the step in the past: play it now
      this.anchorPos = from; this.anchorK = this.k; f = from;
    }
    return f;
  }

  // ---- midi ----
  loadMidi(m) { this.midi = m; this.midiPlaying = false; this.midiIdx = 0; }
  playMidi(pos) {
    if (!this.midi) return false;
    this.midiPlaying = true; this.midiStart = pos; this.midiIdx = 0;
    return true;
  }
  stopMidi() { this.midiPlaying = false; }
  midiPos(i) { return this.midiStart + Math.round(this.midi.hits[i].time * this.sampleRate); }
  midiEndPos() { return this.midiStart + Math.round(this.midi.duration * this.sampleRate); }
  midiPosition(atSample) {
    if (!this.midi || !this.midiPlaying) return 0;
    const d = this.midi.duration;
    const t = (atSample - this.midiStart) / this.sampleRate;
    return Math.max(0, Math.min(d, t));
  }

  // ---- events ----
  nextEvents(from, to) {
    const out = [];
    for (let guard = 0; guard < 100000; guard++) {
      let rPos = Infinity, mPos = Infinity, mKind = null;
      if (this.rhythmPlaying) rPos = Math.max(from, Math.round(this.nextStepPos(from)));
      if (this.midiPlaying && this.midi) {
        if (this.midiIdx < this.midi.hits.length) { mPos = this.midiPos(this.midiIdx); mKind = 'hit'; }
        else { mPos = this.midiEndPos(); mKind = 'end'; }
        mPos = Math.max(from, mPos);
      }
      const pos = Math.min(rPos, mPos);
      if (!(pos < to)) break;
      if (mPos <= rPos) {
        if (mKind === 'end') {
          if (this.midiLoop && this.midi.duration > 0) { this.midiStart = this.midiEndPos(); this.midiIdx = 0; }
          else { this.midiPlaying = false; out.push({ pos, kind: 'midi-end' }); }
          continue;
        }
        const h = this.midi.hits[this.midiIdx++];
        const params = this.hitParams(h.ch, h.v);
        if (params.level > 0) out.push({ pos, kind: 'hit', ch: h.ch, params, source: 'midi' });
        continue;
      }
      this.playStep(pos, out);
    }
    return out;
  }

  playStep(pos, out) {
    const exact = this.nextStepPos(pos);
    this.reanchorPending = false;
    if (this.pendingPattern) { this.pattern = this.pendingPattern; this.pendingPattern = null; }
    const pat = this.pattern;
    this.stepIndex = (this.stepIndex + 1) % pat.length;
    this.lastStepPos = exact;
    this.k++;
    const s = this.stepIndex;
    out.push({ pos, kind: 'step', index: s, length: pat.length, patternId: pat.id });
    const bits = pat.steps[s], acc = pat.accents ? pat.accents[s] : 0;
    let accRows = 0;
    if (pat.accents) for (const a of pat.accents) accRows |= a;
    for (let ch = 0; ch < 8; ch++) {
      if (!(bits >> ch & 1)) continue;
      const drop = (accRows >> ch & 1) && !(acc >> ch & 1) ? this.accentLevelDrop : 0;
      const params = this.hitParams(ch, 1, drop);
      if (params.level > 0) out.push({ pos, kind: 'hit', ch, params, source: 'rhythm' });
    }
  }
}
