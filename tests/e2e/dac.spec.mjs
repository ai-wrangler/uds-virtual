// DAC switch (Output section): "1st order (as built)" vs "2nd order (preview)", the second-order
// sigma-delta proposed on ai-wrangler/tt-uds-1x1 branch sd2. Tests that need the 2nd-order build skip
// until app/engine/builds.json marks it available (UDS_FORCE_DAC2=1 forces it on, for a local
// uds_engine_sd2.wasm that is not listed yet).
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { openApp, requireUI, requireRealEngine, powerOn, measure, events, now, readJSON, ROOT } from './helpers.mjs';

const DEMO = path.join(ROOT, 'app/data/midi/demo.mid');
const FIXTURE = 'engine/test/fixtures/model_frames_sd2.json';

async function forceDac2(page) {
  if (!process.env.UDS_FORCE_DAC2) return;
  await page.route('**/engine/builds.json', async (route) => {
    const res = await route.fetch();
    const b = await res.json();
    for (const d of b.builds) if (d.id === '2nd') d.available = true;
    await route.fulfill({ response: res, json: b });
  });
}

/** Skip unless the 2nd-order build is listed as available and its .wasm is deployed. */
async function requireDac2(page) {
  let ok = false;
  try {
    const b = await (await page.request.get(new URL('engine/builds.json', page.url()).href)).json();
    const d = b.builds.find((x) => x.id === '2nd');
    const w = await page.request.head(new URL('engine/' + d.wasm, page.url()).href);
    ok = (d.available || !!process.env.UDS_FORCE_DAC2) && w.ok();
  } catch { ok = false; }
  test.skip(!ok, '2nd-order DAC build not available yet (tt-uds-1x1 branch sd2)');
}

async function open(page, query = '') {
  await forceDac2(page);
  const errors = await openApp(page, query);
  await requireUI(page);
  await page.waitForSelector('body.ready');
  return errors;
}

/** WAV bytes of renderWav for the selected slot, with RMS and a hash. */
async function wavOf(page) {
  return page.evaluate(async () => {
    const blob = await window.uds.renderWav({ what: 'rhythm' });
    const buf = new Uint8Array(await blob.arrayBuffer());
    const dv = new DataView(buf.buffer);
    const n = (buf.length - 44) / 2;
    let s = 0, h = 2166136261;
    for (let i = 0; i < n; i++) { const v = dv.getInt16(44 + 2 * i, true) / 32768; s += v * v; }
    for (let i = 0; i < buf.length; i++) h = Math.imul(h ^ buf[i], 16777619) >>> 0;
    return { n, rms: Math.sqrt(s / n), hash: h, dac: window.uds.dac };
  });
}

test('DAC switch sits in the Output section with a tooltip; 1st order is the default', async ({ page }) => {
  const errors = await open(page);
  const sel = page.getByTestId('dac');
  await expect(sel).toBeVisible();
  await expect(page.locator('.out-block [data-testid=dac]')).toHaveCount(1);
  const title = await page.locator('#dac-ctl').getAttribute('title');
  expect(title).toMatch(/1st order/);
  expect(title).toMatch(/2nd order/);
  expect(title.includes('\n')).toBe(false);
  const opts = await sel.locator('option').evaluateAll((os) => os.map((o) => ({ v: o.value, t: o.textContent, d: o.disabled })));
  expect(opts.map((o) => o.v)).toEqual(['1st', '2nd']);
  expect(opts[0]).toMatchObject({ t: '1st order (as built)', d: false });
  expect(opts[1].t).toMatch(/^2nd order \(preview\)/);
  const builds = await page.evaluate(() => window.uds.builds.map((b) => ({ id: b.id, available: b.available })));
  if (!builds[1].available) expect(opts[1]).toMatchObject({ d: true, t: '2nd order (preview) · coming soon' });
  await expect(sel).toHaveValue('1st');
  expect(await page.evaluate(() => window.uds.dac)).toBe('1st');
  expect(errors).toEqual([]);
});

test('2nd-order DAC: the choice is remembered (localStorage) and ?dac= overrides it', async ({ page }) => {
  await open(page);
  await requireDac2(page);
  await page.getByTestId('dac').selectOption('2nd');
  await expect.poll(() => page.evaluate(() => window.uds.dac)).toBe('2nd');
  expect(await page.evaluate(() => localStorage.getItem('uds-virtual.dac.v1'))).toBe('2nd');
  await page.reload();
  await page.waitForSelector('body.ready');
  await expect(page.getByTestId('dac')).toHaveValue('2nd');
  expect(await page.evaluate(() => window.uds.dac)).toBe('2nd');
  await page.goto('./?dac=1st');
  await page.waitForSelector('body.ready');
  await expect(page.getByTestId('dac')).toHaveValue('1st');
  await page.getByTestId('dac').selectOption('1st');
  await page.evaluate(() => localStorage.removeItem('uds-virtual.dac.v1'));
});

