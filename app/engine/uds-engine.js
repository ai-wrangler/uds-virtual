// UDS-1x1 engine: the chip's Verilog, simulated clock by clock in WebAssembly.
//
// API: CONTRACT.md section 3. Works in a Window, a Worker, an
// AudioWorkletGlobalScope and Node 22 (no DOM, no fetch inside methods,
// no TextDecoder).
//
// SPDX-License-Identifier: Apache-2.0

/** Chip clock in Hz. */
export const CLOCK_HZ = 6000000;
/** Voices (slots) in the chip. */
export const VOICES = 2;
/** Clocks per audio frame (48 per voice). */
export const FRAME_CLOCKS = 96;
/** Frames per second: CLOCK_HZ / FRAME_CLOCKS. */
export const FRAME_RATE = 62500;

const BACKENDS = { 1: 'cxxrtl', 2: 'verilator', 3: 'gen' };
const MAX_RENDER = 8192;

function stubImports(module) {
  const imports = {};
  for (const imp of WebAssembly.Module.imports(module)) {
    if (imp.kind !== 'function') continue;
    (imports[imp.module] ??= {})[imp.name] = () => 0;
  }
  return imports;
}

async function toModule(source) {
  if (source instanceof WebAssembly.Module) return source;
  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
    return WebAssembly.compile(source);
  }
  if (source === undefined || source === null) {
    source = new URL('./uds_engine.wasm', import.meta.url);
  }
  if (typeof source === 'string' || source instanceof URL) {
    const url = new URL(String(source), import.meta.url);
    if (url.protocol === 'file:' && typeof process !== 'undefined' && process.versions?.node) {
      const { readFile } = await import('node:fs/promises');
      return WebAssembly.compile(await readFile(url));
    }
    if (typeof fetch !== 'function') throw new Error('uds-engine: no fetch here; pass the bytes or a Module');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`uds-engine: ${url}: HTTP ${res.status}`);
    return WebAssembly.compile(await res.arrayBuffer());
  }
  throw new TypeError('uds-engine: source must be bytes, a WebAssembly.Module or a URL');
}

/** The UDS-1x1 chip on its demo board: clock, virtual RP2040 (SPI) and Audio Pmod. */
export class UDSEngine {
  /** @param {WebAssembly.Instance} instance @param {number} sampleRate */
  constructor(instance, sampleRate) {
    const x = instance.exports;
    /** @private */ this._x = x;
    /** @private */ this._mem = x.memory;
    /**
     * Which simulator generated the chip code: 'cxxrtl', 'verilator' or 'gen'.
     * @type {string}
     */
    this.backend = BACKENDS[x.sim_backend_id()] ?? 'unknown';
    /** @private */ this._rate = sampleRate;
    x.sim_reset(sampleRate);
  }

  /** Output sample rate in Hz. @type {number} */
  get sampleRate() { return this._rate; }

  /**
   * Reset the chip (rst_n low for 4 clocks), the SPI queue and the filters.
   * @param {number} [sampleRate] new output rate (default: keep the current one)
   */
  reset(sampleRate) {
    if (sampleRate > 0) this._rate = sampleRate;
    this._x.sim_reset(this._rate);
  }

  /**
   * Cutoff of the analog RC low-pass after the pin, in Hz; 0 turns it off.
   * Default 15900 (1 kOhm, 10 nF).
   * @param {number} hz
   */
  setFilterHz(hz) { this._x.sim_set_filter(+hz || 0); }

  /**
   * Queue one SPI message of 1..4 bytes.
   * @param {ArrayLike<number>} bytes
   * @returns {boolean} false if the queue is full (or the length is wrong)
   */
  send(bytes) {
    const n = bytes.length;
    if (!(n >= 1 && n <= 4)) return false;
    return this._x.sim_send(n, bytes[0] | 0, n > 1 ? bytes[1] | 0 : 0, n > 2 ? bytes[2] | 0 : 0,
      n > 3 ? bytes[3] | 0 : 0) === 1;
  }

  /**
   * Queue a HIT on channel ch (0..7).
   * @param {number} ch
   * @param {{pitch?: number, sweep?: number, decay?: number, balance?: number, level?: number}} p
   * @returns {boolean} false if the queue is full
   */
  hit(ch, { pitch = 0, sweep = 0, decay = 0, balance = 0, level = 0 } = {}) {
    return this.send([0x18 | (ch & 7), pitch & 0xFF, ((decay & 15) << 4) | (sweep & 15),
      ((balance & 15) << 4) | (level & 15)]);
  }

