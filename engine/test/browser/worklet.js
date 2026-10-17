// AudioWorklet check: the engine loads and renders inside an AudioWorkletGlobalScope.
import { loadEngine } from '../../../app/engine/uds-engine.js';
class P extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = async ({ data }) => {
      try {
        const e = await loadEngine(data.module, { sampleRate });
        e.hit(4, { pitch: 20, sweep: 6, decay: 9, balance: 1, level: 15 });
        let peak = 0;
        for (let i = 0; i < 20; i++) for (const v of e.render(128)) peak = Math.max(peak, Math.abs(v));
        this.port.postMessage({ ok: true, backend: e.backend, peak, hasTextDecoder: typeof TextDecoder !== 'undefined' });
      } catch (err) { this.port.postMessage({ ok: false, error: String(err && err.stack || err) }); }
    };
  }
  process() { return true; }
}
registerProcessor('uds-engine-check', P);
