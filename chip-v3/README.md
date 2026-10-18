# chip-v3: UDS v3 (preview, read-only)

Vendored from [ai-wrangler/tt-uds-v3](https://github.com/ai-wrangler/tt-uds-v3) `main` at commit
[`08ee452`](https://github.com/ai-wrangler/tt-uds-v3/commit/08ee45234c9f233cf3b6c258ffdd7427841d1412) ("Merge V3-SOUND kits re-tuned for CONTRACT 2 (PR #3)", 2026-10-18T14:30:12+03:00) by `tools/vendor_v3.sh`.
Do not edit; re-run the script to update.

UDS v3 is the modern UDS: 8 channels, each with a fully editable sound sent with every HIT (the patch fields
are in `docs/v3/CONTRACT.md` and `docs/v3/params.json`). Top module `tt_um_ai_wrangler_uds3`. It is not
taped out. The site plays it when the Chip selector is on "v3 (modern, preview)".
`engine.json` (optional) names the free-running counters that engine/gen.py folds into its fast idle frame.
