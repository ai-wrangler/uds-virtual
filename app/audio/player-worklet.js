// SPDX-License-Identifier: Apache-2.0
// AudioWorklet that plays the engine worker's chunks.
// A FIFO of Float32Array chunks; on underrun it outputs silence and counts the underrun. It reports the
// number of samples it has played to the worker about every 8 render quanta, and sends each chunk's
// event marks (hits, steps) to the main thread when they are played.

class UDSPlayer extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];          // [{ buf, marks, pos }]
    this.queued = 0;          // samples waiting
    this.consumed = 0;        // samples taken from chunks
    this.underruns = 0;
    this.quanta = 0;
    this.started = false;
    this.worker = null;
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'port') {
        this.worker = m.port;
        this.worker.onmessage = (ev) => this.onChunk(ev.data);
      } else if (m.type === 'flush') {
        this.queue = []; this.queued = 0;
      }
    };
  }

  onChunk(c) {
    if (!c.buf) return;
    this.queue.push({ buf: c.buf, marks: c.marks || [], pos: 0, mi: 0 });
    this.queued += c.buf.length;
    if (this.queued >= 1024) this.started = true;      // prime before the first sample plays
  }

  process(inputs, outputs) {
    const out = outputs[0];
    const o = out[0];
    const n = o.length;
    let i = 0, marks = null;
    while (i < n && this.started && this.queue.length) {
      const c = this.queue[0];
      const k = Math.min(n - i, c.buf.length - c.pos);
      o.set(c.buf.subarray(c.pos, c.pos + k), i);
      const end = c.pos + k;
      while (c.mi < c.marks.length && c.marks[c.mi].offset < end) {
        (marks || (marks = [])).push(c.marks[c.mi++]);
      }
      c.pos = end; i += k;
      this.consumed += k; this.queued -= k;
      if (c.pos >= c.buf.length) this.queue.shift();
    }
    if (i < n) {
      o.fill(0, i);
      if (this.started) this.underruns++;
    }
    for (let ch = 1; ch < out.length; ch++) out[ch].set(o);
    if (++this.quanta % 8 === 0 && this.worker) {
      this.worker.postMessage({ consumed: this.consumed, underruns: this.underruns, queued: this.queued });
    }
    if (marks) this.port.postMessage({ type: 'marks', marks, underruns: this.underruns });
    return true;
  }
}

registerProcessor('uds-player', UDSPlayer);
