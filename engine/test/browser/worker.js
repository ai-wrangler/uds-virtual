// Worker check and speed benchmark (module worker).
import { loadEngine } from '../../../app/engine/uds-engine.js';
self.onmessage = async () => {
  const e = await loadEngine(undefined, { sampleRate: 48000 });   // fetch next to the module
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
  self.postMessage({ backend: e.backend, mhz: Math.max(run(), run()) });
};
