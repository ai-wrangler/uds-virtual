// v3 truth test in Chromium: the deployed uds_engine_v3.wasm replays V3-CHIP's model fixture
// (engine/test/fixtures/model_frames_v3.json) with 0 mismatches. Skips until both exist.
import { test, expect } from '@playwright/test';
import { openApp, readJSON } from './helpers.mjs';

const FIXTURE = 'engine/test/fixtures/model_frames_v3.json';

test('v3 engine matches the v3 model frame by frame (in the browser)', async ({ page }) => {
  const fx = readJSON(FIXTURE);
  test.skip(!fx, `${FIXTURE} not delivered yet`);
  const head = await page.request.head('engine/uds_engine_v3.wasm').catch(() => null);
  test.skip(!head || !head.ok(), 'uds_engine_v3.wasm not built yet');
  await openApp(page);
  const r = await page.evaluate(async (fx) => {
    const mod = await import('./engine/uds-engine.js');
    const e = await mod.loadEngine('./uds_engine_v3.wasm', { sampleRate: 48000 });
    e.reset();
    let a = 0, bad = 0, first = -1;
    const t0 = performance.now();
    for (let f = 0; f < fx.counts.length; f++) {
      while (a < fx.events.length && fx.events[a].frame <= f) if (!e.send(fx.events[a++].bytes)) throw new Error('queue full');
      if (e.runFrames(1) !== fx.counts[f]) { bad++; if (first < 0) first = f; }
    }
    const ms = performance.now() - t0;
    return { backend: e.backend, frames: fx.counts.length, mismatches: bad, first, mhz: fx.counts.length * e.frameClocks / ms / 1000 };
  }, fx);
  test.info().annotations.push({ type: 'truth-v3', description: JSON.stringify(r) });
  console.log(`[truth v3] backend=${r.backend} frames=${r.frames} mismatches=${r.mismatches} speed=${r.mhz.toFixed(1)} MHz`);
  expect(r.frames).toBeGreaterThan(1000);
  expect(r.mismatches, `first mismatch at frame ${r.first}`).toBe(0);
});
