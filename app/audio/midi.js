// SPDX-License-Identifier: Apache-2.0
// Standard MIDI File parser and writer, and the General MIDI drum map (CONTRACT section 5). No dependencies.

// GM drum note -> UDS channel
export const GM_MAP = Object.freeze({
  35: 4, 36: 4,
  37: 0, 38: 0, 39: 0, 40: 0,
  41: 3, 43: 3,
  45: 2, 47: 2,
  48: 1, 50: 1,
  42: 6, 44: 6,
  46: 7,
  49: 5, 51: 5, 52: 5, 55: 5, 57: 5, 59: 5,
});

export function mapNote(note) {
  const ch = GM_MAP[note];
  return ch === undefined ? -1 : ch;
}

// Velocity 1..127 -> v; level = round(level * v), at least 1 when v > 0
export function velocityToV(velocity) { return Math.max(0, Math.min(127, velocity)) / 127; }
export function scaleLevel(level, v) {
  if (!(v > 0)) return 0;
  return Math.max(1, Math.min(15, Math.round(level * Math.min(1, v))));
}

function readVlq(d, pos) {
  let v = 0, b;
  do {
    if (pos.i >= d.length) throw new Error('MIDI: truncated variable-length number');
    b = d[pos.i++];
    v = (v << 7) | (b & 0x7f);
  } while (b & 0x80);
  return v;
}

const str4 = (d, i) => String.fromCharCode(d[i], d[i + 1], d[i + 2], d[i + 3]);

// Parse an SMF (format 0 or 1, PPQ division). Returns the raw note events with times in seconds.
// -> { format, ppq, tracks, tempos: [{ tick, usPerQuarter }], timeSigs: [{ tick, num, den }], notes: [{ time, tick, channel (1..16), note, velocity }],
//      duration }   (note-ons only; a note-on with velocity 0 is a note-off and is dropped)
export function parseMidi(buffer) {
  const d = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer.buffer ? buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) : buffer);
  if (d.length < 14 || str4(d, 0) !== 'MThd') throw new Error('Not a MIDI file (no MThd header)');
  const hlen = (d[4] << 24 | d[5] << 16 | d[6] << 8 | d[7]) >>> 0;
  const format = d[8] << 8 | d[9];
  const ntrks = d[10] << 8 | d[11];
  const division = d[12] << 8 | d[13];
  if (format > 2) throw new Error('Unsupported MIDI format ' + format);
  if (division & 0x8000) throw new Error('SMPTE time division is not supported');
  const ppq = division || 96;
  let p = 8 + hlen;
  const tempos = [];
  const timeSigs = [];  // { tick, num, den }
  const raw = [];      // { tick, channel, note, velocity, order }
  let endTick = 0, order = 0, tracks = 0;
  for (let t = 0; t < ntrks && p + 8 <= d.length; t++) {
    const id = str4(d, p);
    const len = (d[p + 4] << 24 | d[p + 5] << 16 | d[p + 6] << 8 | d[p + 7]) >>> 0;
    p += 8;
    const end = Math.min(d.length, p + len);
    if (id !== 'MTrk') { p = end; t--; continue; }
    tracks++;
    const pos = { i: p };
    let tick = 0, status = 0;
    while (pos.i < end) {
      tick += readVlq(d, pos);
      let b = d[pos.i];
      if (b === 0xff) {                       // meta
        pos.i++;
        const type = d[pos.i++];
        const ml = readVlq(d, pos);
        if (type === 0x51 && ml >= 3) tempos.push({ tick, usPerQuarter: d[pos.i] << 16 | d[pos.i + 1] << 8 | d[pos.i + 2] });
        if (type === 0x58 && ml >= 2 && d[pos.i] > 0 && d[pos.i + 1] <= 6) timeSigs.push({ tick, num: d[pos.i], den: 1 << d[pos.i + 1] });
        pos.i += ml;
        if (type === 0x2f) break;
        continue;
      }
      if (b === 0xf0 || b === 0xf7) {         // sysex: skip
        pos.i++;
        const sl = readVlq(d, pos);
        pos.i += sl;
        continue;
      }
      if (b & 0x80) { status = b; pos.i++; }  // else running status
      if (!status) throw new Error('MIDI: data byte without status');
      const type = status & 0xf0, channel = (status & 0x0f) + 1;
      const n1 = type === 0xc0 || type === 0xd0 ? 1 : 2;
      const a = d[pos.i], v = n1 === 2 ? d[pos.i + 1] : 0;
      pos.i += n1;
      if (type === 0x90 && v > 0) raw.push({ tick, channel, note: a, velocity: v, order: order++ });
    }
    if (tick > endTick) endTick = tick;
    p = end;
  }
  tempos.sort((x, y) => x.tick - y.tick);
  timeSigs.sort((x, y) => x.tick - y.tick);
  const toSec = tickToSeconds(tempos, ppq);
  raw.sort((x, y) => x.tick - y.tick || x.order - y.order);
  const notes = raw.map(e => ({ time: toSec(e.tick), tick: e.tick, channel: e.channel, note: e.note, velocity: e.velocity }));
  return { format, ppq, tracks, tempos, timeSigs, notes, endTick, duration: toSec(endTick) };
}

