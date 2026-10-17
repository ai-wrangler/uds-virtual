# Brief: audio

**Goal:** everything between the panel and the engine, in `app/audio/`:

- `uds-audio.js`, implementing CONTRACT.md section 5;
- the Worker that runs the engine ahead of real time;
- the AudioWorklet that plays its output;
- the Autorhythm sequencer, the MIDI-file player and live Web MIDI;
- the WAV renderer;
- the mock engine (section 4).

You also own `app/data/` and `tools/export_patterns.py`. Both JSON files are already generated.

## Architecture (required)

**Main thread: `UDSAudio`**
- Signal chain: AudioContext (`latencyHint: 'interactive'`) → AudioWorkletNode → GainNode (master volume)
  → AnalyserNode → destination.
- Loads `data/channels.json` and `data/patterns.json`, and holds the knob state.
- Forwards commands to the worker.
- Turns worker reports into the events in section 5. Fire `hit` and `step` when they are heard, using the
  worklet's playback position, not when they are scheduled.

**Worker (`engine-worker.js`, a module worker)**
- Loads the engine: the real one with `loadEngine` from `../engine/uds-engine.js`, or `loadMockEngine` from
  `./mock-engine.js`.
- Keeps `leadMs` of audio rendered ahead of the playback position. Default 60 ms; it may adapt between 30
  and 200 ms.
- Posts Float32Array chunks (transferred, 128 to 1024 samples) to the worklet over a MessagePort that the
  main thread gives to both.
- Applies the 3x chip make-up gain.
- Runs the rhythm and MIDI players with sample accuracy. Events become output-sample times, and `render`
  is split at those times.
- Live hits (pads, Web MIDI) go in at the current render position.
- Measures simulation speed (`simHz`, `realtime`) and reports status about 20 times a second.

**AudioWorklet (`player-worklet.js`)**
- A FIFO of chunks; on underrun it outputs silence and counts the underrun.
- Reports its played-sample count to the worker about every 8 render quanta, so the worker can pace itself.

**Degrade cleanly**
- If the engine is slower than real time, `status.realtime` drops below 1 and underruns grow. Audio keeps
  going, with gaps, and nothing crashes.
- If the `.wasm` fails to load, fall back to the mock and emit `error`.

## The parts in detail

- **Sequencer.**
  - Steps come from `patterns.json`, with bit n of a step byte = channel n.
  - Step length is `60 / (tempo * stepsPerBeat)`. Bank B patterns set their own bpm.
  - Apply the accent rule from CONTRACT section 5.
  - A pattern change or tempo change takes effect at the next step without a glitch.
  - Fire `step` events for the step LEDs.
- **MIDI files.** Write your own small parser, no dependencies:
  - SMF formats 0 and 1, PPQ division, running status;
  - tempo map (FF 51, several tempo changes);
  - note-on with velocity 0 counts as note-off;
  - skip sysex and meta events.
  - Map notes to channels by the CONTRACT table, then play with loop on or off.
  - Write a small SMF writer for tests too.
  - Put two or three fixture files in `tests/audio/fixtures/` (the e2e tests reuse them), and one original
    demo groove in `app/data/midi/demo.mid`.
- **Live MIDI.**
  - `navigator.requestMIDIAccess({ sysex: false })`; listen to all inputs.
  - Re-scan on `statechange` and emit `midi-input`.
  - Note-on on any channel goes through the map, with velocity.
- **`renderWav`.**
  - Uses a separate engine instance in its own worker, rendering as fast as it can.
  - Returns 16-bit PCM WAV at the context's sample rate.
  - With `what: 'rhythm'`, it renders the current pattern and tempo for `seconds`; with `'midi'`, the loaded
    file.
- **Mock engine.** The same interface as the real engine, with plausible drum sounds in plain JS: sine plus
  noise with an exponential decay and a pitch sweep, shaped by the knob values. It is the stand-in until the
  engine lands.

## Working with the other parts

- The real engine arrives on branch `engine`. To test with it before it is merged, run
  `git fetch origin engine && git checkout origin/engine -- app/engine`, then unstage and restore those
  files before committing, so you never commit `app/engine/`. Once it is merged, rebase on main.
- The ui part builds against CONTRACT section 5, so keep the names and event shapes exactly as written. If
  you must deviate, update the PR description loudly.

## Tests

- **Node** (`node --test tests/audio/`):
  - the MIDI parser, against files from your writer: tempo changes, running status, format 0 and 1;
  - the GM map;
  - sequencer timing: event sample positions match the expected values at several tempos;
  - WAV encoding.
- **Playwright** (headless Chromium, `--autoplay-policy=no-user-gesture-required`): a small test page under
  `tests/audio/` that does `UDSAudio.create({ engine: 'mock' })`, then `start()`, then `hit()`. Check that:
  - `status` events arrive;
  - the analyser shows signal;
  - rhythm `step` events come at the right tempo;
  - a MIDI fixture plays.

  Then do the same with the real engine once it is available.
- Put the commands in your PR description.
