// SPDX-License-Identifier: Apache-2.0
// Writes the MIDI fixtures in tests/audio/fixtures/ and the demo groove app/data/midi/demo.mid.
//   node tests/audio/make-fixtures.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeMidi } from '../../app/audio/midi.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const on = (tick, note, vel, ch = 10) => ({ tick, bytes: [0x90 | (ch - 1), note, vel] });
const offv0 = (tick, note, ch = 10) => ({ tick, bytes: [0x90 | (ch - 1), note, 0] });   // note-on vel 0 = off
const off = (tick, note, ch = 10) => ({ tick, bytes: [0x80 | (ch - 1), note, 64] });

// Fixtures: what each one contains is described in FIXTURES, which the tests also read
export const FIXTURES = {
  // format 0, 96 PPQ, 120 bpm, 2 bars of kick / snare / closed hat in 8ths on channel 10, running status
  'basic-format0.mid': () => {
    const ev = [{ tick: 0, tempo: 120 }];
    for (let i = 0; i < 16; i++) {
      const t = i * 48;
      ev.push(on(t, 42, 90));
      if (i % 4 === 0) ev.push(on(t, 36, 120));
      if (i % 4 === 2) ev.push(on(t, 38, 110));
      ev.push(offv0(t + 24, 42));
    }
    ev.push({ tick: 16 * 48, meta: 0x2f, data: [] });
    return writeMidi([ev], { format: 0, ppq: 96 });
  },
  // format 1, 480 PPQ: track 0 = tempo map 120 -> 90 (beat 4) -> 150 (beat 8) + a sysex; track 1 = quarter
  // notes on channel 10 (kick on even beats, snare on odd), 12 beats, with note-offs (0x80) and a program change
  'tempo-format1.mid': () => {
    const t0 = [{ tick: 0, tempo: 120 }, { tick: 0, sysex: [0x7e, 0x7f, 0x09, 0x01, 0xf7] },
      { tick: 4 * 480, tempo: 90 }, { tick: 8 * 480, tempo: 150 }, { tick: 12 * 480, meta: 0x2f, data: [] }];
    const t1 = [{ tick: 0, meta: 0x03, data: [...Buffer.from('drums')] }, { tick: 0, bytes: [0xc9, 0] }];
    for (let b = 0; b < 12; b++) {
      t1.push(on(b * 480, b % 2 ? 38 : 36, 100));
      t1.push(off(b * 480 + 240, b % 2 ? 38 : 36));
    }
    return writeMidi([t0, t1], { format: 1, ppq: 480 });
  },
  // format 1 without channel 10: toms on channel 1 plus an unmapped note (60), 100 bpm
  'no-ch10.mid': () => {
    const t0 = [{ tick: 0, tempo: 100 }];
    const t1 = [];
    const notes = [50, 48, 47, 45, 43, 41, 60, 36];
    notes.forEach((n, i) => { t1.push(on(i * 96, n, 127, 1)); t1.push(offv0(i * 96 + 90, n, 1)); });
    return writeMidi([t0, t1], { format: 1, ppq: 192 });
  },
};

// An original groove for the demo: 4 bars at 104 bpm, 16ths, ghost notes, open hat on the "and" of 4,
// tom fill in bar 4, crash on the downbeat of bar 1.
export function demoGroove() {
  const ppq = 96, s = ppq / 4;
  const ev = [{ tick: 0, tempo: 104 }, { tick: 0, meta: 0x03, data: [...Buffer.from('UDS demo groove')] }];
  const kick = [0, 6, 10];          // in 16ths per bar
  for (let bar = 0; bar < 4; bar++) {
    const b = bar * 16 * s;
    for (let i = 0; i < 16; i++) {
      const t = b + i * s;
      const fill = bar === 3 && i >= 12;
      if (!fill) {
        if (i === 14) ev.push(on(t, 46, 96));
        else if (i % 2 === 0) ev.push(on(t, 42, i % 4 === 0 ? 100 : 70));
        else if (bar % 2 === 1 && i === 7) ev.push(on(t, 42, 50));
      }
      if (kick.includes(i) || (bar % 2 === 1 && i === 11)) ev.push(on(t, 36, 120));
      if (i === 4 || i === 12) { if (!fill || i === 12) ev.push(on(t, 38, 118)); }
      if (!fill && (i === 9 || i === 15) && bar !== 3) ev.push(on(t, 38, 40));
      if (fill && i > 12) ev.push(on(t, [48, 45, 41][i - 13], 110));
    }
  }
  ev.push(on(0, 49, 110));
  ev.push({ tick: 4 * 16 * s, meta: 0x2f, data: [] });
  return writeMidi([ev], { format: 0, ppq });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(join(here, 'fixtures'), { recursive: true });
  for (const [name, make] of Object.entries(FIXTURES)) writeFileSync(join(here, 'fixtures', name), make());
  mkdirSync(join(root, 'app', 'data', 'midi'), { recursive: true });
  writeFileSync(join(root, 'app', 'data', 'midi', 'demo.mid'), demoGroove());
  console.log('wrote', Object.keys(FIXTURES).join(', '), 'and app/data/midi/demo.mid');
}
