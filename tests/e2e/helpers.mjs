// Shared helpers for the end-to-end tests (owner: integrate).
// The tests talk to the page only through CONTRACT section 6: data-testids, window.uds and
// body[data-state]. Tests whose part has not landed yet are skipped, not failed.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Chip 7-segment table (segments a..g = bits 0..6), from the chip's src/uds_core.v.
export const SEG7 = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];

/** Errors that are not the page's fault (none known yet). */
const IGNORED_CONSOLE = [/favicon\.ico/i];

/**
 * Open the page and record console errors and page errors on page.__errors.
 * @param {import('@playwright/test').Page} page
 * @param {string} query e.g. '?engine=mock' or ''
 */
export async function openApp(page, query = '') {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !IGNORED_CONSOLE.some((r) => r.test(msg.text()))) errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('requestfailed', (req) => {
    if (!IGNORED_CONSOLE.some((r) => r.test(req.url()))) errors.push(`request failed: ${req.url()}`);
  });
  page.__errors = errors;
  await page.goto(query ? `./${query}` : './');
  await page.waitForLoadState('load');
  return errors;
}

/** Skip the current test if the panel (ui part) is not on the page yet. */
export async function requireUI(page) {
  await waitReady(page);
  const n = await page.getByTestId('power').count();
  test.skip(n === 0, 'ui part not merged yet: no [data-testid=power] on the page');
}

/** Skip if a data-testid is missing (that control has not landed). */
export async function requireTestId(page, id) {
  const n = await page.getByTestId(id).count();
  test.skip(n === 0, `no [data-testid=${id}] on the page yet`);
}

/** Skip unless the real engine files are deployed in app/engine/ (checked outside the page, so no
 * failed requests show up in the page's console). */
export async function requireRealEngine(page) {
  let ok = false;
  try {
    const a = await page.request.get(new URL('engine/uds-engine.js', page.url()).href);
    const b = await page.request.head(new URL('engine/uds_engine.wasm', page.url()).href);
    ok = a.ok() && b.ok();
  } catch { ok = false; }
  test.skip(!ok, 'engine part not merged yet: app/engine/uds-engine.js or uds_engine.wasm missing');
}

/** Wait until the panel is fully built (body.ready, set by the ui part) or window.uds exists. */
export async function waitReady(page) {
  await page.waitForFunction(() => document.body.classList.contains('ready') || !!window.uds, null, { timeout: 15_000 })
    .catch(() => {});
}

/** Wait for window.uds, then attach an event recorder (window.__ev). */
export async function attachRecorder(page) {
  await page.waitForFunction(() => !!window.uds, null, { timeout: 15_000 });
  await page.evaluate(() => {
    if (window.__ev) return;
    window.__ev = [];
    for (const type of ['state', 'status', 'hit', 'step', 'midi', 'midi-input', 'error']) {
      window.uds.addEventListener(type, (e) => {
        window.__ev.push({ type, t: performance.now(), detail: e.detail });
        if (window.__ev.length > 20000) window.__ev.splice(0, 10000);
      });
    }
  });
}

/** Click power and wait for body[data-state=running]. */
export async function powerOn(page) {
  await attachRecorder(page);
  await page.getByTestId('power').click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'running', { timeout: 20_000 });
}

/** Events of one type recorded so far (optionally after time t0). */
export async function events(page, type, t0 = 0) {
  return page.evaluate(([type, t0]) => window.__ev.filter((e) => e.type === type && e.t >= t0), [type, t0]);
}

export async function now(page) {
  return page.evaluate(() => performance.now());
}

/**
 * Measure the analyser: RMS of the time-domain signal (max and mean over the window), and the mean
 * power (linear) in bands from the frequency data.
 */
