// SPDX-License-Identifier: Apache-2.0
// Browser tests for the audio part:  npx playwright test -c tests/audio/playwright.config.mjs
// UDS_ENGINE=wasm runs them with the real engine (needs app/engine/).
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.UDS_AUDIO_PORT || 8137);
export default defineConfig({
  testDir: '.',
  testMatch: /browser\.spec\.mjs$/,
  timeout: 60000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
  },
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    cwd: '../..',
    url: `http://127.0.0.1:${PORT}/tests/audio/test.html`,
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
