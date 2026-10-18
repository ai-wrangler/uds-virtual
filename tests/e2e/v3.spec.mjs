// v3 (modern chip, per-channel sounds): Chip selector, generated strips, the sound editor, kits, export and
// import, chip switch while playing, stored patches, the phone layout.
//
// The page plays v3 with the real engine once app/engine/builds.json lists it as available (built from
// V3-CHIP's RTL). Until then these tests run with ?v3=mock, the mock v3 synth (app/audio/mock-engine-v3.js);
// UDS_V3_MOCK=1 forces the mock. The panel and the API are the same either way.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { openApp, requireUI, powerOn, measure, events, now, readDisplay, SEG7, ROOT } from './helpers.mjs';

const DEMO = path.join(ROOT, 'app/data/midi/demo.mid');

async function v3Query(page) {
  let real = false;
  try {
    const b = await (await page.request.get('engine/builds.json')).json();
    const v3 = b.builds.find((x) => x.version === 'v3');
    real = !!(v3 && v3.available) && !process.env.UDS_V3_MOCK;
  } catch { real = false; }
  return real ? '?chip=v3' : '?v3=mock&chip=v3';
}

async function openV3(page, extra = '') {
  const q = await v3Query(page);
  const errors = await openApp(page, q + extra);
  await requireUI(page);
  await page.waitForSelector('body.ready');
  await expect(page.getByTestId('chip')).toHaveValue('v3');
  // the "Power on" overlay covers the panel until a click; the tests that need sound click Power themselves
  await page.evaluate(() => { document.getElementById('overlay').hidden = true; });
  return errors;
}

/** WAV of the selected slot, offline: RMS and a hash. */
async function wavOf(page) {
  return page.evaluate(async () => {
    const blob = await window.uds.renderWav({ what: 'rhythm', seconds: 4 });
    const buf = new Uint8Array(await blob.arrayBuffer());
    const dv = new DataView(buf.buffer);
    const n = (buf.length - 44) / 2;
    let s = 0, h = 2166136261;
    for (let i = 0; i < n; i++) { const v = dv.getInt16(44 + 2 * i, true) / 32768; s += v * v; }
    for (let i = 0; i < buf.length; i++) h = Math.imul(h ^ buf[i], 16777619) >>> 0;
    return { n, rms: Math.sqrt(s / n), hash: h };
  });
}

/** The engine output of one hit on ch, rendered offline in the page with the current patch (no speakers). */
async function hitSpectrum(page, ch) {
  return page.evaluate(async (ch) => {
    const u = window.uds;
    const b = u.currentBuild;
    const { packHit } = await import('./audio/patch.js');
    let e;
    if (b.mock) { const m = await import('./audio/mock-engine-v3.js'); e = await m.loadMockV3Engine({ sampleRate: 48000, build: b }); }
    else { const m = await import('./engine/uds-engine.js'); e = await m.loadEngine(b.url, { sampleRate: 48000 }); }
    e.send(packHit(b, ch, u.getParams(ch)));
    const x = e.render(8192).slice();
    // brightness: energy of the first difference over the energy (high for a high pitch)
    let s = 0, d = 0;
    for (let i = 1; i < x.length; i++) { s += x[i] * x[i]; d += (x[i] - x[i - 1]) ** 2; }
    return { rms: Math.sqrt(s / x.length), bright: d / Math.max(s, 1e-12) };
  }, ch);
}

test('v3: the Chip selector switches to v3; the strips and the editor come from params.json', async ({ page }) => {
  const errors = await openV3(page);
  const info = await page.evaluate(() => ({ chip: window.uds.chip, clockHz: window.uds.info.clockHz, knobs: window.uds.knobs.map((k) => k.key), strip: window.uds.currentBuild.strip }));
  expect(info.chip).toBe('v3');
  const pj = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/engine/params_v3.json'), 'utf8'));
  expect(info.clockHz).toBe(pj.clockHz);
  expect(info.knobs).toEqual(pj.params.map((p) => p.id));
  // strips: the build's strip parameters, 8 channels
  for (let ch = 0; ch < 8; ch++) for (const k of info.strip) await expect(page.getByTestId(`knob-${ch}-${k}`)).toHaveCount(1);
  await expect(page.getByTestId('knob-0-sweep')).toHaveCount(0);
  // editor: one control per parameter, option lists as selects, 1-bit fields as switches
  await expect(page.getByTestId('editor')).toBeVisible();
  await expect(page.getByTestId('edit-res')).toHaveCount(0);   // reserved bits get no control
  for (const p of pj.params.filter((q) => q.group !== 'hidden')) {
    const el = page.getByTestId(`edit-${p.id}`);
    await expect(el).toHaveCount(1);
    const tag = await el.evaluate((e) => (e.tagName === 'INPUT' ? 'input:' + e.type : e.tagName.toLowerCase()));
    if (p.options) expect(tag, p.id).toBe('select');
    else if (p.max - p.min === 1) expect(tag, p.id).toBe('input:checkbox');
    else expect(await el.getAttribute('role'), p.id).toBe('slider');
  }
  await expect(page.locator('.plate h1')).toHaveText('UDS v3');
  // back to v1: the 5 knobs, no editor
  await page.getByTestId('chip').selectOption('v1');
  await expect.poll(() => page.evaluate(() => window.uds.chip)).toBe('v1');
  await expect(page.getByTestId('editor')).toBeHidden();
  await expect(page.getByTestId('knob-0-sweep')).toHaveCount(1);
  await expect(page.locator('.plate h1')).toHaveText('UDS-1x1');
  expect(errors).toEqual([]);
});