// tick -> seconds with a tempo map (default 120 bpm until the first FF 51)
export function tickToSeconds(tempos, ppq) {
  const segs = [];
  let us = 500000, lastTick = 0, sec = 0;
  for (const t of tempos) {
    sec += (t.tick - lastTick) * us / ppq / 1e6;
    lastTick = t.tick; us = t.usPerQuarter;
    segs.push({ tick: lastTick, sec, us });
  }
  return tick => {
    let s = { tick: 0, sec: 0, us: 500000 };
    for (const g of segs) { if (g.tick <= tick) s = g; else break; }
    return s.sec + (tick - s.tick) * s.us / ppq / 1e6;
  };
}

// Turn a parsed file into UDS hits: channel 10 if it has notes there, else all channels.
// -> { hits: [{ time, ch, v, note }], duration, notes, unmapped: { [note]: count }, drumChannelOnly }
export function midiToHits(parsed) {
  const has10 = parsed.notes.some(n => n.channel === 10);
  const hits = [], unmapped = {};
  for (const n of parsed.notes) {
    if (has10 && n.channel !== 10) continue;
    const ch = mapNote(n.note);
    if (ch < 0) { unmapped[n.note] = (unmapped[n.note] || 0) + 1; continue; }
    hits.push({ time: n.time, ch, v: velocityToV(n.velocity), note: n.note });
  }
  const last = hits.length ? hits[hits.length - 1].time : 0;
  let duration = Math.max(parsed.duration, last);
  if (duration <= last) duration = last + 0.25;
  return { hits, duration, notes: hits.length, unmapped, drumChannelOnly: has10 };
}

// ---- writer (for tests and the demo file) ----

function vlq(n) {
  const out = [n & 0x7f];
  while ((n >>= 7)) out.unshift((n & 0x7f) | 0x80);
  return out;
}

// tracks: [[{ tick, bytes: [...] } or { tick, tempo: bpm } or { tick, timeSig: [num, den] } or { tick, meta: type, data: [...] }]]
// options: { format: 0|1, ppq, runningStatus: true }
export function writeMidi(tracks, { format = tracks.length > 1 ? 1 : 0, ppq = 96, runningStatus = true } = {}) {
  const out = [];
  const push32 = n => out.push(n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255);
  out.push(...[0x4d, 0x54, 0x68, 0x64]); push32(6);
  out.push(0, format, tracks.length >> 8, tracks.length & 255, ppq >> 8, ppq & 255);
  for (const tr of tracks) {
    const evs = tr.map((e, i) => ({ ...e, i })).sort((a, b) => a.tick - b.tick || a.i - b.i);
    const body = [];
    let last = 0, status = 0;
    for (const e of evs) {
      body.push(...vlq(e.tick - last)); last = e.tick;
      if (e.tempo !== undefined) {
        const us = Math.round(60e6 / e.tempo);
        body.push(0xff, 0x51, 3, us >> 16 & 255, us >> 8 & 255, us & 255); status = 0;
      } else if (e.meta !== undefined) {
        body.push(0xff, e.meta, ...vlq(e.data.length), ...e.data); status = 0;
      } else if (e.timeSig) {
        const [num, den] = e.timeSig;
        body.push(0xff, 0x58, 4, num, Math.round(Math.log2(den)), 24, 8); status = 0;
      } else if (e.sysex) {
        body.push(0xf0, ...vlq(e.sysex.length), ...e.sysex); status = 0;
      } else {
        const [s, ...rest] = e.bytes;
        if (!(runningStatus && s === status)) body.push(s);
        status = s;
        body.push(...rest);
      }
    }
    if (!evs.some(e => e.meta === 0x2f)) body.push(0, 0xff, 0x2f, 0);
    out.push(0x4d, 0x54, 0x72, 0x6b); push32(body.length);
    out.push(...body);
  }
  return new Uint8Array(out);
}
