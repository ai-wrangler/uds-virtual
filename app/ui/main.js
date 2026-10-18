// main.js — the UDS-1x1 panel. Talks only to the UDSAudio API (CONTRACT.md section 5).
import { createKnob } from './knob.js';
import { loadStored, storeSlot, forgetSlot, forgetAll, storeSelection, bytesFromB64 } from './slot-store.js';
import { loadPatches, storePatches } from './patch-store.js';
import { createEditor } from './editor.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const SEG = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
// pad labels by chip channel: snare, small (high) tom, middle tom, big (low) tom, bass drum, cymbal, hats
const PAD_SHORT = ['SD', 'HT', 'MT', 'LT', 'BD', 'CY', 'CH', 'OH'];
const SLOTS = 16;
const DAC_KEY = 'uds-virtual.dac.v1';   // the engine build ('1st' | '2nd' | 'v3'); the Chip selector's choice
// the Chip selector: chip version <-> engine build id (builds.json); ?chip=v1|v2|v3, ?dac=1st|2nd (alias)
const CHIP_BUILD = { v1: '1st', v2: '2nd', v3: 'v3' };
const BUILD_CHIP = { '1st': 'v1', '2nd': 'v2', v3: 'v3' };
function storedDac() {
  try { return localStorage.getItem(DAC_KEY); } catch { return null; }
}
function storeDac(v) {
  try { localStorage.setItem(DAC_KEY, v); } catch { /* storage blocked: the choice lasts for this page */ }
}

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function lbl(text, sub) {
  const f = document.createDocumentFragment();
  f.append(h('span', 'lb', text));
  if (sub) f.append(h('small', null, sub));
  return f;
}
const fmtTime = (s) => {
  s = Math.max(0, s || 0);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const fmtBig = (n) => Math.round(n || 0).toLocaleString('en-US').replace(/,/g, ' ');

let toastTimer;
function toast(msg, kind = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast ' + kind;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 5000);
}

async function loadAudio() {
  const opts = {};
  if (params.get('engine') === 'mock') opts.engine = 'mock';
  // ?v3=mock: the v3 entry plays the mock v3 synth until the real v3 engine is built (development, tests)
  if (params.get('v3') === 'mock') opts.v3Mock = true;
  // ?chip=v1|v2|v3 or ?dac=1st|2nd override the stored choice
  const want = CHIP_BUILD[params.get('chip')] || params.get('dac') || storedDac();
  if (want === '1st' || want === '2nd' || want === 'v3') opts.dac = want;
  if (params.get('fake') === '1') {
    const { FakeUDSAudio } = await import('./fake-audio.js');
    return { uds: await FakeUDSAudio.create(opts), fake: true, why: '?fake=1' };
  }
  try {
    const mod = await import('../audio/uds-audio.js');
    return { uds: await mod.UDSAudio.create(opts), fake: false };
  } catch (err) {
    console.warn('UDSAudio unavailable, using the fake:', err);
    const { FakeUDSAudio } = await import('./fake-audio.js');
    return { uds: await FakeUDSAudio.create(opts), fake: true, why: 'audio module not available', err };
  }
}

async function main() {
  // the tempo control does not depend on the data, so it exists before UDSAudio is created
  const tempoKnob = createKnob({
    min: 40, max: 240, value: 120, def: 120, step: 2, testid: 'tempo',
    label: 'Tempo', ariaLabel: 'Tempo (BPM)', className: 'knob-tempo',
    format: (v) => `${v}`,
    onChange: (v) => { window.uds?.setTempo(v); $('tempo-read').textContent = v; },
  });
  const tb = $('tempo-box');
  tb.appendChild(tempoKnob.el);
  const tr = h('div', 'tempo-read');
  const trv = h('output', null, '120');
  trv.id = 'tempo-read';
  tr.append(trv, h('small', null, 'BPM'));
  tb.appendChild(tr);

  const { uds, fake, why } = await loadAudio();
  window.uds = uds;
  const body = document.body;
  body.dataset.state = uds.state;

  if (fake) {
    const n = $('notice');
    n.hidden = false;
    n.textContent = why === '?fake=1'
      ? 'Silent demo: fake audio (?fake=1), no sound, simulated chip status.'
      : 'No sound: the audio module could not be loaded, so this is the silent fake. Check the console.';
  }

  // ---------------- header ----------------
  const backendName = () => (fake ? 'fake' : uds.info?.mock ? 'mock' : uds.info?.backend || '—');
  const showBackend = () => {
    const b = backendName();
    $('engine-name').textContent = b === 'fake' ? 'fake · no sound' : b;
    $('engine-badge').classList.toggle('is-mock', b === 'mock' || b === 'fake');
    $('cnt-backend').textContent = b;
  };
  showBackend();

  const overlay = $('overlay');
  async function power() {
    if (uds.state === 'running') { await uds.suspend(); return; }
    if (uds.state === 'starting') return;
    try {
      await uds.start();
      overlay.hidden = true;
    } catch (err) {
      console.warn(err);
      toast('Could not start audio: ' + (err?.message || err), 'bad');
      overlay.hidden = true;
    }
  }
  $('power').addEventListener('click', power);
  $('overlay-btn').addEventListener('click', power);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) power(); });

  function onState() {
    const s = uds.state;
    body.dataset.state = s;
    $('power').setAttribute('aria-pressed', String(s === 'running'));
    if (s === 'running') overlay.hidden = true;
    showBackend();
    if (s !== 'running') clearLeds();
    if (s === 'error') toast('Audio error; WAV export may still work', 'bad');
  }
  uds.addEventListener('state', onState);

  // ---------------- channel strips (generated from the selected build's parameters) ----------------
  const strips = $('strips');
  let knobs = {};   // knobs[ch][key]: the strip knobs
  const stripLeds = [];
  const pads = [];
  const stripEls = [];
  let selCh = 4;    // the channel the editor shows (v3)
  const isEditorBuild = () => !!(uds.currentBuild && uds.currentBuild.editor);
  // the strip shows these parameters: all of them for v1/v2 (5 knobs), the build's "strip" list for v3
  function stripKnobs() {
    const all = uds.knobs;
    const pick = uds.currentBuild?.strip;
    return pick ? pick.map((id) => all.find((k) => k.key === id)).filter(Boolean) : all;
  }
  function buildStrips() {
    strips.textContent = '';
    knobs = {};
    stripEls.length = 0;
    const list = stripKnobs();
    strips.style.setProperty('--nk', String(list.length));
    strips.classList.toggle('has-editor', isEditorBuild());
    const legend = h('div', 'legend');
    legend.appendChild(h('div', 'legend-head'));
    for (const k of list) {
      const row = h('div', 'legend-row');
      row.append(h('span', 'lb', k.label));
      row.title = k.note || '';
      legend.appendChild(row);
    }
    legend.appendChild(h('div', 'legend-pad'));
    strips.appendChild(legend);
    const editable = isEditorBuild();
    for (const c of uds.channels) {
      const strip = h('div', 'strip');
      strip.dataset.ch = c.ch;
      const head = h('div', 'strip-head');
      const led = h('i', 'led led-red strip-led');
      stripLeds[c.ch] = led;
      const num = h('span', 'strip-num', String(c.ch + 1));
      num.title = `Pad ${c.ch + 1} (key ${c.ch + 1}) = chip channel ${c.ch}`;
      const names = h('div', 'strip-names');
      const chTag = h('small', 'strip-ch', `ch ${c.ch}`);
      chTag.title = `Chip channel ${c.ch}: the 7-segment display shows ${c.ch} when this pad plays`;
      names.append(h('span', 'lb', c.name), chTag);
      head.append(num, names, led);
      if (editable) {
        // v3: the head selects the channel for the sound editor
        head.classList.add('strip-sel');
        head.tabIndex = 0;
        head.setAttribute('role', 'button');
        head.dataset.testid = `strip-sel-${c.ch}`;
        head.setAttribute('aria-label', `Edit the sound of channel ${c.ch}, ${c.name}`);
        head.title = `${c.name}: click to edit its sound below`;
        head.addEventListener('click', () => selectChannel(c.ch));
        head.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); selectChannel(c.ch); } });
        strip.classList.toggle('sel', c.ch === selCh);
      }
      strip.appendChild(head);
      knobs[c.ch] = {};
      const cur = uds.getParams(c.ch);
      const kb = h('div', 'strip-knobs');
      for (const k of list) {
        const knob = createKnob({
          min: k.min, max: k.max, value: cur[k.key], def: c.params[k.key],
          label: k.label, testid: `knob-${c.ch}-${k.key}`,
          ariaLabel: `${c.name} ${k.label}`, title: `${c.name} ${k.label}: ${k.note || ''}\nDouble-click: default (${c.params[k.key]})`,
          onChange: (v) => { uds.setParams(c.ch, { [k.key]: v }); if (c.ch === selCh) editor.refresh(); },
        });
        knobs[c.ch][k.key] = knob;
        kb.appendChild(knob.el);
      }
      strip.appendChild(kb);
      const pad = h('button', 'pad');
      pad.type = 'button';
      pad.dataset.testid = `pad-${c.ch}`;
      pad.setAttribute('aria-label', `${c.name} pad (key ${c.ch + 1}, chip channel ${c.ch})`);
      pad.title = `${c.name} · key ${c.ch + 1} · chip channel ${c.ch}`;
      pad.append(h('span', 'pad-short', editable ? shortName(c.name, c.ch) : PAD_SHORT[c.ch] || c.name.slice(0, 2).toUpperCase()), h('kbd', 'pad-key', String(c.ch + 1)));
      pad.addEventListener('pointerdown', (e) => { if (e.button === 0) { e.preventDefault(); padHit(c.ch); } });
      pad.addEventListener('click', (e) => { if (e.detail === 0) padHit(c.ch); }); // keyboard activation
      pads[c.ch] = pad;
      strip.appendChild(pad);
      stripEls[c.ch] = strip;
      strips.appendChild(strip);
    }
    const resetBtn = h('button', 'btn btn-small reset-all');
    resetBtn.type = 'button';
    resetBtn.append(lbl('Reset', editable ? 'kit' : 'knobs'));
    if (editable) resetBtn.title = 'All 8 channels back to the patches of the current kit';
    resetBtn.addEventListener('click', () => {
      uds.resetParams();
      syncKnobs();
      editor.refresh();
    });
    legend.appendChild(resetBtn);
  }
  // pad label of a v3 channel: the kit's name for it, shortened
  function shortName(name, ch) {
    const w = String(name || '').trim().split(/[\s/-]+/).filter(Boolean);
    if (!w.length) return String(ch + 1);
    if (w.length === 1) return (w[0].length <= 4 ? w[0] : w[0].slice(0, 3)).toUpperCase();
    return w.slice(0, 3).map((x) => x[0]).join('').toUpperCase();
  }
  // strip knobs <- the patches (after a reset, a kit or a chip switch)
  function syncKnobs() {
    for (const c of uds.channels) {
      const p = uds.getParams(c.ch);
      for (const k of stripKnobs()) knobs[c.ch]?.[k.key]?.set(p[k.key], false);
    }
  }
  function selectChannel(ch) {
    selCh = ch;
    for (const st of stripEls) st?.classList.toggle('sel', Number(st.dataset.ch) === ch);
    editor.show(ch);
  }

  // ---------------- sound editor (v3): every parameter of the selected channel, kits ----------------
  const editor = createEditor({
    root: $('editor'), uds, h, lbl, toast,
    onChange: (ch, key, v) => { knobs[ch]?.[key]?.set(v, false); },
    onKit: () => { buildStrips(); editor.show(selCh); },
    onSelect: (ch) => selectChannel(ch),
    // the kit's demo groove into the selected slot (or the first empty one)
    onPattern: async (url, name) => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const file = new File([await r.arrayBuffer()], name, { type: 'audio/midi' });
        let i = uds.slot ?? -1;
        if (!(i >= 0)) i = uds.slots.findIndex((x) => !x);
        if (!(i >= 0)) i = 0;
        await loadSlotFile(i, file);
      } catch (err) {
        toast('Demo groove failed: ' + (err?.message || err), 'bad');
      }
    },
  });
  function showEditor() {
    const on = isEditorBuild();
    $('editor').hidden = !on;
    if (on) editor.build(selCh);
  }
  buildStrips();
  showEditor();

  async function ensureRunning() {
    if (uds.state === 'idle' || uds.state === 'suspended') await power();
  }
  function padHit(ch) {
    pads[ch].classList.remove('pressed'); void pads[ch].offsetWidth; pads[ch].classList.add('pressed');
    if (uds.state !== 'running') { ensureRunning().then(() => uds.hit(ch, { velocity: 1 })); return; }
    uds.hit(ch, { velocity: 1 });
  }

  function flash(elm) {
    elm.classList.remove('flash'); void elm.offsetWidth; elm.classList.add('flash');
  }
  uds.addEventListener('hit', (e) => {
    const { ch, level, source } = e.detail;
    if (stripLeds[ch]) flash(stripLeds[ch]);
    if (source === 'midi-in' || source === 'midi') flash($('led-midi'));
    scopeKick(ch, level);
  });

  // ---------------- autorhythm: 16 slots of .mid loops ----------------
  let endDrag = () => {};
  const slotCells = [];
  const slotParts = [];
  const curSlot = () => (uds.slot !== null && uds.slot !== undefined ? uds.slots[uds.slot] : null);
  const slotReady = () => !!curSlot();
  const LOAD_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 5.5 8 2l3.5 3.5M2.5 10.5v3h11v-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  for (let i = 0; i < SLOTS; i++) {
    const cell = h('div', 'slot empty');
    cell.dataset.index = i;
    const btn = h('button', 'slot-btn');
    btn.type = 'button';
    btn.dataset.testid = `slot-${i}`;
    btn.setAttribute('aria-pressed', 'false');
    const num = h('span', 'slot-num', String(i + 1));
    const name = h('span', 'slot-name', 'empty');
    const meta = h('span', 'slot-meta', '+ load .mid');
    btn.append(num, name, meta);
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = '.mid,.midi';
    file.hidden = true;
    file.dataset.testid = `slot-file-${i}`;
    file.setAttribute('aria-label', `Load a .mid file into slot ${i + 1}`);
    const load = h('button', 'slot-icon slot-load');
    load.type = 'button';
    load.innerHTML = LOAD_ICON;
    load.title = `Load a .mid file into slot ${i + 1}`;
    load.setAttribute('aria-label', load.title);
    load.dataset.testid = `slot-load-${i}`;
    const clr = h('button', 'slot-icon slot-clear', '×');
    clr.type = 'button';
    clr.title = `Clear slot ${i + 1}`;
    clr.setAttribute('aria-label', clr.title);
    clr.dataset.testid = `slot-clear-${i}`;
    cell.append(btn, load, clr, file);

    btn.addEventListener('click', () => {
      if (!uds.slots[i]) { selectSlot(i); file.click(); } else selectSlot(i);
    });
    load.addEventListener('click', () => file.click());
    file.addEventListener('change', () => { const f = file.files[0]; file.value = ''; if (f) loadSlotFile(i, f); });
    clr.addEventListener('click', () => clearSlot(i));
    cell.addEventListener('dragover', (e) => { if (hasFiles(e)) { e.preventDefault(); cell.classList.add('drop'); } });
    cell.addEventListener('dragleave', (e) => { if (!cell.contains(e.relatedTarget)) cell.classList.remove('drop'); });
    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      endDrag();
      const f = [...(e.dataTransfer?.files || [])].find((x) => /\.midi?$/i.test(x.name)) || e.dataTransfer?.files?.[0];
      if (f) loadSlotFile(i, f);
    });
    slotCells.push(cell);
    slotParts.push({ btn, name, meta });
    $('slots').appendChild(cell);
  }

  function renderSlots() {
    for (let i = 0; i < SLOTS; i++) {
      const s = uds.slots[i];
      const { btn, name, meta } = slotParts[i];
      const cell = slotCells[i];
      const sel = uds.slot === i;
      cell.classList.toggle('empty', !s);
      cell.classList.toggle('sel', sel);
      cell.classList.toggle('playing', sel && !!uds.rhythmPlaying);
      btn.setAttribute('aria-pressed', String(sel));
      if (s) {
        name.textContent = s.name;
        meta.textContent = `${s.bars} bar${s.bars === 1 ? '' : 's'}${s.truncated ? ' · first 4 bars' : ''}`;
        btn.title = `Slot ${i + 1}: ${s.name}\n${s.bars} bar${s.bars === 1 ? '' : 's'} of ${s.meter} · ${s.steps} steps · ${s.bpm} BPM`
          + (s.truncated ? '\nLonger than 4 bars: only the first 4 bars play' : '');
        cell.classList.toggle('trunc', !!s.truncated);
      } else {
        name.textContent = 'empty';
        meta.textContent = '+ load .mid';
        btn.title = `Slot ${i + 1} is empty: click to load a .mid file, or drop one here`;
        cell.classList.remove('trunc');
      }
    }
    $('slots-clear-all').disabled = !uds.slots.some(Boolean);
  }

  async function loadSlotFile(i, file) {
    try {
      const buf = await file.arrayBuffer();
      const info = await uds.loadSlot(i, buf.slice(0), file.name);
      const stored = storeSlot(i, file.name, buf);
      selectSlot(i);
      toast(`Slot ${i + 1}: ${info.name} · ${info.bars} bar${info.bars === 1 ? '' : 's'} · ${info.bpm} BPM`
        + (info.truncated ? ' · first 4 bars only' : '') + (stored ? '' : ' · not saved (browser storage unavailable)'));
    } catch (err) {
      console.warn(err);
      toast(`Slot ${i + 1}: ${err?.message || err}`, 'bad');
    }
  }
  function clearSlot(i) {
    uds.clearSlot(i);
    forgetSlot(i);
    renderSlots();
    if (uds.slot === i) buildSteps();
    syncTransport();
    updateWavLabel();
  }
  let clearArmed = 0;
  $('slots-clear-all').addEventListener('click', () => {
    const b = $('slots-clear-all');
    if (Date.now() - clearArmed > 3000) {
      clearArmed = Date.now();
      b.classList.add('armed');
      b.querySelector('.lb').textContent = 'Clear all 16?';
      setTimeout(() => { if (Date.now() - clearArmed >= 2900) disarm(); }, 3000);
      return;
    }
    disarm();
    for (let i = 0; i < SLOTS; i++) uds.clearSlot(i);
    forgetAll();
    renderSlots();
    buildSteps();
    syncTransport();
    updateWavLabel();
    toast('All slots cleared');
  });
  function disarm() {
    clearArmed = 0;
    const b = $('slots-clear-all');
    b.classList.remove('armed');
    b.querySelector('.lb').textContent = 'Clear all';
  }

  function selectSlot(i) {
    uds.setSlot(i);
    storeSelection(i);
    tempoKnob.set(uds.tempo, false);
    $('tempo-read').textContent = uds.tempo;
    renderSlots();
    buildSteps();
    syncTransport();
    updateWavLabel();
  }

  // Step LEDs: one per step, grouped by beat. Above 16 steps on a narrow screen: the current bar plus a counter.
  let stepEls = [];
  let lastStep = -1;
  let compact = false;
  const wantCompact = (s) => !!s && s.steps > s.stepsPerBar && $('steps').parentElement.clientWidth < 12 * s.steps;
  function buildSteps() {
    const row = $('steps');
    row.textContent = '';
    stepEls = [];
    lastStep = -1;
    const s = curSlot();
    compact = wantCompact(s);
    const n = s ? (compact ? s.stepsPerBar : s.steps) : 16;
    const per = s ? s.beatSteps : 4;
    const bar = s ? s.stepsPerBar : 16;
    const has = new Set();
    if (s) for (const nt of s.notes) has.add(compact ? nt.step % s.stepsPerBar : nt.step);
    row.style.setProperty('--n', n);
    row.classList.toggle('empty', !s);
    for (let i = 0; i < n; i++) {
      const el = h('i', 'step');
      if (i % per === 0) el.classList.add('beat');
      if (i && i % bar === 0) el.classList.add('bar');
      if (has.has(i)) el.classList.add('has');
      stepEls.push(el);
      row.appendChild(el);
    }
    const bc = $('bar-count');
    bc.hidden = !compact;
    bc.textContent = compact ? `bar 1/${s.bars}` : '';
    const pn = $('pat-name');
    pn.textContent = '';
    if (uds.slot === null || uds.slot === undefined) pn.append(h('small', null, 'no slot selected'));
    else if (!s) pn.append(h('b', null, `Slot ${uds.slot + 1}`), ' ', h('small', null, 'empty · load a .mid'));
    else {
      const nm = h('span', 'pn-name', s.name);
      nm.title = s.name;
      pn.append(h('b', null, `Slot ${uds.slot + 1}`), ' ', nm, ' ',
        h('small', null, `${s.bars} bar${s.bars === 1 ? '' : 's'} · ${s.meter} · ${s.bpm} BPM`));
    }
  }
  function clearStepLed() {
    if (stepEls[lastStep]) stepEls[lastStep].classList.remove('on');
    lastStep = -1;
  }
  window.addEventListener('resize', () => { if (wantCompact(curSlot()) !== compact) buildSteps(); });

  uds.addEventListener('step', (e) => {
    const { index, slot } = e.detail;
    if (slot === undefined || slot !== uds.slot) return;
    const s = curSlot();
    if (!s) return;
    const li = compact ? index % s.stepsPerBar : index;
    if (stepEls[lastStep]) stepEls[lastStep].classList.remove('on');
    if (stepEls[li]) stepEls[li].classList.add('on');
    lastStep = li;
    if (compact) $('bar-count').textContent = `bar ${Math.floor(index / s.stepsPerBar) + 1}/${s.bars}`;
  });
  uds.addEventListener('slots', () => { renderSlots(); syncTransport(); });

  async function restoreSlots() {
    const saved = loadStored();
    for (let i = 0; i < SLOTS; i++) {
      const e = saved.slots[i];
      if (!e || !e.b64) continue;
      try { await uds.loadSlot(i, bytesFromB64(e.b64), e.name || `slot${i + 1}.mid`); } catch (err) {
        console.warn('stored slot', i + 1, 'could not be loaded:', err);
        forgetSlot(i);
      }
    }
    let sel = saved.sel;
    if (!(sel >= 0 && sel < SLOTS)) sel = uds.slots.findIndex(Boolean);
    if (sel < 0) sel = 0;
    selectSlot(sel);
  }

  function syncTransport() {
    const on = !!uds.rhythmPlaying;
    const b = $('rhythm-toggle');
    b.disabled = !on && !slotReady();
    b.title = b.disabled ? 'The selected slot is empty: load a .mid file into it first' : 'Start or stop the rhythm (Space)';
    const sc = slotCells[uds.slot];
    for (const c of slotCells) c.classList.toggle('playing', on && c === sc);
    if (b.getAttribute('aria-pressed') !== String(on)) {
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.lbl').textContent = '';
      b.querySelector('.lbl').append(lbl(on ? 'Stop' : 'Start'));
      if (!on) clearStepLed();
    }
    const mp = !!uds.midiPlaying;
    const m = $('midi-play');
    if (m.getAttribute('aria-pressed') !== String(mp)) {
      m.setAttribute('aria-pressed', String(mp));
      m.textContent = '';
      m.append(lbl(mp ? 'Stop' : 'Play'));
    }
  }
  async function toggleRhythm() {
    if (uds.rhythmPlaying) uds.stopRhythm();
    else {
      if (!slotReady()) { toast('The selected slot is empty: load a .mid file into it first'); return; }
      await ensureRunning();
      uds.startRhythm();
    }
    syncTransport();
  }
  $('rhythm-toggle').addEventListener('click', toggleRhythm);
  function stopAll() {
    uds.stopAll();
    syncTransport();
    for (const p of pads) p.classList.remove('pressed');
  }
  $('stop-all').addEventListener('click', stopAll);

  // ---------------- MIDI ----------------
  let midiInfo = null;
  async function loadMidiFile(file) {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      midiInfo = await uds.loadMidi(buf, file.name);
      $('midi-name').textContent = midiInfo.name || file.name;
      $('midi-dur').textContent = fmtTime(midiInfo.duration);
      $('midi-pos').textContent = '0:00';
      $('midi-fill').style.width = '0%';
      const un = Object.entries(midiInfo.unmapped || {});
      const total = un.reduce((a, [, n]) => a + n, 0);
      $('midi-unmapped').textContent = total
        ? `· ${midiInfo.notes} notes · ${total} unmapped (${un.slice(0, 6).map(([n]) => n).join(', ')}${un.length > 6 ? '…' : ''}) ignored`
        : `· ${midiInfo.notes} notes`;
      $('midi-unmapped').title = un.map(([n, c]) => `note ${n}: ${c}`).join('\n');
      $('midi-play').disabled = false;
      $('wav-what').querySelector('option[value=midi]').disabled = false;
      updateWavLabel();
      toast(`MIDI: ${midiInfo.name || file.name} · ${fmtTime(midiInfo.duration)}`);
    } catch (err) {
      console.warn(err);
      toast('Could not read the MIDI file: ' + (err?.message || err), 'bad');
    }
  }
  $('midi-file').addEventListener('change', (e) => loadMidiFile(e.target.files[0]));
  $('midi-play').addEventListener('click', async () => {
    if (uds.midiPlaying) uds.stopMidi();
    else { await ensureRunning(); uds.playMidi(); }
    syncTransport();
  });
  $('midi-loop').checked = !!uds.midiLoop;
  $('midi-loop').addEventListener('change', (e) => uds.setMidiLoop(e.target.checked));
  uds.addEventListener('midi', (e) => {
    const { position, duration } = e.detail;
    $('midi-pos').textContent = fmtTime(position);
    if (duration) $('midi-dur').textContent = fmtTime(duration);
    $('midi-fill').style.width = `${duration ? Math.min(100, (100 * position) / duration) : 0}%`;
    syncTransport();
  });

  // drag and drop anywhere
  let dragDepth = 0;
  endDrag = () => { dragDepth = 0; $('drop-hint').hidden = true; for (const c of slotCells) c.classList.remove('drop'); };
  const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
  window.addEventListener('dragenter', (e) => { if (hasFiles(e)) { dragDepth++; $('drop-hint').hidden = false; } });
  window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) $('drop-hint').hidden = true; });
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    endDrag();
    const f = [...(e.dataTransfer?.files || [])].find((x) => /\.midi?$/i.test(x.name)) || e.dataTransfer?.files?.[0];
    if (f) loadMidiFile(f);
  });

  function showInputs(list) {
    const d = $('midi-devs');
    d.textContent = list && list.length ? list.map((i) => i.name).join(' · ') : 'no devices';
  }
  $('midi-input').addEventListener('click', async () => {
    try {
      await ensureRunning();
      const list = await uds.enableMidiInput();
      $('midi-input').classList.add('on');
      showInputs(list);
    } catch (err) {
      $('midi-devs').textContent = 'unavailable · ' + (err?.message || 'Web MIDI unavailable');
      toast('Live MIDI is unavailable: ' + (err?.message || err), 'bad');
    }
  });
  uds.addEventListener('midi-input', (e) => showInputs(e.detail.inputs));

  // ---------------- output ----------------
  // Chip selector: one option per engine build (app/engine/builds.json): v1, v2 (the 2nd-order DAC) and
  // v3; builds not made yet stay disabled ("coming soon")
  const chipSel = $('chip');
  const builds = uds.builds?.length ? uds.builds : [{ id: '1st', version: 'v1', label: 'v1 (1st-order DAC, as built)', available: true }];
  const chipOf = (b) => b.version || BUILD_CHIP[b.id] || b.id;
  chipSel.textContent = '';
  for (const b of builds) {
    const name = b.label || b.name;
    const o = h('option', null, b.available ? name + (b.mock ? ' · mock engine' : '') : `${name} · coming soon`);
    o.value = chipOf(b);
    o.disabled = !b.available;
    chipSel.append(o);
  }
  const curChip = () => BUILD_CHIP[uds.dac] || uds.chip || 'v1';
  function showChip() {
    chipSel.value = curChip();
    body.dataset.dac = uds.dac || '1st';
    body.dataset.chip = curChip();
    const b = uds.currentBuild || builds[0];
    const mhz = ((b && b.clockHz) || 6000000) / 1e6;
    $('foot-chip').textContent = curChip() === 'v3' ? `UDS v3 — Tiny Tapeout chip (preview), Verilog simulated at ${mhz} MHz` : 'UDS-1x1 — Tiny Tapeout chip, Verilog simulated at 6 MHz';
    document.querySelector('.plate h1').textContent = curChip() === 'v3' ? 'UDS v3' : 'UDS-1x1';
    $('h-strips-sub').textContent = curChip() === 'v3' ? 'pads 1–8 · chip ch 0–7 · click a name to edit its sound' : 'pads 1–8 · chip ch 0–7';
  }
  let shownSet = uds.currentBuild?.patchSet || 'v1';
  function afterChip() {
    showChip();
    const set = uds.currentBuild?.patchSet || 'v1';
    if (set !== shownSet || isEditorBuild()) { shownSet = set; buildStrips(); }
    else syncKnobs();
    showEditor();
    showBackend();
  }
  showChip();
  chipSel.addEventListener('change', async () => {
    const v = chipSel.value;
    chipSel.disabled = true;
    try {
      await uds.setDac(CHIP_BUILD[v] || v);
      storeDac(uds.dac);
      toast(`Chip: ${builds.find((b) => chipOf(b) === v)?.label || v}`);
    } catch (err) {
      console.warn(err);
      toast('Chip switch failed: ' + (err?.message || err), 'bad');
    } finally {
      chipSel.disabled = false;
      afterChip();
    }
  });
  uds.addEventListener('dac', afterChip);

  // patches are kept per chip version in this browser (patch-store.js)
  let storeTimer = 0;
  uds.addEventListener('patches', () => {
    clearTimeout(storeTimer);
    storeTimer = setTimeout(() => storePatches(uds), 150);
  });

  $('filter').value = 'rc';
  $('filter').addEventListener('change', (e) => uds.setFilter(e.target.value));
  $('volume').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    uds.setVolume(v);
    $('volume-out').textContent = Math.round(v * 100);
  });
  uds.setVolume?.(Number($('volume').value));

  function wavSeconds() {
    if (wavWhat() === 'midi') return Math.min(180, (midiInfo.duration || 0) + 1);
    const s = curSlot();
    if (!s) return 0;
    return Math.ceil(((8 * s.stepsPerBar * 60) / ((uds.tempo || 120) * s.stepsPerBeat)) * 100) / 100;
  }
  function wavWhat() {
    const v = $('wav-what').value;
    if (v === 'midi' && midiInfo) return 'midi';
    if (slotReady()) return 'rhythm';
    return midiInfo ? 'midi' : null;
  }
  function updateWavLabel() {
    const sel = $('wav-what');
    const o = sel.querySelector('option[value=rhythm]');
    const s = curSlot();
    o.disabled = !s;
    if (s && !midiInfo) sel.value = 'rhythm';
    if (!s && midiInfo) sel.value = 'midi';
    const secs = s ? Math.ceil(((8 * s.stepsPerBar * 60) / ((uds.tempo || 120) * s.stepsPerBeat)) * 10) / 10 : 0;
    o.textContent = s ? `Slot ${uds.slot + 1} · 8 bars · ${secs.toFixed(1)} s` : 'Selected slot · 8 bars (empty)';
    if (!$('wav-export').classList.contains('busy')) $('wav-export').disabled = !wavWhat();
  }
  $('wav-what').addEventListener('change', updateWavLabel);
  $('wav-export').addEventListener('click', async () => {
    const btn = $('wav-export');
    if (btn.classList.contains('busy')) return;
    const what = wavWhat();
    if (!what) { toast('Nothing to export: load a .mid into a slot or the MIDI player'); return; }
    const seconds = wavSeconds();
    btn.classList.add('busy');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    const old = btn.innerHTML;
    btn.textContent = '';
    btn.append(lbl('Rendering…'));
    try {
      const dacTag = curChip() === 'v3' ? 'v3' : `dac${(uds.dac || '1st')[0]}`;   // renderWav uses the chip selected now
      const blob = await uds.renderWav({ what, seconds });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slotName = (curSlot()?.name || '').replace(/\.midi?$/i, '').replace(/[^\w.-]+/g, '_').slice(0, 40);
      const base = what === 'midi' ? (midiInfo?.name || 'midi').replace(/\.midi?$/i, '') : `slot${uds.slot + 1}-${slotName}-${uds.tempo}bpm`;
      a.href = url;
      a.download = `${curChip() === 'v3' ? 'uds-v3' : 'uds-1x1'}-${base}-${dacTag}.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast(`WAV: ${a.download} · ${seconds.toFixed(1)} s`);
    } catch (err) {
      console.warn(err);
      toast('WAV export failed: ' + (err?.message || err), 'bad');
    } finally {
      btn.classList.remove('busy');
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.innerHTML = old;
      updateWavLabel();
    }
  });

  // ---------------- chip status ----------------
  const segEls = SEG.map((s) => document.querySelector(`#display .seg-${s}`));
  const dp = document.querySelector('#display .seg-dp');
  function setDisplay(uo) {
    for (let i = 0; i < 7; i++) segEls[i].classList.toggle('on', !!(uo & (1 << i)));
    dp.classList.toggle('on', !!(uo & 0x80));
  }
  setDisplay(0);
  function clearLeds() {
    for (const id of ['led-busy', 'led-cs', 'led-frame']) $(id).classList.remove('on');
  }

  uds.addEventListener('status', (e) => {
    const s = e.detail;
    setDisplay(s.uoOut | 0);
    $('led-busy').classList.toggle('on', !!s.busy);
    $('led-cs').classList.toggle('on', !!s.cs);
    $('led-frame').classList.toggle('on', uds.state === 'running');
    $('cnt-cycles').textContent = fmtBig(s.cycles);
    $('cnt-frames').textContent = fmtBig(s.frames);
    const mhz = (s.simHz || 0) / 1e6;
    const rt = s.realtime || 0;
    $('sim-speed').textContent = `${mhz.toFixed(1)} MHz · ${rt.toFixed(2)}x real time`;
    const box = $('speed-box');
    box.classList.toggle('warn', rt < 1.2 && rt >= 1.0);
    box.classList.toggle('bad', rt < 1.0);
    syncTransport();
  });

  uds.addEventListener('error', (e) => toast('Error: ' + (e.detail?.message || 'error'), 'bad'));

  // ---------------- keyboard ----------------
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'checkbox' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
    if (typing) return;
    if (/^[1-8]$/.test(e.key) && !e.repeat) {
      e.preventDefault();
      padHit(Number(e.key) - 1);
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) toggleRhythm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopAll();
    }
  });

  // a Space keydown was taken by the rhythm toggle: do not let it also click a focused button on keyup
  window.addEventListener('keyup', (e) => {
    if ((e.key === ' ' || e.code === 'Space') && e.target?.tagName === 'BUTTON') e.preventDefault();
  });

  // ---------------- scope ----------------
  const canvas = $('scope');
  const ctx = canvas.getContext('2d');
  let tdBuf = null;
  let scopeGain = 1;
  const kicks = [];
  function scopeKick(ch, level) {
    if (uds.analyser) return;
    const c = uds.channels[ch]?.params || {};
    const noise = c.balance !== undefined ? c.balance / 15 : (c.mix || 0) / 7;
    kicks.push({ t: performance.now(), amp: (level || 8) / 15, f: 2 + (c.pitch || 80) / 18, noise });
    if (kicks.length > 8) kicks.shift();
  }
  function sizeCanvas() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(100, Math.round(r.width * dpr)), hh = Math.max(40, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; }
  }
  function draw() {
    sizeCanvas();
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120, 220, 160, 0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 10; i++) { const x = Math.round((W * i) / 10) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let i = 1; i < 4; i++) { const y = Math.round((H * i) / 4) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    const N = 512;
    let data = null;
    if (uds.analyser) {
      if (!tdBuf || tdBuf.length !== uds.analyser.fftSize) tdBuf = new Float32Array(uds.analyser.fftSize);
      uds.analyser.getFloatTimeDomainData(tdBuf);
      // trigger on a rising zero crossing for a stable trace
      let start = 0;
      let m0 = 0;
      for (const v of tdBuf) m0 += v;
      m0 /= tdBuf.length;
      for (let i = 1; i < tdBuf.length / 2; i++) if (tdBuf[i - 1] < m0 && tdBuf[i] >= m0) { start = i; break; }
      const raw = tdBuf.subarray(start, Math.min(tdBuf.length, start + N));
      // remove the DC of the 1-bit stream and auto-scale (up to 8x), so quiet voices are visible
      let mean = 0;
      for (const v of tdBuf) mean += v;
      mean /= tdBuf.length;
      let peak = 0;
      for (const v of raw) peak = Math.max(peak, Math.abs(v - mean));
      const want = Math.min(8, 0.9 / Math.max(peak, 1e-4));
      scopeGain += (want - scopeGain) * (want < scopeGain ? 0.5 : 0.05);
      data = new Float32Array(raw.length);
      for (let i = 0; i < raw.length; i++) data[i] = (raw[i] - mean) * scopeGain;
    } else {
      data = new Float32Array(N);
      const now = performance.now();
      for (const k of kicks) {
        const age = (now - k.t) / 1000;
        const env = k.amp * Math.exp(-age * 6);
        if (env < 0.005) continue;
        for (let i = 0; i < N; i++) {
          data[i] += env * ((1 - k.noise) * Math.sin((i / N) * Math.PI * 2 * k.f + age * 40) + k.noise * (Math.random() * 2 - 1)) * 0.8;
        }
      }
    }
    ctx.shadowColor = 'rgba(110, 255, 160, 0.6)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#8cf5ae';
    ctx.lineWidth = Math.max(1.2, W / 300);
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * W;
      const y = H / 2 - Math.max(-1, Math.min(1, data[i])) * H * 0.45;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // stored patches (per chip version) before the stored slots, then the panel shows them
  if (loadPatches(uds)) { syncKnobs(); if (isEditorBuild()) { buildStrips(); editor.show(selCh); } }
  await restoreSlots();
  onState();
  syncTransport();
  updateWavLabel();
  body.classList.add('ready');
}

main().catch((err) => {
  console.error(err);
  document.body.dataset.state = 'error';
  const n = $('notice');
  n.hidden = false;
  n.textContent = 'The panel failed to start: ' + (err?.message || err);
});
