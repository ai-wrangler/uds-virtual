// SPDX-License-Identifier: Apache-2.0
// Autorhythm slots: MIDI -> loop conversion (app/audio/slots.js), the scheduler's slot playback and the
// soft limiter.   node --test tests/audio/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseMidi, writeMidi } from '../../app/audio/midi.js';
import { midiToSlot, midiBytesToSlot, slotToPattern, slotIndexOf, MAX_BARS } from '../../app/audio/slots.js';
import { Scheduler, stepSeconds } from '../../app/audio/scheduler.js';
import { softLimit } from '../../app/audio/limiter.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => new Uint8Array(readFileSync(join(root, p)));
const channels = JSON.parse(readFileSync(join(root, 'app/data/channels.json'), 'utf8'));
const patterns = JSON.parse(readFileSync(join(root, 'app/data/patterns.json'), 'utf8')).patterns;
const on = (tick, note, vel, ch = 10) => ({ tick, bytes: [0x90 | (ch - 1), note, vel] });
const mk = (events, { ppq = 96, eot } = {}) => {
  const ev = [...events];
  if (eot !== undefined) ev.push({ tick: eot, meta: 0x2f, data: [] });
  return midiToSlot(parseMidi(writeMidi([ev], { format: 0, ppq })), 't.mid');
};

test('basic fixture: 2 bars of 4/4, 32 steps, tempo 120, velocities kept', () => {
  const s = midiBytesToSlot(read('tests/audio/fixtures/basic-format0.mid'), 'basic.mid');
  assert.equal(s.bars, 2);
  assert.equal(s.steps, 32);
  assert.equal(s.stepsPerBeat, 4);
  assert.equal(s.stepsPerBar, 16);
  assert.equal(s.bpm, 120);
  assert.equal(s.truncated, false);
  // 8ths -> every 2nd 16th step has a closed hat (ch 6)
  const hats = s.notes.filter(n => n.ch === 6).map(n => n.step);
  assert.deepEqual(hats, Array.from({ length: 16 }, (_, i) => i * 2));
  const kick = s.notes.find(n => n.ch === 4);
  assert.equal(kick.velocity, 120);
  assert.equal(kick.v, 120 / 127);
});

test('quantization to the nearest 16th', () => {
  // ppq 96: a 16th is 24 ticks. 11 -> 0, 13 -> 1 (24), 35 -> 1, 37 -> 2, 59 -> 2 (48), 61 -> 3
  const s = mk([on(11, 36, 100), on(13, 38, 100), on(37, 42, 100), on(61, 46, 100)]);
  assert.deepEqual(s.notes.map(n => [n.step, n.ch]), [[0, 4], [1, 0], [2, 6], [3, 7]]);
  assert.equal(s.bars, 1);
});

test('same step and channel plays once, at the higher velocity; several channels on a step all play', () => {
  const s = mk([on(0, 42, 50), on(0, 44, 90), on(0, 36, 100), on(1, 38, 70)]);
  const step0 = s.notes.filter(n => n.step === 0);
  assert.deepEqual(step0.map(n => n.ch), [0, 4, 6]);
  assert.equal(step0.find(n => n.ch === 6).velocity, 90);
});

test('bar length: whole bars covering the last note, and end-of-track', () => {
  assert.equal(mk([on(0, 36, 100), on(16 * 24 + 5, 38, 100)]).bars, 2);    // a note in bar 2
  assert.equal(mk([on(0, 36, 100)], { eot: 3 * 384 }).bars, 3);             // 3 bars by end-of-track
  assert.equal(mk([on(0, 36, 100)], { eot: 384 + 10 }).bars, 1);            // a few ticks past bar 1
});

test('time signature: 3/4 bars of 12 steps, 6/8 groups of 6', () => {
  const s = mk([{ tick: 0, timeSig: [3, 4] }, on(0, 36, 100), on(12 * 24, 38, 100)]);
  assert.equal(s.stepsPerBar, 12);
  assert.equal(s.meter, '3/4');
  assert.equal(s.bars, 2);
  assert.equal(s.steps, 24);
  assert.equal(s.beatSteps, 4);
  const c = mk([{ tick: 0, timeSig: [6, 8] }, on(0, 36, 100)]);
  assert.equal(c.stepsPerBar, 12);
  assert.equal(c.beatSteps, 6);
});

test(`at most ${MAX_BARS} bars: later notes are dropped and the slot is marked truncated`, () => {
  const ev = [];
  for (let bar = 0; bar < 6; bar++) ev.push(on(bar * 384, 36, 100), on(bar * 384 + 192, 38, 100));
  const s = mk(ev);
  assert.equal(s.bars, 4);
  assert.equal(s.steps, 64);
  assert.equal(s.truncated, true);
  assert.equal(s.dropped, 4);
  assert.ok(s.notes.every(n => n.step < 64));
});

