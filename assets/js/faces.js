/* V4 lab · faces.js (ronda 7)
   Ilustraciones provisorias de los sentidos, sin recuadro de color: el elemento solo, plano,
   con borde negro, sobre el color de su carril. Referencias de movimiento en assets/references/.
   - Listen: cinco barras verticales que suben y bajan, como una frecuencia que se escucha (ronda 33).
   - See: dos ojos redondos que se tocan, con párpados (Byooooob). Siguen al cursor y pestañean.
   - Speak: una boca (estilo "mouth") que habla: cambia de forma como al pronunciar.
   - Taste: labios cerrados; la lengua recorre el labio de una comisura a la otra (ronda 33, referencia Taste.svg).
   - Make: una mano que hace zoom con dos dedos sobre un objeto, que crece.
   Al cambiar de sentido, cada ilustración hace un pequeño salto (Faces.blink).

   Faces.svg(i) → ilustración i (viewBox 160 × 120) · Faces.eyes() → ojos en recuadro (título)
   Faces.blink(el) · Faces.start() */
(function (global) {
  'use strict';
  const INK = '#0A0710', PAPER = '#FFF6EA', LID = '#5B2EFF', TONGUE = '#FF3D7F', DARK = '#2B0A1E', LIP = '#E8365F', LICK = '#FF9CC0';
  let uid = 0;

  function eyesMarkup(cx, cy, r) {
    const id = 'e' + (uid++);
    const one = (x, n) =>
      '<clipPath id="' + id + n + '"><circle cx="' + x + '" cy="' + cy + '" r="' + r + '"/></clipPath>'
      + '<circle cx="' + x + '" cy="' + cy + '" r="' + r + '" fill="' + PAPER + '"/>'
      + '<g class="pupil" data-r="' + (r * 0.42) + '"><circle cx="' + x + '" cy="' + (cy + r * 0.12) + '" r="' + (r * 0.4) + '" fill="' + INK + '"/>'
      + '<circle cx="' + (x + r * 0.14) + '" cy="' + (cy - r * 0.06) + '" r="' + (r * 0.12) + '" fill="' + PAPER + '"/></g>'
      + '<g clip-path="url(#' + id + n + ')"><g class="lid"><rect x="' + (x - r) + '" y="' + (cy - r) + '" width="' + (2 * r) + '" height="' + (r * 0.78) + '" fill="' + LID + '"/>'
      + '<line x1="' + (x - r) + '" y1="' + (cy - r * 0.22) + '" x2="' + (x + r) + '" y2="' + (cy - r * 0.22) + '" stroke="' + INK + '" stroke-width="3"/></g></g>'
      + '<circle cx="' + x + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + INK + '" stroke-width="3.4"/>';
    return '<g class="eyes">' + one(cx - r, 'a') + one(cx + r, 'b') + '</g>';
  }

  // Línea clara con borde negro (se dibuja dos veces)
  const line = (d, w, cls) => '<g class="' + (cls || '') + '"><path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w + 6) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + PAPER + '" stroke-width="' + w + '" stroke-linecap="round"/></g>';

  // Boca: un óvalo de 2 curvas, para poder animar su forma (mismas órdenes en todos los cuadros)
  const mouthPath = (w, t, b, cx = 80, cy = 60) =>
    'M' + (cx - w) + ',' + cy + ' C' + (cx - w) + ',' + (cy - t * 1.33) + ' ' + (cx + w) + ',' + (cy - t * 1.33) + ' ' + (cx + w) + ',' + cy
    + ' C' + (cx + w) + ',' + (cy + b * 1.33) + ' ' + (cx - w) + ',' + (cy + b * 1.33) + ' ' + (cx - w) + ',' + cy + ' Z';

  function mouth({ shapes, dur, teeth, tongueY }) {
    const id = 'm' + (uid++);
    const d0 = mouthPath(...shapes[0]);
    const anim = shapes.length > 1
      ? '<animate attributeName="d" dur="' + dur + 's" repeatCount="indefinite" calcMode="spline" keySplines="' + shapes.slice(1).map(() => '.45 0 .55 1').join(';') + '" values="' + shapes.map((s) => mouthPath(...s)).join(';') + '"/>'
      : '';
    const p = (attrs) => '<path d="' + d0 + '" ' + attrs + '>' + anim + '</path>';
    return '<clipPath id="' + id + '">' + p('') + '</clipPath>'
      + p('fill="' + DARK + '" stroke="' + INK + '" stroke-width="14" stroke-linejoin="round"')
      + '<g clip-path="url(#' + id + ')">'
      + (teeth ? '<rect x="62" y="14" width="36" height="18" rx="4" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><line x1="80" y1="14" x2="80" y2="32" stroke="' + INK + '" stroke-width="2"/>' : '')
      + '<ellipse cx="80" cy="' + tongueY + '" rx="36" ry="20" fill="' + TONGUE + '" stroke="' + INK + '" stroke-width="2.5"/></g>'
      + p('fill="none" stroke="' + PAPER + '" stroke-width="8" stroke-linejoin="round"');
  }

  const ELEMENT = [
    // Listen: cinco barras verticales, de la más alta a la más baja (referencia listen.png), que laten como una frecuencia
    () => [[52, 34], [67, 27], [82, 27], [97, 19], [112, 15]].map(([x, h], k) => line('M' + x + ' ' + (60 - h) + ' V' + (60 + h), 8, 'bar b' + (k + 1))).join(''),
    // See: solo ojos
    () => eyesMarkup(80, 60, 28),
    // Speak: la boca habla (cambia de forma como en "Speak and talk")
    () => mouth({ dur: 2.6, teeth: true, tongueY: 96, shapes: [[62, 6, 18], [56, 26, 40], [68, 14, 28], [34, 24, 30], [58, 16, 34], [46, 8, 16], [56, 26, 40], [62, 6, 18]] }),
    // Taste: labios cerrados, más chicos (referencia Taste.svg); la lengua asoma por debajo del labio de arriba y lo recorre
    () => {
      const st = 'stroke="' + INK + '" stroke-width="3.4" stroke-linejoin="round"';
      const lower = '<path d="M38 60 C52 61.5 64 62.5 80 61.5 C96 62.5 108 61.5 122 60 C114 73 100 80 80 80 C60 80 46 73 38 60 Z" fill="' + LIP + '" ' + st + '/>';
      const upper = '<path d="M38 60 C48 52 58 43 67 43 C73 43 77 47.5 80 47.5 C83 47.5 87 43 93 43 C102 43 112 52 122 60 C108 59 96 58 80 61 C64 58 52 59 38 60 Z" fill="' + LIP + '" ' + st + '/>';
      // Brillos: el de abajo queda debajo de la lengua; el de arriba, sobre el labio de arriba
      const glossLow = '<ellipse cx="62" cy="71" rx="7" ry="3" fill="' + PAPER + '" opacity=".55"/>', glossUp = '<ellipse cx="66" cy="49" rx="4" ry="2" fill="' + PAPER + '" opacity=".55"/>';
      const tongue = '<g class="lick"><ellipse cx="80" cy="64" rx="13" ry="9.5" fill="' + LICK + '" stroke="' + INK + '" stroke-width="3"/><path d="M80 59 V67" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/></g>';
      return lower + glossLow + tongue + upper + glossUp;
    },
    // Make: una mano hace zoom con dos dedos y abre un marco de selección vacío (como al editar una imagen)
    () => {
      const sq = (x, y) => '<rect x="' + (x - 4.5) + '" y="' + (y - 4.5) + '" width="9" height="9" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2.2"/>';
      const frame = '<g class="sel"><rect x="28" y="20" width="66" height="50" fill="none" stroke="' + INK + '" stroke-width="2.4"/>' + sq(28, 20) + sq(94, 20) + sq(28, 70) + sq(94, 70) + '</g>';
      const finger = (cls, ox, oy, x, y, w, h) => '<g transform="translate(' + ox + ' ' + oy + ')"><g class="' + cls + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (Math.min(w, h) / 2) + '"/></g></g>';
      const shape = () => '<rect x="96" y="74" width="46" height="42" rx="17"/><circle cx="109" cy="77" r="8.5"/><circle cx="123" cy="75" r="8.5"/><circle cx="136" cy="79" r="7.5"/>'
        + finger('idx', 101, 86, -6.5, -48, 13, 52) + finger('thb', 99, 102, -40, -6.5, 44, 13);
      const hand = '<g fill="' + INK + '" stroke="' + INK + '" stroke-width="6.4" stroke-linejoin="round">' + shape() + '</g>'
        + '<g fill="' + PAPER + '">' + shape() + '</g>'
        + '<path d="M116 80 v9 M130 80 v9" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>';
      return frame + hand;
    }
  ];

  function svg(i) {
    const vb = ['26 4 112 112', '0 0 160 120', '0 0 160 120', '0 0 160 120', '16 8 134 114'][i];
    return '<svg class="face il il-' + i + '" viewBox="' + vb + '" aria-hidden="true"><g class="gest">' + ELEMENT[i]() + '</g></svg>';
  }

  // Ojos del título: solo los ojos, sin recuadro
  function eyes() {
    return '<svg class="face title-eyes" viewBox="12 25 106 54" aria-hidden="true">' + eyesMarkup(65, 52, 25) + '</svg>';
  }

  function blink(el) {
    if (!el) return;
    el.classList.remove('blink'); void el.getBoundingClientRect(); el.classList.add('blink');
  }

  let mx = -1, my = -1;
  function track() {
    document.querySelectorAll('.face .eyes').forEach((g) => {
      const r = g.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = 0, dy = 0.6;
      if (mx >= 0) { dx = mx - cx; dy = my - cy; const d = Math.hypot(dx, dy) || 1; const k = Math.min(1, d / 260); dx = dx / d * k; dy = dy / d * k; }
      g.querySelectorAll('.pupil').forEach((p) => {
        const m = +p.dataset.r;
        p.setAttribute('transform', 'translate(' + (dx * m).toFixed(2) + ' ' + (dy * m * 0.8).toFixed(2) + ')');
      });
    });
    requestAnimationFrame(track);
  }

  function start() {
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } });
    requestAnimationFrame(track);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('svg.face').forEach((s) => s.pauseAnimations && s.pauseAnimations());
    (function idle() {
      document.querySelectorAll('.face .eyes').forEach((g) => {
        const r = g.getBoundingClientRect();
        if (r.width && r.top < innerHeight && r.bottom > 0 && Math.random() < 0.6) blink(g.closest('svg'));
      });
      setTimeout(idle, 2200 + Math.random() * 2600);
    })();
  }

  global.Faces = { svg, eyes, blink, start };
})(window);
