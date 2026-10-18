#!/usr/bin/env bash
# Build the UDS-1x1 engine: chip/src/*.v -> app/engine/uds_engine.wasm
#
#   engine/build.sh [backend] [variant]
#     backend: gen (default) | cxxrtl | all
#     variant: base (default): chip/     -> engine/wasm/*.wasm,     app/engine/uds_engine.wasm
#              sd2:            chip-sd2/ -> engine/wasm/sd2/*.wasm, app/engine/uds_engine_sd2.wasm
#                              (2nd-order sigma-delta DAC preview, tt-uds-1x1 branch sd2)
#              v3:             chip-v3/  -> engine/wasm/v3/*.wasm,  app/engine/uds_engine_v3.wasm
#                              (UDS v3, ai-wrangler/tt-uds-v3; top tt_um_ai_wrangler_uds3; clock, frame
#                              and the free-running counters come from chip-v3/docs/v3/params.json and
#                              chip-v3/engine.json, the sources from chip-v3/info.yaml)
#     UDS_CHIP_DIR overrides the chip folder of a variant.
#
# Installs what it needs (yosys, verilator, zig via pip) if missing. The
# generated C++ (engine/gen/) and the .wasm files are committed, so the site
# and CI need no toolchain.
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$PWD
BACKEND=${1:-${UDS_BACKEND:-gen}}
VARIANT=${2:-${UDS_VARIANT:-base}}
case "$VARIANT" in
  base) CHIP=chip;     SFX="";     WDIR=engine/wasm;     OUT=app/engine/uds_engine.wasm ;;
  sd2)  CHIP=chip-sd2; SFX="_sd2"; WDIR=engine/wasm/sd2; OUT=app/engine/uds_engine_sd2.wasm ;;
  v3)   CHIP=chip-v3;  SFX="_v3";  WDIR=engine/wasm/v3;  OUT=app/engine/uds_engine_v3.wasm ;;
  *) echo "unknown variant $VARIANT"; exit 1 ;;
esac
CHIP=${UDS_CHIP_DIR:-$CHIP}
GEN_H=engine/gen/uds_chip_gen$SFX.h
CXXRTL_CC=engine/gen/uds_chip_cxxrtl$SFX.cc
# the base build keeps the header names compiled into backend_*.h (byte-identical output)
HDR=()
[ -z "$SFX" ] || HDR=("-DGEN_HEADER=\"gen/uds_chip_gen$SFX.h\"" "-DCXXRTL_SOURCE=\"gen/uds_chip_cxxrtl$SFX.cc\"")
# UDS_SINC3=1: the Audio Pmod model uses a sinc^3 decimator instead of the count of 1s per frame
# (harness.cc, AUDIO_SINC3; off in the shipped builds, see engine/README.md)
[ "${UDS_SINC3:-0}" != 1 ] || HDR+=("-DAUDIO_SINC3")

need() {
  if ! command -v yosys >/dev/null || ! command -v verilator >/dev/null; then
    apt-get install -y yosys verilator || { apt-get update && apt-get install -y yosys verilator; }
  fi
  python3 -m ziglang version >/dev/null 2>&1 || pip install --break-system-packages ziglang
}
need

TOP=tt_um_ai_wrangler_uds1x1
SRC="$CHIP/src/project.v $CHIP/src/uds_spi.v $CHIP/src/uds_core.v"
if [ "$VARIANT" = v3 ]; then
  # shape of the v3 chip: top module and sources from info.yaml, clock and frame from params.json,
  # free-running counters for gen.py's step_at (optional) from engine.json
  eval "$(python3 - "$CHIP" <<'PY'
import json, os, re, sys
d = sys.argv[1]
y = open(os.path.join(d, "info.yaml")).read()
top = re.search(r'^\s*top_module:\s*"?([\w]+)"?', y, re.M).group(1)
src = re.findall(r'^\s*-\s*"?([\w./-]+\.s?v)"?', y.split("source_files:", 1)[1].split("\n\n", 1)[0], re.M)
p = json.load(open(os.path.join(d, "docs/v3/params.json")))
e = {}
if os.path.exists(os.path.join(d, "engine.json")):
    e = json.load(open(os.path.join(d, "engine.json")))
phase = ";".join("%s=%s" % kv for kv in e.get("phase", {}).items())
print("TOP=%s" % top)
print("SRC='%s'" % " ".join(os.path.join(d, "src", f) for f in src))
print("V3_CLOCK=%d" % p["clockHz"])
print("V3_FRAME=%d" % p["frameClocks"])
print("export UDS_PHASE='%s'" % phase)
PY
)"
  export UDS_TOP=$TOP UDS_FRAME=$V3_FRAME
  HDR=("-DGEN_HEADER=\"gen/uds_chip_gen$SFX.h\"" "-DCXXRTL_SOURCE=\"gen/uds_chip_cxxrtl$SFX.cc\""
       "-DUDS_FRAME=$V3_FRAME" "-DUDS_CLOCK_HZ=$V3_CLOCK.0" "-DUDS_MSG_MAX=8" "-DUDS_EXPORT_SHAPE"
       "-DCXXRTL_TOP=p_$(echo "$TOP" | sed 's/_/__/g')")
  echo "v3: top $TOP, $V3_CLOCK Hz, $V3_FRAME clocks per frame, sources: $SRC"
fi
mkdir -p engine/gen app/engine "$WDIR" engine/build
ZIG="python3 -m ziglang c++ -target wasm32-wasi -mexec-model=reactor"
WFLAGS="-O3 -flto -fno-exceptions -fno-rtti -Wl,--no-entry -Wl,--strip-all -Wl,-z,stack-size=65536 -Wl,--initial-memory=1048576 -Wl,--max-memory=1048576"

build_cxxrtl() {
  yosys -q -p "read_verilog -sv $SRC; hierarchy -top $TOP; write_cxxrtl -O6 $CXXRTL_CC"
  $ZIG $WFLAGS -std=c++17 -I engine -I engine/third_party/cxxrtl -DBACKEND_CXXRTL ${HDR[@]+"${HDR[@]}"} \
    engine/harness.cc -o "$WDIR/uds_engine_cxxrtl.wasm"
}

YOSYS_NETLIST="read_verilog -sv $SRC; hierarchy -top $TOP; proc; flatten; opt -full; wreduce; opt_clean; memory; opt -full; opt_clean -purge"

build_gen() {
  yosys -q -p "$YOSYS_NETLIST; write_json engine/build/uds_netlist$SFX.json"
  python3 engine/gen.py engine/build/uds_netlist$SFX.json > "$GEN_H"
  $ZIG $WFLAGS -std=c++17 -I engine -DBACKEND_GEN ${HDR[@]+"${HDR[@]}"} engine/harness.cc -o "$WDIR/uds_engine_gen.wasm"
}

case "$BACKEND" in
  cxxrtl) build_cxxrtl ;;
  gen) build_gen ;;
  all) build_cxxrtl; build_gen ;;
  *) echo "unknown backend $BACKEND"; exit 1 ;;
esac
SHIP=${UDS_SHIP:-gen}
[ "$BACKEND" = all ] || SHIP=$BACKEND
cp "$WDIR/uds_engine_$SHIP.wasm" "$OUT"
ls -l "$OUT"
