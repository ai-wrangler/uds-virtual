# chip-v3: UDS v3 (preview, read-only)

Vendored from [ai-wrangler/tt-uds-v3](https://github.com/ai-wrangler/tt-uds-v3) `main` at commit
[`cb6f808`](https://github.com/ai-wrangler/tt-uds-v3/commit/cb6f8081791b7de55913f17b4c6e75f0a78d0602) ("v3: CONTRACT 1 + params.json, first bit-exact model (model/uds3_model.py)").
Do not edit; `tools/vendor_v3.sh` replaces this folder with the chip's RTL, model and docs once the RTL exists.

For now it holds V3-CHIP's golden model (`model/uds3_model.py`, CONTRACT 1) and the contract
(`docs/v3/CONTRACT.md`, `docs/v3/params.json`): `engine/test/make_fixture_v3.py` makes the v3 truth fixture
from the model, and `app/audio/mock-engine-v3.js` is a JavaScript port of the model, checked against it.
