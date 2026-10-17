// Root Playwright config (owner: integrate).
// - e2e:   tests/e2e, against the site exactly as deployed: python3 -m http.server -d app
// - ui:    tests/ui specs (owner: ui), same server
// - audio: tests/audio specs (owner: audio), served from the repo root so test pages can import ../../app/...
import { defineConfig, devices } from '@playwright/test';

const APP_PORT = Number(process.env.APP_PORT || 8123);
const ROOT_PORT = Number(process.env.ROOT_PORT || 8124);
// UDS_BASE_URL lets the same suite run against the deployed site, e.g.
// UDS_BASE_URL=https://ai-wrangler.github.io/uds-virtual/ npx playwright test --project=e2e
const remote = process.env.UDS_BASE_URL;

const chromium = {
  ...devices['Desktop Chrome'],
  launchOptions: {
    args: ['--autoplay-policy=no-user-gesture-required'],
  },
};

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1, // audio timing tests are sensitive to CPU contention
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      testMatch: /.*\.spec\.(m?js|ts)$/,
      use: { ...chromium, baseURL: remote || `http://127.0.0.1:${APP_PORT}/` },
    },
    {
      name: 'ui',
      testDir: 'tests/ui',
      testMatch: /.*\.spec\.(m?js|ts)$/,
      use: { ...chromium, baseURL: `http://127.0.0.1:${APP_PORT}/` },
    },
    {
      name: 'audio',
      testDir: 'tests/audio',
      testMatch: /.*\.spec\.(m?js|ts)$/,
      use: { ...chromium, baseURL: `http://127.0.0.1:${ROOT_PORT}/` },
    },
  ],
  webServer: [
    {
      command: `python3 -m http.server ${APP_PORT} --bind 127.0.0.1 -d app`,
      url: `http://127.0.0.1:${APP_PORT}/index.html`,
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
      stderr: 'ignore',
    },
    {
      command: `python3 -m http.server ${ROOT_PORT} --bind 127.0.0.1 -d .`,
      url: `http://127.0.0.1:${ROOT_PORT}/README.md`,
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
      stderr: 'ignore',
    },
  ],
});
