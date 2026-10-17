#!/usr/bin/env python3
"""Drive chip/model/uds_model.py from a schedule; print the per-frame 1s.

stdin:  JSON {"frames": N, "events": [{"frame": f, "kind": "hit"|"stop", "ch": c, "payload": [p, b2, b3]}]}
        an event with frame f is given to the model just before it steps frame f.
stdout: JSON {"counts": [...]} (N numbers, frame 0 first)

Alignment (from chip/test/test.py): a message whose last SCK rising edge is
driven in cycle X gives its pulse (hit_done / stop) on cycle X + 2, which the
chip acts on at the end of frame m = (X + 3) // FRAME; the model gets it
before stepping frame m + 1. See frame_for() below.
SPDX-License-Identifier: Apache-2.0
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "chip", "model"))
import uds_model as M  # noqa: E402

FRAME = M.frame_clks(2)


def frame_for(last_sck):
    pulse = last_sck + 2
    return (pulse + 1) // FRAME + 1


def run(sched):
    eng = M.Engine(2, check=True, triggers=False, status=False)
    before = {}
    for ev in sched["events"]:
        before.setdefault(ev["frame"], []).append(ev)
    out = []
    for f in range(sched["frames"]):
        for ev in before.get(f, ()):
            if ev["kind"] == "hit":
                eng.hit(ev["ch"], tuple(ev["payload"]))
            else:
                eng.stop()
        out.append(eng.step())
    return out


if __name__ == "__main__":
    sched = json.load(sys.stdin)
    json.dump({"counts": run(sched)}, sys.stdout)
