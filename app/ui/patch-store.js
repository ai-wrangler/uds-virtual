// patch-store.js — the channel patches, per chip version, in localStorage ('uds-virtual.patches.v1').
// { v1: { patches: [8], names: [8] }, v3: { patches: [8], names: [8], kit: id, kitData: kit } }.
// v1 and v2 share the "v1" set (they differ only in the DAC). Every access is wrapped in try/catch:
// with storage blocked the patches last for this page only.

const KEY = 'uds-virtual.patches.v1';

/** Restore the stored patch sets into uds; true when anything was restored. */
export function loadPatches(uds) {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { data = null; }
  if (!data || typeof data !== 'object') return false;
  let any = false;
  for (const set of ['v1', 'v3']) {
    if (!data[set] || !uds.getPatchSet?.(set)) continue;
    try { any = uds.setPatchSet(set, data[set]) || any; } catch (e) { console.warn('stored patches', set, 'ignored:', e); }
  }
  return any;
}

/** Store every patch set of uds; false if the browser refuses. */
export function storePatches(uds) {
  const data = {};
  for (const set of ['v1', 'v3']) {
    const s = uds.getPatchSet?.(set);
    if (!s) continue;
    data[set] = s;
    if (set === 'v3' && uds.kit) data[set].kitData = uds.kit;
  }
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch { return false; }
}

export function forgetPatches() {
  try { localStorage.removeItem(KEY); } catch { /* blocked */ }
}
