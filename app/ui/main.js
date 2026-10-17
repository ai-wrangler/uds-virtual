// main.js — the UDS-1x1 panel. Talks only to the UDSAudio API (CONTRACT.md section 5).
import { createKnob } from './knob.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const SEG = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function bil(ru, en) {
  const f = document.createDocumentFragment();
  f.append(h('span', 'ru', ru), h('small', null, en));
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
  const { uds, fake, why } = await loadAudio();
  window.uds = uds;
  const body = document.body;
  body.dataset.state = uds.state;

  if (fake) {
    const n = $('notice');
    n.hidden = false;
    n.textContent = why === '?fake=1'
      ? 'Демо без звука · fake audio (?fake=1): no sound, simulated chip status.'
      : 'Звук недоступен · the audio module could not be loaded, so this is the silent fake. Check the console.';
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
      toast('Не удалось включить · could not start audio: ' + (err?.message || err), 'bad');
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
  }
  uds.addEventListener('state', onState);

  // ---------------- channel strips ----------------
  const strips = $('strips');
  const legend = h('div', 'legend');
  legend.appendChild(h('div', 'legend-head'));
  for (const k of uds.knobs) {
    const row = h('div', 'legend-row');
    row.append(bil(k.labelRu, k.label));
    row.title = k.note || '';
    legend.appendChild(row);
  }
  legend.appendChild(h('div', 'legend-pad'));
  strips.appendChild(legend);

  const knobs = {};   // knobs[ch][key]
  const stripLeds = [];
  const pads = [];
  for (const c of uds.channels) {
    const strip = h('div', 'strip');
    strip.dataset.ch = c.ch;
    const head = h('div', 'strip-head');
    const led = h('i', 'led led-red strip-led');
    stripLeds[c.ch] = led;
    const num = h('span', 'strip-num', String(c.ch + 1));
    const names = h('div', 'strip-names');
    names.append(h('span', 'ru', c.nameRu), h('small', null, c.name));
    head.append(num, names, led);
    strip.appendChild(head);
    knobs[c.ch] = {};
    const cur = uds.getParams(c.ch);
    const kb = h('div', 'strip-knobs');
    for (const k of uds.knobs) {
      const knob = createKnob({
        min: k.min, max: k.max, value: cur[k.key], def: c.params[k.key],
        label: k.label, labelRu: k.labelRu, testid: `knob-${c.ch}-${k.key}`,
        ariaLabel: `${c.name} ${k.label}`, title: `${k.labelRu} · ${k.label}: ${k.note || ''}\nDouble-click: default (${c.params[k.key]})`,
        onChange: (v) => uds.setParams(c.ch, { [k.key]: v }),
      });
      knobs[c.ch][k.key] = knob;
      kb.appendChild(knob.el);
    }
    strip.appendChild(kb);
    const pad = h('button', 'pad');
    pad.type = 'button';
    pad.dataset.testid = `pad-${c.ch}`;
    pad.setAttribute('aria-label', `${c.name} pad (key ${c.ch + 1})`);
    pad.append(h('span', 'pad-short', c.shortRu), h('kbd', 'pad-key', String(c.ch + 1)));
    pad.addEventListener('pointerdown', (e) => { if (e.button === 0) { e.preventDefault(); padHit(c.ch); } });
    pad.addEventListener('click', (e) => { if (e.detail === 0) padHit(c.ch); }); // keyboard activation
    pads[c.ch] = pad;
    strip.appendChild(pad);
    strips.appendChild(strip);
  }
  const resetBtn = h('button', 'btn btn-small reset-all');
  resetBtn.type = 'button';
  resetBtn.append(bil('Сброс', 'reset knobs'));
  resetBtn.addEventListener('click', () => {
    uds.resetParams();
    for (const c of uds.channels) {
      const p = uds.getParams(c.ch);
      for (const k of uds.knobs) knobs[c.ch][k.key].set(p[k.key], false);
    }
  });
  legend.appendChild(resetBtn);

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

  // ---------------- autorhythm ----------------
  const patBtns = {};
  for (const p of uds.patterns) {
    const b = h('button', 'pat');
    b.type = 'button';
    b.dataset.testid = `pattern-${p.id}`;
    b.setAttribute('aria-pressed', 'false');
    b.title = `${p.id} · ${p.name} · ${p.meter}${p.bpm ? ' · ' + p.bpm + ' BPM' : ''}${p.notes ? '\n' + p.notes : ''}`;
    const idx = h('span', 'pat-idx', String(p.index + 1));
    const nm = h('span', 'pat-nm');
    nm.append(h('span', 'ru', p.nameRu), h('small', null, p.name));
    b.append(idx, nm);
    b.addEventListener('click', () => selectPattern(p.id));
    patBtns[p.id] = b;
    $(p.bank === 'B' ? 'bank-B' : 'bank-A').appendChild(b);
  }

  const tempoKnob = createKnob({
    min: 40, max: 240, value: uds.tempo || 120, def: 120, step: 2, testid: 'tempo',
    label: 'tempo', labelRu: 'Темп', ariaLabel: 'Tempo (BPM)', className: 'knob-tempo',
    format: (v) => `${v}`,
    onChange: (v) => { uds.setTempo(v); $('tempo-read').textContent = v; },
  });
  const tb = $('tempo-box');
  tb.appendChild(tempoKnob.el);
  const tr = h('div', 'tempo-read');
  const trv = h('output', null, String(uds.tempo || 120));
  trv.id = 'tempo-read';
  tr.append(trv, h('small', null, 'BPM'));
  tb.appendChild(tr);

  let stepEls = [];
  function buildSteps(p) {
    const row = $('steps');
    row.textContent = '';
    stepEls = [];
    row.style.setProperty('--n', p.length);
    for (let i = 0; i < p.length; i++) {
      const s = h('i', 'step');
      if (i % p.stepsPerBeat === 0) s.classList.add('beat');
      if (p.steps && p.steps[i]) s.classList.add('has');
      stepEls.push(s);
      row.appendChild(s);
    }
    $('pat-name').textContent = '';
    $('pat-name').append(h('b', null, p.id), ' ', h('span', 'ru', p.nameRu), ' ', h('small', null, `${p.name} · ${p.meter} · ${p.length}`));
  }
  function selectPattern(id) {
    uds.setPattern(id);
    for (const [k, b] of Object.entries(patBtns)) {
      b.classList.toggle('sel', k === id);
      b.setAttribute('aria-pressed', String(k === id));
    }
    const p = uds.patterns.find((x) => x.id === id);
    if (p) buildSteps(p);
    tempoKnob.set(uds.tempo, false);
    $('tempo-read').textContent = uds.tempo;
    updateWavLabel();
  }
  selectPattern(uds.pattern || uds.patterns[0].id);

  let lastStep = -1;
  uds.addEventListener('step', (e) => {
    const { index, patternId } = e.detail;
    if (patternId && patternId !== uds.pattern) return;
    if (stepEls[lastStep]) stepEls[lastStep].classList.remove('on');
    if (stepEls[index]) stepEls[index].classList.add('on');
    lastStep = index;
  });

  function syncTransport() {
    const on = !!uds.rhythmPlaying;
    const b = $('rhythm-toggle');
    if (b.getAttribute('aria-pressed') !== String(on)) {
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.lbl').textContent = '';
      b.querySelector('.lbl').append(on ? bil('Стоп', 'stop') : bil('Пуск', 'start'));
      if (!on && stepEls[lastStep]) { stepEls[lastStep].classList.remove('on'); lastStep = -1; }
    }
    const mp = !!uds.midiPlaying;
    const m = $('midi-play');
    if (m.getAttribute('aria-pressed') !== String(mp)) {
      m.setAttribute('aria-pressed', String(mp));
      m.textContent = '';
      m.append(mp ? bil('Стоп', 'stop') : bil('Играть', 'play'));
    }
  }
  async function toggleRhythm() {
    if (uds.rhythmPlaying) uds.stopRhythm();
    else { await ensureRunning(); uds.startRhythm(); }
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
      toast(`MIDI: ${midiInfo.name || file.name} · ${fmtTime(midiInfo.duration)}`);
    } catch (err) {
      console.warn(err);
      toast('Не удалось прочитать MIDI · could not read MIDI file: ' + (err?.message || err), 'bad');
    }
  }
  $('midi-file').addEventListener('change', (e) => loadMidiFile(e.target.files[0]));
  $('midi-play').addEventListener('click', async () => {
    if (uds.midiPlaying) uds.stopMidi();
    else { await ensureRunning(); uds.playMidi(); }
    syncTransport();
  });
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
  const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
  window.addEventListener('dragenter', (e) => { if (hasFiles(e)) { dragDepth++; $('drop-hint').hidden = false; } });
  window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) $('drop-hint').hidden = true; });
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    $('drop-hint').hidden = true;
    const f = [...(e.dataTransfer?.files || [])].find((x) => /\.midi?$/i.test(x.name)) || e.dataTransfer?.files?.[0];
    if (f) loadMidiFile(f);
  });

  function showInputs(list) {
    const d = $('midi-devs');
    d.textContent = list && list.length ? list.map((i) => i.name).join(' · ') : 'нет устройств · no devices';
  }
  $('midi-input').addEventListener('click', async () => {
    try {
      await ensureRunning();
      const list = await uds.enableMidiInput();
      $('midi-input').classList.add('on');
      showInputs(list);
    } catch (err) {
      $('midi-devs').textContent = 'недоступно · ' + (err?.message || 'Web MIDI unavailable');
      toast('Живой МИДИ недоступен · ' + (err?.message || err), 'bad');
    }
  });
  uds.addEventListener('midi-input', (e) => showInputs(e.detail.inputs));

  // ---------------- output ----------------
  $('filter').value = 'rc';
  $('filter').addEventListener('change', (e) => uds.setFilter(e.target.value));
  $('volume').addEventListener('input', (e) => {
    const v = Number(e.target.value);
    uds.setVolume(v);
    $('volume-out').textContent = Math.round(v * 100);
  });
  uds.setVolume?.(Number($('volume').value));

  function wavSeconds() {
    if ($('wav-what').value === 'midi' && midiInfo) return Math.min(180, (midiInfo.duration || 0) + 1);
    const p = uds.patterns.find((x) => x.id === uds.pattern) || uds.patterns[0];
    const [num, den] = String(p.meter || '4/4').split(/[/ ]/).map(Number);
    const beatsPerBar = den === 8 ? num / 3 : num || 4;
    return Math.ceil(((8 * beatsPerBar * 60) / (uds.tempo || 120)) * 100) / 100;
  }
  function updateWavLabel() {
    const o = $('wav-what').querySelector('option[value=rhythm]');
    o.textContent = `Ритм ${uds.pattern} · 8 bars · ${wavSeconds().toFixed(1)} s`;
  }
  $('wav-what').addEventListener('change', updateWavLabel);
  $('wav-export').addEventListener('click', async () => {
    const btn = $('wav-export');
    if (btn.classList.contains('busy')) return;
    const what = $('wav-what').value === 'midi' && midiInfo ? 'midi' : 'rhythm';
    const seconds = wavSeconds();
    btn.classList.add('busy');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    const old = btn.innerHTML;
    btn.textContent = '';
    btn.append(bil('Рендер…', 'rendering'));
    try {
      const blob = await uds.renderWav({ what, seconds });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const base = what === 'midi' ? (midiInfo?.name || 'midi').replace(/\.midi?$/i, '') : `${uds.pattern}-${uds.tempo}bpm`;
      a.href = url;
      a.download = `uds-1x1-${base}.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast(`WAV: ${a.download} · ${seconds.toFixed(1)} s`);
    } catch (err) {
      console.warn(err);
      toast('Ошибка записи · WAV export failed: ' + (err?.message || err), 'bad');
    } finally {
      btn.classList.remove('busy');
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.innerHTML = old;
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

  uds.addEventListener('error', (e) => toast('Ошибка · ' + (e.detail?.message || 'error'), 'bad'));

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

  // ---------------- scope ----------------
  const canvas = $('scope');
  const ctx = canvas.getContext('2d');
  let tdBuf = null;
  const kicks = [];
  function scopeKick(ch, level) {
    if (uds.analyser) return;
    const c = uds.channels[ch]?.params || {};
    kicks.push({ t: performance.now(), amp: (level || 8) / 15, f: 2 + (c.pitch || 80) / 18, noise: (c.balance || 0) / 15 });
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
      for (let i = 1; i < tdBuf.length / 2; i++) if (tdBuf[i - 1] < 0 && tdBuf[i] >= 0) { start = i; break; }
      data = tdBuf.subarray(start, Math.min(tdBuf.length, start + N));
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

  onState();
  syncTransport();
  body.classList.add('ready');
}

main().catch((err) => {
  console.error(err);
  document.body.dataset.state = 'error';
  const n = $('notice');
  n.hidden = false;
  n.textContent = 'Ошибка запуска · the panel failed to start: ' + (err?.message || err);
});
