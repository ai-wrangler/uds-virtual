// slot-store.js — keeps the Autorhythm slots (raw .mid bytes as base64, plus the file name) in localStorage,
// so they survive a reload. Every access is guarded: storage can be missing, blocked or full.
const KEY = 'uds-virtual.slots.v1';

export function b64FromBytes(buf) {
  const u = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
export function bytesFromB64(b64) {
  const s = atob(b64);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u.buffer;
}

function readAll() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    if (v && Array.isArray(v.slots)) return { slots: v.slots.slice(0, 16), sel: Number.isInteger(v.sel) ? v.sel : null };
  } catch { /* no storage or bad data */ }
  return { slots: [], sel: null };
}
function writeAll(v) {
  try { window.localStorage.setItem(KEY, JSON.stringify(v)); return true; } catch { return false; }
}

export function loadStored() { return readAll(); }
// -> false if the browser refused to store it (quota, private mode)
export function storeSlot(index, name, buf) {
  const v = readAll();
  while (v.slots.length < 16) v.slots.push(null);
  try { v.slots[index] = { name, b64: b64FromBytes(buf) }; } catch { return false; }
  return writeAll(v);
}
export function forgetSlot(index) {
  const v = readAll();
  if (v.slots[index]) { v.slots[index] = null; writeAll(v); }
}
export function forgetAll() { try { window.localStorage.removeItem(KEY); } catch { /* ignore */ } }
export function storeSelection(sel) {
  const v = readAll();
  v.sel = sel;
  writeAll(v);
}
