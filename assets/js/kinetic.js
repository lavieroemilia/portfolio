/* V4 lab · kinetic.js
   Frases encadenadas: cuando una frase pasa a la siguiente, las palabras que comparten se quedan
   en pantalla y se acomodan en su nuevo lugar; las que sobran suben y se van, y las nuevas suben
   desde abajo. Todo depende del scroll, así que es reversible.

   Kinetic.create(container, seq, opts)
   - seq: [{ tokens: [{ k, t, hl }], hold: [a, b], cy, from?: elementos del DOM }] o { hold } vacío.
     k: clave que une palabras entre frases (si dos frases seguidas tienen la misma k, es la misma palabra).
     t: texto. hl: resaltado. cy: altura del centro de la frase (0..1). from: spans del DOM de donde
     sale la frase (el hero), en vez de medirla.
   - .layout(size, maxWidth) mide las frases; .update(y) las ubica según el scroll (en vh). */
(function (global) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const ramp = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;

  function create(box, seq) {
    // Una palabra = un elemento; si la frase anterior tiene la misma clave, se reutiliza.
    const els = [];
    seq.forEach((step, k) => {
      step.map = [];
      if (!step.tokens) return;
      const prev = k > 0 ? seq[k - 1] : null;
      const used = new Set();
      step.tokens.forEach((tok, j) => {
        let id = -1;
        if (prev && prev.tokens) {
          const pj = prev.tokens.findIndex((p, n) => p.k === tok.k && !used.has(n));
          if (pj >= 0) { used.add(pj); id = prev.map[pj]; }
        }
        if (id < 0) {
          const el = document.createElement('span');
          el.className = 'k-tok';
          box.appendChild(el);
          id = els.push({ el, poses: {} }) - 1;
        }
        step.map[j] = id;
      });
    });

    const measure = document.createElement('div');
    measure.className = 'k-measure';
    box.appendChild(measure);
    let base = 80, W = 1, H = 1;

    function layout(size, maxWidth) {
      base = size; W = box.clientWidth; H = box.clientHeight;
      const bx = box.getBoundingClientRect();
      seq.forEach((step) => {
        if (!step.tokens) return;
        let rects;
        if (step.from) {
          rects = step.from.map((s) => s.getBoundingClientRect());
        } else {
          measure.style.fontSize = size + 'px';
          // Cada frase puede ir centrada en otra columna (cx) y con otro ancho (maxW), en fracciones de la pantalla
          measure.style.left = ((step.cx ?? 0.5) * W) + 'px';
          measure.style.width = (step.maxW ? step.maxW * W : maxWidth) + 'px';
          measure.innerHTML = step.tokens.map((t) => '<span class="k-tok' + (t.hl ? ' hl' : '') + '">' + t.t + '</span>').join(' ');
          const spans = [...measure.children];
          const mb = measure.getBoundingClientRect();
          const dy = (step.cy ?? 0.5) * H - (mb.top - bx.top) - mb.height / 2;
          rects = spans.map((s) => { const r = s.getBoundingClientRect(); return { left: r.left, top: r.top + dy, height: r.height }; });
        }
        step.tokens.forEach((tok, j) => {
          const r = rects[j];
          const s = step.from ? (step.fromSize || size) / size : 1;
          els[step.map[j]].poses[seq.indexOf(step)] = { x: r.left - bx.left, y: r.top - bx.top, s, t: tok.t, hl: !!tok.hl };
        });
      });
      measure.innerHTML = '';
      els.forEach((e) => { e.el.style.fontSize = size + 'px'; });
    }

    function place(e, pose, dy, vis) {
      e.el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      if (e.el.textContent !== pose.t) e.el.textContent = pose.t;
      e.el.classList.toggle('hl', pose.hl);
      e.el.style.transform = 'translate(' + pose.x.toFixed(1) + 'px,' + (pose.y + dy).toFixed(1) + 'px) scale(' + pose.s.toFixed(4) + ')';
    }

    function update(y) {
      // ¿En qué tramo estamos? Quieto en una frase, o pasando de una a la siguiente.
      let k = 0;
      while (k < seq.length - 1 && y > seq[k].hold[1]) k++;
      const inHold = y >= seq[k].hold[0] || k === 0;
      if (inHold) {
        els.forEach((e) => { const p = e.poses[k]; place(e, p || {}, 0, !!p); });
        return;
      }
      const a = k - 1, b = k;
      const t = ramp(y, seq[a].hold[1], seq[b].hold[0]);
      els.forEach((e, n) => {
        const pa = e.poses[a], pb = e.poses[b];
        if (pa && pb) {
          // La palabra se queda: viaja de su lugar al nuevo
          const u = smooth(t);
          place(e, { x: lerp(pa.x, pb.x, u), y: lerp(pa.y, pb.y, u), s: lerp(pa.s, pb.s, u), t: u < 0.5 ? pa.t : pb.t, hl: u < 0.5 ? pa.hl : pb.hl }, 0, true);
        } else if (pa) {
          // Sobra: sube y se va
          const st = (n % 6) * 0.04, u = smooth(ramp(t, st, st + 0.5));
          place(e, pa, -u * H * 0.7, u < 1);
        } else if (pb) {
          // Nueva: sube desde abajo
          const st = 0.4 + (n % 6) * 0.04, u = smooth(ramp(t, st, Math.min(1, st + 0.5)));
          place(e, pb, (1 - u) * H * 0.6, u > 0);
        } else place(e, {}, 0, false);
      });
    }

    return { layout, update };
  }

  global.Kinetic = { create };
})(window);
