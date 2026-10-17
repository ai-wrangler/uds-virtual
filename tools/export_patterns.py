#!/usr/bin/env python3
"""Export the chip's Autorhythm patterns and channel presets for the web app.

Reads chip/model/uds_patterns.py and chip/model/uds_model.py (vendored from
ai-wrangler/tt-uds-1x1) and writes app/data/patterns.json and app/data/channels.json.

    python3 tools/export_patterns.py

SPDX-License-Identifier: Apache-2.0
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "chip", "model"))

import uds_model as M      # noqa: E402
import uds_patterns as U   # noqa: E402

CHANNELS = [
    # ch, id, English name, Russian name, short Russian label (as in the UDS manual's score)
    (0, "snare", "Snare", "Малый барабан", "МБ"),
    (1, "small-tom", "Small tom", "Малый том", "МТ"),
    (2, "middle-tom", "Middle tom", "Средний том", "СТ"),
    (3, "big-tom", "Big tom", "Большой том", "БТ"),
    (4, "bass-drum", "Bass drum", "Большой барабан", "ББ"),
    (5, "cymbal", "Cymbal", "Тарелка", "Т"),
    (6, "hihat-closed", "Closed hi-hat", "Хай-хэт закрытый", "ХХ"),
    (7, "hihat-open", "Open hi-hat", "Хай-хэт открытый", "ХХ о"),
]

KNOBS = [
    # key, English label, Russian label, min, max, note
    ("pitch", "Pitch", "Тон", 0, 255, "8-bit exponential pitch, 32 steps per octave"),
    ("sweep", "Sweep", "Диап.", 0, 7, "pitch sweep depth (bit 3 of the nibble is reserved, always 0)"),
    ("decay", "Decay", "Длит.", 0, 13, "envelope steps every 2^decay frames; the chip treats 14 and 15 as 13"),
    ("balance", "Tone/noise", "Баланс", 0, 15, "0 = all tone ... 15 = almost all noise"),
    ("level", "Level", "Громк.", 0, 15, "0 = silent"),
]


def export():
    data_dir = os.path.join(ROOT, "app", "data")
    os.makedirs(data_dir, exist_ok=True)

    channels = []
    for ch, cid, name, name_ru, short_ru in CHANNELS:
        pitch, sweep, decay, balance, level = M.PRESETS[ch]
        channels.append({
            "ch": ch, "id": cid, "name": name, "nameRu": name_ru, "shortRu": short_ru,
            "group": M.group(ch),
            "params": {"pitch": pitch, "sweep": sweep, "decay": decay, "balance": balance, "level": level},
        })
    knobs = [{"key": k, "label": l, "labelRu": r, "min": lo, "max": hi, "note": n}
             for k, l, r, lo, hi, n in KNOBS]
    with open(os.path.join(data_dir, "channels.json"), "w", encoding="utf-8") as f:
        json.dump({
            "source": "chip/model/uds_model.py PRESETS (ai-wrangler/tt-uds-1x1)",
            "accentLevelDrop": M.ACCENT_LEVEL_DROP,
            "channels": channels, "knobs": knobs,
        }, f, ensure_ascii=False, indent=1)

    patterns = []
    for bank_name, bank in (("A", U.PATTERNS), ("B", U.BANK_B)):
        for i, pat in enumerate(bank):
            patterns.append({
                "id": f"{bank_name}{i}", "bank": bank_name, "index": i,
                "name": pat["name"], "nameRu": pat["name_ru"], "meter": pat["meter"],
                "stepsPerBeat": pat["steps_per_beat"], "bpm": pat["bpm"],
                "length": U.length(i, bank),
                # bit n of a step = trigger channel n (0 snare ... 7 open hi-hat)
                "steps": U.steps(i, bank),
                # bit n of an accent = channel n is accented on this step; on a channel that has
                # any accent, unaccented hits play accentLevelDrop softer (see channels.json)
                "accents": U.accents(i, bank),
                "notes": pat["notes"],
            })
    with open(os.path.join(data_dir, "patterns.json"), "w", encoding="utf-8") as f:
        json.dump({
            "source": "chip/model/uds_patterns.py (ai-wrangler/tt-uds-1x1); bank A = the 16 original "
                      "Autorhythm patterns from the Rokton/Formanta UDS manual, bank B = additions",
            "stepSeconds": "60 / (bpm * stepsPerBeat)",
            "patterns": patterns,
        }, f, ensure_ascii=False, indent=1)
    return len(channels), len(patterns)


if __name__ == "__main__":
    n_ch, n_pat = export()
    print(f"wrote app/data/channels.json ({n_ch} channels) and app/data/patterns.json ({n_pat} patterns)")
