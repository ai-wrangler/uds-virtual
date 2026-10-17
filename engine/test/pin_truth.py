#!/usr/bin/env python3
"""Error of render() against the band-limited raw pin, for engine/test/pin_truth.mjs.
usage: pin_truth.py DIR name:model ...
SPDX-License-Identifier: Apache-2.0
"""
import sys
import numpy as np

FS, OUT, LO, HI = 6e6, 48000, 20.0, 20000.0


def band(x, fs):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / fs)
    X[(f > HI) | (f < LO)] = 0
    n = int(round(len(x) * OUT / fs))
    Y = np.zeros(n // 2 + 1, complex)
    m = min(len(Y), len(X))
    Y[:m] = X[:m]
    return np.fft.irfft(Y, n) * n / len(x)


def db(v):
    return 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-15)


d = sys.argv[1]
for arg in sys.argv[2:]:
    name, model = arg.split(":")
    T = band(np.fromfile(d + name + ".bits", dtype=np.uint8).astype(float) * 2 - 1, FS)
    H = band(np.fromfile(d + name + ".render", dtype="<f4").astype(float)[: len(T)], OUT)
    best = min((db(H[l:][OUT // 2:] - T[: len(T) - l][OUT // 2:]), l) for l in range(40))
    l = best[1]
    Hs, Ts = H[l:], T[: len(T) - l]
    tail = slice(int(1.6 * OUT), None)
    print("%-5s (%s): pin %.1f dB, tail %.1f dB | render() error %.1f dB, tail %.1f dB (delay %d samples)" % (
        name, model, db(Ts[OUT // 2:]), db(Ts[tail]), best[0], db(Hs[tail] - Ts[tail]), l))
