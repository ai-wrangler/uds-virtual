// knob.js — a rotary knob with a skirt scale. role="slider", keyboard, wheel, pointer drag, double-click reset.

const SVGNS = 'http://www.w3.org/2000/svg';
const A0 = -135, A1 = 135;

function el(tag, attrs = {}, ns) {
  const e = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/**
 * createKnob({ min, max, value, def, label, labelRu, testid, size, onChange, format, step, title })
 * returns { el, set(v, emit), get() }
 */
export function createKnob(o) {
  const { min, max } = o;
  const range = max - min;
  const step = o.step ?? Math.max(1, Math.round(range / 32));
  const fmt = o.format || ((v) => String(v));
  let value = o.value ?? min;

  const wrap = el('div', { class: 'knob-wrap' + (o.className ? ' ' + o.className : '') });
  const knob = el('div', {
    class: 'knob', role: 'slider', tabindex: '0',
    'aria-valuemin': String(min), 'aria-valuemax': String(max), 'aria-valuenow': String(value),
    'aria-label': o.ariaLabel || `${o.label}`,
  });
  if (o.testid) knob.dataset.testid = o.testid;
  if (o.title) knob.title = o.title;

  const svg = el('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }, SVGNS);
  // skirt: ticks around the knob, every tick of a range up to 16 steps, else 11 ticks
  const nt = range <= 15 ? range + 1 : 11;
  for (let i = 0; i < nt; i++) {
    const a = ((A0 + ((A1 - A0) * i) / (nt - 1)) * Math.PI) / 180;
    const major = i === 0 || i === nt - 1 || (nt === 11 && i === 5);
    const r0 = major ? 41 : 43, r1 = 48;
    svg.appendChild(el('line', {
      x1: 50 + r0 * Math.sin(a), y1: 50 - r0 * Math.cos(a), x2: 50 + r1 * Math.sin(a), y2: 50 - r1 * Math.cos(a),
      class: major ? 'tick major' : 'tick',
    }, SVGNS));
  }
  // value arc
  const arc = el('path', { class: 'arc' }, SVGNS);
  svg.appendChild(arc);
  svg.appendChild(el('circle', { cx: 50, cy: 50, r: 34, class: 'skirt' }, SVGNS));
  const rot = el('g', { class: 'rot' }, SVGNS);
  rot.appendChild(el('circle', { cx: 50, cy: 50, r: 25, class: 'cap' }, SVGNS));
  rot.appendChild(el('circle', { cx: 50, cy: 50, r: 19, class: 'cap-top' }, SVGNS));
  rot.appendChild(el('line', { x1: 50, y1: 18, x2: 50, y2: 33, class: 'pointer' }, SVGNS));
  svg.appendChild(rot);
  knob.appendChild(svg);

  const lab = el('div', { class: 'knob-lbl' });
  if (o.labelRu) { const r = el('span', { class: 'ru' }); r.textContent = o.labelRu; lab.appendChild(r); }
  if (o.label) { const s = el('small'); s.textContent = o.label; lab.appendChild(s); }
  const val = el('output', { class: 'knob-val' });

  wrap.append(knob, val, lab);

  function arcPath(a) {
    const r = 38;
    const s = (A0 * Math.PI) / 180, e = (a * Math.PI) / 180;
    const x0 = 50 + r * Math.sin(s), y0 = 50 - r * Math.cos(s);
    const x1 = 50 + r * Math.sin(e), y1 = 50 - r * Math.cos(e);
    const large = a - A0 > 180 ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }

  function render() {
    const a = A0 + ((A1 - A0) * (value - min)) / (range || 1);
    rot.setAttribute('transform', `rotate(${a.toFixed(2)} 50 50)`);
    arc.setAttribute('d', value > min ? arcPath(a) : '');
    knob.setAttribute('aria-valuenow', String(value));
    knob.setAttribute('aria-valuetext', fmt(value));
    val.textContent = fmt(value);
  }

  function set(v, emit = true) {
    const nv = Math.max(min, Math.min(max, Math.round(v)));
    if (nv === value) return;
    value = nv;
    render();
    if (emit && o.onChange) o.onChange(value);
  }

  // keyboard
  knob.addEventListener('keydown', (e) => {
    const s = e.shiftKey ? 1 : step;
    let handled = true;
    switch (e.key) {
      case 'ArrowUp': case 'ArrowRight': set(value + s); break;
      case 'ArrowDown': case 'ArrowLeft': set(value - s); break;
      case 'PageUp': set(value + Math.max(step, Math.round(range / 8))); break;
      case 'PageDown': set(value - Math.max(step, Math.round(range / 8))); break;
      case 'Home': set(min); break;
      case 'End': set(max); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  });

  // wheel
  knob.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    set(value + dir * (e.shiftKey ? 1 : step));
  }, { passive: false });

  // drag: 160 px for the full range, 4x finer with Shift
  let drag = null;
  knob.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    knob.focus();
    knob.setPointerCapture(e.pointerId);
    drag = { y: e.clientY, v: value, fine: e.shiftKey };
    knob.classList.add('dragging');
    e.preventDefault();
  });
  knob.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (e.shiftKey !== drag.fine) { drag = { y: e.clientY, v: value, fine: e.shiftKey }; }
    const px = drag.fine ? 640 : 160;
    set(drag.v + ((drag.y - e.clientY) * range) / px);
  });
  const end = (e) => {
    if (!drag) return;
    drag = null;
    knob.classList.remove('dragging');
    try { knob.releasePointerCapture(e.pointerId); } catch { /* already released */ }
  };
  knob.addEventListener('pointerup', end);
  knob.addEventListener('pointercancel', end);

  knob.addEventListener('dblclick', () => { if (o.def !== undefined) set(o.def); });

  render();
  return { el: wrap, knob, set, get: () => value };
}