test('tempo: the first tempo, rounded and clamped to 40..240; 120 without one', () => {
  assert.equal(midiBytesToSlot(read('tests/audio/fixtures/tempo-format1.mid'), 't').bpm, 120);
  assert.equal(midiBytesToSlot(read('tests/audio/fixtures/no-ch10.mid'), 't').bpm, 100);
  assert.equal(midiBytesToSlot(read('app/data/midi/demo.mid'), 'demo.mid').bpm, 104);
  assert.equal(mk([{ tick: 0, tempo: 97.4 }, on(0, 36, 100)]).bpm, 97);
  assert.equal(mk([{ tick: 0, tempo: 300 }, on(0, 36, 100)]).bpm, 240);
  assert.equal(mk([{ tick: 0, tempo: 20 }, on(0, 36, 100)]).bpm, 40);
  assert.equal(mk([on(0, 36, 100)]).bpm, 120);
});

test('demo groove: 4 bars, 64 steps, not truncated; channel rule as the MIDI player', () => {
  const s = midiBytesToSlot(read('app/data/midi/demo.mid'), 'demo.mid');
  assert.equal(s.bars, 4);
  assert.equal(s.steps, 64);
  assert.equal(s.truncated, false);
  const n = midiBytesToSlot(read('tests/audio/fixtures/no-ch10.mid'), 'n');   // no channel 10: all channels
  assert.deepEqual([...new Set(n.notes.map(x => x.ch))].sort(), [1, 2, 3, 4]);
  assert.deepEqual(n.unmapped, { 60: 1 });
});

test('a file with no mapped drum notes throws a clear error', () => {
  assert.throws(() => mk([on(0, 60, 100), on(24, 61, 100)]), /No drum notes in t\.mid/);
  assert.throws(() => midiBytesToSlot(new Uint8Array([1, 2, 3]), 'x.mid'), /Could not read x\.mid/);
});

function sched() {
  return new Scheduler({ sampleRate: 48000, patterns, channels: channels.channels, accentLevelDrop: 4 });
}
const collect = (s, from, to, block = 128) => {
  const out = [];
  for (let p = from; p < to; p += block) out.push(...s.nextEvents(p, Math.min(to, p + block)));
  return out;
};

test('scheduler plays a slot: step positions, per-hit velocity level, slot id on steps', () => {
  const slot = midiBytesToSlot(read('tests/audio/fixtures/basic-format0.mid'), 'b');
  const s = sched();
  s.addPattern(slotToPattern(3, slot));
  s.setPattern('S3'); s.setTempo(slot.bpm); s.startRhythm(0);
  const len = stepSeconds(120, 4) * 48000;
  const ev = collect(s, 0, Math.round(len * 40));
  const steps = ev.filter(e => e.kind === 'step');
  steps.forEach((e, k) => { assert.equal(e.pos, Math.round(k * len)); assert.equal(e.index, k % 32); assert.equal(slotIndexOf(e.patternId), 3); });
  const kick = ev.find(e => e.kind === 'hit' && e.ch === 4);
  assert.equal(kick.params.level, Math.max(1, Math.round(channels.channels[4].params.level * 120 / 127)));
  const hat = ev.find(e => e.kind === 'hit' && e.ch === 6);
  assert.equal(hat.params.level, Math.max(1, Math.round(channels.channels[6].params.level * 90 / 127)));
});

test('switching slots while playing waits for the next bar line, then starts at bar 1', () => {
  const two = mk([on(0, 36, 100), on(384, 38, 100)]);      // 2 bars
  const one = mk([on(0, 42, 100)]);                          // 1 bar
  const s = sched();
  s.addPattern(slotToPattern(0, two)); s.addPattern(slotToPattern(1, one));
  s.setPattern('S0'); s.startRhythm(0);
  const len = stepSeconds(120, 4) * 48000;
  collect(s, 0, Math.round(len * 5) - 10);                   // steps 0..4 played
  s.setPattern('S1');
  const steps = collect(s, Math.round(len * 5) - 10, Math.round(len * 40)).filter(e => e.kind === 'step');
  const first = steps.findIndex(e => e.patternId === 'S1');
  assert.equal(first, 11);                                   // steps 5..15 of S0, then S1 at the bar line
  assert.equal(steps[first].index, 0);
  assert.equal(steps[first].pos, Math.round(16 * len));
});

test('removing the playing slot stops the rhythm', () => {
  const s = sched();
  s.addPattern(slotToPattern(2, mk([on(0, 36, 100)])));
  s.setPattern('S2'); s.startRhythm(0);
  s.removePattern('S2');
  assert.equal(s.rhythmPlaying, false);
});

test('soft limiter: linear below 0.8, continuous, below 1, monotonic', () => {
  for (const v of [0, 0.3, -0.5, 0.8, -0.8]) assert.equal(softLimit(v), v);
  let last = -Infinity;
  for (let v = 0; v < 4; v += 0.01) { const y = softLimit(v); assert.ok(y >= last && y < 1); last = y; }
  assert.ok(Math.abs(softLimit(0.8001) - 0.8001) < 1e-6);
  assert.ok(softLimit(1.2) > 0.95 && softLimit(1.2) < 1);
  assert.equal(softLimit(-1.5), -softLimit(1.5));
});
