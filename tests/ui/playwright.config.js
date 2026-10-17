// Playwright config for the panel tests. Run from the repo root:
//   npx playwright test -c tests/ui
// Serves app/ with python's static server, like GitHub Pages would.
const { defineConfig } = require('./pw.js');

const PORT = Number(process.env.UI_TEST_PORT || 8123);

module.exports = defineConfig({
  testDir: __dirname,
  timeout: 30000,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/`,
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1 -d app`,
    cwd: require('path').join(__dirname, '..', '..'),
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: true,
    timeout: 15000,
    stderr: 'ignore',
  },
});
