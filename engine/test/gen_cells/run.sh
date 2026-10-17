#!/usr/bin/env bash
# gen.py cell coverage test (needs yosys, iverilog and g++). cells.v uses word-level operators that the
# UDS-1x1 netlist does not use yet. It goes through gen.py (compiled natively) and through Icarus Verilog,
# and the pins must agree before every clock edge for N clocks of random inputs (default 200 000).
# Yosys 0.33 CXXRTL is compared too, for information only: it differs on this design (it gets a
# sign-extended `<<<` result wrong; Icarus and gen.py agree).
# SPDX-License-Identifier: Apache-2.0
set -euo pipefail
cd "$(dirname "$0")"
ROOT=../../..
N=${1:-200000}
B=$ROOT/engine/build/gen_cells; mkdir -p "$B"
yosys -q -p "read_verilog -sv cells.v; hierarchy -top tt_um_ai_wrangler_uds1x1; proc; flatten; opt -full; wreduce; opt_clean; memory; opt -full; opt_clean -purge; write_json $B/net.json"
yosys -q -p "read_verilog -sv cells.v; hierarchy -top tt_um_ai_wrangler_uds1x1; write_cxxrtl -O6 $B/cells_cxxrtl.cc"
python3 $ROOT/engine/gen.py "$B/net.json" > "$B/cells_gen.h"
python3 -c "import json,collections,sys; m=json.load(open(sys.argv[1]))['modules']['tt_um_ai_wrangler_uds1x1']; print('cells:', ' '.join('%s:%d' % kv for kv in sorted(collections.Counter(c['type'] for c in m['cells'].values()).items())))" "$B/net.json"
g++ -std=c++17 -O1 -I "$B" -I $ROOT/engine/third_party/cxxrtl driver.cc -o "$B/driver"
"$B/driver" "$N" > "$B/native.txt"
iverilog -g2012 -o "$B/tb" cells.v tb.v
# clock 0 is before the first edge: Icarus registers are still x there, so compare from clock 1
vvp -n "$B/tb" +N="$N" | grep -v '^VCD' | tail -n +2 > "$B/icarus.txt"
awk 'NR > 1 {print $1, $2}' "$B/native.txt" > "$B/gen.txt"
if cmp -s "$B/gen.txt" "$B/icarus.txt"; then echo "gen.py vs Icarus: $((N - 1)) clocks identical"; else
  echo "gen.py vs Icarus: MISMATCH"; diff "$B/gen.txt" "$B/icarus.txt" | head -5; exit 1; fi
awk '$2 != $3 {n++} END {print "gen.py vs CXXRTL (information): " (n+0) " of " NR " clocks differ"}' "$B/native.txt"
