// v3: builds.json declarations, HIT packing, the mock v3 engine, kits and note maps (node --test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { packHit, unpackHit, paramList, clampPatch, defaultPatch, validateKit, kitNoteMap, gmNotes } from '../../app/audio/patch.js';
import { loadMockV3Engine, DRAFT0_BUILD } from '../../app/audio/mock-engine-v3.js';
import { mapNote, setNoteMap, GM_MAP } from '../../app/audio/midi.js';
import { Scheduler } from '../../app/audio/scheduler.js';
import { loadEngine } from '../../app/engine/uds-engine.js';

const read = (p) => JSON.parse(fs.readFileSync(new URL('../../' + p, import.meta.url)));
const builds = read('app/engine/builds.json');
const channels = read('app/data/channels.json');
const pj = read('app/engine/params_v3.json');
const v3entry = builds.builds.find((b) => b.version === 'v3');
const V3 = { ...v3entry, params: pj.params, hit: pj.hit, contract: pj.contract };
const V1 = builds.builds.find((b) => b.id === '1st');
const rms = (a) => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length);

function lcg(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32); }
function randomPatch(build, r) {
  const p = {};
  for (const q of paramList(build)) p[q.id] = q.min + Math.floor(r() * (q.max - q.min + 1));
  return p;
}

test('builds.json: every build declares its clock, frame, parameters and HIT packing', () => {
  assert.deepEqual(builds.builds.map((b) => b.version), ['v1', 'v2', 'v3']);
  for (const b of builds.builds) {
    assert.ok(b.clockHz > 0 && b.frameClocks > 0, b.id + ' clock/frame');
    assert.ok(b.label && b.patchSet, b.id + ' label/patchSet');
    if (b.paramsUrl) continue;
    assert.ok(Array.isArray(b.params) && b.params.length, b.id + ' params');
    assert.ok(b.hit && b.hit.bytes.length, b.id + ' hit');
  }
  // v1 and v2 keep their 5 knobs: the same as data/channels.json
  for (const id of ['1st', '2nd']) {
    const b = builds.builds.find((x) => x.id === id);
    assert.equal(b.clockHz, 6000000); assert.equal(b.frameClocks, 96); assert.equal(b.patchSet, 'v1');
    assert.deepEqual(b.params.map((p) => [p.id, p.label, p.min, p.max, p.note]), channels.knobs.map((k) => [k.key, k.label, k.min, k.max, k.note]));
  }
  // v3: the copy of params.json; builds.json repeats its clock and frame
  assert.equal(v3entry.paramsUrl, 'params_v3.json');
  assert.equal(v3entry.clockHz, pj.clockHz);
  assert.equal(v3entry.frameClocks, pj.frameClocks);
  for (const id of v3entry.strip) assert.ok(pj.params.some((p) => p.id === id), 'strip param ' + id);
  // every field of the packing is a parameter, every parameter is packed once, at most 8 bits a byte
  const ids = pj.hit.bytes.flat();
  assert.deepEqual([...ids].sort(), pj.params.map((p) => p.id).sort());
  for (const byte of pj.hit.bytes) assert.ok(byte.reduce((s, f) => s + pj.params.find((p) => p.id === f).bits, 0) <= 8);
});

test('the v3 entry is not available without the real engine (the live site never plays the mock)', () => {
  const wasm = new URL('../../app/engine/' + v3entry.wasm, import.meta.url);
  if (v3entry.available) assert.ok(fs.existsSync(wasm), 'v3 available but ' + v3entry.wasm + ' missing');
  assert.equal(v3entry.mock, undefined, 'builds.json never marks a build as mock: only the page does, with ?v3=mock');
});

test('v1 packing: packHit gives exactly the bytes UDSEngine.hit sends', async () => {
  const e = await loadEngine(new URL('../../app/engine/uds_engine.wasm', import.meta.url));
  const r = lcg(7);
  for (let i = 0; i < 200; i++) {
    const ch = Math.floor(r() * 8), p = randomPatch(V1, r);
    e.hit(ch, p);
    e.runFrames(12);
    const log = e.takeLog();
    assert.equal(log.length, 1);
    assert.deepEqual(log[0].bytes, packHit(V1, ch, p));
  }
});

