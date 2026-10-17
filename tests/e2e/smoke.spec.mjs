// Page load and power-on (CONTRACT section 6).
import { test, expect } from '@playwright/test';
import { openApp, requireUI, powerOn, MODES, requireRealEngine } from './helpers.mjs';

test('page loads with no console errors', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page).toHaveTitle(/UDS/);
  await page.waitForTimeout(1500);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('page loads with ?engine=mock and no console errors', async ({ page }) => {
  const errors = await openApp(page, '?engine=mock');
  await page.waitForTimeout(1000);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('every data-testid from CONTRACT section 6 is present', async ({ page }) => {
  await openApp(page, '?engine=mock');
  await requireUI(page);
  await page.waitForSelector('body.ready', { timeout: 15_000 }).catch(() => {});
  const ids = ['power', 'rhythm-toggle', 'tempo', 'midi-file', 'midi-play', 'midi-input', 'filter', 'volume',
    'display', 'sim-speed', 'wav-export'];
  for (let i = 0; i < 16; i++) ids.push(`slot-${i}`, `slot-file-${i}`, `slot-clear-${i}`);
  for (let i = 0; i < 8; i++) ids.push(`pad-${i}`);
  for (const s of 'abcdefg') ids.push(`seg-${s}`);
  const missing = [];
  for (const id of ids) if ((await page.getByTestId(id).count()) === 0) missing.push(id);
  expect(missing, `missing data-testids: ${missing.join(', ')}`).toEqual([]);
  expect(await page.locator('[data-testid^=pattern-]').count(), 'pattern buttons were replaced by slots').toBe(0);
  expect(await page.locator('[data-testid^=knob-4-]').count()).toBeGreaterThan(0);
});

for (const mode of MODES) {
  test.describe(mode.name, () => {
    test('power on gives body[data-state=running] without errors', async ({ page }) => {
      const errors = await openApp(page, mode.query);
      await requireUI(page);
      if (mode.real) await requireRealEngine(page);
      await powerOn(page);
      const info = await page.evaluate(() => window.uds.info);
      test.info().annotations.push({ type: 'backend', description: JSON.stringify(info) });
      if (mode.real) expect(info.mock).toBeFalsy();
      await page.waitForTimeout(1000);
      const errs = await page.evaluate(() => window.__ev.filter((e) => e.type === 'error').map((e) => e.detail?.message));
      expect([...errors, ...errs], [...errors, ...errs].join('\n')).toEqual([]);
    });
  });
}
