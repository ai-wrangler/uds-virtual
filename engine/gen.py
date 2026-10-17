#!/usr/bin/env python3
"""Yosys write_json netlist -> straight-line C++ simulator ("gen" backend).

The netlist is flattened, word-level and single-clock (see build.sh for the
Yosys script). The output is one header with the state in plain integers and
one function, step(), that simulates one clock cycle:

  1. every combinational cell, in topological order, from the current state
     and the inputs;
  2. the outputs (so they are the pins during this cycle, before its edge);
  3. every flip-flop's next value, then the state is updated.

Signals up to 64 bits are uint64_t, wider ones (the 96-bit voice ring)
unsigned __int128. Undefined bits (x, z) are 0, the same as CXXRTL's
initial state; registers start at 0.

  python3 engine/gen.py netlist.json > engine/gen/uds_chip_gen.h
SPDX-License-Identifier: Apache-2.0
"""
import json
import re
import sys

TOP = "tt_um_ai_wrangler_uds1x1"
FRAME = 96
# t counts 0..47 within a voice window, v the window; both from 0 at cycle 0
PHASE_NETS = {"core.t": "uint64_t(P % 48)", "core.v": "uint64_t((P / 48) % 2)"}


def pint(v):
    return int(v, 2) if isinstance(v, str) else int(v)


