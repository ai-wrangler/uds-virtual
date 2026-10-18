#!/usr/bin/env python3
"""v3 truth fixture from V3-CHIP's bit-exact model (chip-v3/model/uds3_model.py, or the folder given).

  python3 engine/test/make_fixture_v3.py [chip dir] [out.json]

A schedule of HITs and STOPs (every channel, parameter corners, voice stealing, the hi-hat choke, random
traffic) goes through the model's run(): messages are queued at the start of their frame and the model's
standard Host sends them (one byte per window, BUSY wait after every HIT byte), the same host the engine's
harness implements for v3 (UDS_HOST_WINDOW). Output: { frames, events: [{ frame, bytes }], counts, crc, regs }.
SPDX-License-Identifier: Apache-2.0
"""
import json
import os
import random
import sys

chip = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '../../chip-v3')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'fixtures/model_frames_v3.json')
sys.path.insert(0, os.path.join(chip, 'model'))
import uds3_model as M  # noqa: E402

params = json.load(open(os.path.join(chip, 'docs/v3/params.json')))
ids = [p['id'] for p in params['params']]
model_ids = {'bendtime': 'btime'}


def patch(**kw):
    p = {p['id']: p['default'] for p in params['params']}
    p.update(kw)
    p['res'] = 0
    return p


def to_model(p):
    return {model_ids.get(k, k): v for k, v in p.items()}


r = random.Random(11)
hits, stops = [], []
f = 4
for ch in range(8):                                   # every channel, plain
    hits.append((f, ch, patch(pitch=40 + ch * 25, decay=6, level=15, mix=ch, wave=ch & 3, color=(ch >> 1) & 3)))
    f += 700
for mode in range(4):                                 # envelope modes, bend, aux time, click
    for bt in (0, 3, 7):
        hits.append((f, 4, patch(pitch=30, decay=8, level=14, bend=3, bendtime=bt, mode=mode, mix=4, click=mode & 1)))
        f += 600
for lv in (0, 1, 15):
    hits.append((f, 0, patch(level=lv, decay=13, mix=7, color=2)))
    f += 400
stops.append(f)
f += 50
hits += [(f, 4, patch(decay=11)), (f + 3, 0, patch(decay=11, mix=5)), (f + 6, 5, patch(decay=11, wave=3))]   # stealing
f += 2000
hits += [(f, 6, patch(decay=12, mix=7)), (f + 200, 7, patch(decay=12, mix=7)), (f + 400, 6, patch(decay=4, mix=7))]   # choke
f += 1500
stops += [f, f + 1]
f += 100
while f < 40000:                                      # random traffic
    p = {q['id']: r.randint(q['min'], q['max']) for q in params['params']}
    p['res'] = 0
    hits.append((f, r.randrange(8), p))
    if r.random() < 0.05:
        stops.append(f + r.randrange(3))
    f += r.choice((0, 1, 2, 3, 5, 9, 17, 40, 120, 300))
frames = f + 3000

bits, evlog = M.run([(fr, ch, to_model(p)) for fr, ch, p in hits], frames, stops)
counts = M.frame_counts(bits)
events = [{'frame': fr, 'bytes': list(M.hit_message(ch, to_model(p)))} for fr, ch, p in hits]
events += [{'frame': fr, 'bytes': [0x40]} for fr in stops]
# the same order as the model's queue: by frame, HITs before STOPs as in run()
events.sort(key=lambda e: (e['frame'], e['bytes'][0] == 0x40))
fx = {'chip': os.path.basename(os.path.abspath(chip)), 'contract': params['contract'], 'clockHz': params['clockHz'],
      'frameClocks': params['frameClocks'], 'frames': len(counts), 'events': events, 'counts': counts,
      'crc': M.crc(bits), 'regs': {'id': M.CHIP_ID, 'version': M.VERSION}}
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
json.dump(fx, open(out, 'w'), separators=(',', ':'))
print('%s: %d frames, %d messages, crc %08x' % (out, len(counts), len(events), fx['crc']))
