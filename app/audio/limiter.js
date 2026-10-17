// SPDX-License-Identifier: Apache-2.0
// Soft limiter after the 3x make-up gain (replaces a hard clamp to +-1): linear up to KNEE, then a tanh
// knee that approaches 1.0 with a continuous slope, so loud hits round off instead of flat-topping.
export const KNEE = 0.8;
const RANGE = 1 - KNEE;
export function softLimit(v) {
  const a = v < 0 ? -v : v;
  if (a <= KNEE) return v;
  const y = KNEE + RANGE * Math.tanh((a - KNEE) / RANGE);
  return v < 0 ? -y : y;
}
