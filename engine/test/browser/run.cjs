// Chromium checks: speed in the main thread and a Worker, and loading in an AudioWorklet.
// Run: node engine/test/browser/run.cjs   (uses the global playwright and /opt/pw-browsers)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(f.endsWith('/') ? 200 : 404, { 'content-type': 'text/html' }); res.end('<!doctype html><title>t</title>'); return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
server.listen(0, '127.0.0.1', async () => {
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.goto(base + 'engine/test/browser/');
  const r = await page.evaluate(async () => {
    const out = {};
    const mod = await import('/app/engine/uds-engine.js');
    const e = await mod.loadEngine(undefined, { sampleRate: 48000 });
    const run = () => {
      e.reset();
      const t0 = performance.now();
      for (let i = 0; i < 300; i++) {
        if (i % 25 === 0) e.hit(4, { pitch: 20, sweep: 6, decay: 9, balance: 1, level: 15 });
        if (i % 25 === 12) e.hit(0, { pitch: 80, sweep: 4, decay: 7, balance: 11, level: 13 });
        if (i % 10 === 5) e.hit(6, { pitch: 255, sweep: 0, decay: 6, balance: 15, level: 10 });
        e.render(480);
      }
      return e.cycles / ((performance.now() - t0) / 1000) / 1e6;
    };
    run();
    out.main = { backend: e.backend, mhz: Math.max(run(), run()) };
    const w = new Worker('/engine/test/browser/worker.js', { type: 'module' });
    out.worker = await new Promise((res) => { setTimeout(() => res({ error: 'timeout' }), 20000); w.onmessage = (m) => res(m.data); w.onerror = (x) => res({ error: x.message }); w.postMessage(0); });
    const ctx = new OfflineAudioContext(1, 48000 * 600, 48000);
    await ctx.audioWorklet.addModule('/engine/test/browser/worklet.js');
    const node = new AudioWorkletNode(ctx, 'uds-engine-check');
    const bytes = await (await fetch('/app/engine/uds_engine.wasm')).arrayBuffer();
    node.port.onmessageerror = () => (out.log ??= []).push('messageerror');
    node.connect(ctx.destination);
    const got = new Promise((res) => { node.port.onmessage = (m) => { if (typeof m.data !== 'string') res(m.data); else (out.log ??= []).push(m.data); }; });
    node.port.postMessage({ module: bytes });
    ctx.startRendering();
    out.worklet = await Promise.race([got, new Promise((res) => setTimeout(() => res({ ok: false, error: 'timeout' }), 20000))]);
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
  server.close();
  const ok = r.main.mhz > 0 && r.worker.mhz > 0 && r.worklet.ok && r.worklet.peak > 0.1;
  process.exit(ok ? 0 : 1);
});
