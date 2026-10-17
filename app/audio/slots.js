// SPDX-License-Identifier: Apache-2.0
// Autorhythm slots: a Standard MIDI File turned into a loop on a 16th-note grid (pure, tested in Node).
//
// Rules (CONTRACT section 5):
// - The same note map and channel rule as the MIDI player: channel 10, else all channels.
// - Note-ons are quantized to the nearest 16th note (PPQ / 4 ticks).
// - The loop is whole bars of the first time signature (default 4/4), at least up to the last note and
//   to the last whole bar before end-of-track, at most MAX_BARS; later notes are dropped (truncated).
// - Each hit keeps its velocity: v = velocity / 127, level = round(knob level * v), at least 1.
// - Two notes on the same step and channel (e.g. 42 and 44) play once, at the higher velocity.
// - bpm is the file's first tempo, rounded and clamped to 40..240 (120 if the file has none).

import { parseMidi, mapNote, velocityToV } from './midi.js';
import { TEMPO_MIN, TEMPO_MAX, TEMPO_DEFAULT } from './scheduler.js';

export const SLOT_COUNT = 16;
export const MAX_BARS = 4;
export const STEPS_PER_BEAT = 4;      // steps per quarter note (16ths); tempo is quarter notes per minute

export function slotPatternId(index) { return 'S' + index; }
export function slotIndexOf(patternId) {
  const m = /^S(\d+)$/.exec(patternId || '');
  return m ? Number(m[1]) : null;
}

// parsed: the result of parseMidi. -> { name, bars, steps, stepsPerBeat, stepsPerBar, beatSteps, meter,
//   notes: [{ step, ch, v, velocity, note }], bpm, truncated, dropped, unmapped }
export function midiToSlot(parsed, name = 'file.mid') {
  const ppq = parsed.ppq || 96;
  const ts = (parsed.timeSigs && parsed.timeSigs[0]) || { num: 4, den: 4 };
  const num = ts.num || 4, den = ts.den || 4;
  const stepsPerBar = Math.max(1, Math.round(num * 16 / den));
  // LED grouping: one group per beat; compound meters (6/8, 9/8, 12/8) group dotted quarters
  const beatSteps = den >= 8 && num % 3 === 0 && num > 3 ? 3 * 16 / den : Math.max(1, 16 / den);
  const stepTicks = ppq / STEPS_PER_BEAT;

  const has10 = parsed.notes.some(n => n.channel === 10);
  const byKey = new Map(), unmapped = {};
  for (const n of parsed.notes) {
    if (has10 && n.channel !== 10) continue;
    const ch = mapNote(n.note);
    if (ch < 0) { unmapped[n.note] = (unmapped[n.note] || 0) + 1; continue; }
    const step = Math.round(n.tick / stepTicks);
    const key = step * 8 + ch;
    const old = byKey.get(key);
    if (!old || n.velocity > old.velocity) byKey.set(key, { step, ch, velocity: n.velocity, note: n.note });
  }
  const all = [...byKey.values()].sort((a, b) => a.step - b.step || a.ch - b.ch);
  if (!all.length) {
    throw new Error(`No drum notes in ${name}: none of its notes map to a UDS channel ` +
      '(General MIDI drum notes 35..59, on channel 10 if the file uses it)');
  }
  const lastStep = all[all.length - 1].step;
  const noteBars = Math.floor(lastStep / stepsPerBar) + 1;
  const eotBars = Math.floor((parsed.endTick || 0) / (stepTicks * stepsPerBar) + 1e-9);
  const bars = Math.max(1, Math.min(MAX_BARS, Math.max(noteBars, eotBars)));
  const steps = bars * stepsPerBar;
  const notes = all.filter(n => n.step < steps).map(n => ({ ...n, v: velocityToV(n.velocity) }));
  const dropped = all.length - notes.length;

  let bpm = TEMPO_DEFAULT;
  if (parsed.tempos && parsed.tempos.length) bpm = 60e6 / parsed.tempos[0].usPerQuarter;
  bpm = Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, Math.round(bpm) || TEMPO_DEFAULT));

  return {
    name, bars, steps, stepsPerBeat: STEPS_PER_BEAT, stepsPerBar, beatSteps, meter: `${num}/${den}`,
    notes, bpm, truncated: dropped > 0, dropped, unmapped,
  };
}

export function midiBytesToSlot(buffer, name) {
  let parsed;
  try { parsed = parseMidi(buffer); } catch (e) { throw new Error(`Could not read ${name}: ${e.message}`); }
  return midiToSlot(parsed, name);
}

// A slot as a Scheduler pattern: steps[i] = channel bits, hits[i] = [{ ch, v }]
export function slotToPattern(index, slot) {
  const steps = new Array(slot.steps).fill(0);
  const hits = Array.from({ length: slot.steps }, () => []);
  for (const n of slot.notes) { steps[n.step] |= 1 << n.ch; hits[n.step].push({ ch: n.ch, v: n.v }); }
  return {
    id: slotPatternId(index), slot: index, name: slot.name, stepsPerBeat: slot.stepsPerBeat,
    barSteps: slot.stepsPerBar, length: slot.steps, steps, hits, accents: null, bpm: slot.bpm,
  };
}
