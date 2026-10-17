// Autorhythm slots end to end (CONTRACT sections 5 and 6), with the mock engine and the real engine:
// load a .mid into a slot through slot-file-0, select it, start the rhythm, check the step rate, the sound,
// the WAV export, persistence across a reload, clear, and that the page is English only.
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { ROOT, MODES, startMode, requireTestId, events, now, measure } from './helpers.mjs';

const BASIC = path.join(ROOT, 'tests/audio/fixtures/basic-format0.mid');   // 2 bars, 120 bpm
const DEMO = path.join(ROOT, 'app/data/midi/demo.mid');                    // 4 bars, 104 bpm
const SILENCE_RMS = 1e-4;

for (const mode of MODES) {
  test.describe(mode.name, () => {
    test('a slot loads, plays at its tempo (±5%) and sounds', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'slot-file-0');
      await page.getByTestId('slot-file-0').setInputFiles(BASIC);
      await expect(page.getByTestId('slot-0')).toContainText('basic-format0.mid');
      await expect(page.getByTestId('slot-0')).toContainText('2 bars');
      await page.getByTestId('slot-0').click();
      expect(await page.evaluate(() => window.uds.slot)).toBe(0);
      expect(await page.evaluate(() => window.uds.tempo)).toBe(120);
      const quiet = await measure(page, 300);
      const t0 = await now(page);
      await page.getByTestId('rhythm-toggle').click();
      await expect.poll(() => page.evaluate(() => window.uds.rhythmPlaying)).toBe(true);
      const loud = await measure(page, 1500);
      await page.waitForTimeout(3000);
      const steps = (await events(page, 'step', t0)).filter((e) => e.detail.slot === 0);
      const hits = (await events(page, 'hit', t0)).filter((e) => e.detail.source === 'rhythm');
      await page.getByTestId('rhythm-toggle').click();
      await expect.poll(() => page.evaluate(() => window.uds.rhythmPlaying)).toBe(false);
      expect(steps.length).toBeGreaterThan(12);
      const s = steps.slice(1);
      const interval = (s[s.length - 1].t - s[0].t) / (s.length - 1) / 1000;
      const expected = 60 / (120 * 4);
      test.info().annotations.push({ type: 'step interval', description: `${interval.toFixed(4)} s, expected ${expected}` });
      expect(Math.abs(interval / expected - 1)).toBeLessThan(0.05);
      for (let i = 1; i < s.length; i++) expect(s[i].detail.index).toBe((s[i - 1].detail.index + 1) % 32);
      expect(s[0].detail.length).toBe(32);
      expect(new Set(hits.map((h) => h.detail.ch))).toEqual(new Set([0, 4, 6]));
      // velocity: kick 120/127 and hat 90/127 of the knob level
      const lv = await page.evaluate(() => [window.uds.getParams(4).level, window.uds.getParams(6).level]);
      expect(hits.find((h) => h.detail.ch === 4).detail.level).toBe(Math.max(1, Math.round(lv[0] * 120 / 127)));
      expect(hits.find((h) => h.detail.ch === 6).detail.level).toBe(Math.max(1, Math.round(lv[1] * 90 / 127)));
      expect(loud.maxRms, `RMS quiet=${quiet.maxRms} loud=${loud.maxRms}`).toBeGreaterThan(Math.max(SILENCE_RMS, quiet.maxRms * 2));
    });

    test('slots survive a reload, clear empties them; no Cyrillic', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'slot-file-0');
      await page.getByTestId('slot-file-0').setInputFiles(DEMO);
      await page.getByTestId('slot-file-3').setInputFiles(BASIC);
      await expect(page.getByTestId('slot-3')).toContainText('basic-format0.mid');
      await page.reload();
      await page.waitForSelector('body.ready');
      await expect(page.getByTestId('slot-0')).toContainText('demo.mid');
      await expect(page.getByTestId('slot-0')).toContainText('4 bars');
      await expect(page.getByTestId('slot-3')).toContainText('basic-format0.mid');
      expect(await page.evaluate(() => [window.uds.slot, window.uds.slots[0]?.bars, window.uds.slots[0]?.bpm])).toEqual([3, 4, 104]);
      const text = await page.evaluate(() => document.body.innerText);
      expect(text.match(/[Ѐ-ӿ]+/g), 'Cyrillic text on the page').toBeNull();
      await page.getByTestId('power').click();
      await expect(page.locator('body')).toHaveAttribute('data-state', 'running', { timeout: 20_000 });
      await page.getByTestId('slot-clear-0').click();
      await expect(page.getByTestId('slot-0')).toContainText('empty');
      expect(await page.evaluate(() => window.uds.slots[0])).toBeNull();
      await page.reload();
      await page.waitForSelector('body.ready');
      await expect(page.getByTestId('slot-0')).toContainText('empty');
      await expect(page.getByTestId('slot-3')).toContainText('basic-format0.mid');
    });

    test('WAV export of a slot (demo groove, 8 bars) has no flat-topped runs', async ({ page }) => {
      await startMode(page, mode);
      await page.getByTestId('slot-file-0').setInputFiles(DEMO);
      await expect.poll(() => page.evaluate(() => !!window.uds.slots[0])).toBe(true);
      const r = await page.evaluate(async () => {
        const blob = await window.uds.renderWav({ what: 'rhythm' });
        const dv = new DataView(await blob.arrayBuffer());
        let peak = 0, full = 0, run = 0, maxRun = 0, prev = null;
        const n = (dv.byteLength - 44) / 2;
        for (let i = 0; i < n; i++) {
          const v = dv.getInt16(44 + 2 * i, true);
          const a = Math.abs(v);
          peak = Math.max(peak, a);
          if (a >= 32767) full++;
          if (a > 30000 && v === prev) { run++; maxRun = Math.max(maxRun, run); } else run = 0;
          prev = v;
        }
        return { n, peak: peak / 32768, full, maxRun, seconds: n / dv.getUint32(24, true) };
      });
      test.info().annotations.push({ type: 'wav', description: JSON.stringify(r) });
      expect(r.seconds).toBeGreaterThan(8 * 4 * 60 / 104);       // 8 bars at 104 bpm
      expect(r.peak).toBeGreaterThan(0.05);
      expect(r.full, 'samples at full scale').toBe(0);
      expect(r.maxRun, 'repeated samples near full scale').toBeLessThan(3);
    });
  });
}
