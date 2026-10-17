# Contract between the build sessions

Four Claude sessions build this repo at the same time, one per part: **engine**, **audio**, **ui** and
**integrate**. This file is the interface between them: who owns which files and the APIs between the parts.
It wins over anything else. If something here is wrong or missing, say so in your PR description; the
integration session keeps this file up to date.

## 1. Layout and ownership

| Path | Owner | Contents |
| --- | --- | --- |
| `chip/` | nobody (read-only) | the chip, vendored from ai-wrangler/tt-uds-1x1 at commit ba09c49 |
| `engine/`, `app/engine/` | engine | Verilog to WebAssembly build, harness, JS wrapper, engine tests |
| `app/audio/`, `app/data/`, `tools/export_patterns.py`, `tests/audio/` | audio | AudioContext, worker, worklet, sequencer, MIDI, mock engine |
| `app/index.html`, `app/ui/`, `app/assets/`, `tests/ui/` | ui | the panel |
| `.github/`, `tests/e2e/`, `README.md`, `CONTRACT.md`, root `package.json`, `docs/` (except `docs/screenshots/ui/`) | integrate | CI, Pages deploy, end-to-end tests, docs |
| `docs/screenshots/ui/` | ui | panel screenshots |

- Change only the files your part owns. Never modify the chip repo ai-wrangler/tt-uds-1x1.
- Branches `engine`, `audio`, `ui`, `integrate`; one PR each into `main` (follow-up PRs are fine). Only the
  integration session merges.
- The site is the folder `app/`, served as is: plain ES modules, relative URLs, no bundler and no build step
  in the browser. It must work from any static server (`python3 -m http.server -d app 8000`) and from
  https://ai-wrangler.github.io/uds-virtual/. Target browser: Chrome or Edge on Windows 11 (desktop).
  No external CDNs at run time; vendor anything you need (with its license) into your own folder.
- License: Apache-2.0. Third-party code only under compatible licenses (MIT, BSD, ISC, Apache); no GPL.

## 2. The chip (full datasheet: `chip/docs/info.md`; reference model: `chip/model/uds_model.py`)

- Top module `tt_um_ai_wrangler_uds1x1`; 2 voices; clock 6 MHz; one audio frame = 96 clocks, so the frame
  rate is 62 500 Hz.
- SPI mode 0, MSB first, SCK at most clk/6, CS low for the whole message:
  - HIT `0x18|ch, pitch, decay<<4 | sweep, balance<<4 | level`
  - READ `0x30|reg` plus one dummy byte (the answer comes on MISO; reg 0 = ID 0xD5, reg 1 = VERSION 0x12)
  - STOP `0x40` silences all voices
