// Take the README screenshots from a site (default: the deployed one).
//   node tests/e2e/screenshots.mjs [url]
// Writes docs/screenshots/desktop.png (1440x900) and docs/screenshots/mobile.png (390x844).
import { chromium } from '@playwright/test';
const url = process.argv[2] || 'https://ai-wrangler.github.io/uds-virtual/';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const power = page.getByTestId('power');
  if (await power.count()) {
    await power.click();
    await page.waitForSelector('body[data-state=running]', { timeout: 20000 }).catch(() => {});
    const rhythm = page.getByTestId('rhythm-toggle');
    if (await rhythm.count()) await rhythm.click();   // Rock 1 running, so the scope and step LEDs show
    await page.waitForTimeout(2300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `docs/screenshots/${name}.png` });
  console.log(`docs/screenshots/${name}.png`);
  await ctx.close();
}
await browser.close();