test('2nd-order DAC: switching both ways while the rhythm plays', async ({ page }) => {
  const errors = await open(page);
  await requireRealEngine(page);
  await requireDac2(page);
  await page.getByTestId('slot-file-0').setInputFiles(DEMO);
  await expect.poll(() => page.evaluate(() => !!window.uds.slots[0])).toBe(true);
  await powerOn(page);
  await page.evaluate(() => window.uds.addEventListener('dac', (e) => window.__ev.push({ type: 'dac', t: performance.now(), detail: e.detail })));
  await page.getByTestId('rhythm-toggle').click();
  await expect.poll(() => page.evaluate(() => window.uds.rhythmPlaying)).toBe(true);
  const levels = {}, under = [];
  await page.waitForTimeout(1500);
  under.push(await page.evaluate(() => window.uds.lastStatus.underruns));
  for (const dac of ['2nd', '1st', '2nd', '1st']) {
    const t0 = await now(page);
    await page.getByTestId('dac').selectOption(dac);
    await expect.poll(() => page.evaluate(() => window.uds.dac)).toBe(dac);
    await expect.poll(async () => (await events(page, 'status', t0)).some((e) => e.detail.dac === dac)).toBe(true);
    const m = await measure(page, 1200);
    const steps = await events(page, 'step', t0);
    expect(steps.length, `rhythm steps after switching to ${dac}`).toBeGreaterThan(4);
    expect(m.maxRms, `sound after switching to ${dac}`).toBeGreaterThan(0.01);
    (levels[dac] ||= []).push(m.meanRms);
    under.push(await page.evaluate(() => window.uds.lastStatus.underruns));
  }
  const st = await page.evaluate(() => window.uds.lastStatus);
  expect(st.dac).toBe('1st');
  expect(st.backend).toBe('gen');
  const dacEvents = await events(page, 'dac');
  expect(dacEvents.map((e) => e.detail.dac)).toEqual(['2nd', '1st', '2nd', '1st']);
  test.info().annotations.push({ type: 'levels', description: JSON.stringify({ levels, underruns: st.underruns }) });
  console.log(`[dac switch] ${JSON.stringify({ levels, underruns: under })}`);
  expect(under[4] - under[0], 'underruns during four switches').toBeLessThan(12);
  expect(errors).toEqual([]);
});

test('2nd-order DAC: the WAV export follows the selected DAC (file name and audio)', async ({ page }) => {
  await open(page);
  await requireRealEngine(page);
  await requireDac2(page);
  await powerOn(page);
  await page.getByTestId('slot-file-0').setInputFiles(DEMO);
  await expect.poll(() => page.evaluate(() => !!window.uds.slots[0])).toBe(true);
  const w1 = await wavOf(page);
  const w1b = await wavOf(page);
  expect(w1b.hash, 'renderWav is deterministic').toBe(w1.hash);
  await page.getByTestId('dac').selectOption('2nd');
  await expect.poll(() => page.evaluate(() => window.uds.dac)).toBe('2nd');
  const w2 = await wavOf(page);
  expect(w2.dac).toBe('2nd');
  expect(w2.n).toBe(w1.n);
  expect(w2.hash, 'the 2nd-order WAV differs from the 1st-order one').not.toBe(w1.hash);
  const db = 20 * Math.log10(w2.rms / w1.rms);
  test.info().annotations.push({ type: 'wav', description: JSON.stringify({ w1, w2, db }) });
  console.log(`[dac wav] rms 1st ${w1.rms.toFixed(4)}, 2nd ${w2.rms.toFixed(4)}: ${db.toFixed(2)} dB`);
  expect(Math.abs(db), `loudness difference ${db.toFixed(2)} dB`).toBeLessThan(1);
  // the button's download is named after the DAC
  const dl = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByTestId('wav-export').click();
  expect((await dl).suggestedFilename()).toMatch(/-dac2\.wav$/);
  await page.getByTestId('dac').selectOption('1st');
  await expect.poll(() => page.evaluate(() => window.uds.dac)).toBe('1st');
  const dl1 = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByTestId('wav-export').click();
  expect((await dl1).suggestedFilename()).toMatch(/-dac1\.wav$/);
  expect((await wavOf(page)).hash).toBe(w1.hash);
});

test('2nd-order engine matches the sd2 model frame by frame (in the browser)', async ({ page }) => {
  const fx = readJSON(FIXTURE);
  test.skip(!fx, `${FIXTURE} not built yet`);
  await open(page);
  await requireRealEngine(page);
  await requireDac2(page);
  const r = await page.evaluate(async (fx) => {
    const mod = await import('./engine/uds-engine.js');
    const engine = await mod.loadEngine('./uds_engine_sd2.wasm', { sampleRate: 48000 });
    engine.reset();
    const got = new Array(fx.counts.length);
    let ei = 0;
    const t0 = performance.now();
    for (let f = 0; f < fx.counts.length; f++) {
      while (ei < fx.events.length && fx.events[ei].frame <= f) {
        if (!engine.send(fx.events[ei++].bytes)) throw new Error('queue full at frame ' + f);
      }
      got[f] = engine.runFrames(1);
    }
    const ms = performance.now() - t0;
    let mismatches = 0, first = -1;
    for (let i = 0; i < got.length; i++) if (got[i] !== fx.counts[i]) { mismatches++; if (first < 0) first = i; }
    return { backend: engine.backend, frames: got.length, mismatches, first, mhz: (got.length * 96) / ms / 1000 };
  }, fx);
  test.info().annotations.push({ type: 'truth-sd2', description: JSON.stringify(r) });
  console.log(`[truth sd2] backend=${r.backend} frames=${r.frames} mismatches=${r.mismatches} speed=${r.mhz.toFixed(1)} MHz`);
  expect(r.frames).toBeGreaterThan(1000);
  expect(r.mismatches, `first mismatch at frame ${r.first}`).toBe(0);
});