- The chip takes one HIT per frame: after a HIT wait until BUSY (uio[5]) is low before the next message.
- Pins: uo_out[6:0] = 7-segment display (segments a..g = bits 0..6, lit = 1; shows the channel last hit),
  uo_out[7] = audio (first-order sigma-delta bitstream). uio[0] CS_N, uio[1] MOSI, uio[2] MISO, uio[3] SCK
  (inputs from the controller), uio[4] FRAME (high during voice 0's window), uio[5] BUSY, uio[6] and uio[7]
  audio again (for the Audio Pmod).
- Channels: 0 snare, 1 small tom, 2 middle tom, 3 big tom, 4 bass drum, 5 cymbal, 6 closed hi-hat,
  7 open hi-hat. Hi-hats 6 and 7 share a voice group (an open hat is cut by a closed one).
- Parameters: pitch 0..255, sweep 0..7, decay 0..15 (14 and 15 act as 13), balance 0..15, level 0..15.
  Defaults per channel are in `app/data/channels.json`.
- At full level a voice reaches about 1/6 of the pin's swing, so the audio part applies about 3x gain by
  default (as `write_wav` in the model does).

## 3. Engine API: `app/engine/uds-engine.js` + `app/engine/uds_engine.wasm` (owner: engine)

An ES module with no DOM access and no `fetch` in its methods. It must run in a Window, a dedicated Worker,
an AudioWorkletGlobalScope and Node 22.

```js
import { loadEngine, CLOCK_HZ, VOICES, FRAME_CLOCKS, FRAME_RATE } from './engine/uds-engine.js';
// CLOCK_HZ = 6000000, VOICES = 2, FRAME_CLOCKS = 96, FRAME_RATE = 62500

// source: ArrayBuffer | Uint8Array | WebAssembly.Module, or a URL string / URL object (then it fetches,
// relative to the module, when fetch exists). Default: new URL('./uds_engine.wasm', import.meta.url).
const engine = await loadEngine(source, { sampleRate: 48000 });

engine.backend;            // string: which simulator generated the code: 'gen' (shipped) or 'cxxrtl'
engine.sampleRate;         // output sample rate
engine.reset(sampleRate?); // reset the chip (rst_n low for 4 clocks), the SPI queue and the filters
engine.setFilterHz(hz);    // analog low-pass after the pin (RC model); 0 = off. Default 15900 (1 kOhm, 10 nF)
engine.send(bytes);        // queue one SPI message (array or Uint8Array of 1..4 bytes) -> false if the queue is full
engine.hit(ch, { pitch, sweep, decay, balance, level });   // = send of a HIT; -> false if the queue is full
engine.stop();             // = send([0x40])
engine.queueLength();      // messages not yet sent
engine.render(n);          // simulate until n output samples are ready (1 <= n <= 8192); returns a Float32Array
                           // view (valid until the next call); mono, the pin's full swing maps to -1..1
engine.runFrames(n);       // simulate n whole frames; returns the number of 1s on the audio pin in the last one
engine.uoOut; engine.uioOut;   // current output pins (numbers)
engine.cycles; engine.frames;  // clocks and frames since reset (numbers)
engine.takeActivity();     // -> { busy, cs, hits }: BUSY seen high, CS seen low, HITs sent, since the last call
```

The virtual controller inside the engine works like the RP2040 on the demo board: it sends queued messages
in order, SCK = clk/8, and waits for BUSY low before each message. A message queued between `render` calls
starts on the next clock, so callers get sample-accurate timing by splitting `render` at event times.

Extras beyond this list (used by the engine tests, not needed by other parts): `runCycles(n)`,
`runCounts(n)`, `runTrace(n)`, `takeLog()`. In an AudioWorklet pass the `.wasm` bytes (an ArrayBuffer), not
a `WebAssembly.Module`: Chromium does not deliver a Module posted to a worklet port.

The engine is the bottleneck. Its README in `engine/` must state the measured simulation speed (MHz of chip
clock in Node, and in Chrome if measured) and the method used to verify it against the model.

## 4. Mock engine: `app/audio/mock-engine.js` (owner: audio)

`loadMockEngine({ sampleRate })` returns an object with the same interface as section 3 (`backend: 'mock'`)
that makes plausible drum sounds in plain JS, so the audio and ui parts work before the real engine lands.

## 5. Audio API: `app/audio/uds-audio.js` (owner: audio, used by ui and integrate)

```js
import { UDSAudio } from './audio/uds-audio.js';
const uds = await UDSAudio.create({ engine: 'wasm' });   // 'wasm' (default) or 'mock'; does not start sound
await uds.start();          // call from a user gesture: AudioContext, worker, worklet
await uds.suspend();
uds.state;                  // 'idle' | 'starting' | 'running' | 'suspended' | 'error'
uds.info;                   // { backend, mock, clockHz, voices, frameRate, sampleRate }
uds.analyser;               // AnalyserNode after start() (for a scope view), else null

uds.channels;               // [{ ch, id, name, nameRu, shortRu, group, params }] from data/channels.json
uds.knobs;                  // [{ key, label, labelRu, min, max, note }]
uds.getParams(ch);          // { pitch, sweep, decay, balance, level }: the channel's knob values
uds.setParams(ch, partial); // new knob values; used by the next hit of that channel
uds.resetParams(ch?);       // back to the defaults (one channel or all)

uds.hit(ch, { velocity: 1 });   // play now with the channel's knobs; velocity 0..1 scales the level
uds.stopAll();              // STOP: silence the chip; also stops the rhythm and the MIDI file
uds.setVolume(v);           // master gain 0..1 (default 0.8)
uds.setFilter(mode);        // 'rc' (default, 15.9 kHz) | 'warm' (4 kHz) | 'off'

uds.patterns;               // [{ id: 'A0'..'A15', 'B0', 'B1', bank, index, name, nameRu, meter, stepsPerBeat, length, bpm }]
// patterns entries also carry steps and accents (for step LEDs)
uds.setPattern(id); uds.setTempo(bpm);   // tempo 40..240, default 120
uds.startRhythm(); uds.stopRhythm(); uds.rhythmPlaying; uds.pattern /* id string, e.g. 'A0' */; uds.tempo;

// Autorhythm slots (the panel's rhythm source; the built-in patterns above stay in the API, unused by the panel)
uds.slots;                  // Array(16): null or { index, name, bars, steps, stepsPerBeat (4), stepsPerBar, beatSteps,
                            //   meter, notes: [{ step, ch, v, velocity, note }], bpm, truncated, unmapped }
await uds.loadSlot(index, arrayBuffer, name);   // -> the slot; throws an Error if no note maps to a drum channel
uds.clearSlot(index); uds.setSlot(index | null); uds.slot;   // selected index or null (null = the pattern plays)
// startRhythm() does nothing while the selected slot is empty. setSlot applies the slot's bpm; while playing,
// a slot-to-slot switch happens at the next bar line and starts at bar 1. renderWav({ what: 'rhythm' })
// renders the selected slot (default 8 bars + 1 s).

await uds.loadMidi(arrayBuffer, name);   // -> { name, duration, notes, unmapped: { [note]: count } }
uds.playMidi(); uds.stopMidi(); uds.setMidiLoop(on); uds.midiPlaying;

await uds.enableMidiInput();            // -> [{ id, name }]; throws if Web MIDI is missing or denied
uds.midiInputs;

await uds.renderWav({ what: 'rhythm' | 'midi', seconds });   // -> Blob (audio/wav), offline, real engine

// Events (CustomEvent, data in e.detail):
//  'state'  { state }
//  'status' { simHz, realtime, cycles, frames, uoOut, uioOut, busy, cs, queue, leadMs, underruns }  about 20 per second
//           simHz = chip clocks per second of time spent in engine.render (smoothed); realtime = simHz / 6e6,
//           i.e. headroom. Extra fields: leadTargetMs, dropped, hits, sampleRate, backend, mock, midi
//  'hit'    { ch, level, source: 'pad' | 'rhythm' | 'midi' | 'midi-in' }    when the hit is heard
//  'step'   { index, length, patternId, slot }    when a rhythm step is heard (slot: index, or null for a pattern)
//  'slots'  { slots, slot }                       after loadSlot, clearSlot, setSlot
//  'midi'   { position, duration, playing }
//  'midi-input' { inputs }
//  'error'  { message }
```

Rules shared by every source of hits (pads, rhythm, MIDI file, live MIDI):

- The hit uses the channel's current knob values. Velocity v (0..1) gives level `round(level * v)`, at least 1
  when v > 0.
- Rhythm accents: on a channel that has any accent in the pattern, unaccented hits are `accentLevelDrop` (4)
  softer (as in `pattern_events` in the model).
- A rhythm step lasts `60 / (tempo * stepsPerBeat)` seconds. Bank B patterns carry a default bpm, which
  `setPattern` applies.
- Slots (`app/audio/slots.js`): the MIDI file's note map and channel rule below; note-ons quantized to the
  nearest 16th; the loop is whole bars of the first time signature (default 4/4) covering the last note and
  the last whole bar before end-of-track, at most 4 bars (later notes dropped, `truncated: true`); per-hit
  velocity as below; two notes on one step and channel play once at the higher velocity; bpm = the first
  tempo, rounded, clamped to 40..240 (120 if none).
- Output: the worker's 3x make-up gain is followed by a soft limiter (linear to 0.8, tanh knee towards 1.0),
  not a hard clamp.
- MIDI file: General MIDI drum notes on channel 10 (if a file has no notes on channel 10, all channels are
  used). Live MIDI: note-ons on any channel. Velocity 1..127 maps to v = velocity / 127. Note map:

| Notes | Channel |
| --- | --- |
| 35, 36 | 4 bass drum |
| 37, 38, 39, 40 | 0 snare |
| 41, 43 | 3 big tom |
| 45, 47 | 2 middle tom |
| 48, 50 | 1 small tom |
| 42, 44 | 6 closed hi-hat |
| 46 | 7 open hi-hat |
| 49, 51, 52, 55, 57, 59 | 5 cymbal |

  Other notes are ignored and counted in `unmapped`.

How it runs (audio decides the details): the engine runs in a dedicated Worker, ahead of the speakers,
and passes audio to an AudioWorklet over a MessagePort (no SharedArrayBuffer: GitHub Pages cannot send the
COOP/COEP headers). The rhythm and MIDI players run inside that Worker, so hits land on exact samples.
`status.realtime` is simulated time / wall time; below 1.0 the UI shows a warning and `renderWav` is the
fallback.

## 6. UI hooks for tests (owner: ui, used by integrate)

The page sets `window.uds` to its `UDSAudio` instance once created, mirrors `uds.state` into
`document.body.dataset.state`, and gives these elements `data-testid`s:

| data-testid | Element |
| --- | --- |
| `power` | the start button (first click starts audio) |
| `pad-0` .. `pad-7` | pads |
| `knob-<ch>-<key>` | knobs, e.g. `knob-4-pitch`: `role="slider"`, `aria-valuemin/max/now`, arrow keys change it |
| `slot-0` .. `slot-15` | Autorhythm slot buttons (click: select; an empty slot also opens the file picker) |
| `slot-file-0` .. `slot-file-15` | `<input type=file accept=".mid,.midi">` per slot (hidden) |
| `slot-clear-0` .. `slot-clear-15` | clear one slot (`slot-load-<n>` replaces its file; `slots-clear-all` clears all after a second click) |
| `rhythm-toggle`, `tempo` | rhythm start/stop, tempo control (`role="slider"` or `<input type=range>`) |
| `midi-file`, `midi-play`, `midi-input` | `<input type=file>` for .mid, play/stop, enable live MIDI |
| `filter`, `volume` | filter switch, master volume |
| `display` | the 7-segment display (child elements `seg-a` .. `seg-g` with class `on` when lit) |
| `sim-speed` | text such as `11.8 MHz · 1.97x real time` |
| `wav-export` | WAV export button |

- `filter` is a `<select>` (values `rc`, `warm`, `off`), `volume` an `<input type=range>` 0..1, `tempo` a
  knob (`role="slider"`).
- The pattern buttons (`pattern-<id>`) were removed: the panel is English only and the Autorhythm plays .mid
  files from 16 slots, saved in localStorage (`uds-virtual.slots.v1`: base64 bytes + name, and the selection).
- `body.ready` is set once the panel is fully built (pads, knobs and stored slots appear after
  `UDSAudio.create()` resolves); tests wait for it.

URL flags: `?engine=mock` makes the page use the mock engine; `?fake=1` uses the ui's silent fake
(`app/ui/fake-audio.js`, also the fallback if `audio/uds-audio.js` does not import).

## 7. Tests and CI (owner: integrate)

- `node --test` runs `engine/test/*.test.mjs`, `tests/audio/*.test.mjs`, `tests/ui/*.test.mjs` in CI.
- `npx playwright test` (root `playwright.config.mjs`) runs the projects `e2e` (`tests/e2e/`) and `ui`
  (`tests/ui/`) against `python3 -m http.server -d app` on port 8123, and `audio` (`tests/audio/`) against
  the repo root on port 8124. Spec files are `*.spec.mjs`.
- CI also runs `engine/test/browser/run.cjs` (main thread, Worker, AudioWorklet) and the Python model.
- `UDS_BASE_URL=https://ai-wrangler.github.io/uds-virtual/ npx playwright test --project=e2e` runs the e2e
  suite against the deployed site.

## 8. Data files (owner: audio; generated by `python3 tools/export_patterns.py`)

- `app/data/channels.json`: `{ accentLevelDrop, channels: [{ ch, id, name, nameRu, shortRu, group, params }], knobs: [...] }`
- `app/data/patterns.json`: `{ patterns: [{ id, bank, index, name, nameRu, meter, stepsPerBeat, bpm, length,
  steps, accents, notes }] }`, where `steps[i]` and `accents[i]` are bytes with bit n = channel n.