export async function measure(page, ms = 800) {
  return page.evaluate(async (ms) => {
    const an = window.uds.analyser;
    if (!an) return null;
    const td = new Float32Array(an.fftSize);
    const fd = new Float32Array(an.frequencyBinCount);
    const sr = an.context.sampleRate;
    let maxRms = 0, sumRms = 0, n = 0, lo = 0, hi = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      an.getFloatTimeDomainData(td);
      let s = 0;
      for (const v of td) s += v * v;
      const rms = Math.sqrt(s / td.length);
      maxRms = Math.max(maxRms, rms); sumRms += rms; n++;
      an.getFloatFrequencyData(fd);
      for (let i = 1; i < fd.length; i++) {
        const f = (i * sr) / an.fftSize;
        const p = Math.pow(10, fd[i] / 10);
        if (f < 2000) lo += p; else if (f > 8000) hi += p;
      }
      await new Promise((r) => setTimeout(r, 20));
    }
    return { maxRms, meanRms: sumRms / Math.max(1, n), lo: lo / n, hi: hi / n, frames: n };
  }, ms);
}

/** Read the 7-segment display as a bit mask (a..g = bits 0..6). */
export async function readDisplay(page) {
  return page.evaluate(() => {
    const d = document.querySelector('[data-testid=display]');
    if (!d) return null;
    let m = 0;
    'abcdefg'.split('').forEach((s, i) => {
      const el = d.querySelector(`[data-testid=seg-${s}]`);
      if (el && el.classList.contains('on')) m |= 1 << i;
    });
    return m;
  });
}

/** A minimal Standard MIDI File (format 0) with drum notes on channel 10. */
export function makeMidi(notes, { ppq = 480, bpm = 120 } = {}) {
  // notes: [{ tick, note, vel, dur }]
  const ev = [];
  for (const n of notes) {
    ev.push({ tick: n.tick, data: [0x99, n.note, n.vel ?? 100] });
    ev.push({ tick: n.tick + (n.dur ?? ppq / 8), data: [0x89, n.note, 0] });
  }
  ev.sort((a, b) => a.tick - b.tick || (a.data[0] & 0xf0) - (b.data[0] & 0xf0));
  const vlq = (v) => {
    const out = [v & 0x7f];
    while ((v >>= 7)) out.unshift((v & 0x7f) | 0x80);
    return out;
  };
  const us = Math.round(60e6 / bpm);
  const trk = [0, 0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255];
  let last = 0;
  for (const e of ev) { trk.push(...vlq(e.tick - last), ...e.data); last = e.tick; }
  trk.push(0, 0xff, 0x2f, 0);
  const u32 = (v) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  return Buffer.from([
    0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 0, 0, 1, (ppq >> 8) & 255, ppq & 255,
    0x4d, 0x54, 0x72, 0x6b, ...u32(trk.length), ...trk,
  ]);
}

/** A two-bar rock beat as a MIDI fixture: kick 36, snare 38, closed hat 42, plus one unmapped note 60. */
export function rockMidi() {
  const ppq = 480, notes = [];
  for (let bar = 0; bar < 2; bar++) {
    for (let e = 0; e < 8; e++) {
      const tick = bar * 4 * ppq + e * (ppq / 2);
      notes.push({ tick, note: 42, vel: 80 });
      if (e === 0 || e === 4) notes.push({ tick, note: 36, vel: 120 });
      if (e === 2 || e === 6) notes.push({ tick, note: 38, vel: 110 });
    }
  }
  notes.push({ tick: 8 * ppq - ppq / 2, note: 60, vel: 64 });
  return makeMidi(notes, { ppq, bpm: 120 });
}

export function readJSON(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}

/** The engine modes every functional test runs in. */
export const MODES = [
  { name: 'mock engine', query: '?engine=mock', real: false },
  { name: 'real engine', query: '', real: true },
];

/** Open, check preconditions for a mode, power on. Returns the console error list. */
export async function startMode(page, mode) {
  const errors = await openApp(page, mode.query);
  await requireUI(page);
  if (mode.real) await requireRealEngine(page);
  await powerOn(page);
  const info = await page.evaluate(() => window.uds.info);
  if (mode.real) expect(info.mock, `real engine expected, got backend ${info.backend}`).toBeFalsy();
  else expect(info.backend).toBe('mock');
  return errors;
}
