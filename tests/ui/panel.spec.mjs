// Panel tests (owner: ui). Run: npx playwright test --project=ui
// They use the silent fake (?fake=1), so they do not depend on the audio or engine parts.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FX = (n) => path.join(ROOT, 'tests/audio/fixtures', n);
const DEMO = path.join(ROOT, 'app/data/midi/demo.mid');

const SEG7 = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07];

async function open(page, query = '?fake=1') {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`./${query}`);
  await page.waitForSelector('body.ready');
  await page.evaluate(() => {
    window.__hits = [];
    window.__steps = [];
    window.uds.addEventListener('hit', (e) => window.__hits.push(e.detail));
    window.uds.addEventListener('step', (e) => window.__steps.push(e.detail));
  });
  return errors;
}
async function powerOn(page) {
  await page.getByTestId('power').click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'running');
}
async function readDisplay(page) {
  return page.evaluate(() => {
    let m = 0;
    'abcdefg'.split('').forEach((s, i) => {
      if (document.querySelector(`[data-testid=display] [data-testid=seg-${s}]`).classList.contains('on')) m |= 1 << i;
    });
    return m;
  });
}

test('every data-testid from CONTRACT section 6 exists', async ({ page }) => {
  await open(page);
  const ids = ['power', 'rhythm-toggle', 'tempo', 'midi-file', 'midi-play', 'midi-input', 'filter', 'volume',
    'display', 'sim-speed', 'wav-export'];
  for (let i = 0; i < 8; i++) ids.push(`pad-${i}`);
  for (const s of 'abcdefg') ids.push(`seg-${s}`);
  for (let i = 0; i < 16; i++) ids.push(`slot-${i}`, `slot-file-${i}`, `slot-clear-${i}`);
  await expect(page.locator('[data-testid^=pattern-]')).toHaveCount(0);
  for (let ch = 0; ch < 8; ch++) for (const k of ['pitch', 'sweep', 'decay', 'balance', 'level']) ids.push(`knob-${ch}-${k}`);
  for (const id of ids) await expect(page.getByTestId(id), id).toHaveCount(1);
  await expect(page.getByTestId('midi-file')).toHaveAttribute('type', 'file');
  await expect(page.getByTestId('slot-file-3')).toHaveAttribute('type', 'file');
  await expect(page.getByTestId('slot-file-3')).toHaveAttribute('accept', '.mid,.midi');
  for (const k of await page.locator('[data-testid^=knob-], [data-testid=tempo]').all()) {
    await expect(k).toHaveAttribute('role', 'slider');
    for (const a of ['aria-valuemin', 'aria-valuemax', 'aria-valuenow']) expect(await k.getAttribute(a)).toMatch(/^\d+$/);
  }
  expect(await page.evaluate(() => !!window.uds)).toBe(true);
});

test('power on mirrors uds.state into body[data-state] and hides the overlay', async ({ page }) => {
  await open(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'idle');
  await expect(page.locator('#overlay')).toBeVisible();
  await powerOn(page);
  await expect(page.locator('#overlay')).toBeHidden();
  await expect(page.getByTestId('sim-speed')).toHaveText(/\d+\.\d MHz · \d+\.\d\dx real time/);
});

