// SPDX-License-Identifier: Apache-2.0
// Patches: the per-channel sound of a chip build, as declared in app/engine/builds.json (CONTRACT.md 3a).
// Pure functions, no DOM: used by UDSAudio (main thread), the engine worker, the mock v3 engine and the
// Node tests.
//
// A build declares its parameter list (`params`: [{ id, label, bits, min, max, default, options?, ... }];
// v3 takes it from params.json, the twin of tt-uds-v3 docs/v3/CONTRACT.md) and its HIT packing
// (`hit`: { opcode: "0x18|ch", bytes: [[field ids of byte 1, MSB first], ...] }). A patch is a plain object
// { [id]: integer }.

import { GM_MAP } from './midi.js';

/** Parse an opcode such as "0x18|ch" -> 0x18. */
export function opcodeBase(opcode) {
  const m = /^\s*(0x[0-9a-f]+|\d+)/i.exec(String(opcode ?? '0x18'));
  return m ? Number(m[1]) & 0xf8 : 0x18;
}

/** The parameter list of a build, normalized: [{ id, key, label, bits, min, max, default, options, ... }]. */
export function paramList(build) {
  return (build.params || []).map((p) => {
    const id = p.id ?? p.key;
    const bits = p.bits ?? 8;
    const max = p.max ?? (1 << bits) - 1;
    return { ...p, id, key: id, bits, min: p.min ?? 0, max, default: p.default ?? p.min ?? 0, note: p.note ?? p.help ?? '' };
  });
}

/** Clamp every field to its range (integers); unknown keys are dropped, missing ones take the default. */
export function clampPatch(params, patch = {}, base = null) {
  const out = {};
  for (const p of params) {
    let v = patch[p.id];
    if (v === undefined || v === null || !Number.isFinite(Number(v))) v = base ? base[p.id] : p.default;
    v = Math.round(Number(v));
    out[p.id] = Math.max(p.min, Math.min(p.max, Number.isFinite(v) ? v : p.default));
  }
  return out;
}

export function defaultPatch(params) {
  return clampPatch(params, {});
}

/**
 * The SPI bytes of a HIT on channel ch with this patch: [opcode | ch, byte 1, byte 2, ...]. Each byte packs
 * its fields MSB first, each field masked to its width. For v1/v2 this gives exactly UDSEngine.hit().
 */
export function packHit(build, ch, patch) {
  const params = paramList(build);
  const byId = new Map(params.map((p) => [p.id, p]));
  const out = [opcodeBase(build.hit?.opcode) | (ch & 7)];
  for (const fields of build.hit.bytes) {
    let b = 0, used = 0;
    for (const f of fields) {
      const p = byId.get(f);
      if (!p) throw new Error('HIT field ' + f + ' is not a parameter');
      b = (b << p.bits) | ((patch[f] | 0) & ((1 << p.bits) - 1));
      used += p.bits;
    }
    if (used > 8) throw new Error('HIT byte [' + fields.join(', ') + '] has ' + used + ' bits');
    out.push((b << (8 - used)) & 255);   // fields fill the byte from bit 7 down
  }
  return out;
}

/** The inverse of packHit: bytes after the opcode -> patch. */
export function unpackHit(build, bytes) {
  const params = paramList(build);
  const byId = new Map(params.map((p) => [p.id, p]));
  const patch = {};
  build.hit.bytes.forEach((fields, i) => {
    let pos = 8;
    for (const f of fields) {
      const p = byId.get(f);
      pos -= p.bits;
      patch[f] = (bytes[i] >> pos) & ((1 << p.bits) - 1);
    }
  });
  return patch;
}

/** HIT bytes of a build: 1 + hit.bytes.length. */
export function hitLength(build) { return 1 + build.hit.bytes.length; }

// ---- kits (V3-SOUND's kits/<id>.json) ----

/** GM notes per channel (the default map). */
export function gmNotes(ch) {
  return Object.entries(GM_MAP).filter(([, c]) => c === ch).map(([n]) => Number(n));
}

/**
 * Check a kit and return a clean copy: { id, name, inspiredBy, description, contract, tempo,
 * channels: [8 x { ch, name, notes, patch }] }. Throws an Error with a plain message when it does not fit.
 */
export function validateKit(kit, build) {
  if (!kit || typeof kit !== 'object' || Array.isArray(kit)) throw new Error('a kit is a JSON object');
  if (!Array.isArray(kit.channels)) throw new Error('the kit has no "channels" list');
  const params = paramList(build);
  const byCh = new Map();
  for (const c of kit.channels) {
    const ch = Number(c?.ch);
    if (!(Number.isInteger(ch) && ch >= 0 && ch < 8)) throw new Error('kit channel numbers must be 0..7');
    if (byCh.has(ch)) throw new Error('channel ' + ch + ' appears twice in the kit');
    if (!c.patch || typeof c.patch !== 'object') throw new Error('channel ' + ch + ' has no "patch"');
    for (const [k, v] of Object.entries(c.patch)) {
      const p = params.find((x) => x.id === k);
      if (!p) throw new Error(`channel ${ch}: "${k}" is not a ${build.version || ''} parameter`.replace('  ', ' '));
      if (!(Number.isInteger(v) && v >= p.min && v <= p.max)) throw new Error(`channel ${ch}: ${k} = ${v} is outside ${p.min}..${p.max}`);
    }
    let notes = null;
    if (c.notes !== undefined && c.notes !== null) {
      if (!Array.isArray(c.notes) || c.notes.some((n) => !(Number.isInteger(n) && n >= 0 && n <= 127))) throw new Error('channel ' + ch + ': notes must be MIDI note numbers 0..127');
      notes = [...c.notes];
    }
    byCh.set(ch, { ch, name: String(c.name || `Ch ${ch}`).slice(0, 24), notes, patch: clampPatch(params, c.patch) });
  }
  if (byCh.size !== 8) throw new Error('a kit needs all 8 channels (0..7), this one has ' + byCh.size);
  const contract = kit.contract ?? null;
  return {
    id: String(kit.id || 'kit').replace(/[^\w.-]+/g, '-').slice(0, 40) || 'kit',
    name: String(kit.name || kit.id || 'Kit').slice(0, 40),
    inspiredBy: kit.inspiredBy ? String(kit.inspiredBy).slice(0, 80) : '',
    description: kit.description ? String(kit.description).slice(0, 400) : '',
    contract,
    tempo: Number.isFinite(kit.tempo) ? kit.tempo : null,
    channels: [...byCh.values()].sort((a, b) => a.ch - b.ch),
  };
}

/**
 * The note map of a kit: note -> channel. A channel without "notes" uses its GM notes. When two channels
 * claim a note, the lower channel number wins.
 */
export function kitNoteMap(kit) {
  const map = {};
  for (const c of [...kit.channels].sort((a, b) => b.ch - a.ch)) {
    for (const n of c.notes ?? gmNotes(c.ch)) map[n] = c.ch;
  }
  return map;
}
