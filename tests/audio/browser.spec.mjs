// SPDX-License-Identifier: Apache-2.0
// Playwright tests of UDSAudio in headless Chromium (see playwright.config.mjs).
import { test, expect } from '@playwright/test';

const ENGINE = process.env.UDS_ENGINE || 'mock';

test.describe(`UDSAudio with the ${ENGINE} engine`, () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()); });
    page.on('pageerror', e => console.log('[pageerror]', e.message));
    await page.goto('/tests/audio/test.html');
    await page.waitForFunction(() => window.testPageReady);
    const r = await page.evaluate(e => window.createUds(e), ENGINE);
    expect(r.channels).toBe(8);
    expect(r.patterns).toBe(18);
    if (ENGINE === 'mock') expect(r.info.backend).toBe('mock');
    else expect(r.info.mock).toBe(false);
    await page.evaluate(() => window.uds.start());
    expect(await page.evaluate(() => window.uds.state)).toBe('running');
  });

  test('status events arrive and a pad hit is heard', async ({ page }) => {
    await page.waitForTimeout(600);
    const st = await page.evaluate(() => window.rec.status.slice());
    expect(st.length).toBeGreaterThan(5);
    const last = st.at(-1);
    for (const k of ['simHz', 'realtime', 'cycles', 'frames', 'uoOut', 'uioOut', 'busy', 'cs', 'queue', 'leadMs', 'underruns']) {
      expect(last, k).toHaveProperty(k);
    }
    expect(last.cycles).toBeGreaterThan(0);
    const rate = st.length / ((st.at(-1).t - st[0].t) / 1000);
    expect(rate).toBeGreaterThan(10); expect(rate).toBeLessThan(40);
    console.log(`status: ${(last.simHz / 1e6).toFixed(2)} MHz, ${last.realtime.toFixed(2)}x, lead ${last.leadMs} ms, underruns ${last.underruns}`);
    const quiet = await page.evaluate(() => window.peakOver(150));
    const t0 = await page.evaluate(() => { window.uds.hit(4, { velocity: 1 }); return performance.now(); });
    const loud = await page.evaluate(() => window.peakOver(300));
    console.log(`analyser rms: quiet ${quiet.toFixed(4)}, after hit ${loud.toFixed(4)}`);
    expect(loud).toBeGreaterThan(0.02);
    expect(loud).toBeGreaterThan(quiet * 3);
    const hits = await page.evaluate(() => window.rec.hit.slice());
    expect(hits.length).toBe(1);
    expect(hits[0]).toMatchObject({ ch: 4, level: 15, source: 'pad' });
    const delay = hits[0].t - t0;
    console.log(`hit event ${delay.toFixed(1)} ms after hit()`);
    expect(delay).toBeGreaterThan(5);
    expect(delay).toBeLessThan(400);
    // velocity scaling
    await page.evaluate(() => window.uds.hit(0, { velocity: 0.5 }));
    await page.waitForTimeout(300);
    expect((await page.evaluate(() => window.rec.hit.at(-1)))).toMatchObject({ ch: 0, level: 7 });
    const s = await page.evaluate(() => window.rec.status.at(-1));
    expect(s.uoOut & 0x7f).toBe(0x3f);     // display shows 0, the channel last hit
  });

  for (const [id, tempo] of [['A0', 120], ['A9', 150], ['B1', null]]) {
    test(`rhythm ${id} steps at the right tempo`, async ({ page }) => {
      const info = await page.evaluate(([id, tempo]) => {
        window.uds.setPattern(id);
        if (tempo) window.uds.setTempo(tempo);
        window.uds.startRhythm();
        const p = window.uds.patterns.find(x => x.id === id);
        return { tempo: window.uds.tempo, spb: p.stepsPerBeat, length: p.length };
      }, [id, tempo]);
      await page.waitForTimeout(2500);
      await page.evaluate(() => window.uds.stopRhythm());
      const steps = await page.evaluate(() => window.rec.step.slice());
      const want = 60000 / (info.tempo * info.spb);
      expect(steps.length).toBeGreaterThan(2000 / want - 2);
      steps.forEach((s, i) => { expect(s.index).toBe(i % info.length); expect(s.patternId).toBe(id); });
      // events fire when heard: average spacing matches, jitter limited by worklet quanta + message delivery
      const span = steps.at(-1).t - steps[0].t;
      const avg = span / (steps.length - 1);
      console.log(`${id} @ ${info.tempo}: ${steps.length} steps, avg ${avg.toFixed(2)} ms (want ${want.toFixed(2)})`);
      expect(Math.abs(avg - want)).toBeLessThan(want * 0.03);
      const hits = await page.evaluate(() => window.rec.hit.filter(h => h.source === 'rhythm').length);
      expect(hits).toBeGreaterThan(0);
      const peak = await page.evaluate(() => Math.max(...window.rec.status.slice(-10).map(s => s.underruns)));
      console.log(`underruns ${peak}`);
    });
  }

  test('tempo change mid-pattern takes effect at once', async ({ page }) => {
    await page.evaluate(() => { window.uds.setPattern('A0'); window.uds.setTempo(120); window.uds.startRhythm(); });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.uds.setTempo(240));
    const n0 = await page.evaluate(() => window.rec.step.length);
    await page.waitForTimeout(1500);
    const st = await page.evaluate(n => window.rec.step.slice(n + 3), n0);
    const avg = (st.at(-1).t - st[0].t) / (st.length - 1);
    expect(Math.abs(avg - 62.5)).toBeLessThan(3);
  });

  test('a MIDI fixture plays', async ({ page }) => {
    const info = await page.evaluate(() => window.loadMidiUrl('/tests/audio/fixtures/tempo-format1.mid'));
    expect(info.notes).toBe(12);
    expect(info.duration).toBeCloseTo(6.2667, 3);
    await page.evaluate(() => { window.uds.setMidiLoop(false); window.uds.playMidi(); });
    expect(await page.evaluate(() => window.uds.midiPlaying)).toBe(true);
    await page.waitForTimeout(2300);
    const hits = await page.evaluate(() => window.rec.hit.filter(h => h.source === 'midi'));
    // beats at 0, 0.5, 1.0, 1.5, 2.0 s: 5 hits in the first 2.3 s
    expect(hits.length).toBe(5);
    expect(hits.map(h => h.ch)).toEqual([4, 0, 4, 0, 4]);
    const gaps = hits.slice(1).map((h, i) => h.t - hits[i].t);
    console.log('midi gaps', gaps.map(g => g.toFixed(1)).join(' '));
    gaps.forEach(g => expect(Math.abs(g - 500)).toBeLessThan(30));
    const midiEv = await page.evaluate(() => window.rec.midi.filter(m => m.playing));
    expect(midiEv.length).toBeGreaterThan(5);
    expect(midiEv.at(-1).position).toBeGreaterThan(1.5);
    expect(await page.evaluate(() => window.peakOver(200))).toBeGreaterThan(0.005);
    await page.evaluate(() => window.uds.stopMidi());
    expect(await page.evaluate(() => window.uds.midiPlaying)).toBe(false);
  });

  test('demo.mid loads and stopAll stops everything', async ({ page }) => {
    const info = await page.evaluate(() => window.loadMidiUrl('/app/data/midi/demo.mid'));
    expect(info.notes).toBeGreaterThan(60);
    await page.evaluate(() => { window.uds.playMidi(); window.uds.startRhythm(); });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.uds.stopAll());
    expect(await page.evaluate(() => [window.uds.midiPlaying, window.uds.rhythmPlaying])).toEqual([false, false]);
    await page.waitForTimeout(400);
    const n = await page.evaluate(() => window.rec.hit.length);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.rec.hit.length)).toBe(n);
    expect(await page.evaluate(() => window.peakOver(150))).toBeLessThan(0.01);
  });

  test('renderWav renders rhythm and MIDI offline', async ({ page }) => {
    const w = await page.evaluate(() => window.wavInfo({ what: 'rhythm', seconds: 2 }));
    expect(w.type).toBe('audio/wav');
    expect(w.rate).toBe(await page.evaluate(() => window.uds.ctx.sampleRate));
    expect(w.samples).toBe(Math.round(2 * w.rate));
    expect(w.peak).toBeGreaterThan(3000);
    await page.evaluate(() => window.loadMidiUrl('/tests/audio/fixtures/basic-format0.mid'));
    const m = await page.evaluate(() => window.wavInfo({ what: 'midi' }));
    expect(m.samples).toBe(Math.round((4 + 1.5) * m.rate));
    expect(m.peak).toBeGreaterThan(3000);
  });

  test('filter, volume, knobs and suspend', async ({ page }) => {
    await page.evaluate(() => {
      window.uds.setFilter('warm'); window.uds.setVolume(0.5);
      window.uds.setParams(4, { pitch: 999, level: 7 });
    });
    expect(await page.evaluate(() => window.uds.getParams(4))).toMatchObject({ pitch: 255, level: 7 });
    await page.evaluate(() => window.uds.resetParams(4));
    expect(await page.evaluate(() => window.uds.getParams(4).pitch)).toBe(20);
    await page.evaluate(() => window.uds.suspend());
    expect(await page.evaluate(() => window.uds.state)).toBe('suspended');
    await page.evaluate(() => window.uds.start());
    expect(await page.evaluate(() => window.uds.state)).toBe('running');
    expect(await page.evaluate(() => window.rec.state)).toEqual(['starting', 'running', 'suspended', 'running']);
  });
});