test('knobs respond to keys, wheel and double-click and call setParams', async ({ page }) => {
  await open(page);
  await powerOn(page);
  const knob = page.getByTestId('knob-4-pitch');
  const v0 = Number(await knob.getAttribute('aria-valuenow'));
  await knob.focus();
  await page.keyboard.press('ArrowUp');
  const v1 = Number(await knob.getAttribute('aria-valuenow'));
  expect(v1).toBeGreaterThan(v0);
  await page.keyboard.press('Shift+ArrowUp');
  expect(Number(await knob.getAttribute('aria-valuenow'))).toBe(v1 + 1);
  expect(await page.evaluate(() => window.uds.getParams(4).pitch)).toBe(v1 + 1);
  await page.keyboard.press('End');
  await expect(knob).toHaveAttribute('aria-valuenow', '255');
  await page.keyboard.press('Home');
  await expect(knob).toHaveAttribute('aria-valuenow', '0');
  await knob.dblclick();
  await expect(knob).toHaveAttribute('aria-valuenow', String(v0));
  // wheel
  await knob.hover();
  await page.mouse.wheel(0, -100);
  expect(Number(await knob.getAttribute('aria-valuenow'))).toBeGreaterThan(v0);
  // drag up
  const lv = page.getByTestId('knob-2-level');
  const b = await lv.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + 60, { steps: 4 });
  await page.mouse.up();
  expect(Number(await lv.getAttribute('aria-valuenow'))).toBeLessThan(12);
  expect(await page.evaluate(() => window.uds.getParams(2).level)).toBe(Number(await lv.getAttribute('aria-valuenow')));
  // tempo knob
  const tempo = page.getByTestId('tempo');
  await tempo.focus();
  await page.keyboard.press('ArrowUp');
  await expect(tempo).toHaveAttribute('aria-valuenow', '122');
  expect(await page.evaluate(() => window.uds.tempo)).toBe(122);
});

test('pads and keys 1..8 trigger hits; the display shows the channel digit', async ({ page }) => {
  await open(page);
  await powerOn(page);
  for (let ch = 0; ch < 8; ch++) {
    await page.getByTestId(`pad-${ch}`).click();
    await expect.poll(() => page.evaluate(() => window.__hits.at(-1)?.ch)).toBe(ch);
    await expect.poll(() => readDisplay(page)).toBe(SEG7[ch]);
  }
  expect(await page.evaluate(() => window.__hits.length)).toBe(8);
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  for (let ch = 0; ch < 8; ch++) {
    await page.keyboard.press(String(ch + 1));
    await expect.poll(() => page.evaluate(() => window.__hits.at(-1)?.ch)).toBe(ch);
    await expect.poll(() => readDisplay(page)).toBe(SEG7[ch]);
  }
  expect(await page.evaluate(() => window.__hits.filter((h) => h.source === 'pad').length)).toBe(16);
});

test('display follows bits 0..6 of status.uoOut', async ({ page }) => {
  await open(page);
  for (const uo of [0x00, 0x3f, 0x5b, 0x7f, 0x80 | 0x06]) {
    await page.evaluate((uo) => window.uds.dispatchEvent(new CustomEvent('status', {
      detail: { simHz: 6e6, realtime: 1, cycles: 0, frames: 0, uoOut: uo, uioOut: 0, busy: false, cs: false } })), uo);
    expect(await readDisplay(page)).toBe(uo & 0x7f);
  }
});

test('sim-speed turns amber below 1.2x and red below 1.0x', async ({ page }) => {
  await open(page);
  const send = (rt) => page.evaluate((rt) => window.uds.dispatchEvent(new CustomEvent('status', {
    detail: { simHz: 6e6 * rt, realtime: rt, cycles: 1, frames: 1, uoOut: 0, uioOut: 0 } })), rt);
  await send(1.1);
  await expect(page.locator('#speed-box')).toHaveClass(/warn/);
  await expect(page.getByTestId('sim-speed')).toHaveText('6.6 MHz · 1.10x real time');
  await send(0.8);
  await expect(page.locator('#speed-box')).toHaveClass(/bad/);
  await expect(page.locator('#speed-hint')).toBeVisible();
  await send(2);
  await expect(page.locator('#speed-box')).not.toHaveClass(/warn|bad/);
});

test('slots: all empty at first, Start disabled on an empty slot', async ({ page }) => {
  await open(page);
  for (let i = 0; i < 16; i++) await expect(page.getByTestId(`slot-${i}`)).toContainText('empty');
  await expect(page.getByTestId('rhythm-toggle')).toBeDisabled();
  await page.keyboard.press('Space');
  expect(await page.evaluate(() => window.uds.rhythmPlaying)).toBe(false);
  expect(await page.evaluate(() => window.uds.slots.every((s) => s === null))).toBe(true);
});

