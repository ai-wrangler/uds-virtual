// SPDX-License-Identifier: Apache-2.0
// Node tests for the audio part:  node --test tests/audio/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseMidi, midiToHits, writeMidi, GM_MAP, mapNote, scaleLevel, velocityToV } from '../../app/audio/midi.js';
import { Scheduler, stepSeconds } from '../../app/audio/scheduler.js';
import { encodeWav, decodeWav } from '../../app/audio/wav.js';
import { loadMockEngine } from '../../app/audio/mock-engine.js';
import { FIXTURES, demoGroove } from './make-fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const json = p => JSON.parse(readFileSync(join(root, p), 'utf8'));
const channels = json('app/data/channels.json');
const patterns = json('app/data/patterns.json').patterns;
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

// ---------- MIDI ----------
test('fixtures on disk match the generator', () => {
  for (const [name, make] of Object.entries(FIXTURES)) {
    assert.deepEqual(new Uint8Array(readFileSync(join(here, 'fixtures', name))), make(), name);
  }
  assert.deepEqual(new Uint8Array(readFileSync(join(root, 'app/data/midi/demo.mid'))), demoGroove());
});

test('format 0 with running status', () => {
  const bytes = FIXTURES['basic-format0.mid']();
  const withRs = bytes.length, withoutRs = FIXTURES['basic-format0.mid'].length;
  void withoutRs;
  const m = parseMidi(bytes);
  assert.equal(m.format, 0); assert.equal(m.ppq, 96); assert.equal(m.tracks, 1);
  // 16 hats + 4 kicks + 4 snares; the 16 note-on/vel-0 offs are dropped
  assert.equal(m.notes.length, 24);
  const kicks = m.notes.filter(n => n.note === 36).map(n => n.time);
  assert.deepEqual(kicks, [0, 1, 2, 3]);           // 120 bpm, every 2 beats
  near(m.duration, 4);
  // the file really uses running status: every message after the first in a run omits the status byte
  const plain = writeMidi([[{ tick: 0, bytes: [0x99, 36, 100] }, { tick: 10, bytes: [0x99, 38, 100] }]], { runningStatus: false });
  const rs = writeMidi([[{ tick: 0, bytes: [0x99, 36, 100] }, { tick: 10, bytes: [0x99, 38, 100] }]], { runningStatus: true });
  assert.equal(plain.length - rs.length, 1);
  assert.deepEqual(parseMidi(plain).notes, parseMidi(rs).notes);
  assert.ok(withRs > 0);
});

test('format 1 with a tempo map, sysex, note-offs and meta events', () => {
  const m = parseMidi(FIXTURES['tempo-format1.mid']());
  assert.equal(m.format, 1); assert.equal(m.ppq, 480); assert.equal(m.tracks, 2);
  assert.equal(m.tempos.length, 3);
  const want = [0, 0.5, 1, 1.5, 2, 2 + 2 / 3, 2 + 4 / 3, 4, 4 + 2 / 3, 4 + 2 / 3 + 0.4, 4 + 2 / 3 + 0.8, 4 + 2 / 3 + 1.2];
  assert.equal(m.notes.length, 12);
  m.notes.forEach((n, i) => near(n.time, want[i], 1e-5));
  near(m.duration, 4 + 2 / 3 + 1.6, 1e-5);
  assert.ok(m.notes.every(n => n.channel === 10));
});

test('channel 10 only, else all channels; unmapped notes are counted', () => {
  const h = midiToHits(parseMidi(FIXTURES['no-ch10.mid']()));
  assert.equal(h.drumChannelOnly, false);
  assert.deepEqual(h.hits.map(x => x.ch), [1, 1, 2, 2, 3, 3, 4]);
  assert.deepEqual(h.unmapped, { 60: 1 });
  near(h.hits[1].time, 0.3);                       // 100 bpm, 96 ticks at 192 PPQ = half a beat
  // a file with drums on 10 ignores the other channels
  const mixed = writeMidi([[{ tick: 0, bytes: [0x90, 36, 100] }, { tick: 0, bytes: [0x99, 38, 100] }]]);
  const hm = midiToHits(parseMidi(mixed));
  assert.deepEqual(hm.hits.map(x => x.ch), [0]);
  assert.equal(hm.drumChannelOnly, true);
});

test('demo groove parses and maps every note', () => {
  const h = midiToHits(parseMidi(demoGroove()));
  assert.ok(h.notes > 60);
  assert.deepEqual(h.unmapped, {});
  near(h.duration, 4 * 4 * 60 / 104, 1e-5);
});

