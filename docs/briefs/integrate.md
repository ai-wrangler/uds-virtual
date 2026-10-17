# Brief: integrate

**Goal:** turn the three other parts into one working, deployed product by the end of the 3 hours, and prove
that it works. You own `.github/`, `tests/e2e/`, `README.md`, `CONTRACT.md` and the root `package.json`.
You are the only session that merges.

## 1. Right away: CI and the Pages deploy

- **`.github/workflows/pages.yml`**
  - Runs on push to `main` and on `workflow_dispatch`.
  - Uploads `app/` with `actions/upload-pages-artifact@v3` and deploys with `actions/deploy-pages@v4`.
  - Permissions: `pages: write` and `id-token: write`.
  - The deploy job needs `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`.
    The chip repo's deploy failed without it.
  - Add a concurrency group.
  - Juris set Pages to "GitHub Actions". Check with `gh api repos/ai-wrangler/uds-virtual/pages`. If Pages is
    not enabled, you cannot enable it: say so in your final report.
- **`.github/workflows/ci.yml`**, on pull requests and on main:
  - the Python model sanity check;
  - the engine Node tests, if `engine/test/` exists;
  - the audio and ui tests, if they exist;
  - the Playwright e2e tests against `python3 -m http.server -d app`.
- **Root `package.json`**
  - `@playwright/test` pinned to 1.56.x, the version installed here.
  - A `playwright.config` with Chromium flag `--autoplay-policy=no-user-gesture-required`.
  - In CI, run `npx playwright install --with-deps chromium`. Locally the browsers are already in
    `/opt/pw-browsers`; never run `playwright install` here.
- Get the deploy green on the placeholder `app/index.html` first: push `integrate`, open a PR, merge it, and
  watch the Actions run with `gh api repos/ai-wrangler/uds-virtual/actions/runs`.

## 2. End-to-end tests (`tests/e2e/`)

Write them now against CONTRACT section 6, so they run as soon as ui and audio land. Mark tests whose part is
missing as skipped, not failed. Cover:

- The page loads with no console errors.
- Power on gives `body[data-state=running]`.
- With `?engine=mock` and with the real engine:
  - a pad click brings a `hit` event, and analyser RMS rises above silence;
  - the rhythm starts, and `step` events come at the set tempo, within ±5%;
  - a MIDI fixture uploads through `midi-file` and plays;
  - filter and volume change the output;
  - the 7-segment display shows the channel last hit. Chip table: 0=0x3F, 1=0x06, 2=0x5B, 3=0x4F, 4=0x66,
    5=0x6D, 6=0x7D, 7=0x07; segments a..g = bits 0..6.
- `status.simHz` > 0, and the WAV export returns a non-silent WAV.
- **Real-engine truth test.** In the browser, run the engine API on the fixture HIT schedule from
  `engine/test/fixtures/model_frames.json`, which the engine part provides. Compare the per-frame counts with
  the model's.

## 3. The merge loop

Every 20 to 30 minutes, wake yourself with the `send_later` tool, then:

- List open PRs (`gh api repos/ai-wrangler/uds-virtual/pulls`), fetch their branches and run all tests
  locally.
- Merge what is ready and green with a squash merge:
  `gh api -X PUT repos/ai-wrangler/uds-virtual/pulls/<n>/merge -f merge_method=squash`.
  - Prefer engine and audio first, then ui.
  - A `[WIP]` PR may be merged if it is green and makes main better. The owner then rebases.
- Fix the glue between parts yourself.
  - Keep those fixes small: wiring, paths, event names.
  - Touch another part's files only for a one-line wiring fix, or once that session has finished. Note it in
    the PR.
- Keep CONTRACT.md accurate. When you change it, comment on the open PRs so the other sessions see it.
- Watch the Pages deploy after each merge.

## 4. Timeline (Riga time; the build starts about 21:15)

| Time | Milestone |
| --- | --- |
| ~21:45 | Pages live with the placeholder |
| ~22:30 | first real merges |
| ~23:45 | everything merged, e2e tests green |
| ~00:15 | final deploy, README and report |

If a part is late, ship what works. A deployed page with the mock engine and a clear note beats nothing. A
verified real engine is the core of the product.

## 5. Final

- **README.md**:
  - what it is, with the live link;
  - how to use it: power on, pads, knobs, patterns, MIDI file, live MIDI, WAV export;
  - the architecture as a small diagram: knobs → UDSAudio → Worker (Verilog → WASM engine) → AudioWorklet
    → speakers;
  - how it is verified;
  - measured simulation speed, and what to expect on a Ryzen 7 8845HS;
  - known gaps;
  - credits and licenses.
- Open the deployed site with Playwright and take screenshots: desktop 1440×900 and mobile 390×844. Commit
  them to `docs/screenshots/` and show them in the README.
- Post the final report as a comment on the last merged PR, and put it in the README's "Status" section.
  Cover:
  - the URL;
  - what works;
  - test results;
  - simulation speed;
  - known gaps;
  - what Juris should try first on his laptop.
