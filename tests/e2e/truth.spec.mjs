// Real-engine truth test: in Chromium, run the engine API (CONTRACT section 3) on the HIT schedule in
// engine/test/fixtures/model_frames.json and compare the per-frame counts of 1s on the audio pin with the
// Python model's. This is the browser-side proof that the shipped WASM is the chip.
import { test, expect } from '@playwright/test';
import { openApp, requireRealEngine, readJSON } from './helpers.mjs';

const FIXTURE = 'engine/test/fixtures/model_frames.json';

test('real engine matches the model frame by frame (in the browser)', async ({ page }) => {
  const fx = readJSON(FIXTURE);
  test.skip(!fx, `${FIXTURE} not merged yet`);
  await openApp(page);
  await requireRealEngine(page);
  const r = await page.evaluate(async (fx) => {
    const mod = await import('./engine/uds-engine.js');
    const engine = await mod.loadEngine(undefined, { sampleRate: 48000 });
    return { backend: engine.backend, ...(await runFixture(mod, engine, fx)) };

    // The fixture format is documented in engine/test/fixtures/README or the engine PR; this runner
    // accepts { events|hits|schedule: [{ frame, bytes }], counts|frames|expected: [n, ...] }.
    async function runFixture(mod, engine, fx) {
      const evs = fx.events || fx.hits || fx.schedule || [];
      const expected = fx.counts || fx.expected || fx.frames;
      engine.reset();
      const startFrame = fx.startFrame ?? 0;
      const got = new Array(expected.length);
      let ei = 0, f = 0;
      const sorted = [...evs].sort((a, b) => (a.frame ?? a.atFrame) - (b.frame ?? b.atFrame));
      const t0 = performance.now();
      while (f < expected.length) {
        while (ei < sorted.length && (sorted[ei].frame ?? sorted[ei].atFrame) <= f + startFrame) {
          const e = sorted[ei++];
          if (!engine.send(e.bytes)) throw new Error('queue full at frame ' + f);
        }
        got[f++] = engine.runFrames(1);
      }
      const ms = performance.now() - t0;
      let mismatches = 0, first = -1;
      for (let i = 0; i < expected.length; i++) if (got[i] !== expected[i]) { mismatches++; if (first < 0) first = i; }
      return { frames: expected.length, mismatches, first, ms, mhz: (expected.length * mod.FRAME_CLOCKS) / ms / 1000,
        sample: first < 0 ? null : { got: got.slice(first, first + 8), want: expected.slice(first, first + 8) } };
    }
  }, fx);
  test.info().annotations.push({ type: 'truth', description: JSON.stringify(r) });
  console.log(`[truth] backend=${r.backend} frames=${r.frames} mismatches=${r.mismatches} speed=${r.mhz.toFixed(1)} MHz`);
  expect(r.frames).toBeGreaterThan(1000);
  expect(r.mismatches, `first mismatch at frame ${r.first}: ${JSON.stringify(r.sample)}`).toBe(0);
});

test('real engine answers READ ID and VERSION in the browser', async ({ page }) => {
  await openApp(page);
  await requireRealEngine(page);
  const r = await page.evaluate(async () => {
    const mod = await import('./engine/uds-engine.js');
    const e = await mod.loadEngine(undefined, { sampleRate: 48000 });
    return { CLOCK_HZ: mod.CLOCK_HZ, VOICES: mod.VOICES, FRAME_CLOCKS: mod.FRAME_CLOCKS, FRAME_RATE: mod.FRAME_RATE,
      backend: e.backend, sr: e.sampleRate };
  });
  expect(r).toMatchObject({ CLOCK_HZ: 6000000, VOICES: 2, FRAME_CLOCKS: 96, FRAME_RATE: 62500, sr: 48000 });
});

test('real engine renders sound for a HIT in the browser', async ({ page }) => {
  await openApp(page);
  await requireRealEngine(page);
  const r = await page.evaluate(async () => {
    const mod = await import('./engine/uds-engine.js');
    const e = await mod.loadEngine(undefined, { sampleRate: 48000 });
    e.reset();
    const silent = e.render(4800);
    let s0 = 0; for (const v of silent) s0 += v * v;
    e.hit(4, { pitch: 40, sweep: 3, decay: 9, balance: 0, level: 15 });
    const t0 = performance.now();
    let s1 = 0, n = 0;
    for (let i = 0; i < 10; i++) { const b = e.render(4800); for (const v of b) { s1 += v * v; n++; } }
    const ms = performance.now() - t0;
    const act = e.takeActivity();
    return { rms0: Math.sqrt(s0 / 4800), rms1: Math.sqrt(s1 / n), uo: e.uoOut, act, ms, cycles: e.cycles };
  });
  test.info().annotations.push({ type: 'render', description: JSON.stringify(r) });
  expect(r.rms1).toBeGreaterThan(r.rms0 + 0.001);
  expect(r.uo & 0x7f).toBe(0x66); // display shows channel 4
  expect(r.act.hits).toBeGreaterThanOrEqual(1);
});
