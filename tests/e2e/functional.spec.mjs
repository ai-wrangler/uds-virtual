// Functional end-to-end tests, run with the mock engine and with the real engine.
import { test, expect } from '@playwright/test';
import {
  MODES, startMode, requireTestId, events, now, measure, readDisplay, rockMidi, SEG7,
} from './helpers.mjs';

const SILENCE_RMS = 1e-4;

for (const mode of MODES) {
  test.describe(mode.name, () => {
    test('pad click brings a hit event and sound', async ({ page }) => {
      await startMode(page, mode);
      const quiet = await measure(page, 300);
      const t0 = await now(page);
      await page.getByTestId('pad-4').click();
      const loud = await measure(page, 600);
      const hits = await events(page, 'hit', t0);
      expect(hits.length, 'hit events after clicking pad-4').toBeGreaterThan(0);
      expect(hits[0].detail.ch).toBe(4);
      expect(hits[0].detail.source).toBe('pad');
      expect(loud.maxRms, `analyser RMS quiet=${quiet.maxRms} loud=${loud.maxRms}`).toBeGreaterThan(
        Math.max(SILENCE_RMS, quiet.maxRms * 2));
    });

    test('every pad plays its channel and the 7-segment display shows it', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'display');
      for (let ch = 0; ch < 8; ch++) {
        const t0 = await now(page);
        await page.getByTestId(`pad-${ch}`).click();
        await expect.poll(async () => (await events(page, 'hit', t0)).map((e) => e.detail.ch),
          { timeout: 5000 }).toContain(ch);
        await expect.poll(() => readDisplay(page), { timeout: 5000,
          message: `display after pad-${ch} should be 0x${SEG7[ch].toString(16)}` }).toBe(SEG7[ch]);
        // the chip's own pins agree
        await expect.poll(async () => {
          const s = (await events(page, 'status', t0)).pop();
          return s ? s.detail.uoOut & 0x7f : -1;
        }, { timeout: 5000 }).toBe(SEG7[ch]);
      }
    });

    test('rhythm starts and steps come at the set tempo (±5%)', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'rhythm-toggle');
      await page.getByTestId('pattern-A0').click();
      await page.evaluate(() => window.uds.setTempo(120));
      const spb = await page.evaluate(() => window.uds.patterns.find((p) => p.id === 'A0').stepsPerBeat);
      expect(await page.evaluate(() => window.uds.pattern?.id ?? window.uds.pattern)).toBe('A0');
      const t0 = await now(page);
      await page.getByTestId('rhythm-toggle').click();
      await expect.poll(() => page.evaluate(() => window.uds.rhythmPlaying)).toBe(true);
      await page.waitForTimeout(4500);
      const steps = (await events(page, 'step', t0)).filter((e) => e.detail.patternId === 'A0');
      const hits = await events(page, 'hit', t0);
      await page.getByTestId('rhythm-toggle').click();
      await expect.poll(() => page.evaluate(() => window.uds.rhythmPlaying)).toBe(false);
      expect(steps.length).toBeGreaterThan(8);
      // skip the first step (start-up latency) and use the span of the rest
      const s = steps.slice(1);
      const interval = (s[s.length - 1].t - s[0].t) / (s.length - 1) / 1000;
      const expected = 60 / (120 * spb);
      test.info().annotations.push({ type: 'step interval', description: `${interval.toFixed(4)} s, expected ${expected.toFixed(4)} s` });
      expect(Math.abs(interval / expected - 1), `step interval ${interval}s vs ${expected}s`).toBeLessThan(0.05);
      expect(hits.some((h) => h.detail.source === 'rhythm'), 'rhythm hits').toBe(true);
      // steps are consecutive indices
      for (let i = 1; i < s.length; i++) expect(s[i].detail.index).toBe((s[i - 1].detail.index + 1) % s[i].detail.length);
    });

    test('tempo change changes the step rate', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'rhythm-toggle');
      await page.getByTestId('pattern-A0').click();
      await page.evaluate(() => window.uds.setTempo(180));
      const spb = await page.evaluate(() => window.uds.patterns.find((p) => p.id === 'A0').stepsPerBeat);
      const t0 = await now(page);
      await page.getByTestId('rhythm-toggle').click();
      await page.waitForTimeout(3500);
      const s = (await events(page, 'step', t0)).slice(1);
      await page.getByTestId('rhythm-toggle').click();
      const interval = (s[s.length - 1].t - s[0].t) / (s.length - 1) / 1000;
      expect(Math.abs(interval / (60 / (180 * spb)) - 1)).toBeLessThan(0.05);
    });

    test('MIDI file uploads through midi-file and plays', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'midi-file');
      await page.getByTestId('midi-file').setInputFiles({ name: 'rock.mid', mimeType: 'audio/midi', buffer: rockMidi() });
      // loadMidi is async; wait until a play is possible
      await page.waitForTimeout(800);
      const t0 = await now(page);
      await page.getByTestId('midi-play').click();
      await expect.poll(async () => (await events(page, 'hit', t0)).filter((e) => e.detail.source === 'midi').length,
        { timeout: 8000 }).toBeGreaterThan(5);
      const chs = new Set((await events(page, 'hit', t0)).filter((e) => e.detail.source === 'midi').map((e) => e.detail.ch));
      expect([...chs].sort()).toEqual(expect.arrayContaining([4, 6]));
      const midiEv = await events(page, 'midi', t0);
      expect(midiEv.some((e) => e.detail.playing)).toBe(true);
    });

    test('MIDI loadMidi API maps notes and counts unmapped', async ({ page }) => {
      await startMode(page, mode);
      const res = await page.evaluate(async (bytes) => {
        const r = await window.uds.loadMidi(new Uint8Array(bytes).buffer, 'rock.mid');
        return r;
      }, [...rockMidi()]);
      expect(res.notes).toBe(16 + 4 + 4);
      expect(res.unmapped).toEqual({ 60: 1 });
      expect(res.duration).toBeGreaterThan(3.5);
      expect(res.duration).toBeLessThan(4.6);
    });

    test('volume changes the output', async ({ page }) => {
      await startMode(page, mode);
      const level = async (v) => {
        await page.evaluate((v) => window.uds.setVolume(v), v);
        await page.waitForTimeout(150);
        const m = page.evaluate(() => new Promise((r) => setTimeout(r, 0)));
        await m;
        let max = 0;
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.uds.hit(4, { velocity: 1 }));
          max = Math.max(max, (await measure(page, 400)).maxRms);
        }
        return max;
      };
      const loud = await level(0.8);
      const soft = await level(0.1);
      test.info().annotations.push({ type: 'rms', description: `vol 0.8: ${loud}, vol 0.1: ${soft}` });
      expect(loud).toBeGreaterThan(SILENCE_RMS);
      expect(soft, 'lower volume should be quieter (is the analyser after the master gain?)').toBeLessThan(loud * 0.5);
    });

    test('filter changes the output', async ({ page }) => {
      await startMode(page, mode);
      const hiBand = async (f) => {
        await page.evaluate((f) => window.uds.setFilter(f), f);
        let hi = 0, lo = 0;
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => { window.uds.hit(5, { velocity: 1 }); });
          const m = await measure(page, 400);
          hi += m.hi; lo += m.lo;
        }
        return { hi, lo };
      };
      const off = await hiBand('off');
      const warm = await hiBand('warm');
      test.info().annotations.push({ type: 'hi band', description: `off ${off.hi} warm ${warm.hi}` });
      expect(off.hi).toBeGreaterThan(0);
      expect(warm.hi, 'warm (4 kHz) should cut the band above 8 kHz').toBeLessThan(off.hi * 0.5);
      await page.evaluate(() => window.uds.setFilter('rc'));
    });

    test('UI filter and volume controls exist and respond', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'volume');
      const vol = page.getByTestId('volume');
      await vol.focus();
      for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowDown');
      await requireTestId(page, 'filter');
      await page.getByTestId('filter').click();
      // no errors from interacting
      const errs = await page.evaluate(() => window.__ev.filter((e) => e.type === 'error'));
      expect(errs).toEqual([]);
    });

    test('knob changes the channel parameters', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'knob-4-pitch');
      const knob = page.getByTestId('knob-4-pitch');
      const before = await page.evaluate(() => window.uds.getParams(4).pitch);
      await knob.focus();
      for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowUp');
      const after = await page.evaluate(() => window.uds.getParams(4).pitch);
      expect(after).toBeGreaterThan(before);
      expect(Number(await knob.getAttribute('aria-valuenow'))).toBe(after);
    });

    test('status reports simHz > 0 and the sim-speed text', async ({ page }) => {
      await startMode(page, mode);
      await page.waitForTimeout(1500);
      const st = (await events(page, 'status')).pop();
      expect(st, 'a status event').toBeTruthy();
      expect(st.detail.simHz).toBeGreaterThan(0);
      test.info().annotations.push({ type: 'status', description: JSON.stringify(st.detail) });
      if (mode.real) {
        console.log(`[${mode.name}] simHz=${(st.detail.simHz / 1e6).toFixed(2)} MHz realtime=${st.detail.realtime}`);
      }
      await requireTestId(page, 'sim-speed');
      await expect(page.getByTestId('sim-speed')).toHaveText(/\d/);
    });

    test('WAV export gives a non-silent WAV', async ({ page }) => {
      await startMode(page, mode);
      await page.evaluate(() => window.uds.setPattern('A0'));
      const r = await page.evaluate(async () => {
        const blob = await window.uds.renderWav({ what: 'rhythm', seconds: 2 });
        const buf = new DataView(await blob.arrayBuffer());
        const tag = (o) => String.fromCharCode(buf.getUint8(o), buf.getUint8(o + 1), buf.getUint8(o + 2), buf.getUint8(o + 3));
        let o = 12, fmt = null, peak = 0, n = 0;
        while (o + 8 <= buf.byteLength) {
          const id = tag(o), len = buf.getUint32(o + 4, true);
          if (id === 'fmt ') fmt = { format: buf.getUint16(o + 8, true), channels: buf.getUint16(o + 10, true), rate: buf.getUint32(o + 12, true), bits: buf.getUint16(o + 22, true) };
          if (id === 'data') {
            const bps = fmt.bits / 8;
            for (let i = o + 8; i + bps <= o + 8 + len && i + bps <= buf.byteLength; i += bps) {
              const v = fmt.bits === 16 ? buf.getInt16(i, true) / 32768 : fmt.bits === 32 && fmt.format === 3 ? buf.getFloat32(i, true) : 0;
              peak = Math.max(peak, Math.abs(v)); n++;
            }
          }
          o += 8 + len + (len & 1);
        }
        return { type: blob.type, size: blob.size, riff: tag(0), wave: tag(8), fmt, peak, n };
      });
      test.info().annotations.push({ type: 'wav', description: JSON.stringify(r) });
      expect(r.riff).toBe('RIFF');
      expect(r.wave).toBe('WAVE');
      expect(r.type).toMatch(/wav/);
      expect(r.n / r.fmt.channels / r.fmt.rate).toBeGreaterThan(1.5);
      expect(r.peak, 'WAV should not be silent').toBeGreaterThan(0.01);
    });

    test('wav-export button gives a download', async ({ page }) => {
      await startMode(page, mode);
      await requireTestId(page, 'wav-export');
      const dl = page.waitForEvent('download', { timeout: 30_000 });
      await page.getByTestId('wav-export').click();
      const d = await dl;
      expect(d.suggestedFilename()).toMatch(/\.wav$/i);
    });
  });
}