test('GM map matches the CONTRACT table', () => {
  const table = { 4: [35, 36], 0: [37, 38, 39, 40], 3: [41, 43], 2: [45, 47], 1: [48, 50], 6: [42, 44], 7: [46], 5: [49, 51, 52, 55, 57, 59] };
  let count = 0;
  for (const [ch, notes] of Object.entries(table)) for (const n of notes) { assert.equal(mapNote(n), Number(ch)); count++; }
  assert.equal(Object.keys(GM_MAP).length, count);
  for (const n of [0, 34, 53, 54, 56, 58, 60, 127]) assert.equal(mapNote(n), -1);
});

test('velocity scaling', () => {
  assert.equal(scaleLevel(15, 1), 15);
  assert.equal(scaleLevel(13, 0.5), 7);            // round(6.5)
  assert.equal(scaleLevel(10, 1 / 127), 1);        // at least 1
  assert.equal(scaleLevel(10, 0), 0);
  near(velocityToV(127), 1);
});

// ---------- sequencer ----------
function mkSched(rate = 48000) {
  return new Scheduler({ sampleRate: rate, patterns, channels: channels.channels, accentLevelDrop: channels.accentLevelDrop });
}
function collect(s, from, to, block = 128) {
  const out = [];
  for (let p = from; p < to; p += block) out.push(...s.nextEvents(p, Math.min(to, p + block)));
  return out;
}

for (const [tempo, rate, block] of [[120, 48000, 128], [97, 44100, 256], [240, 48000, 1024], [40, 48000, 77]]) {
  test(`rhythm step positions at ${tempo} bpm, ${rate} Hz, blocks of ${block}`, () => {
    const s = mkSched(rate);
    s.setTempo(tempo);
    s.setPattern('A0');
    const start = 1000;
    s.startRhythm(start);
    const len = stepSeconds(tempo, 4) * rate;
    const steps = collect(s, start, start + Math.round(len * 70), block).filter(e => e.kind === 'step');
    assert.ok(steps.length >= 70 - 1);
    steps.forEach((e, k) => {
      assert.equal(e.pos, Math.round(start + k * len), `step ${k}`);
      assert.equal(e.index, k % 32);
      assert.equal(e.patternId, 'A0');
    });
  });
}

test('hits follow the step bits; 3/4 pattern uses its stepsPerBeat', () => {
  const s = mkSched();
  s.setPattern('A9');
  const p = patterns.find(x => x.id === 'A9');
  s.startRhythm(0);
  const ev = collect(s, 0, Math.round(stepSeconds(120, p.stepsPerBeat) * 48000 * p.length) - 1);
  const steps = ev.filter(e => e.kind === 'step');
  assert.equal(steps.length, p.length);
  steps.forEach((st, i) => {
    const chs = ev.filter(e => e.kind === 'hit' && e.pos === st.pos).map(e => e.ch);
    const want = [0, 1, 2, 3, 4, 5, 6, 7].filter(c => p.steps[i] >> c & 1);
    assert.deepEqual(chs, want, 'step ' + i);
  });
});

test('accent rule: unaccented hits on an accented channel are 4 softer', () => {
  const p = patterns.find(x => x.id === 'B0');
  let rows = 0; for (const a of p.accents) rows |= a;
  const s = mkSched();
  s.setPattern('B0'); s.setTempo(p.bpm); s.startRhythm(0);
  const ev = collect(s, 0, Math.round(stepSeconds(p.bpm, 4) * 48000 * p.length) - 1);
  let checked = 0;
  for (const st of ev.filter(e => e.kind === 'step')) {
    for (const h of ev.filter(e => e.kind === 'hit' && e.pos === st.pos)) {
      const base = channels.channels[h.ch].params.level;
      const accented = p.accents[st.index] >> h.ch & 1;
      const want = (rows >> h.ch & 1) && !accented ? Math.max(0, base - 4) : base;
      assert.equal(h.params.level, want);
      checked++;
    }
  }
  assert.ok(checked > 10);
  assert.ok(rows !== 0);
});

test('tempo change applies to the next step, pattern change at the next step', () => {
  const s = mkSched();
  s.startRhythm(0);
  const l120 = stepSeconds(120, 4) * 48000;     // 6000 samples
  let ev = s.nextEvents(0, 6100).filter(e => e.kind === 'step');
  assert.deepEqual(ev.map(e => e.pos), [0, 6000]);
  s.setTempo(60);                                // the step after 6000 is 12000 samples later
  s.setPattern('A1');
  ev = collect(s, 6100, 40000).filter(e => e.kind === 'step');
  assert.equal(ev[0].pos, 6000 + 2 * l120);
  assert.equal(ev[0].patternId, 'A1');
  assert.equal(ev[0].index, 2);                  // the step counter goes on
  assert.equal(ev[1].pos, 6000 + 4 * l120);
  // faster tempo while the next step is already "due": it plays at once, then at the new spacing
  s.setTempo(240);
  ev = collect(s, 40000, 60000).filter(e => e.kind === 'step');
  assert.equal(ev[0].pos, 40000);                // 30000 + 3000 is already past
  assert.equal(ev[1].pos, 43000);
});

