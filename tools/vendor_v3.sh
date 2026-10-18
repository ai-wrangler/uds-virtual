#!/usr/bin/env bash
# Vendor UDS v3 from ai-wrangler/tt-uds-v3 into chip-v3/, copy its params.json and kits into the site, build the
# v3 engine and run the v3 checks. Read-only on the chip repo (a clone).
#
#   tools/vendor_v3.sh [commit]     default: the head of main
#   UDS_V3_REPO=/path/to/clone      use a local clone instead of GitHub
#   UDS_V3_KITS_REF=origin/sound    take kits/ from another ref (default: the same commit)
#
# Steps:
#   1. chip-v3/ <- src/*.v, model/*.py, test/*.py + test/*.v, docs/info.md, docs/v3/{CONTRACT.md,params.json},
#      info.yaml (+ engine.json if the chip repo has one), README.md naming the commit;
#   2. app/engine/params_v3.json <- docs/v3/params.json; app/kits/ <- kits/*.json (with their note maps) and
#      kits/patterns/*.mid (index.json lists them, the panel's own init.json stays);
#   3. engine/build.sh all v3 (gen + CXXRTL);
#   4. engine/test/fixtures/model_frames_v3.json <- engine/test/make_fixture_v3.py (the vendored golden model);
#   5. node --test engine/test/v3_truth.test.mjs tests/audio/v3.test.mjs.
# It does not set "available": true in app/engine/builds.json: do that (and run the loudness match,
# node engine/test/loudness.mjs --write) only after V3-CHIP's RTL tests pass against the model.
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=${UDS_V3_REPO:-https://github.com/ai-wrangler/tt-uds-v3}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q "$REPO" "$TMP/chip"
if [ -n "${1:-}" ]; then git -C "$TMP/chip" checkout -q "$1"; fi
SHA=$(git -C "$TMP/chip" rev-parse HEAD)
SUBJ=$(git -C "$TMP/chip" log -1 --format=%s)
DATE=$(git -C "$TMP/chip" log -1 --format=%cI)
C="$TMP/chip"

rm -rf chip-v3
mkdir -p chip-v3/src chip-v3/model chip-v3/test chip-v3/docs/v3
cp "$C"/src/*.v chip-v3/src/
cp "$C"/model/*.py chip-v3/model/ 2>/dev/null || true
cp "$C"/test/*.py "$C"/test/*.v chip-v3/test/ 2>/dev/null || true
cp "$C"/docs/info.md chip-v3/docs/ 2>/dev/null || true
cp "$C"/docs/v3/CONTRACT.md "$C"/docs/v3/params.json chip-v3/docs/v3/
cp "$C"/info.yaml chip-v3/
[ -f "$C/engine.json" ] && cp "$C/engine.json" chip-v3/
[ -f "$C/docs/v3/engine.json" ] && cp "$C/docs/v3/engine.json" chip-v3/
cat > chip-v3/README.md <<EOF
# chip-v3: UDS v3 (preview, read-only)

Vendored from [ai-wrangler/tt-uds-v3](https://github.com/ai-wrangler/tt-uds-v3) \`main\` at commit
[\`${SHA:0:7}\`](https://github.com/ai-wrangler/tt-uds-v3/commit/${SHA}) ("${SUBJ}", ${DATE}) by \`tools/vendor_v3.sh\`.
Do not edit; re-run the script to update.

UDS v3 is the modern UDS: 8 channels, each with a fully editable sound sent with every HIT (the patch fields
are in \`docs/v3/CONTRACT.md\` and \`docs/v3/params.json\`). Top module \`tt_um_ai_wrangler_uds3\`. It is not
taped out. The site plays it when the Chip selector is on "v3 (modern, preview)".
\`engine.json\` (optional) names the free-running counters that engine/gen.py folds into its fast idle frame.
EOF
echo "chip-v3/ <- tt-uds-v3@${SHA:0:7} (${SUBJ})"

cp chip-v3/docs/v3/params.json app/engine/params_v3.json
KITS_SRC="$C/kits"
if [ -n "${UDS_V3_KITS_REF:-}" ]; then
  mkdir -p "$TMP/kits"
  git -C "$C" fetch -q origin "${UDS_V3_KITS_REF#origin/}" || true
  git -C "$C" archive "$UDS_V3_KITS_REF" kits 2>/dev/null | tar -x -C "$TMP/kits" && KITS_SRC="$TMP/kits/kits"
fi
if [ -d "$KITS_SRC" ]; then python3 tools/sync_v3_kits.py "$KITS_SRC" "tt-uds-v3@${SHA:0:7}"; fi

engine/build.sh all v3
python3 engine/test/make_fixture_v3.py          # the truth fixture, from the vendored golden model
python3 - "$SHA" <<'PY'
import json, sys
p = 'app/engine/builds.json'
b = json.load(open(p))
d = next(x for x in b['builds'] if x['id'] == 'v3')
d['commit'] = sys.argv[1][:7]
open(p, 'w').write(json.dumps(b, indent=2, ensure_ascii=False) + '\n')
PY
node --test engine/test/v3_truth.test.mjs tests/audio/v3.test.mjs
node engine/test/bench.mjs app/engine/uds_engine_v3.wasm
