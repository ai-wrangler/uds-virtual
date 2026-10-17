#!/usr/bin/env bash
# Build the UDS-1x1 engine: chip/src/*.v -> app/engine/uds_engine.wasm
#
#   engine/build.sh [backend]      backend: gen (default) | verilator | cxxrtl | all
#
# Installs what it needs (yosys, verilator, zig via pip) if missing. The
# generated C++ (engine/gen/) and the .wasm files are committed, so the site
# and CI need no toolchain.
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$PWD
BACKEND=${1:-${UDS_BACKEND:-gen}}

need() {
  if ! command -v yosys >/dev/null || ! command -v verilator >/dev/null; then
    apt-get install -y yosys verilator || { apt-get update && apt-get install -y yosys verilator; }
  fi
  python3 -m ziglang version >/dev/null 2>&1 || pip install --break-system-packages ziglang
}
need

SRC="chip/src/project.v chip/src/uds_spi.v chip/src/uds_core.v"
mkdir -p engine/gen app/engine engine/wasm engine/build
ZIG="python3 -m ziglang c++ -target wasm32-wasi -mexec-model=reactor"
WFLAGS="-O3 -flto -fno-exceptions -fno-rtti -Wl,--no-entry -Wl,--strip-all -Wl,-z,stack-size=65536 -Wl,--initial-memory=1048576 -Wl,--max-memory=1048576"

build_cxxrtl() {
  yosys -q -p "read_verilog -sv $SRC; hierarchy -top tt_um_ai_wrangler_uds1x1; write_cxxrtl -O6 engine/gen/uds_chip_cxxrtl.cc"
  $ZIG $WFLAGS -std=c++17 -I engine -I engine/third_party/cxxrtl -DBACKEND_CXXRTL \
    engine/harness.cc -o engine/wasm/uds_engine_cxxrtl.wasm
}

YOSYS_NETLIST="read_verilog -sv $SRC; hierarchy -top tt_um_ai_wrangler_uds1x1; proc; flatten; opt -full; wreduce; opt_clean; memory; opt -full; opt_clean -purge"

build_gen() {
  yosys -q -p "$YOSYS_NETLIST; write_json engine/build/uds_netlist.json"
  python3 engine/gen.py engine/build/uds_netlist.json > engine/gen/uds_chip_gen.h
  $ZIG $WFLAGS -std=c++17 -I engine -DBACKEND_GEN engine/harness.cc -o engine/wasm/uds_engine_gen.wasm
}

case "$BACKEND" in
  cxxrtl) build_cxxrtl ;;
  gen) build_gen ;;
  all) build_cxxrtl; build_gen ;;
  *) echo "unknown backend $BACKEND"; exit 1 ;;
esac
SHIP=${UDS_SHIP:-gen}
[ "$BACKEND" = all ] || SHIP=$BACKEND
cp "engine/wasm/uds_engine_$SHIP.wasm" app/engine/uds_engine.wasm
ls -l app/engine/uds_engine.wasm
