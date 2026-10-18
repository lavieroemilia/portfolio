/* V4 lab · ribbon.js
   El sistema de las cinco bandas: una sola columna vertebral (spine) y cinco carriles desplazados
   en paralelo a partir de ella. Como todas las bandas salen de la misma curva, cuando una se dobla
   las demás la acompañan, nunca se cruzan y nunca queda un hueco entre ellas.

   Ribbon.render(ctx, view, state, palette, style)
   - view:    { w, h } en px CSS (el ctx ya viene escalado por devicePixelRatio).
   - state:   { pts: [[x,y],…] en fracciones de w y h, W: ancho total (fracción de w),
                r: radio de las curvas (fracción de w), t0/t1: tramo visible (0..1 del largo),
                weights: [5] proporción de cada carril, cam: [escala, focoX, focoY],
                icons: opacidad 0..1, iconAt: 0 (cola) o 1 (punta), cap: 'pill' | 'round' | 'notch' | 'flat',
                lead: [5] cuánto se adelanta la punta de cada carril, en anchos de carril }
   - style:   'flow' (curvas suaves, sin contorno) o 'fold' (pliegues, contorno y sombra dura). */
(function (global) {
  'use strict';

  const PALETTES = {
    spectrum: {
      name: 'Hot Spectrum',
      bg: '#16101F', surface: '#221A2E', text: '#FFF1E4', soft: 'rgba(255,241,228,.62)', line: 'rgba(255,241,228,.16)', ink: '#16101F',
      lanes: ['#5B2EFF', '#C43CFF', '#FF3D7F', '#FF6A2B', '#FFB61E'], outline: '#0A0710',
      // Fondo y trazo de cada ilustración: otro color de la paleta, para que no sean todas blancas.
      iconBg: ['#FFB61E', '#5B2EFF', '#FFF6EA', '#C43CFF', '#FF3D7F'], iconFg: ['#0A0710', '#FFF1E4', '#0A0710', '#0A0710', '#0A0710'],
      names: ['Ultraviolet', 'Orchid', 'Watermelon', 'Persimmon', 'Saffron'],
      on: ['#FFF1E4', '#16101F', '#16101F', '#16101F', '#16101F']
    },
    // Ronda 9: todos los carriles con texto negro (contraste de 7:1 o más con #0A0710). Mismo fondo ciruela.
    bright: {
      name: 'Spectrum claro',
      bg: '#16101F', surface: '#221A2E', text: '#FFF1E4', soft: 'rgba(255,241,228,.62)', line: 'rgba(255,241,228,.16)', ink: '#16101F',
      lanes: ['#9A8CFF', '#E07BFF', '#FF6B95', '#FF7A3D', '#FFB61E'], outline: '#0A0710',
      names: ['Periwinkle', 'Orchid', 'Watermelon', 'Persimmon', 'Saffron'],
      on: ['#0A0710', '#0A0710', '#0A0710', '#0A0710', '#0A0710']
    },
    // Ronda 13: fondos menos intensos. Los mismos cinco tonos con menos saturación (polvo), contraste 10:1 o más.
    dusk: {
      name: 'Bruma',
      bg: '#16101F', surface: '#221A2E', text: '#FFF1E4', soft: 'rgba(255,241,228,.62)', line: 'rgba(255,241,228,.16)', ink: '#16101F',
      lanes: ['#B7B3EC', '#D9B5E6', '#EDB4C4', '#EEC4A8', '#EFD79A'], outline: '#0A0710',
      names: ['Haze', 'Mauve', 'Rose', 'Clay', 'Straw'],
      on: ['#0A0710', '#0A0710', '#0A0710', '#0A0710', '#0A0710']
    },
    sorbet: {
      name: 'Sorbete',
      bg: '#16101F', surface: '#221A2E', text: '#FFF1E4', soft: 'rgba(255,241,228,.62)', line: 'rgba(255,241,228,.16)', ink: '#16101F',
      lanes: ['#A9B8FF', '#D9A6FF', '#FF9EBB', '#FFAE7A', '#FFD66B'], outline: '#0A0710',
      names: ['Ice', 'Lilac', 'Raspberry', 'Peach', 'Lemon'],
      on: ['#0A0710', '#0A0710', '#0A0710', '#0A0710', '#0A0710']
    },
    pop: {
      name: 'Tropical Pop',
      bg: '#F4EEE3', surface: '#FFFFFF', text: '#17130E', soft: 'rgba(23,19,14,.62)', line: 'rgba(23,19,14,.16)', ink: '#17130E',
      lanes: ['#00BFA6', '#2E8CFF', '#FF5130', '#8A3CFF', '#FFC61A'],
      names: ['Lagoon', 'Sky', 'Coral', 'Grape', 'Sunflower'],
      on: ['#17130E', '#17130E', '#17130E', '#FFFFFF', '#17130E']
    }
  };

  const SENSES = ['listen', 'see', 'speak', 'taste', 'make'];

  /* ---------- Geometría de la columna vertebral ---------- */

  function buildSpine(pts, r) {
    // 1. Quitar puntos repetidos y alineados: solo quedan las esquinas reales.
    let P = [];
    for (const p of pts) {
      const l = P[P.length - 1];
      if (!l || Math.hypot(p[0] - l[0], p[1] - l[1]) > 0.5) P.push(p);
    }
    if (P.length < 2) return null;
    const Q = [P[0]];
    for (let i = 1; i < P.length - 1; i++) {
      const a = Q[Q.length - 1], b = P[i], c = P[i + 1];
      const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(c[0] - b[0], c[1] - b[1]);
      if (Math.abs(cr) / l > 0.004) Q.push(b);
    }
    Q.push(P[P.length - 1]);
    P = Q;

    // 2. Redondear cada esquina con un arco (o dejar el pliegue si r = 0).
    const out = [{ x: P[0][0], y: P[0][1] }];
    for (let i = 1; i < P.length - 1; i++) {
      const a = P[i - 1], b = P[i], c = P[i + 1];
      let d1x = b[0] - a[0], d1y = b[1] - a[1]; const l1 = Math.hypot(d1x, d1y); d1x /= l1; d1y /= l1;
      let d2x = c[0] - b[0], d2y = c[1] - b[1]; const l2 = Math.hypot(d2x, d2y); d2x /= l2; d2y /= l2;
      const th = Math.acos(Math.max(-1, Math.min(1, d1x * d2x + d1y * d2y)));
      if (r <= 0) { out.push({ x: b[0], y: b[1], corner: true }); continue; }
      const tanH = Math.tan(th / 2);
      const lim1 = i === 1 ? l1 : l1 * 0.5, lim2 = i === P.length - 2 ? l2 : l2 * 0.5;
      const t = Math.min(r * tanH, lim1, lim2);
      const re = t / tanH;
      const side = d1x * d2y - d1y * d2x > 0 ? 1 : -1;
      const sx = b[0] - d1x * t, sy = b[1] - d1y * t;
      const cx = sx + -d1y * re * side, cy = sy + d1x * re * side;
      const a0 = Math.atan2(sy - cy, sx - cx);
      const steps = Math.max(3, Math.ceil(th * re / 6));
      for (let k = 0; k <= steps; k++) {
        const ang = a0 + th * side * (k / steps);
        out.push({ x: cx + Math.cos(ang) * re, y: cy + Math.sin(ang) * re });
      }
    }
    out.push({ x: P[P.length - 1][0], y: P[P.length - 1][1] });

    // 3. Normales (con inglete en los pliegues) y largo acumulado.
    let s = 0;
    for (let k = 0; k < out.length; k++) {
      const p = out[k];
      if (k > 0) s += Math.hypot(p.x - out[k - 1].x, p.y - out[k - 1].y);
      p.s = s;
      let tx = 0, ty = 0, n1x = 0, n1y = 0, has1 = false;
      if (k > 0) {
        const dx = p.x - out[k - 1].x, dy = p.y - out[k - 1].y, l = Math.hypot(dx, dy) || 1;
        tx += dx / l; ty += dy / l; n1x = -dy / l; n1y = dx / l; has1 = true;
      }
      if (k < out.length - 1) {
        const dx = out[k + 1].x - p.x, dy = out[k + 1].y - p.y, l = Math.hypot(dx, dy) || 1;
        tx += dx / l; ty += dy / l;
        if (!has1) { n1x = -dy / l; n1y = dx / l; }
      }
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      let nx = -ty, ny = tx;
      const m = 1 / Math.max(0.25, nx * n1x + ny * n1y);
      p.tx = tx; p.ty = ty; p.nx = nx * m; p.ny = ny * m;
    }
    return out;
  }

  // Tramo visible de la columna, entre s0 y s1 (px de largo).
  function slice(S, s0, s1) {
    const L = S[S.length - 1].s;
    s0 = Math.max(0, s0); s1 = Math.min(L, s1);
    if (s1 - s0 < 1) return null;
    const res = [];
    const at = (s) => {
      let k = 1; while (k < S.length - 1 && S[k].s < s) k++;
      const a = S[k - 1], b = S[k], f = (s - a.s) / ((b.s - a.s) || 1);
      const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
      return { x: a.x + dx * f, y: a.y + dy * f, s, tx: dx / l, ty: dy / l, nx: -dy / l, ny: dx / l };
    };
    res.push(at(s0));
    for (const p of S) if (p.s > s0 + 0.01 && p.s < s1 - 0.01) res.push(p);
    res.push(at(s1));
    return res;
  }

  // Largo s donde la columna cruza por primera vez la altura y (si no cruza, devuelve def).
  function sAtY(V, y, def) {
    for (let k = 1; k < V.length; k++) {
      const a = V[k - 1], b = V[k];
      if ((a.y - y) * (b.y - y) <= 0 && a.y !== b.y) return a.s + (b.s - a.s) * (y - a.y) / (b.y - a.y);
    }
    return def;
  }

  /* La punta que avanza con el scroll (como FlowFest): devuelve t1 para que la punta quede cerca de
     targetY (px de pantalla). Los tramos horizontales "cuestan" alpha px de scroll por px recorrido,
     así la punta los cruza mientras la página sigue bajando, sin saltos. */
  function headT(view, st, targetY, alpha) {
    const { w, h } = view;
    const pts = st.pts.map(([x, y]) => [x * w, y * h]);
    const S = buildSpine(pts, Math.max(st.r * w, st.W * w * 0.56));
    if (!S) return 1;
    const L = S[S.length - 1].s;
    let v = S[0].y; const goal = targetY;
    for (let k = 1; k < S.length; k++) {
      const a = S[k - 1], b = S[k];
      const dv = Math.max(0, b.y - a.y) + alpha * Math.abs(b.x - a.x);
      if (v + dv >= goal) return Math.max(0, Math.min(1, (a.s + (b.s - a.s) * (dv ? (goal - v) / dv : 0)) / L));
      v += dv;
    }
    return 1;
  }

  /* ---------- Dibujo ---------- */

  function offsets(W, weights) {
    const sum = weights.reduce((a, b) => a + b, 0);
    const o = [W / 2]; let c = W / 2;
    for (const w of weights) { c -= W * w / sum; o.push(c); }
    return o; // de +W/2 (carril 0, a la izquierda del recorrido) a -W/2
  }

  function capPoints(E, tx, ty, a, b, R, cap, into) {
    // Recorre el extremo desde u=a hasta u=b (u: distancia sobre la normal).
    const nx = -ty, ny = tx;
    if (cap === 'round') {
      const A = Math.acos(Math.max(-1, Math.min(1, a / R))), B = Math.acos(Math.max(-1, Math.min(1, b / R)));
      const n = 14;
      for (let k = 0; k <= n; k++) {
        const al = A + (B - A) * k / n;
        into.push([E.x + nx * R * Math.cos(al) + tx * R * Math.sin(al), E.y + ny * R * Math.cos(al) + ty * R * Math.sin(al)]);
      }
    } else if (cap === 'pill') {
      // Punta propia de cada carril: un semicírculo del ancho del carril.
      const c = (a + b) / 2, rr = (a - b) / 2, n = 12;
      for (let k = 0; k <= n; k++) {
        const al = Math.PI * k / n;
        into.push([E.x + nx * (c + rr * Math.cos(al)) + tx * rr * Math.sin(al), E.y + ny * (c + rr * Math.cos(al)) + ty * rr * Math.sin(al)]);
      }
    } else if (cap === 'notch') {
      const depth = R * 0.55;
      const us = [a]; if ((a > 0 && b < 0) || (a < 0 && b > 0)) us.push(0); us.push(b);
      for (const u of us) {
        const v = depth * Math.abs(u) / R;
        into.push([E.x + nx * u + tx * v, E.y + ny * u + ty * v]);
      }
    }
  }

  function lanePolygon(V, a, b, R, cap) {
    // a: borde con offset mayor; b: borde con offset menor.
    const poly = [];
    for (const p of V) poly.push([p.x + p.nx * a, p.y + p.ny * a]);
    const E = V[V.length - 1];
    capPoints(E, E.tx, E.ty, a, b, R, cap, poly);
    for (let k = V.length - 1; k >= 0; k--) { const p = V[k]; poly.push([p.x + p.nx * b, p.y + p.ny * b]); }
    const S = V[0];
    // En la cola, la tangente apunta hacia atrás: la normal se invierte, así que también los offsets.
    capPoints(S, -S.tx, -S.ty, -b, -a, R, cap, poly);
    return poly;
  }

  function pathOf(ctx, poly) {
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
    ctx.closePath();
  }

  function render(ctx, view, st, pal, style) {
    const { w, h } = view;
    const [cs, cfx, cfy] = st.cam || [1, 0.5, 0.5];
    const Fx = cfx * w, Fy = cfy * h;
    const pts = st.pts.map(([x, y]) => [(x * w - Fx) * cs + w / 2, (y * h - Fy) * cs + h / 2]);
    const W = st.W * w * cs;
    const fold = style === 'fold';
    const r = fold ? 0 : Math.max(st.r * w * cs, W * 0.56);
    const S = buildSpine(pts, r);
    if (!S || W < 0.5) return null;
    const L = S[S.length - 1].s;
    const s0 = (st.t0 || 0) * L, s1 = (st.t1 == null ? 1 : st.t1) * L;
    const V = slice(S, s0, s1);
    if (!V) return null;
    const R = W / 2;
    const cap = fold ? (st.cap === 'round' || st.cap === 'pill' ? 'notch' : st.cap) : st.cap;
    const O = offsets(W, st.weights || [1, 1, 1, 1, 1]);
    // Avance escalonado: cada carril puede llegar un poco más lejos que el tramo común (en anchos de carril).
    const lead = st.lead || [0, 0, 0, 0, 0];
    const LV = O.slice(0, 5).map((o, i) => {
      const extra = fold ? 0 : lead[i] * Math.abs(O[i] - O[i + 1]);
      return extra > 0.5 ? (slice(S, s0, s1 + extra) || V) : V;
    });

    const lw = fold ? Math.max(1.5, Math.min(2.5, W / 40)) : 0;
    if (fold) {
      // Sombra dura: la silueta completa, desplazada.
      const sh = Math.max(3, Math.min(8, W / 18));
      ctx.save(); ctx.translate(sh, sh);
      pathOf(ctx, lanePolygon(V, O[0], O[5], R, cap));
      ctx.fillStyle = pal.ink; ctx.fill(); ctx.restore();
    }

    for (let i = 0; i < 5; i++) {
      const poly = lanePolygon(LV[i], O[i], O[i + 1], R, cap);
      pathOf(ctx, poly);
      ctx.fillStyle = pal.lanes[i]; ctx.fill();
      if (!fold) { ctx.strokeStyle = pal.lanes[i]; ctx.lineWidth = 0.8; ctx.stroke(); }
    }
    if (!fold && pal.outline) {
      // Contorno negro (ronda 3): cada carril con su borde, como FlowFest, sobre curvas continuas.
      ctx.strokeStyle = pal.outline; ctx.lineWidth = Math.max(1.5, Math.min(2.5, W / 50)); ctx.lineJoin = 'round';
      for (let i = 0; i < 5; i++) { pathOf(ctx, lanePolygon(LV[i], O[i], O[i + 1], R, cap)); ctx.stroke(); }
    }

    if (fold) {
      // Cara de atrás: los tramos entre pliegues alternan una sombra suave.
      const idx = [0]; V.forEach((p, k) => { if (p.corner) idx.push(k); }); idx.push(V.length - 1);
      for (let j = 1; j < idx.length - 1 && W < w * 0.45; j += 2) {
        const seg = V.slice(idx[j], idx[j + 1] + 1);
        if (seg.length < 2) continue;
        pathOf(ctx, lanePolygon(seg, O[0], O[5], R, 'flat'));
        ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fill();
      }
      ctx.strokeStyle = pal.ink; ctx.lineWidth = lw; ctx.lineJoin = 'round';
      for (let i = 0; i < 5; i++) { pathOf(ctx, lanePolygon(V, O[i], O[i + 1], R, cap)); ctx.stroke(); }
      for (const p of V) if (p.corner) {
        ctx.beginPath(); ctx.moveTo(p.x + p.nx * O[0], p.y + p.ny * O[0]); ctx.lineTo(p.x + p.nx * O[5], p.y + p.ny * O[5]); ctx.stroke();
      }
    }

    // Íconos de los sentidos, sobre cada carril, cerca de la punta (o de la cola).
    const io = st.icons || 0;
    const laneW = Math.abs(O[1] - O[0]);
    if (io > 0.01 && (laneW > 12 || st.iconSize)) {
      for (let i = 0; i < 5; i++) {
        // Con puntas propias, cada ícono va en la punta de su carril; si no, todos a la misma altura.
        const Vi = cap === 'pill' ? LV[i] : V;
        const vs = Vi[0].s, ve = Vi[Vi.length - 1].s;
        const back = cap === 'pill' ? laneW * 0.5 : Math.max(R * 0.9, laneW);
        let s = st.iconAt === 0 ? vs + back : ve - back;
        if (st.iconAt === 0.5) s = sAtY(Vi, h * (st.iconY || 0.5), s);
        let k = 1; while (k < Vi.length - 1 && Vi[k].s < s) k++;
        const a = Vi[k - 1], b = Vi[k], f = Math.max(0, Math.min(1, (s - a.s) / ((b.s - a.s) || 1)));
        const u = (O[i] + O[i + 1]) / 2;
        const x = a.x + (b.x - a.x) * f + (a.nx + (b.nx - a.nx) * f) * u;
        const y = a.y + (b.y - a.y) * f + (a.ny + (b.ny - a.ny) * f) * u;
        const ri = st.iconSize ? laneW * st.iconSize : Math.min(laneW * 0.4, 30);
        if (ri < 6) continue;
        ctx.save(); ctx.globalAlpha = io;
        drawIcon(ctx, SENSES[i], x, y, ri, pal, fold);
        ctx.restore();
      }
    }
    return { spine: V, offsets: O, W };
  }

  /* ---------- Íconos provisorios (placeholders geométricos) ---------- */

  function drawIcon(ctx, sense, x, y, r, pal, fold) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    const n = SENSES.indexOf(sense);
    ctx.fillStyle = pal.iconBg ? pal.iconBg[n] : fold ? '#FFFFFF' : pal.text === '#FFF1E4' ? '#FFF1E4' : '#FFFFFF';
    ctx.fill();
    if (fold || pal.outline) { ctx.lineWidth = Math.max(1.5, Math.min(3, r * 0.05)); ctx.strokeStyle = pal.outline || pal.ink; ctx.stroke(); }
    const fg = pal.iconFg ? pal.iconFg[n] : pal.ink;
    ctx.strokeStyle = fg; ctx.fillStyle = fg;
    ctx.lineWidth = Math.max(1.2, r * 0.075); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    glyph(ctx, sense, r * 0.62);
    ctx.restore();
  }

  function glyph(ctx, sense, g) {
    ctx.beginPath();
    if (sense === 'listen') {
      ctx.arc(-g * 0.55, 0, g * 0.14, 0, Math.PI * 2); ctx.fill();
      for (const k of [0.45, 0.85]) { ctx.beginPath(); ctx.arc(-g * 0.55, 0, g * k * 1.2, -0.85, 0.85); ctx.stroke(); }
    } else if (sense === 'see') {
      ctx.moveTo(-g, 0); ctx.quadraticCurveTo(0, -g * 1.05, g, 0); ctx.quadraticCurveTo(0, g * 1.05, -g, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, g * 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (sense === 'speak') {
      ctx.moveTo(-g * 0.55, g * 0.45); ctx.lineTo(-g * 0.75, g * 0.95); ctx.lineTo(-g * 0.1, g * 0.58);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -g * 0.05, g * 0.95, g * 0.68, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (sense === 'taste') {
      ctx.moveTo(0, -g); ctx.bezierCurveTo(g * 0.25, -g * 0.45, g * 0.75, -g * 0.05, g * 0.75, g * 0.3);
      ctx.arc(0, g * 0.3, g * 0.75, 0, Math.PI); ctx.bezierCurveTo(-g * 0.75, -g * 0.05, -g * 0.25, -g * 0.45, 0, -g);
      ctx.stroke();
    } else {
      ctx.moveTo(-g * 0.8, 0); ctx.lineTo(g * 0.8, 0); ctx.moveTo(0, -g * 0.8); ctx.lineTo(0, g * 0.8); ctx.stroke();
    }
  }

  /* ---------- Interpolación de estados ---------- */

  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic

  function mix(A, B, t) {
    const o = {};
    o.pts = A.pts.map((p, i) => [lerp(p[0], B.pts[i][0], t), lerp(p[1], B.pts[i][1], t)]);
    for (const k of ['W', 'r', 't0', 't1', 'icons', 'iconSize']) o[k] = lerp(A[k] ?? 0, B[k] ?? 0, t);
    if (A.t1 == null && B.t1 == null) o.t1 = 1;
    o.weights = A.weights.map((v, i) => lerp(v, B.weights[i], t));
    const la = A.lead || [0, 0, 0, 0, 0], lb = B.lead || [0, 0, 0, 0, 0];
    o.lead = la.map((v, i) => lerp(v, lb[i], t));
    // La escala se interpola en logaritmo: un zoom de 0,2 a 5 se siente parejo.
    const s = Math.exp(lerp(Math.log(A.cam[0]), Math.log(B.cam[0]), t));
    o.cam = [s, lerp(A.cam[1], B.cam[1], t), lerp(A.cam[2], B.cam[2], t)];
    o.cap = t < 0.5 ? A.cap : B.cap;
    o.iconAt = (A.icons || 0) >= (B.icons || 0) ? A.iconAt : B.iconAt;
    o.iconY = A.iconY;
    return o;
  }

  // Estado en la posición y (en vh) a partir de una lista de fotogramas clave { at, ...estado }.
  function stateAt(KF, y) {
    if (y <= KF[0].at) return KF[0];
    for (let i = 0; i < KF.length - 1; i++) {
      const a = KF[i], b = KF[i + 1];
      if (y <= b.at) {
        const t = (y - a.at) / ((b.at - a.at) || 1);
        return mix(a, b, (b.ease || ease)(t));
      }
    }
    return KF[KF.length - 1];
  }

  global.Ribbon = { PALETTES, SENSES, render, stateAt, mix, drawIcon, ease, headT };
})(window);
