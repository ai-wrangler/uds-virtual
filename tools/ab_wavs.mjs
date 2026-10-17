// A/B WAVs of the two DACs: demo.mid in slot 1, 8 bars (+ 1 s of tail), exported with renderWav once with
// the 1st-order DAC and once with the 2nd-order preview, in Chromium, from a running copy of the site.
//
//   node tools/ab_wavs.mjs [base URL] [out dir]
//   default: http://127.0.0.1:8123/ (python3 -m http.server 8123 -d app) and docs/audio/
//
// Writes dac1.wav and dac2.wav, then dac1.mp3 and dac2.mp3 with ffmpeg if it is installed. Prints the
// SHA-256 and RMS of each WAV (the same code gives the same bytes, so this also checks a deployment).
// SPDX-License-Identifier: Apache-2.0
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:8123/';
const out = process.argv[3] || 'docs/audio';
const demo = readFileSync(new URL('../app/data/midi/demo.mid', import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(base);
await page.waitForSelector('body.ready');
const res = {};
for (const dac of ['1st', '2nd']) {
  const r = await page.evaluate(async ([dac, bytes]) => {
    const uds = window.uds;
    await uds.setDac(dac);
    await uds.loadSlot(0, new Uint8Array(bytes).buffer, 'demo.mid');
    uds.setSlot(0);
    const blob = await uds.renderWav({ what: 'rhythm' });
    return { dac: uds.dac, bytes: Array.from(new Uint8Array(await blob.arrayBuffer())) };
  }, [dac, Array.from(demo)]);
  const buf = Buffer.from(r.bytes);
  const name = `dac${dac[0]}`;
  writeFileSync(path.join(out, name + '.wav'), buf);
  let s = 0;
  const n = (buf.length - 44) / 2;
  for (let i = 0; i < n; i++) { const v = buf.readInt16LE(44 + 2 * i) / 32768; s += v * v; }
  res[name] = { dac: r.dac, bytes: buf.length, seconds: n / buf.readUInt32LE(24),
    rmsDb: 20 * Math.log10(Math.sqrt(s / n)), sha256: createHash('sha256').update(buf).digest('hex') };
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, name + '.wav'),
    '-codec:a', 'libmp3lame', '-b:a', '192k', path.join(out, name + '.mp3')]);
  if (ff.status !== 0) console.warn(`ffmpeg failed or missing for ${name}.mp3`);
}
await browser.close();
console.log(JSON.stringify(res, null, 2));
