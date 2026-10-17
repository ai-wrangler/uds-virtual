// SPDX-License-Identifier: Apache-2.0
// 16-bit PCM WAV encoding (mono or interleaved).

export function encodeWav(samples, sampleRate, channels = 1) {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); s(8, 'WAVE');
  s(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, channels, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * channels * 2, true);
  v.setUint16(32, channels * 2, true); v.setUint16(34, 16, true);
  s(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0, o = 44; i < n; i++, o += 2) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(o, x < 0 ? Math.round(x * 32768) : Math.round(x * 32767), true);
  }
  return buf;
}

// Minimal reader, for tests: -> { sampleRate, channels, bits, samples: Float32Array }
export function decodeWav(buffer) {
  const v = new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  const tag = o => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a WAV file');
  let o = 12, fmt = null;
  while (o + 8 <= v.byteLength) {
    const id = tag(o), len = v.getUint32(o + 4, true);
    if (id === 'fmt ') fmt = { channels: v.getUint16(o + 10, true), sampleRate: v.getUint32(o + 12, true), bits: v.getUint16(o + 22, true) };
    if (id === 'data') {
      const n = len / 2, out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = v.getInt16(o + 8 + i * 2, true) / 32768;
      return { ...fmt, samples: out };
    }
    o += 8 + len + (len & 1);
  }
  throw new Error('WAV: no data chunk');
}
