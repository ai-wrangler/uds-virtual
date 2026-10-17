# chip/ (read-only)

A copy of the UDS-1x1 chip from [ai-wrangler/tt-uds-1x1](https://github.com/ai-wrangler/tt-uds-1x1) at commit
`ba09c49824720e01876be2ed6d302beacec69d21` (the 1x1 tile, 2 voices, 6 MHz), the build that goes to tapeout.

| Path | What |
| --- | --- |
| `src/project.v`, `src/uds_spi.v`, `src/uds_core.v` | the RTL (top module `tt_um_ai_wrangler_uds1x1`, `VOICES = 2`, `TRIGGERS = 0`, `STATUS = 0`) |
| `model/uds_model.py` | the reference model; the chip matches it frame by frame (RTL and gate level) |
| `model/uds_patterns.py` | the Autorhythm patterns |
| `test/test.py`, `test/tb.v`, `test/Makefile` | the cocotb test: shows how SPI timing maps to model frames |
| `docs/info.md`, `info.yaml` | the datasheet and pinout |

Do not edit these files here. Changes to the chip happen in tt-uds-1x1 and are copied over.
