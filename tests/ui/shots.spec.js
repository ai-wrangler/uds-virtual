// Screenshots of the panel (with the silent fake) for docs/screenshots/ui/.
const { test } = require('./pw.js');
const path = require('path');

const OUT = path.join(__dirname, '..', '..', 'docs', 'screenshots', 'ui');

for (const [name, w, h] of [['desktop-1440', 1440, 900], ['desktop-1280', 1280, 800], ['desktop-1024', 1024, 768], ['mobile-390', 390, 844]]) {
  test(`screenshot ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('index.html?fake=1');
    await page.waitForSelector('body.ready');
    if (name === 'desktop-1440') await page.screenshot({ path: path.join(OUT, 'power-overlay-1440.png') });
    await page.getByTestId('power').click();
    await page.waitForFunction(() => document.body.dataset.state === 'running');
    await page.getByTestId('pattern-A13').click();
    await page.getByTestId('rhythm-toggle').click();
    await page.waitForTimeout(900);
    await page.keyboard.press('5');
    await page.waitForTimeout(60);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: name !== 'desktop-1440' });
  });
}
