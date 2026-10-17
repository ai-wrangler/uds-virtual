# Rules for every build session

You are one of four Claude sessions building **UDS-1x1 Virtual** at the same time for Juris Vitols
(GitHub `ai-wrangler`, time zone Europe/Riga) at a hackathon. The four parts are engine, audio, ui and
integrate. The whole build has about 3 hours, from about 21:15 to 00:15 Riga time on 17 October 2026.
Work on your own: nobody will answer questions while you work. Make reasonable calls and record them in
your PR description.

**The product.** A web page, deployed to https://ai-wrangler.github.io/uds-virtual/, that is a virtual
drum machine styled after the Soviet Formanta UDS. It has knobs, pads, Autorhythm patterns, MIDI files and
live MIDI. These drive the real Verilog of the UDS-1x1 Tiny Tapeout chip, simulated clock by clock at
6 MHz in WebAssembly. The chip's 1-bit sigma-delta audio pin goes through a model of the Audio Pmod to the
laptop speakers. Juris tests it with Chrome or Edge on Windows 11, on a Ryzen 7 8845HS laptop.

## Setup

1. Attach the repository: call the `add_repo` tool with owner `ai-wrangler`, repo `uds-virtual` and access
   `push`. Then clone it exactly as the tool's response says.
2. Create your branch from `main`: `engine`, `audio`, `ui` or `integrate`.
3. Read `README.md`, `CONTRACT.md`, this file and your own brief in `docs/briefs/`. CONTRACT.md is the
   interface between the parts. It wins over anything else, including your brief.

## Rules

- Change only the files your part owns (CONTRACT.md section 1). If you need a change somewhere else, write
  it in your PR description.
- Never modify `ai-wrangler/tt-uds-1x1`, the chip repo. A read-only copy of the chip is in `chip/`.
- GitHub GraphQL is not available from these sessions, so `gh pr create` and similar commands fail. Use
  REST through `gh api`:
  - Create a PR: `gh api repos/ai-wrangler/uds-virtual/pulls -f head=<branch> -f base=main -f title=... -f body=...`
  - Update a PR: `gh api -X PATCH repos/ai-wrangler/uds-virtual/pulls/<n> -f body=...`
  - List PRs: `gh api repos/ai-wrangler/uds-virtual/pulls`
- Push early and often.
  - Open your PR within about 45 minutes, with the title `[WIP] <part>: ...`.
  - Keep a checklist in its description and update it at every push.
  - Remove `[WIP]` when your part is done.
  - Only the integration session merges.
- Before each push, run `git fetch origin main` and rebase on it.
- End commit messages and PR descriptions with the attribution lines your own session's instructions give
  you.
- Test what you build. Headless Chromium is available for Playwright: browsers are in `/opt/pw-browsers`,
  `PLAYWRIGHT_BROWSERS_PATH` is set and `npx playwright` 1.56 is installed. Do not run `playwright install`
  here.
- Finish with a last PR update covering:
  - what works;
  - how you tested it;
  - known gaps.

  That update is how the other sessions and Juris see your result.
