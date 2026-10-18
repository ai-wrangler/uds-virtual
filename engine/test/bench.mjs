// Speed benchmark: MHz of chip clock in Node. Usage: node engine/test/bench.mjs [file.wasm ...]
import { readFileSync } from 'node:fs';
import { loadEngine } from '../../app/engine/uds-engine.js';
const files = process.argv.slice(2);
if (!files.length) files.push(new URL('../../app/engine/uds_engine.wasm', import.meta.url).pathname);
for (const f of files) {
  const e = await loadEngine(readFileSync(f), { sampleRate: 48000 });
  // a v3 build (5-byte HITs): a kick, a clap and a hat with patches in CONTRACT-1 layout (pitch, decay|wave|color,
  // bend|res|bendtime|mode, mix|level|click)
  const v3 = e.maxMessage > 4;
  const hit = (ch, p, b) => (v3 ? e.send([0x18 | ch, ...b]) : e.hit(ch, p));
  const run = (sec) => {
    e.reset();
    const t0 = performance.now();
    for (let i = 0; i < sec * 100; i++) {          // 480-sample blocks, 10 ms each
      if (i % 25 === 0) hit(4, { pitch: 20, sweep: 6, decay: 9, balance: 1, level: 15 }, [40, 0x94, 0xce, 0x3f]);
      if (i % 25 === 12) hit(0, { pitch: 80, sweep: 4, decay: 7, balance: 11, level: 13 }, [90, 0x81, 0x0f, 0xfc]);
      if (i % 10 === 5) hit(6, { pitch: 255, sweep: 0, decay: 6, balance: 15, level: 10 }, [200, 0x6e, 0x0c, 0xf4]);
      e.render(480);
    }
    const s = (performance.now() - t0) / 1000;
    return e.cycles / s / 1e6;
  };
  run(1);
  const mhz = Math.max(run(3), run(3));
  console.log(`${f.split('/').pop()}: backend ${e.backend}: ${mhz.toFixed(2)} MHz (${(mhz * 1e6 / e.clockHz).toFixed(2)}x real time at ${e.clockHz / 1e6} MHz)`);
}
