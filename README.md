# UDS-1x1 Virtual

A virtual drum machine in the browser that runs the real chip. Knobs, pads, Autorhythm patterns, MIDI files
and live MIDI drive the Verilog of the [UDS-1x1](https://github.com/ai-wrangler/tt-uds-1x1) Tiny Tapeout chip,
simulated clock by clock at 6 MHz in WebAssembly. The chip's 1-bit sigma-delta audio pin goes through a model
of the Audio Pmod to your speakers.

UDS-1x1 is a digital homage to the Soviet Formanta UDS drum synthesizer: two voices, eight drums, SPI control.

Live site (once deployed): https://ai-wrangler.github.io/uds-virtual/

## Status

Being built now by four parallel sessions (engine, audio, ui, integrate). See [CONTRACT.md](CONTRACT.md) for
the parts and their interfaces, and [docs/briefs/](docs/briefs/) for each part's brief.

## Layout

| Path | What |
| --- | --- |
| `chip/` | the chip: Verilog, Python reference model, cocotb test (read-only copy of tt-uds-1x1 at ba09c49) |
| `engine/` | Verilog to WebAssembly: generated simulator, harness (virtual RP2040 and Audio Pmod), tests |
| `app/` | the site: `index.html`, `ui/`, `audio/`, `engine/`, `data/` |
| `tools/` | helper scripts, such as the pattern export |
| `tests/` | end-to-end and per-part tests |

## License

Apache-2.0. The vendored CXXRTL runtime headers in `engine/third_party/cxxrtl/` are ISC-licensed (Yosys).
