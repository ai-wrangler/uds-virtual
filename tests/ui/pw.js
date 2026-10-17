// Resolve Playwright's test runner from either @playwright/test or playwright/test (whichever is installed).
let pw;
try { pw = require('@playwright/test'); } catch { pw = require('playwright/test'); }
module.exports = pw;