test('v3: a pad hit makes sound and the display shows the channel', async ({ page }) => {
  const errors = await openV3(page);
  await powerOn(page);
  const quiet = await measure(page, 300);
  const t0 = await now(page);
  await page.getByTestId('pad-4').click();
  const m = await measure(page, 500);
  expect(quiet.maxRms).toBeLessThan(0.005);
  expect(m.maxRms).toBeGreaterThan(0.02);
  const hits = await events(page, 'hit', t0);
  expect(hits.map((e) => e.detail.ch)).toContain(4);
  await expect.poll(() => readDisplay(page)).toBe(SEG7[4]);
  for (const ch of [0, 6]) {
    await page.keyboard.press(String(ch + 1));
    await expect.poll(() => readDisplay(page)).toBe(SEG7[ch]);
  }
  const st = await page.evaluate(() => window.uds.lastStatus);
  expect(st.chip).toBe('v3');
  expect(st.simHz).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('v3: the editor changes the sound (pitch, noise mix) and keeps the strip in step', async ({ page }) => {
  const errors = await openV3(page);
  await page.getByTestId('strip-sel-1').click();
  await expect(page.getByTestId('editor-name')).toContainText('ch 1');
  await expect(page.getByTestId('edit-ch-1')).toHaveAttribute('aria-pressed', 'true');
  // tone only, low pitch -> few zero crossings; high pitch -> many
  const mix = page.getByTestId('edit-mix');
  await mix.focus(); await mix.press('Home');
  const pitch = page.getByTestId('edit-pitch');
  await pitch.focus(); await pitch.press('Home');
  const low = await hitSpectrum(page, 1);
  await pitch.press('End');
  expect(await page.evaluate(() => window.uds.getParams(1).pitch)).toBe(255);
  await expect(page.getByTestId('knob-1-pitch')).toHaveAttribute('aria-valuenow', '255');
  const high = await hitSpectrum(page, 1);
  expect(high.bright, JSON.stringify({ low, high })).toBeGreaterThan(low.bright * 4);
  // the option selectors and the click switch change the patch
  await page.getByTestId('edit-wave').selectOption({ label: 'Square' });
  expect(await page.evaluate(() => window.uds.getParams(1).wave)).toBe(2);
  await page.getByTestId('edit-mode').selectOption({ label: 'Clap' });
  expect(await page.evaluate(() => window.uds.getParams(1).mode)).toBe(3);
  await page.getByTestId('edit-click').check();
  expect(await page.evaluate(() => window.uds.getParams(1).click)).toBe(1);
  // a strip knob updates the editor
  await page.getByTestId('knob-1-level').focus();
  await page.getByTestId('knob-1-level').press('Home');
  await expect(page.getByTestId('edit-level')).toHaveAttribute('aria-valuenow', '0');
  const silent = await hitSpectrum(page, 1);
  expect(silent.rms).toBeLessThan(1e-4);
  // the slot WAV changes with the patch
  await page.getByTestId('slot-file-0').setInputFiles(DEMO);
  await expect.poll(() => page.evaluate(() => !!window.uds.slots[0])).toBe(true);
  const w1 = await wavOf(page);
  await page.getByTestId('strip-sel-4').click();
  await page.getByTestId('edit-decay').focus();
  await page.getByTestId('edit-decay').press('End');
  const w2 = await wavOf(page);
  expect(w2.hash).not.toBe(w1.hash);
  expect(w2.rms).toBeGreaterThan(w1.rms);
  // reset channel: back to the kit's sound
  await page.getByTestId('channel-reset').click();
  const kit = await page.evaluate(() => window.uds.kit.channels[4].patch);
  expect(await page.evaluate(() => window.uds.getParams(4))).toEqual(kit);
  expect((await wavOf(page)).hash).toBe(w1.hash);
  expect(errors).toEqual([]);
});

test('v3: kits load from app/kits, with names and note maps', async ({ page }) => {
  const errors = await openV3(page);
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/kits/index.json'), 'utf8'));
  const opts = await page.getByTestId('kit').locator('option').evaluateAll((os) => os.map((o) => o.value));
  expect(opts).toEqual(idx.kits.map((k) => k.id));
  for (const k of idx.kits) {
    await page.getByTestId('kit').selectOption(k.id);
    await expect.poll(() => page.evaluate(() => window.uds.kit && window.uds.kit.id)).toBe(k.id);
    const file = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/kits', k.file), 'utf8'));
    for (const c of file.channels) {
      expect(await page.evaluate((ch) => window.uds.getParams(ch), c.ch)).toEqual(expect.objectContaining(c.patch));
      await expect(page.locator(`.strip[data-ch="${c.ch}"] .strip-names .lb`)).toHaveText(c.name);
    }
  }
  // a kit's demo groove goes into the selected slot
  const withPattern = idx.kits.find((k) => k.pattern);
  if (withPattern) {
    await page.getByTestId('kit').selectOption(withPattern.id);
    await expect.poll(() => page.evaluate(() => window.uds.kit.id)).toBe(withPattern.id);
    await page.getByTestId('kit-pattern').click();
    await expect.poll(() => page.evaluate(() => window.uds.slots[0] && window.uds.slots[0].name)).toBe(`${withPattern.id}.mid`);
  }
  // a kit with its own note map: note 60 plays channel 4, note 36 no longer does
  const kit = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/kits', idx.kits[0].file), 'utf8'));
  kit.id = 'mapped'; kit.name = 'Mapped';
  kit.channels[4].notes = [60];
  kit.channels[4].name = 'Low C kick';
  await page.getByTestId('kit-import').setInputFiles({ name: 'mapped.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(kit)) });
  await expect.poll(() => page.evaluate(() => window.uds.kit.id)).toBe('mapped');
  await expect(page.locator('.strip[data-ch="4"] .strip-names .lb')).toHaveText('Low C kick');
  await expect(page.getByTestId('kit')).toHaveValue('__custom');
  const r = await page.evaluate(async () => {
    const { writeMidi } = await import('./audio/midi.js');
    const ev = [{ tick: 0, tempo: 120 }];
    [[0, 60], [96, 36], [192, 38]].forEach(([t, n]) => ev.push({ tick: t, bytes: [0x99, n, 100] }, { tick: t + 24, bytes: [0x89, n, 0] }));
    const bytes = writeMidi([ev], { ppq: 96 });
    const s = await window.uds.loadSlot(3, bytes, 'map.mid');
    return s.notes.map((n) => [n.note, n.ch]);
  });
  expect(r).toEqual([[60, 4], [38, 0]]);
  // back on v1 the GM map applies again (the slot is mapped again)
  await page.getByTestId('chip').selectOption('v1');
  await expect.poll(() => page.evaluate(() => window.uds.slots[3].notes.map((n) => [n.note, n.ch]))).toEqual([[36, 4], [38, 0]]);
  expect(errors).toEqual([]);
});

test('v3: export a kit, change it, import it back', async ({ page }, testInfo) => {
  const errors = await openV3(page);
  await page.getByTestId('strip-sel-2').click();
  await page.getByTestId('edit-bendtime').focus();
  await page.getByTestId('edit-bendtime').press('End');
  await page.getByTestId('edit-color').selectOption({ index: 3 });
  const edited = await page.evaluate(() => window.uds.getParams(2));
  expect(edited.bendtime).toBe(7);
  const dl = page.waitForEvent('download');
  await page.getByTestId('kit-export').click();
  const d = await dl;
  expect(d.suggestedFilename()).toMatch(/\.json$/);
  const file = testInfo.outputPath('kit.json');
  await d.saveAs(file);
  const kit = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(kit.channels).toHaveLength(8);
  expect(kit.channels[2].patch).toEqual(edited);
  // change it, then import the file: the edit is back
  await page.getByTestId('channel-reset').click();
  expect(await page.evaluate(() => window.uds.getParams(2))).not.toEqual(edited);
  await page.getByTestId('kit-import').setInputFiles(file);
  await expect.poll(() => page.evaluate(() => window.uds.getParams(2))).toEqual(edited);
  await expect(page.getByTestId('edit-bendtime')).toHaveAttribute('aria-valuenow', '7');
  // a broken file is refused with a message, nothing changes
  await page.getByTestId('kit-import').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"channels": []}') });
  await expect(page.locator('#toast')).toContainText('Kit import failed');
  expect(await page.evaluate(() => window.uds.getParams(2))).toEqual(edited);
  expect(errors).toEqual([]);
});

test('v3: the patches are kept per chip version across a reload', async ({ page }) => {
  await openV3(page);
  await page.getByTestId('knob-5-pitch').focus();
  await page.getByTestId('knob-5-pitch').press('Home');
  await page.getByTestId('chip').selectOption('v1');
  await expect.poll(() => page.evaluate(() => window.uds.chip)).toBe('v1');
  await page.getByTestId('knob-0-decay').focus();
  await page.getByTestId('knob-0-decay').press('End');
  await page.waitForTimeout(400);
  const q = await v3Query(page);
  await page.goto('./' + q);
  await page.waitForSelector('body.ready');
  expect(await page.evaluate(() => window.uds.getParams(5).pitch)).toBe(0);
  await expect(page.getByTestId('knob-5-pitch')).toHaveAttribute('aria-valuenow', '0');
  await page.getByTestId('chip').selectOption('v1');
  await expect.poll(() => page.evaluate(() => window.uds.getParams(0).decay)).toBe(13);
  await page.evaluate(() => localStorage.clear());
});

test('v3: switching chips while the rhythm plays keeps the groove going', async ({ page }) => {
  const errors = await openV3(page, '&dac=1st');
  // ?chip= wins over ?dac=; start on v1
  await page.getByTestId('chip').selectOption('v1');
  await expect.poll(() => page.evaluate(() => window.uds.chip)).toBe('v1');
  await page.getByTestId('slot-file-0').setInputFiles(DEMO);
  await expect.poll(() => page.evaluate(() => !!window.uds.slots[0])).toBe(true);
  await powerOn(page);
  await page.evaluate(() => window.uds.addEventListener('dac', (e) => window.__ev.push({ type: 'dac', t: performance.now(), detail: e.detail })));
  await page.getByTestId('rhythm-toggle').click();
  await expect.poll(() => page.evaluate(() => window.uds.rhythmPlaying)).toBe(true);
  await page.waitForTimeout(1000);
  const levels = {};
  for (const chip of ['v3', 'v1', 'v3', 'v2']) {
    const t0 = await now(page);
    await page.getByTestId('chip').selectOption(chip);
    await expect.poll(() => page.evaluate(() => window.uds.chip)).toBe(chip);
    await expect.poll(async () => (await events(page, 'status', t0)).some((e) => e.detail.chip === chip)).toBe(true);
    const m = await measure(page, 1200);
    const steps = await events(page, 'step', t0);
    expect(steps.length, `steps after switching to ${chip}`).toBeGreaterThan(4);
    expect(m.maxRms, `sound after switching to ${chip}`).toBeGreaterThan(0.01);
    (levels[chip] ||= []).push(Number(m.meanRms.toFixed(4)));
    const strip = await page.evaluate(() => document.querySelectorAll('.strip[data-ch="0"] [role=slider]').length);
    expect(strip).toBe(chip === 'v3' ? 4 : 5);
  }
  console.log(`[chip switch] ${JSON.stringify(levels)} underruns ${await page.evaluate(() => window.uds.lastStatus.underruns)}`);
  expect((await events(page, 'dac')).map((e) => e.detail.chip)).toEqual(['v3', 'v1', 'v3', 'v2']);
  expect(await page.evaluate(() => window.uds.rhythmPlaying)).toBe(true);
  expect(errors).toEqual([]);
});

test('v3: the panel works on a phone (390 x 844)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await openV3(page);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(390);
  await page.getByTestId('edit-ch-6').click();
  await expect(page.getByTestId('editor-name')).toContainText('ch 6');
  for (const id of ['edit-pitch', 'edit-wave', 'edit-mode', 'edit-click', 'kit', 'kit-export', 'channel-reset', 'pad-6']) {
    const box = await page.getByTestId(id).boundingBox();
    if (id !== 'edit-click') expect(box, id).not.toBeNull();
    if (box) { expect(box.x, id).toBeGreaterThanOrEqual(0); expect(box.x + box.width, id).toBeLessThanOrEqual(391); }
  }
  await powerOn(page);
  await page.getByTestId('edit-play').click();
  await expect.poll(() => readDisplay(page)).toBe(SEG7[6]);
  expect(errors).toEqual([]);
});
