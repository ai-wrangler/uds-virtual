# chip-sd2: UDS-1x1 with the 2nd-order DAC (preview, read-only)

Vendored from [ai-wrangler/tt-uds-1x1](https://github.com/ai-wrangler/tt-uds-1x1) branch `sd2` at commit
[`48eb2d1`](https://github.com/ai-wrangler/tt-uds-1x1/commit/48eb2d114880c784a84c0cffb49072ffbe55571f) ("sd2: RTL and model ready (second-order sigma-delta DAC)", 2026-10-17T21:35:26+00:00) by `tools/vendor_sd2.sh`.
Do not edit; re-run the script to update.

This is a **proposed** chip change, not taped out: the first-order 1-bit sigma-delta audio DAC of the chip as
built (`chip/`) is replaced by a second-order one, so quiet decay tails no longer break into sparse clicks.
Its input scaling makes the output about 6 dB quieter; the site makes up for it with the make-up gain in
`app/engine/builds.json`. The site plays it when the Output section's DAC switch is on
"2nd order (preview)". Files: `src/*.v`, `model/*.py`, `docs/info.md` (and `info.yaml`).