test('v3 packing: DRAFT 0 layout, MSB first, and unpack is its inverse', () => {
  const b = packHit(V3, 4, { pitch: 0x9a, decay: 0xc, level: 0x5, bend: 6, bendtime: 2, mix: 3, wave: 2, color: 1, clap: 1, snap: 5 });
  assert.deepEqual(b, [0x1c, 0x9a, 0xc5, (6 << 5) | (2 << 3) | 3, (2 << 6) | (1 << 4) | (1 << 3) | 5]);
  const r = lcg(3);
  for (let i = 0; i < 500; i++) {
    const p = randomPatch(V3, r);
    const bytes = packHit(V3, i & 7, p);
    assert.equal(bytes.length, 1 + pj.hit.bytes.length);
    assert.deepEqual(unpackHit(V3, bytes.slice(1)), p);
  }
  // out-of-range values are clamped by clampPatch, masked by packHit
  assert.deepEqual(clampPatch(paramList(V3), { pitch: 999, level: -3, nope: 1 }).pitch, 255);
  assert.equal(clampPatch(paramList(V3), { level: -3 }).level, 0);
});

test('mock v3: a hit makes sound, silence stays silent, STOP cuts, the display shows the channel', async () => {
  const e = await loadMockV3Engine({ sampleRate: 48000, build: V3 });
  assert.equal(e.clockHz, 12000000); assert.equal(e.frameClocks, 192); assert.equal(e.maxMessage, 8);
  assert.ok(rms(e.render(4800)) < 1e-6, 'silence');
  const kit = read('app/kits/init.json');
  for (const c of kit.channels) {
    e.reset();
    assert.ok(e.send(packHit(V3, c.ch, c.patch)));
    const a = rms(e.render(4800));
    assert.ok(a > 0.003, `${c.name}: rms ${a}`);
    assert.equal(e.uoOut & 0x7f, [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07][c.ch]);
  }
  e.reset();
  e.send(packHit(V3, 4, { ...kit.channels[4].patch, decay: 15 }));
  e.render(2400);
  e.stop();
  e.render(480);
  assert.ok(rms(e.render(2400)) < 1e-4, 'STOP silences');
  // level 0 is silent
  e.reset();
  e.send(packHit(V3, 4, { ...kit.channels[4].patch, level: 0 }));
  assert.ok(rms(e.render(4800)) < 1e-6);
});

test('mock v3: every parameter changes the sound', async () => {
  const e = await loadMockV3Engine({ sampleRate: 48000, build: V3 });
  const base = { pitch: 60, decay: 9, level: 12, bend: 3, bendtime: 1, mix: 3, wave: 0, color: 1, clap: 0, snap: 2 };
  const render = (p) => { e.reset(); e.send(packHit(V3, 0, p)); return e.render(9600).slice(); };
  const ref = render(base);
  for (const q of paramList(V3)) {
    const alt = { ...base, [q.id]: base[q.id] === q.max ? q.min : q.max };
    const out = render(alt);
    let diff = 0;
    for (let i = 0; i < out.length; i++) diff += (out[i] - ref[i]) ** 2;
    assert.ok(Math.sqrt(diff / out.length) > 1e-3, q.id + ' changes the sound');
  }
});

test('mock v3: two voices, same channel retriggers, hats 6 and 7 choke each other', async () => {
  const e = await loadMockV3Engine({ sampleRate: 48000, build: V3 });
  const long = { pitch: 80, decay: 14, level: 12, bend: 0, bendtime: 0, mix: 0, wave: 0, color: 1, clap: 0, snap: 0 };
  e.send(packHit(V3, 6, long)); e.render(960);
  e.send(packHit(V3, 7, long)); e.render(960);
  assert.equal(e.voices.filter((v) => v.on).length, 1, 'open hat cut the closed one');
  e.send(packHit(V3, 4, long)); e.render(960);
  assert.equal(e.voices.filter((v) => v.on).length, 2);
  e.send(packHit(V3, 0, long)); e.render(960);
  assert.equal(e.voices.filter((v) => v.on).length, 2, 'a third hit steals a voice');
});

