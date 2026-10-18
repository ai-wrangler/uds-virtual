// editor.js — the sound editor of the selected channel (v3): one control per parameter of the build
// (a knob, an option selector or a switch, generated from params.json), the kit selector, kit export and
// import, and "reset channel". Talks only to the UDSAudio API.
import { createKnob } from './knob.js';

const GROUPS = [['tone', 'Tone'], ['amp', 'Amplitude'], ['noise', 'Noise']];

export function createEditor({ root, uds, h, lbl, toast, onChange, onKit, onSelect }) {
  let ch = 0;
  let controls = {};   // key -> { set(v) }
  let built = false;
  let nameEl, descEl, kitSel, chBtns = [];

  function params() { return uds.knobs; }

  function build(selCh = ch) {
    ch = selCh;
    root.textContent = '';
    controls = {};
    chBtns = [];

    const head = h('div', 'ed-head');
    const title = h('div', 'ed-title');
    title.append(h('span', 'lb', 'Sound'));
    nameEl = h('b', 'ed-name');
    nameEl.dataset.testid = 'editor-name';
    title.append(nameEl);
    const chs = h('div', 'ed-chs');
    chs.setAttribute('role', 'group');
    chs.setAttribute('aria-label', 'Channel to edit');
    for (let i = 0; i < 8; i++) {
      const b = h('button', 'ed-ch', String(i + 1));
      b.type = 'button';
      b.dataset.testid = `edit-ch-${i}`;
      b.title = `Edit channel ${i} (pad ${i + 1})`;
      b.addEventListener('click', () => onSelect(i));
      chBtns.push(b);
      chs.append(b);
    }
    const play = h('button', 'btn btn-small ed-play');
    play.type = 'button';
    play.dataset.testid = 'edit-play';
    play.append(lbl('Play'));
    play.title = 'Play this channel';
    play.addEventListener('click', async () => {
      if (uds.state !== 'running') { try { await uds.start(); document.getElementById('overlay').hidden = true; } catch { /* the toast of power() covers it */ } }
      uds.hit(ch, { velocity: 1 });
    });
    head.append(title, chs, play);
    root.append(head);

    const body = h('div', 'ed-body');
    const all = params();
    const groups = [...GROUPS];
    for (const p of all) if (p.group && !groups.some(([g]) => g === p.group)) groups.push([p.group, p.group[0].toUpperCase() + p.group.slice(1)]);
    if (all.some((p) => !p.group)) groups.push(['', 'Other']);
    for (const [g, gname] of groups) {
      const list = all.filter((p) => (p.group || '') === g);
      if (!list.length) continue;
      const fs = h('fieldset', 'ed-group');
      fs.dataset.group = g;
      fs.append(h('legend', null, gname));
      const row = h('div', 'ed-row');
      for (const p of list) row.append(control(p));
      fs.append(row);
      body.append(fs);
    }
    root.append(body);

    const foot = h('div', 'ed-foot');
    const kl = h('label', 'ctl ed-kit');
    kl.append(Object.assign(h('span', 'ctl-lbl'), { innerHTML: '<span class="lb">Kit</span>' }));
    kitSel = document.createElement('select');
    kitSel.dataset.testid = 'kit';
    kitSel.id = 'kit';
    kitSel.addEventListener('change', async () => {
      const id = kitSel.value;
      if (!id || id === '__custom') return;
      try {
        const k = await uds.loadKit(id);
        toast(`Kit: ${k.name}${k.inspiredBy ? ' · inspired by ' + k.inspiredBy : ''}`);
        onKit();
      } catch (err) {
        console.warn(err);
        toast('Kit failed to load: ' + (err?.message || err), 'bad');
        fillKits();
      }
    });
    kl.append(kitSel);
    const exp = h('button', 'btn btn-small');
    exp.type = 'button';
    exp.dataset.testid = 'kit-export';
    exp.append(lbl('Export kit'));
    exp.title = 'Download the 8 sounds as a kit (.json)';
    exp.addEventListener('click', exportKit);
    const imp = h('label', 'btn btn-small file-btn');
    imp.append(lbl('Import kit'));
    imp.title = 'Load a kit (.json) from your computer';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = '.json,application/json';
    file.dataset.testid = 'kit-import';
    file.setAttribute('aria-label', 'Import a kit (.json)');
    file.addEventListener('change', async () => {
      const f = file.files[0];
      file.value = '';
      if (!f) return;
      try {
        const k = await uds.importKit(await f.text());
        toast(`Kit imported: ${k.name}`);
        onKit();
      } catch (err) {
        console.warn(err);
        toast('Kit import failed: ' + (err?.message || err), 'bad');
      }
    });
    imp.append(file);
    const rst = h('button', 'btn btn-small');
    rst.type = 'button';
    rst.dataset.testid = 'channel-reset';
    rst.append(lbl('Reset channel'));
    rst.title = 'This channel back to its sound in the current kit';
    rst.addEventListener('click', () => {
      uds.resetChannel(ch);
      refresh();
      for (const p of params()) onChange(ch, p.key, uds.getParams(ch)[p.key]);
      toast(`Channel ${ch + 1}: back to the kit's sound`);
    });
    foot.append(kl, exp, imp, rst);
    root.append(foot);
    descEl = h('p', 'ed-desc dim');
    descEl.dataset.testid = 'kit-desc';
    root.append(descEl);
    built = true;
    fillKits();
    show(ch);
  }

  function control(p) {
    const cur = uds.getParams(ch)[p.key];
    const wrap = h('div', 'ed-ctl');
    wrap.title = p.help || p.note || '';
    if (Array.isArray(p.options) && p.options.length) {
      const l = h('label', 'ed-opt');
      l.append(h('span', 'lb', p.label));
      const sel = document.createElement('select');
      sel.dataset.testid = `edit-${p.key}`;
      p.options.forEach((name, i) => { const o = h('option', null, name); o.value = String(p.min + i); sel.append(o); });
      sel.value = String(cur);
      sel.addEventListener('change', () => set(p, Number(sel.value)));
      l.append(sel);
      wrap.append(l);
      controls[p.key] = { set: (v) => { sel.value = String(v); } };
    } else if (p.max - p.min === 1) {
      const l = h('label', 'ed-sw');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.testid = `edit-${p.key}`;
      cb.checked = cur === p.max;
      cb.addEventListener('change', () => set(p, cb.checked ? p.max : p.min));
      l.append(cb, h('span', 'lb', p.label));
      wrap.append(l);
      controls[p.key] = { set: (v) => { cb.checked = v === p.max; } };
    } else {
      const knob = createKnob({
        min: p.min, max: p.max, value: cur, def: p.default,
        label: p.label, testid: `edit-${p.key}`, className: 'ed-knob',
        ariaLabel: `${p.label}`, title: `${p.label}: ${p.help || p.note || ''}${p.unit ? ' (' + p.unit + ')' : ''}`,
        onChange: (v) => set(p, v),
      });
      wrap.append(knob.el, Object.assign(h('div', 'ed-klbl'), { textContent: p.label }));
      controls[p.key] = { set: (v) => knob.set(v, false) };
    }
    return wrap;
  }

  function set(p, v) {
    uds.setParams(ch, { [p.key]: v });
    onChange(ch, p.key, uds.getParams(ch)[p.key]);
  }

  function fillKits() {
    if (!kitSel) return;
    const k = uds.kit;
    kitSel.textContent = '';
    for (const e of uds.kits || []) {
      const o = h('option', null, e.inspiredBy ? `${e.name} · ${e.inspiredBy}` : e.name);
      o.value = e.id;
      kitSel.append(o);
    }
    const known = k && (uds.kits || []).some((e) => e.id === k.id);
    if (k && !known) {
      const o = h('option', null, `${k.name} (imported)`);
      o.value = '__custom';
      kitSel.append(o);
    }
    kitSel.value = k ? (known ? k.id : '__custom') : '';
    if (descEl) {
      descEl.textContent = k ? [k.inspiredBy ? `Inspired by ${k.inspiredBy}.` : '', k.description || ''].filter(Boolean).join(' ') : 'No kit loaded: the sounds are the defaults of params.json.';
    }
  }

  function show(selCh) {
    ch = selCh;
    if (!built) return;
    nameEl.textContent = `ch ${ch} · ${uds.channelName(ch)}`;
    chBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === ch)));
    refresh();
    fillKits();
  }

  function refresh() {
    if (!built) return;
    const p = uds.getParams(ch);
    for (const [k, c] of Object.entries(controls)) if (p[k] !== undefined) c.set(p[k]);
  }

  function exportKit() {
    const kit = uds.exportKit();
    const text = JSON.stringify(kit, null, 2) + '\n';
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kit.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    toast(`Kit exported: ${a.download}`);
  }

  return { build, show, refresh };
}
