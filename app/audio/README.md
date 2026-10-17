# app/audio: the audio part

Everything between the panel and the engine. Public API: `UDSAudio` in `uds-audio.js` (CONTRACT.md section 5).

```
main thread                       engine worker (module)                     audio thread
UDSAudio ── commands ───────────▶ engine-worker.js                            player-worklet.js
  │  (postMessage)                  engine (wasm or mock)                     FIFO of chunks
  │                                 Scheduler: rhythm + MIDI file             underrun -> silence, counted
  │ ◀── status ~20/s ─────────────  render() split at event samples ──chunks▶  (MessagePort, transferred)
  │                                 3x make-up gain, 10 Hz DC blocker  ◀──── played count every 8 quanta
  │ ◀──────────────── hit / step marks, posted when the worklet plays them ────────┘
AudioWorkletNode → GainNode (volume) → AnalyserNode → destination
```

| File | What |
| --- | --- |
| `uds-audio.js` | `UDSAudio`: AudioContext graph, knob state, data files, live Web MIDI, events, `renderWav` |
| `engine-worker.js` | Runs the engine ahead of real time (live mode) or as fast as possible (`renderWav`) |
| `player-worklet.js` | AudioWorkletProcessor `uds-player` |
| `scheduler.js` | Autorhythm sequencer and MIDI-file player, in output-sample positions (pure, tested in Node) |
| `midi.js` | SMF parser (formats 0/1, running status, tempo map), SMF writer, GM drum map, velocity rule |
| `mock-engine.js` | `loadMockEngine`: engine interface in plain JS, a frame-level port of `chip/model/uds_model.py` |
| `wav.js` | 16-bit PCM WAV encoder (and a small decoder for tests) |

## Timing

- The worker keeps `leadTargetMs` of audio rendered ahead of the worklet's playback position: 60 ms at start,
  ×1.25 + 5 ms on each new underrun (up to 200), and when the engine runs above 1.5x real time with no
  underrun for 8 s it steps down by 5 ms every 4 s, to 40 ms. `status.leadMs` is the amount actually buffered.
- Pads and live MIDI go in at the current render position, so they are heard about `leadMs` later
  (plus the output latency of the device).
- Rhythm steps are at `start + k * 60 / (tempo * stepsPerBeat) * sampleRate`, rounded to the sample. A tempo
  change re-anchors at the last played step, so it applies to the interval in progress (if that makes the
  next step already due, it plays at once). A pattern change applies at the next step; the step counter goes
  on (modulo the new length).
- MIDI hits are at `start + round(time * sampleRate)`; with loop on, the next pass starts at the file's
  duration (end-of-track or last note).
- `hit` and `step` events fire when the worklet plays the sample (so ~1 render quantum + message delay).

## Status

`status.simHz` is chip clocks simulated per second of time spent inside `engine.render` (smoothed), and
`status.realtime = simHz / 6 MHz`: how much faster than real time the engine can run. Extra fields beyond
the contract: `leadTargetMs`, `dropped` (hits refused by a full engine queue), `hits`, `sampleRate`,
`backend`, `mock`; `status.midi` while a file plays.

## Options of `UDSAudio.create`

`{ engine: 'wasm' | 'mock', wasmUrl, dataUrl, slowdown }`. `slowdown` is a test hook: it makes the engine
behave as if it ran at that many times real time (used by the "slow engine" test).
