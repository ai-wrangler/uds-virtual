// Screenshots of the panel (silent fake) into docs/screenshots/ui/. Run: npx playwright test --project=ui
import { test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/screenshots/ui');
const SIZES = [['desktop-1440', 1440, 900], ['desktop-1280', 1280, 800], ['desktop-1024', 1024, 768], ['mobile-390', 390, 844]];

for (const [name, w, h] of SIZES) {
  test(`screenshot ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('./?fake=1');
    await page.waitForSelector('body.ready');
    if (name === 'desktop-1440') await page.screenshot({ path: path.join(OUT, 'power-overlay-1440.png') });
    await page.getByTestId('power').click();
    await page.waitForFunction(() => document.body.dataset.state === 'running');
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    await page.getByTestId('slot-file-0').setInputFiles(path.join(root, 'app/data/midi/demo.mid'));
    await page.getByTestId('slot-file-1').setInputFiles(path.join(root, 'tests/audio/fixtures/basic-format0.mid'));
    await page.getByTestId('slot-file-4').setInputFiles(path.join(root, 'tests/audio/fixtures/tempo-format1.mid'));
    await page.getByTestId('slot-0').click();
    await page.waitForTimeout(5200);   // let the toasts go
    await page.getByTestId('rhythm-toggle').click();
    await page.waitForTimeout(900);
    await page.keyboard.press('5');
    await page.waitForTimeout(60);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: name !== 'desktop-1440' });
  });
}