test('kits: every kit in app/kits validates against params_v3.json; bad kits are refused with a reason', () => {
  const idx = read('app/kits/index.json');
  assert.ok(idx.kits.length >= 1);
  assert.ok(idx.kits.some((k) => k.id === idx.default));
  for (const k of idx.kits) {
    const kit = validateKit(read('app/kits/' + k.file), V3);
    assert.equal(kit.channels.length, 8);
    assert.equal(kit.id, k.id);
  }
  const good = read('app/kits/init.json');
  const bad = (mut, re) => { const k = JSON.parse(JSON.stringify(good)); mut(k); assert.throws(() => validateKit(k, V3), re); };
  bad((k) => k.channels.pop(), /all 8 channels/);
  bad((k) => { k.channels[1].ch = 0; }, /twice/);
  bad((k) => { k.channels[0].patch.pitch = 300; }, /outside 0\.\.255/);
  bad((k) => { k.channels[0].patch.sweep = 1; }, /not a v3 parameter/);
  bad((k) => { k.channels[0].notes = [200]; }, /0\.\.127/);
  assert.throws(() => validateKit([], V3), /JSON object/);
  // missing fields take the defaults
  const k = JSON.parse(JSON.stringify(good));
  delete k.channels[2].patch.snap;
  assert.equal(validateKit(k, V3).channels[2].patch.snap, defaultPatch(paramList(V3)).snap);
});

test('note maps: a kit may bring its own notes; channels without notes keep their GM notes', () => {
  const kit = validateKit(read('app/kits/init.json'), V3);
  assert.deepEqual(kitNoteMap(kit), Object.fromEntries(Object.entries(GM_MAP).map(([n, c]) => [n, c])));
  kit.channels[4].notes = [36, 60];
  kit.channels[0].notes = [39];
  const map = kitNoteMap(kit);
  assert.equal(map[60], 4); assert.equal(map[36], 4); assert.equal(map[35], undefined);
  assert.equal(map[39], 0); assert.equal(map[38], undefined);
  assert.equal(map[42], 6);
  assert.deepEqual(gmNotes(7), [46]);
  setNoteMap(map);
  assert.equal(mapNote(60), 4); assert.equal(mapNote(38), -1);
  setNoteMap(null);
  assert.equal(mapNote(38), 0); assert.equal(mapNote(60), -1);
});

test('the scheduler plays v3 patches with velocity on the level field', () => {
  const kit = read('app/kits/init.json');
  const s = new Scheduler({ sampleRate: 48000, patterns: read('app/data/patterns.json').patterns, channels: kit.channels.map((c) => ({ ch: c.ch, params: c.patch })) });
  const p = s.hitParams(4, 0.5);
  assert.equal(p.level, Math.round(kit.channels[4].patch.level * 0.5));
  assert.equal(p.wave, kit.channels[4].patch.wave);
  assert.deepEqual(packHit(V3, 4, p).length, 5);
  assert.ok(DRAFT0_BUILD.hit.bytes.length === 4);
});

test('v3 loudness matches v1 within 1 dB on the reference groove (real engine, or the mock until it is built)', async () => {
  const { measure } = await import('../../engine/test/loudness.mjs');
  const r = await measure();
  const v1 = r.find((x) => x.id === '1st'), v3 = r.find((x) => x.id === 'v3');
  console.log(`# loudness: v1 ${v1.dbOut.toFixed(2)} dBFS, v3${v3.mock ? ' (mock)' : ''} ${v3.dbOut.toFixed(2)} dBFS (gain ${v3.gain})`);
  assert.ok(Math.abs(v3.dbOut - v1.dbOut) < 1, `${(v3.dbOut - v1.dbOut).toFixed(2)} dB`);
});