test('midi player: sample positions, loop and end', () => {
  const s = mkSched();
  const h = midiToHits(parseMidi(FIXTURES['tempo-format1.mid']()));
  s.loadMidi(h);
  s.playMidi(500);
  const ev = collect(s, 0, 48000 * 12.4).filter(e => e.kind === 'hit');
  assert.equal(ev.length, 24);                    // looped twice
  ev.slice(0, 12).forEach((e, i) => assert.equal(e.pos, 500 + Math.round(h.hits[i].time * 48000)));
  const loopStart = 500 + Math.round(h.duration * 48000);
  assert.equal(ev[12].pos, loopStart);
  s.midiLoop = false; s.playMidi(0);
  const ev2 = collect(s, 0, 48000 * 14);
  assert.equal(ev2.filter(e => e.kind === 'hit').length, 12);
  assert.equal(ev2.at(-1).kind, 'midi-end');
  assert.equal(s.midiPlaying, false);
});

// ---------- WAV ----------
test('WAV encoding', () => {
  const x = new Float32Array([0, 0.5, -0.5, 1, -1, 2, -2]);
  const buf = encodeWav(x, 48000);
  assert.equal(buf.byteLength, 44 + 14);
  const v = new DataView(buf);
  assert.equal(String.fromCharCode(...new Uint8Array(buf, 0, 4)), 'RIFF');
  assert.equal(v.getUint32(4, true), 36 + 14);
  assert.equal(v.getUint16(20, true), 1);          // PCM
  assert.equal(v.getUint16(22, true), 1);          // mono
  assert.equal(v.getUint32(24, true), 48000);
  assert.equal(v.getUint32(28, true), 96000);
  assert.equal(v.getUint16(34, true), 16);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(i => v.getInt16(44 + 2 * i, true)), [0, 16384, -16384, 32767, -32768, 32767, -32768]);
  const d = decodeWav(buf);
  assert.equal(d.sampleRate, 48000); assert.equal(d.samples.length, 7);
});

// ---------- mock engine ----------
test('mock engine: interface and sound', async () => {
  const e = await loadMockEngine({ sampleRate: 48000 });
  assert.equal(e.backend, 'mock');
  let out = e.render(4800);
  assert.equal(out.length, 4800);
  assert.ok(Math.max(...out.map(Math.abs)) < 0.05);       // silence (sigma-delta idle)
  assert.equal(e.hit(4, channels.channels[4].params), true);
  assert.equal(e.queueLength(), 1);
  out = e.render(4800);
  assert.ok(Math.max(...Array.from(out, Math.abs)) > 0.15);
  assert.equal(e.uoOut & 0x7f, 0x66);                       // digit 4
  const a = e.takeActivity();
  assert.equal(a.hits, 1); assert.equal(a.cs, true);
  near(e.cycles, e.frames * 96);
  e.stop(); e.render(480);
  out = e.render(4800);
  assert.ok(Math.max(...Array.from(out, Math.abs)) < 0.05);
  e.reset(44100);
  assert.equal(e.sampleRate, 44100);
  assert.equal(e.frames, 0);
});

// ---------- mock vs real engine (runs once app/engine/ is present) ----------
import { existsSync } from 'node:fs';
const ENGINE_JS = join(root, 'app/engine/uds-engine.js');
test('mock engine sounds like the real engine (correlation per drum)', { skip: !existsSync(ENGINE_JS) && 'app/engine not present' }, async () => {
  const { loadEngine } = await import('../../app/engine/uds-engine.js');
  const real = await loadEngine(readFileSync(join(root, 'app/engine/uds_engine.wasm')), { sampleRate: 48000 });
  const mock = await loadMockEngine({ sampleRate: 48000 });
  for (const c of channels.channels) {
    real.reset(); mock.reset();
    real.hit(c.ch, c.params); mock.hit(c.ch, c.params);
    const a = Float32Array.from(real.render(8192)), b = Float32Array.from(mock.render(8192));
    let best = -1;
    for (let lag = -64; lag <= 64; lag++) {
      let ab = 0, aa = 0, bb = 0;
      for (let i = 100; i < 8000; i++) { const x = a[i], y = b[i + lag]; ab += x * y; aa += x * x; bb += y * y; }
      best = Math.max(best, ab / Math.sqrt(aa * bb));
    }
    assert.ok(best > 0.85, `${c.id}: correlation ${best.toFixed(3)}`);
  }
});