def main(path):
    mod = json.load(open(path))["modules"][TOP]
    cells = mod["cells"]
    ports = mod["ports"]

    # every bit -> (variable, index)
    src = {}
    var_width = {}
    for pname, p in ports.items():
        if p["direction"] == "input":
            v = "in_" + pname
            var_width[v] = len(p["bits"])
            for i, b in enumerate(p["bits"]):
                if isinstance(b, int):
                    src[b] = (v, i)
    names = {}
    for k, (cname, c) in enumerate(cells.items()):
        ff = c["type"] in ("$dff", "$dffe", "$sdff", "$sdffe", "$sdffce")
        names[cname] = ("s.c%d" if ff else "c%d") % k     # registers live in State s
        for port, d in c["port_directions"].items():
            if d != "output":
                continue
            v = names[cname] if port in ("Y", "Q") else names[cname] + "_" + port
            var_width[v] = len(c["connections"][port])
            for i, b in enumerate(c["connections"][port]):
                src[b] = (v, i)

    def ctype(w):
        return "uint64_t" if w <= 64 else "u128"

    def mask(w):
        return "(~%s(0) >> %d)" % (ctype(w), (64 if w <= 64 else 128) - w) if w not in (64, 128) else "(~%s(0))" % ctype(w)

    def expr(bits, w=None):
        """C expression for a bit vector (LSB first), of type ctype(w)."""
        w = w or len(bits)
        T = ctype(max(w, len(bits)))
        parts = []
        const = 0
        i = 0
        n = len(bits)
        while i < n:
            b = bits[i]
            if not isinstance(b, int):
                if b == "1":
                    const |= 1 << i
                i += 1
                continue
            v, s = src[b]
            j = i + 1
            while j < n and isinstance(bits[j], int) and src[bits[j]] == (v, s + j - i):
                j += 1
            ln = j - i
            e = v
            if var_width[v] > 64 and T != "u128":
                e = "uint64_t(%s >> %d)" % (v, s)
                s = 0
            elif var_width[v] <= 64 and T == "u128":
                e = "u128(%s)" % v
            if s:
                e = "(%s >> %d)" % (e, s)
            if s + ln < var_width[v]:
                e = "(%s & %s)" % (e, ("%s(0x%x)" % (T, (1 << ln) - 1)) if ln <= 64 else mask(ln))
            if i:
                e = "(%s << %d)" % (e, i)
            parts.append(e)
            i = j
        if const or not parts:
            if const >> 64:
                parts.append("((u128(0x%x) << 64) | u128(0x%x))" % (const >> 64, const & ((1 << 64) - 1)))
            else:
                parts.append("%s(0x%x)" % (T, const))
        return parts[0] if len(parts) == 1 else "(" + " | ".join(parts) + ")"

    def sext(e, w_from, w_to):
        if w_from >= w_to:
            return e
        T = ctype(w_to)
        sh = (64 if w_to <= 64 else 128) - w_from
        st = "int64_t" if w_to <= 64 else "i128"
        return "(%s(%s(%s(%s) << %d) >> %d) & %s)" % (T, st, T, e, sh, sh, mask(w_to))

    def operand(c, port, w_to):
        bits = c["connections"][port]
        sgn = pint(c["parameters"].get(port + "_SIGNED", 0))
        e = expr(bits, max(w_to, len(bits)))
        if sgn:
            e = sext(e, len(bits), w_to)
        return e

    comb, ffs = [], []
    for cname, c in cells.items():
        (ffs if c["type"] in ("$dff", "$dffe", "$sdff", "$sdffe", "$sdffce") else comb).append(cname)

    # topological order of the combinational cells
    driver = {}
    for cname in comb:
        for port, d in cells[cname]["port_directions"].items():
            if d == "output":
                for b in cells[cname]["connections"][port]:
                    driver[b] = cname
    order, state = [], {}

    def visit(cname):
        if state.get(cname) == 2:
            return
        if state.get(cname) == 1:
            raise SystemExit("combinational loop at " + cname)
        state[cname] = 1
        c = cells[cname]
        for port, d in c["port_directions"].items():
            if d == "input":
                for b in c["connections"][port]:
                    if isinstance(b, int) and b in driver:
                        visit(driver[b])
        state[cname] = 2
        order.append(cname)

    for cname in comb:
        visit(cname)

    out = []
    w = out.append
    w("// Generated by engine/gen.py from the Yosys netlist of chip/src/*.v. Do not edit.")
    w("// SPDX-License-Identifier: Apache-2.0")
    w("#pragma once")
    w("#include <cstdint>")
    w("namespace gen {")
    w("typedef unsigned __int128 u128;")
    w("typedef __int128 i128;")
    for pname, p in ports.items():
        if p["direction"] == "input":
            w("uint64_t in_%s = 0;" % pname)
    w("struct State {")
    for pname, p in ports.items():
        if p["direction"] == "output":
            w("  uint64_t out_%s = 0;" % pname)
    netname = {}
    for nn, x in mod["netnames"].items():
        if not x["hide_name"]:
            netname.setdefault(tuple(x["bits"]), nn)
    for cname in ffs:
        n = names[cname]
        w("  %s %s = 0;  // %s %s" % (ctype(var_width[n]), n[2:], cells[cname]["type"],
                                     netname.get(tuple(cells[cname]["connections"]["Q"]), "")))
    w("};")
    w("State S;")
    # registers that are known per clock of the frame (the window counters)
    phase_regs = {}
    for nn, x in mod["netnames"].items():
        for cname in ffs:
            if x["bits"] == cells[cname]["connections"]["Q"] and nn in PHASE_NETS:
                phase_regs[names[cname]] = PHASE_NETS[nn]
    w("")
    body_start = len(out)
    w("__attribute__((always_inline)) inline void step(State &s) {")
    for cname in order:
        c = cells[cname]
        t = c["type"]
        n = names[cname]
        P = c["parameters"]
        yw = len(c["connections"]["Y"])
        T = ctype(yw)
        M = mask(yw)
        if t in ("$and", "$or", "$xor", "$add", "$sub", "$mul"):
            if t == "$mul" and yw > 64:
                raise SystemExit("wide multiply not supported")
            op = {"$and": "&", "$or": "|", "$xor": "^", "$add": "+", "$sub": "-", "$mul": "*"}[t]
            sg = pint(P["A_SIGNED"]) and pint(P["B_SIGNED"])
            a = operand(c, "A", yw) if sg else expr(c["connections"]["A"], yw)
            b = operand(c, "B", yw) if sg else expr(c["connections"]["B"], yw)
            e = "(%s(%s) %s %s(%s)) & %s" % (T, a, op, T, b, M)
        elif t == "$not":
            e = "~%s(%s) & %s" % (T, operand(c, "A", yw), M)
        elif t == "$xnor":
            sg = pint(P["A_SIGNED"]) and pint(P["B_SIGNED"])
            a = operand(c, "A", yw) if sg else expr(c["connections"]["A"], yw)
            b = operand(c, "B", yw) if sg else expr(c["connections"]["B"], yw)
            e = "~(%s(%s) ^ %s(%s)) & %s" % (T, a, T, b, M)
        elif t == "$neg":
            e = "(%s(0) - %s(%s)) & %s" % (T, T, operand(c, "A", yw), M)
        elif t == "$pos":
            e = "%s(%s) & %s" % (T, operand(c, "A", yw), M)
        elif t in ("$reduce_xor", "$reduce_xnor"):
            aw = len(c["connections"]["A"])
            pc = "__builtin_popcountll" if aw <= 64 else None
            if pc is None:
                raise SystemExit("wide reduce_xor not supported")
            e = "%s((%s(%s) & 1) %s)" % (T, pc, expr(c["connections"]["A"]), "^ 1" if t == "$reduce_xnor" else "")
        elif t in ("$gt", "$ge") or (t in ("$lt", "$le") and pint(P["A_SIGNED"]) and pint(P["B_SIGNED"])):
            aw, bw = len(c["connections"]["A"]), len(c["connections"]["B"])
            mw = max(aw, bw)
            sg = pint(P["A_SIGNED"]) and pint(P["B_SIGNED"])
            if sg:
                # sign-extend both to the full C type, then compare as signed integers
                FW = 64 if mw <= 64 else 128
                ST = "int64_t" if FW == 64 else "i128"
                a = "%s(%s)" % (ST, sext(expr(c["connections"]["A"], FW), aw, FW))
                b = "%s(%s)" % (ST, sext(expr(c["connections"]["B"], FW), bw, FW))
            else:
                CT = ctype(mw)
                a = "%s(%s)" % (CT, expr(c["connections"]["A"], mw))
                b = "%s(%s)" % (CT, expr(c["connections"]["B"], mw))
            op = {"$lt": "<", "$le": "<=", "$gt": ">", "$ge": ">="}[t]
            e = "%s(%s %s %s)" % (T, a, op, b)
        elif t in ("$eq", "$ne", "$lt", "$le"):
            aw, bw = len(c["connections"]["A"]), len(c["connections"]["B"])
            mw = max(aw, bw)
            sg = pint(P["A_SIGNED"]) and pint(P["B_SIGNED"])
            CT = ctype(mw)
            a = "%s(%s)" % (CT, sext(expr(c["connections"]["A"], mw), aw, mw) if sg else expr(c["connections"]["A"], mw))
            b = "%s(%s)" % (CT, sext(expr(c["connections"]["B"], mw), bw, mw) if sg else expr(c["connections"]["B"], mw))
            if sg and t in ("$lt", "$le"):
                raise SystemExit("signed compare not supported")
            op = {"$eq": "==", "$ne": "!=", "$lt": "<", "$le": "<="}[t]
            e = "%s(%s %s %s)" % (T, a, op, b)
        elif t in ("$logic_and", "$logic_or"):
            op = "&&" if t == "$logic_and" else "||"
            e = "%s((%s) != 0 %s (%s) != 0)" % (T, expr(c["connections"]["A"]), op, expr(c["connections"]["B"]))
        elif t == "$logic_not":
            e = "%s((%s) == 0)" % (T, expr(c["connections"]["A"]))
        elif t in ("$reduce_or", "$reduce_bool"):
            e = "%s((%s) != 0)" % (T, expr(c["connections"]["A"]))
        elif t == "$reduce_and":
            aw = len(c["connections"]["A"])
            e = "%s((%s) == %s)" % (T, expr(c["connections"]["A"]), mask(aw))
        elif t == "$mux":
            e = "(%s) ? %s(%s) : %s(%s)" % (expr(c["connections"]["S"]), T, expr(c["connections"]["B"]),
                                            T, expr(c["connections"]["A"]))
        elif t == "$pmux":
            wd = pint(P["WIDTH"])
            sw = pint(P["S_WIDTH"])
            S = c["connections"]["S"]
            B = c["connections"]["B"]
            e = "%s(%s)" % (T, expr(c["connections"]["A"]))
            # lowest set select bit wins (as CXXRTL); build from the highest down
            for i in reversed(range(sw)):
                e = "(%s) ? %s(%s) : %s" % (expr([S[i]]), T, expr(B[i * wd:(i + 1) * wd]), e)
        elif t in ("$shl", "$shr", "$shiftx"):
            if pint(P["B_SIGNED"]):
                raise SystemExit("signed shift amount not supported")
            aw = len(c["connections"]["A"])
            ww = max(aw, yw)
            if ww > 64:
                raise SystemExit("wide shift not supported")
            a = operand(c, "A", ww) if t != "$shiftx" else expr(c["connections"]["A"], ww)
            b = expr(c["connections"]["B"])
            op = "<<" if t == "$shl" else ">>"
            e = "(uint64_t(%s) < 64 ? (uint64_t(%s) %s uint64_t(%s)) : 0) & %s" % (b, a, op, b, M)
        elif t in ("$sshr", "$sshl"):
            if pint(P["B_SIGNED"]):
                raise SystemExit("signed shift amount not supported")
            aw = len(c["connections"]["A"])
            ww = max(aw, yw)
            if ww > 64:
                raise SystemExit("wide shift not supported")
            b = expr(c["connections"]["B"])
            if t == "$sshl":
                a = operand(c, "A", ww)
                e = "(uint64_t(%s) < 64 ? (uint64_t(%s) << uint64_t(%s)) : 0) & %s" % (b, a, b, M)
            elif pint(P["A_SIGNED"]):
                a = "int64_t(%s)" % sext(expr(c["connections"]["A"], 64), aw, 64)
                e = "uint64_t(%s >> (uint64_t(%s) < 63 ? uint64_t(%s) : 63)) & %s" % (a, b, b, M)
            else:
                a = expr(c["connections"]["A"], ww)
                e = "(uint64_t(%s) < 64 ? (uint64_t(%s) >> uint64_t(%s)) : 0) & %s" % (b, a, b, M)
        else:
            raise SystemExit("unsupported cell " + t)
        w("  const %s %s = %s;" % (T, n, e))
    for pname, p in ports.items():
        if p["direction"] == "output":
            w("  s.out_%s = %s;" % (pname, expr(p["bits"], 64)))
    nxt = []
    for cname in ffs:
        c = cells[cname]
        t = c["type"]
        n = names[cname]
        P = c["parameters"]
        clk = c["connections"]["CLK"]
        assert pint(P["CLK_POLARITY"]) == 1 and src[clk[0]] == ("in_clk", 0), cname
        wd = var_width[n]
        T = ctype(wd)
        d = "%s(%s)" % (T, expr(c["connections"]["D"], wd))
        e = d
        en = None
        if "EN" in c["connections"]:
            en = "((%s) %s 0)" % (expr(c["connections"]["EN"]), "!=" if pint(P["EN_POLARITY"]) else "==")
        if "SRST" in c["connections"]:
            sr = "((%s) %s 0)" % (expr(c["connections"]["SRST"]), "!=" if pint(P["SRST_POLARITY"]) else "==")
            rv = pint(P["SRST_VALUE"])
            rve = ("((u128(0x%x) << 64) | u128(0x%x))" % (rv >> 64, rv & ((1 << 64) - 1))) if wd > 64 else "%s(0x%x)" % (T, rv)
            if t == "$sdff":
                e = "%s ? %s : %s" % (sr, rve, d)
            elif t == "$sdffe":      # reset over enable
                e = "%s ? %s : (%s ? %s : %s)" % (sr, rve, en, d, n)
            else:                    # $sdffce: reset only when enabled
                e = "%s ? (%s ? %s : %s) : %s" % (en, sr, rve, d, n)
        elif en:
            e = "%s ? %s : %s" % (en, d, n)
        w("  const %s %s_next = %s;" % (T, n[2:], e))
        nxt.append(n)
    for n in nxt:
        w("  %s = %s_next;" % (n, n[2:]))
    w("}")
    w("inline void step() { step(S); }")
    body = out[body_start + 1:-2]
    # step_at<P, UIO>(): the same clock with the inputs of an idle SPI bus
    # (rst_n = 1, ui_in = 0, uio_in = UIO) and the window counters known:
    # P is the cycle number mod one frame. Only valid while the counters run
    # freely (any time after reset), which the harness guarantees.
    w("")
    w("// Window counters as functions of P = cycle mod %d: %s" % (FRAME, ", ".join(
        "%s = %s" % (k, v) for k, v in sorted(phase_regs.items()))))
    w("template <int P, int UIO> __attribute__((always_inline)) inline void step_at(State &s) {")
    w("  constexpr uint64_t in_rst_n = 1, in_ena = 1, in_ui_in = 0, in_clk = 1, in_uio_in = UIO;")
    w("  (void)in_rst_n; (void)in_ena; (void)in_ui_in; (void)in_clk; (void)in_uio_in;")
    for k, v in sorted(phase_regs.items()):
        w("  constexpr uint64_t %s_k = %s;" % (k[2:], v))
    for line in body:
        skip = False
        for k in phase_regs:
            if line.startswith("  const uint64_t %s_next =" % k[2:]) or line.startswith("  %s = %s_next;" % (k, k[2:])):
                skip = True
            line = re.sub(r"\bs\.%s\b" % k[2:], k[2:] + "_k", line)
        if not skip:
            w(line)
    w("}")
    w("}  // namespace gen")
    print("\n".join(out))


if __name__ == "__main__":
    main(sys.argv[1])