test('slots: load, name and bars, tempo from the file, steps fit, Space and Esc, clear, reload', async ({ page }) => {
  await open(page);
  await powerOn(page);
  await page.getByTestId('slot-file-2').setInputFiles(FX('no-ch10.mid'));     // 100 bpm, 1 bar
  await expect(page.getByTestId('slot-2')).toContainText('no-ch10.mid');
  await expect(page.getByTestId('slot-2')).toContainText('1 bar');
  await expect(page.getByTestId('slot-2')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('tempo')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('#steps .step')).toHaveCount(16);
  await page.getByTestId('slot-file-0').setInputFiles(DEMO);                    // 104 bpm, 4 bars
  await expect(page.getByTestId('slot-0')).toContainText('4 bars');
  await expect(page.getByTestId('tempo')).toHaveAttribute('aria-valuenow', '104');
  await expect(page.locator('#steps .step')).toHaveCount(64);
  await page.getByTestId('slot-2').click();                                     // select
  await expect(page.getByTestId('slot-2')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('tempo')).toHaveAttribute('aria-valuenow', '100');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Space');
  await expect(page.getByTestId('rhythm-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.__steps.filter((s) => s.slot === 2).length)).toBeGreaterThan(3);
  await expect(page.locator('#steps .step.on')).toHaveCount(1);
  expect(await page.evaluate(() => window.__hits.some((h) => h.source === 'rhythm'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('rhythm-toggle')).toHaveAttribute('aria-pressed', 'false');
  // a file with no drum notes is refused with a message, the slot stays empty
  await page.getByTestId('slot-file-5').setInputFiles({ name: 'piano.mid', mimeType: 'audio/midi', buffer: pianoMidi() });
  await expect(page.locator('#toast')).toContainText('No drum notes');
  await expect(page.getByTestId('slot-5')).toContainText('empty');
  // reload: slots and selection survive
  await page.reload();
  await page.waitForSelector('body.ready');
  await powerOn(page);
  await expect(page.getByTestId('slot-0')).toContainText('demo.mid');
  await expect(page.getByTestId('slot-2')).toHaveAttribute('aria-pressed', 'true');
  // clear
  await page.getByTestId('slot-clear-2').click();
  await expect(page.getByTestId('slot-2')).toContainText('empty');
  await expect(page.getByTestId('rhythm-toggle')).toBeDisabled();
  await page.reload();
  await page.waitForSelector('body.ready');
  await powerOn(page);
  await expect(page.getByTestId('slot-2')).toContainText('empty');
  await expect(page.getByTestId('slot-0')).toContainText('demo.mid');
  // clear all asks for a second click
  await page.getByTestId('slots-clear-all').click();
  await expect(page.getByTestId('slot-0')).toContainText('demo.mid');
  await page.getByTestId('slots-clear-all').click();
  await expect(page.getByTestId('slot-0')).toContainText('empty');
});

test('slots: a file longer than 4 bars shows "first 4 bars"', async ({ page }) => {
  await open(page);
  const ev = [];
  for (let bar = 0; bar < 6; bar++) ev.push(bar * 4 * 96, 36);
  await page.getByTestId('slot-file-7').setInputFiles({ name: 'long.mid', mimeType: 'audio/midi', buffer: drumMidi(ev) });
  await expect(page.getByTestId('slot-7')).toContainText('first 4 bars');
});

test('page has no Cyrillic text', async ({ page }) => {
  await open(page);
  await powerOn(page);
  await page.getByTestId('slot-file-0').setInputFiles(DEMO);
  const txt = await page.evaluate(() => document.body.innerText + document.title
    + [...document.querySelectorAll('[title],[aria-label]')].map((e) => (e.title || '') + (e.getAttribute('aria-label') || '')).join(' '));
  expect(txt.match(/[\u0400-\u04FF]+/g)).toBeNull();
});

// format 0, 96 ppq: [tick, note, tick, note, ...] on channel 10
function drumMidi(flat, ch = 9) {
  const trk = [];
  let last = 0;
  for (let i = 0; i < flat.length; i += 2) {
    const d = flat[i] - last; last = flat[i];
    const v = []; let x = d; v.unshift(x & 0x7f); while ((x >>= 7)) v.unshift((x & 0x7f) | 0x80);
    trk.push(...v, 0x90 | ch, flat[i + 1], 100);
  }
  trk.push(0, 0xff, 0x2f, 0);
  const u32 = (v) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  return Buffer.from([0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 0, 0, 1, 0, 96, 0x4d, 0x54, 0x72, 0x6b, ...u32(trk.length), ...trk]);
}
function pianoMidi() { return drumMidi([0, 60, 96, 64], 0); }

function midiFile() {
  // format 0, 480 ppq, 120 bpm: kick, snare, hat, and an unmapped note 60
  const trk = [0, 0xff, 0x51, 3, 0x07, 0xa1, 0x20,
    0, 0x99, 36, 100, 0x83, 0x60, 0x99, 38, 100, 0x83, 0x60, 0x99, 42, 90, 0, 0x99, 60, 64, 0x83, 0x60, 0x89, 42, 0,
    0, 0xff, 0x2f, 0];
  const u32 = (v) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  return Buffer.from([0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 0, 0, 1, 1, 0xe0, 0x4d, 0x54, 0x72, 0x6b, ...u32(trk.length), ...trk]);
}

test('MIDI file: load, info, unmapped note, play', async ({ page }) => {
  await open(page);
  await powerOn(page);
  await page.getByTestId('midi-file').setInputFiles({ name: 'beat.mid', mimeType: 'audio/midi', buffer: midiFile() });
  await expect(page.locator('#midi-name')).toHaveText('beat.mid');
  await expect(page.locator('#midi-dur')).toHaveText('0:01');
  await expect(page.locator('#midi-unmapped')).toContainText('1 unmapped (60)');
  await expect(page.getByTestId('midi-play')).toBeEnabled();
  await page.getByTestId('midi-play').click();
  await expect.poll(() => page.evaluate(() => window.__hits.filter((h) => h.source === 'midi').map((h) => h.ch))).toEqual([4, 0, 6]);
});

test('output: filter, volume and WAV export download', async ({ page }) => {
  await open(page);
  await powerOn(page);
  await page.getByTestId('filter').selectOption('warm');
  expect(await page.evaluate(() => window.uds.filter)).toBe('warm');
  await page.getByTestId('volume').fill('0.5');
  expect(await page.evaluate(() => window.uds.volume)).toBe(0.5);
  await expect(page.getByTestId('wav-export')).toBeDisabled();      // nothing loaded yet
  await page.getByTestId('slot-file-0').setInputFiles(FX('basic-format0.mid'));
  await expect(page.locator('#wav-what')).toContainText('Slot 1 · 8 bars');
  const dl = page.waitForEvent('download');
  await page.getByTestId('wav-export').click();
  await expect(page.getByTestId('wav-export')).toHaveClass(/busy/);
  const d = await dl;
  expect(d.suggestedFilename()).toBe('uds-1x1-slot1-basic-format0-120bpm-dac1.wav');
  await expect(page.getByTestId('wav-export')).not.toHaveClass(/busy/);
});

test('no console errors with ?fake=1, and the fallback notice without the audio module', async ({ page }) => {
  const errors = await open(page);
  await powerOn(page);
  await page.getByTestId('pad-0').click();
  await page.waitForTimeout(500);
  expect(errors, errors.join('\n')).toEqual([]);
  await expect(page.locator('#notice')).toContainText('fake');
});

test('no horizontal page scroll at 1024 and 390 px', async ({ page }) => {
  for (const w of [1024, 390]) {
    await page.setViewportSize({ width: w, height: 800 });
    await open(page);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, `scrollWidth at ${w}`).toBeLessThanOrEqual(w);
  }
});
