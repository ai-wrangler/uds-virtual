# chip-v3: UDS v3 (preview, read-only)

Vendored from [ai-wrangler/tt-uds-v3](https://github.com/ai-wrangler/tt-uds-v3) `main` at commit
[`7232722`](https://github.com/ai-wrangler/tt-uds-v3/commit/723272210ab1a1e01cacdf96dae4190ec60e8a9b) ("Merge V3-SOUND renders on baed8b7 and SOUND.md limits (PR #4)", 2026-10-18T14:52:58+03:00) by `tools/vendor_v3.sh`.
Do not edit; re-run the script to update.

UDS v3 is the modern UDS: 8 channels, each with a fully editable sound sent with every HIT (the patch fields
are in `docs/v3/CONTRACT.md` and `docs/v3/params.json`). Top module `tt_um_ai_wrangler_uds3`. It is not
taped out. The site plays it when the Chip selector is on "v3 (modern, preview)".
`engine.json` (optional) names the free-running counters that engine/gen.py folds into its fast idle frame.
