# Brief: ui

**Goal:** the panel. You own `app/index.html`, `app/ui/` and `app/assets/`. Build a Formanta-UDS-style
instrument for the virtual chip that works through the `UDSAudio` API (CONTRACT.md section 5) and exposes
the test hooks in section 6. `index.html` is a placeholder now; replace it.

## Look

- An homage to late-Soviet studio gear. Search the web for the Formanta UDS / «Форманта» УДС drum
  synthesizer to get its feel: a dark panel, knobs with skirt markings, Cyrillic labels, a no-nonsense
  layout.
- The design is our own. Do not copy logos or trademarks.
  - Title: "UDS-1x1".
  - Subtitle: "virtual chip · homage to the Formanta UDS".
- Labels are bilingual: Russian as the main label, English small underneath. Knob names come from
  `uds.knobs`: Тон, Диап., Длит., Баланс, Громк.
- Desktop first: it should look great at 1440×900 and work at 1280 and 1024. At 390 px wide it stacks, with
  no horizontal page scroll.
- Fonts are system fonts or a vendored OFL font (no CDNs). Keep assets small: CSS and inline SVG.

## Sections

1. **Header**
   - Title and a power button (`power`).
   - A first-run overlay "Включить / Power on": the AudioContext needs a click.
   - An engine badge: WASM backend name, or "mock".
   - The sim speed meter (`sim-speed`): MHz and times real time. Amber below 1.2x, red below 1.0x, with a
     hint that WAV export still works.
2. **8 channel strips**
   - Russian and English names.
   - 5 knobs.
   - A pad, which is also a big button.
   - An LED that flashes on `hit` events for that channel.
   - Double-clicking a knob resets it to its default.
3. **Autorhythm**
   - 18 pattern buttons: bank A 16 and bank B 2, with Russian and English names.
   - Start/stop (`rhythm-toggle`).
   - A tempo knob, 40 to 240, with a readout (`tempo`).
   - A step LED row that fits the pattern length (16, 24 or 32), driven by `step` events.
4. **MIDI**
   - A file input (`midi-file`) plus drag and drop of `.mid` onto the page.
   - Name, duration and position, play/stop (`midi-play`), loop, and a note about unmapped notes.
   - A live MIDI button (`midi-input`), a device list and an activity LED.
5. **Chip**
   - The 7-segment display (`display`, segments `seg-a`..`seg-g`), driven by bits 0..6 of `status.uoOut`.
   - LEDs for BUSY, CS and FRAME (FRAME glows steadily while running).
   - Cycle and frame counters, and the engine backend.
6. **Output**
   - Filter switch (`filter`: RC 15.9 kHz / warm 4 kHz / off) and master volume (`volume`).
   - An oscilloscope canvas fed by `uds.analyser`.
   - WAV export (`wav-export`): for example 8 bars of the current pattern via `renderWav`, with a busy state
     and a download.

## Controls

- Keyboard:
  - pads on keys 1..8, with hints shown on the pads;
  - space starts and stops the rhythm;
  - Esc is STOP.
- Knobs:
  - drag vertically, mouse wheel, arrow keys; Shift for fine steps;
  - `role="slider"` with aria values and a visible focus ring;
  - pointer events, so touch works too.
- Knob changes call `uds.setParams` live.

## Working without the other parts

- Write `app/ui/fake-audio.js`: the `UDSAudio` surface with no sound, simulated `status`, `hit` and `step`
  events, and the real channel and pattern data from `app/data/`. Use it with `?fake=1`.
- By default, load `../audio/uds-audio.js` with a dynamic import. It does not exist on your branch until the
  audio part is merged. If the import fails, fall back to the fake and show a small visible notice.
- `?engine=mock` passes `{ engine: 'mock' }` to `UDSAudio.create`.

## Tests

`tests/ui/`, Playwright with headless Chromium:
- Screenshots at 1440×900 and 390×844. Look at them and iterate on the design until it looks good.
- Every `data-testid` from CONTRACT section 6 exists.
- Knobs respond to keys and update `aria-valuenow`.
- Pads and keys 1..8 trigger hits (with the fake).
- The display shows the segments of `uoOut`.
- No console errors.

Put the screenshots in your PR description, committed under `docs/screenshots/ui/`.