  /** Queue a STOP (silence every voice). @returns {boolean} false if the queue is full */
  stop() { return this.send([0x40]); }

  /** Messages not yet completely sent (including the one on the wire). @returns {number} */
  queueLength() { return this._x.sim_queue_len(); }

  /**
   * Simulate until n output samples are ready.
   * @param {number} n 1..8192
   * @returns {Float32Array} n mono samples (a view, valid until the next call);
   *   the pin's full swing maps to -1..1
   */
  render(n) {
    n = Math.max(1, Math.min(MAX_RENDER, n | 0));
    this._x.sim_run(n);
    return new Float32Array(this._mem.buffer, this._x.sim_out_ptr(), n);
  }

  /**
   * Simulate n whole frames (frames are FRAME_CLOCKS clocks).
   * @param {number} n
   * @returns {number} 1s on the audio pin in the last frame (0..96)
   */
  runFrames(n) { return this._x.sim_run_frames(n | 0); }

  /** uo_out pins now (bit 7 audio, bits 6:0 the 7-segment display). @type {number} */
  get uoOut() { return this._x.sim_uo_out(); }
  /** uio_out pins now (bit 5 BUSY, bit 4 FRAME, bit 2 MISO, bits 7:6 audio). @type {number} */
  get uioOut() { return this._x.sim_uio_out(); }
  /** Clocks since reset. @type {number} */
  get cycles() { return this._x.sim_cycles(); }
  /** Complete frames since reset. @type {number} */
  get frames() { return this._x.sim_frames(); }

  /**
   * What happened on the pins since the last call.
   * @returns {{busy: boolean, cs: boolean, hits: number}} BUSY seen high, CS seen low, HITs sent
   */
  takeActivity() {
    const a = this._x.sim_take_activity();
    return { busy: (a & 1) !== 0, cs: (a & 2) !== 0, hits: a >>> 8 };
  }

  // ---- extras for tests ---------------------------------------------------

  /**
   * Finished SPI messages since the last call, oldest first (up to 1024 kept).
   * lastSck is the cycle in which SCK was driven high for the last bit.
   * @returns {{lastSck: number, bytes: number[], rx: number[]}[]}
   */
  takeLog() {
    const n = this._x.sim_log_count();
    const p = this._x.sim_log_ptr();
    const dv = new DataView(this._mem.buffer);
    const out = [];
    for (let i = 0; i < n; i++) {
      const o = p + i * 24;
      const lastSck = dv.getFloat64(o, true);
      const sent = dv.getUint32(o + 8, true), recv = dv.getUint32(o + 12, true);
      const len = dv.getUint32(o + 16, true);
      const bytes = [], rx = [];
      for (let k = 0; k < len; k++) { bytes.push((sent >>> (8 * k)) & 255); rx.push((recv >>> (8 * k)) & 255); }
      out.push({ lastSck, bytes, rx });
    }
    this._x.sim_log_clear();
    return out;
  }

  /**
   * Run n frames (n <= 8192) and return the 1s of each.
   * @param {number} n
   * @returns {Uint8Array} a copy
   */
  runCounts(n) {
    n = this._x.sim_run_counts(n | 0);
    return new Uint8Array(this._mem.buffer, this._x.sim_counts_ptr(), n).slice();
  }

  /**
   * Run exactly n clocks (no audio output is kept).
   * @param {number} n
   */
  runCycles(n) { this._x.sim_run_cycles(n | 0); }

  /**
   * Run n clocks (n <= 8192) and return uo_out | uio_out << 8 of each.
   * @param {number} n
   * @returns {Uint16Array} a view, valid until the next call
   */
  runTrace(n) {
    n = this._x.sim_run_trace(n | 0);
    return new Uint16Array(this._mem.buffer, this._x.sim_trace_ptr(), n);
  }
}

/**
 * Load the engine.
 * @param {ArrayBuffer|Uint8Array|WebAssembly.Module|string|URL} [source]
 *   the .wasm bytes, a compiled Module, or a URL (fetched relative to this module);
 *   default ./uds_engine.wasm next to this file
 * @param {{sampleRate?: number}} [options]
 * @returns {Promise<UDSEngine>}
 */
export async function loadEngine(source, { sampleRate = 48000 } = {}) {
  const module = await toModule(source);
  const instance = await WebAssembly.instantiate(module, stubImports(module));
  if (instance.exports._initialize) instance.exports._initialize();
  return new UDSEngine(instance, sampleRate);
}
