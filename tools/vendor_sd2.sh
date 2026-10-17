#!/usr/bin/env bash
# Vendor the 2nd-order DAC preview from ai-wrangler/tt-uds-1x1 branch sd2 into chip-sd2/, build it and
# verify it. Read-only on the chip repo (a shallow clone).
#
#   tools/vendor_sd2.sh [commit]     default: the head of branch sd2
#
# Steps: copy src/*.v, model/*.py, docs/info.md (+ info.yaml); write chip-sd2/README.md with the commit;
# engine/build.sh all sd2; the sd2 fixture; the loudness match (gain into app/engine/builds.json, with the
# commit and available: true); then node --test engine/test (model check, fixture, cross-check).
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=https://github.com/ai-wrangler/tt-uds-1x1
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git clone -q --branch sd2 --single-branch "$REPO" "$TMP/chip"
if [ -n "${1:-}" ]; then git -C "$TMP/chip" checkout -q "$1"; fi
SHA=$(git -C "$TMP/chip" rev-parse HEAD)
SUBJ=$(git -C "$TMP/chip" log -1 --format=%s)
DATE=$(git -C "$TMP/chip" log -1 --format=%cI)
rm -rf chip-sd2
mkdir -p chip-sd2/src chip-sd2/model chip-sd2/docs
cp "$TMP"/chip/src/*.v chip-sd2/src/
cp "$TMP"/chip/model/*.py chip-sd2/model/
cp "$TMP"/chip/docs/info.md chip-sd2/docs/
[ -f "$TMP/chip/info.yaml" ] && cp "$TMP/chip/info.yaml" chip-sd2/
cat > chip-sd2/README.md <<EOF
# chip-sd2: UDS-1x1 with the 2nd-order DAC (preview, read-only)

Vendored from [ai-wrangler/tt-uds-1x1](${REPO}) branch \`sd2\` at commit
[\`${SHA:0:7}\`](${REPO}/commit/${SHA}) ("${SUBJ}", ${DATE}) by \`tools/vendor_sd2.sh\`.
Do not edit; re-run the script to update.

This is a **proposed** chip change, not taped out: the first-order 1-bit sigma-delta audio DAC of the chip as
built (\`chip/\`) is replaced by a second-order one, so quiet decay tails no longer break into sparse clicks.
Its input scaling makes the output about 6 dB quieter; the site makes up for it with the make-up gain in
\`app/engine/builds.json\`. The site plays it when the Output section's DAC switch is on
"2nd order (preview)". Files: \`src/*.v\`, \`model/*.py\`, \`docs/info.md\` (and \`info.yaml\`).
EOF
echo "chip-sd2/ <- tt-uds-1x1@${SHA:0:7} (${SUBJ})"
engine/build.sh all sd2
node engine/test/make_fixture.mjs sd2
python3 - "$SHA" <<'PY'
import json, sys
p = 'app/engine/builds.json'
b = json.load(open(p))
d = next(x for x in b['builds'] if x['id'] == '2nd')
d['commit'] = sys.argv[1][:7]
d['available'] = True
open(p, 'w').write(json.dumps(b, indent=2) + '\n')
PY
node engine/test/loudness.mjs --write
node --test engine/test/*.test.mjs
