#!/usr/bin/env python3
"""Copy V3-SOUND's kits (tt-uds-v3 kits/*.json with their note maps, kits/patterns/*.mid) into app/kits/ and
rewrite app/kits/index.json. The panel's own init.json stays, listed last; V3-SOUND's "default" kit (or the
first one) becomes the default.

  python3 tools/sync_v3_kits.py <kits dir> <source label, e.g. tt-uds-v3@abc1234>
SPDX-License-Identifier: Apache-2.0
"""
import json
import os
import shutil
import sys

src, label = sys.argv[1], sys.argv[2]
dst = 'app/kits'
for f in os.listdir(dst):
    if f.endswith('.json') and f not in ('init.json', 'index.json'):
        os.remove(os.path.join(dst, f))
shutil.rmtree(os.path.join(dst, 'patterns'), ignore_errors=True)
for f in sorted(os.listdir(src)):
    if f.endswith('.json') and f not in ('index.json', 'init.json'):
        shutil.copy(os.path.join(src, f), dst)
if os.path.isdir(os.path.join(src, 'patterns')):
    os.makedirs(os.path.join(dst, 'patterns'))
    for f in sorted(os.listdir(os.path.join(src, 'patterns'))):
        if f.lower().endswith(('.mid', '.midi')):
            shutil.copy(os.path.join(src, 'patterns', f), os.path.join(dst, 'patterns'))
kits = []
for f in sorted(os.listdir(dst)):
    if not f.endswith('.json') or f == 'index.json':
        continue
    k = json.load(open(os.path.join(dst, f)))
    if 'channels' not in k:
        continue
    e = {"id": k.get("id", f[:-5]), "file": f, "name": k.get("name", f[:-5]), "inspiredBy": k.get("inspiredBy", ""),
         "source": "uds-virtual" if f == "init.json" else label}
    if k.get("pattern") and os.path.exists(os.path.join(dst, k["pattern"])):
        e["pattern"] = k["pattern"]
    kits.append(e)
kits.sort(key=lambda k: (k["file"] == "init.json", k["id"] != "default", k["name"].lower()))
idx = json.load(open(os.path.join(dst, 'index.json')))
idx["kits"] = kits
idx["default"] = kits[0]["id"]
open(os.path.join(dst, 'index.json'), 'w').write(json.dumps(idx, indent=2, ensure_ascii=False) + "\n")
print("app/kits:", ", ".join(k["id"] for k in kits), "(default %s)" % idx["default"])
