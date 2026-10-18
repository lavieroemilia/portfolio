/* V4 lab · choreo.js (ronda 8)
   La coreografía de la home como tabla de datos. Cada fotograma clave dice dónde está la cinta
   (pts), qué ancho tiene (W), qué tramo se ve (t0, t1), dónde está la cámara (cam: escala, foco)
   y si se ven los íconos. "at" es la posición del scroll en vh desde el inicio del escenario.
   El motor interpola entre fotogramas: para cambiar el ritmo se cambian estos números.

   Escenas (desktop). El escenario empieza después de Work: la cinta llega bajando por el centro
   desde el hero (heroPath) y acá sigue.
     0-70      La cinta baja por el centro, dobla a la izquierda y se ensancha
     70-200    A PRODUCT IS ONE BODY OF MANY PARTS (cinta a la izquierda, frase a la derecha)
     200-290   EVERY PART INFLUENCES THE WHOLE. (cinta a la derecha, frase a la izquierda)
     290-400   THE WHOLE SHAPES THE EXPERIENCE (cinta a la izquierda, más ancha; frase a la derecha)
     400-500   Se endereza y se ensancha: GOOD PRODUCTS MAKE SENSE sobre los cinco carriles
     500-556   Zoom in a Listen: SO I USE ALL MY SENSES
     570-1120  Los cinco sentidos: la cámara recorre la cinta de costado
     1120-1205 Zoom out, se angosta; las puntas quedan a la vista y siguen bajando con la página */
(function (global) {
  'use strict';

  const LANE_X = [0.1, 0.3, 0.5, 0.7, 0.9];
  const ACTS = [315, 435, 555, 675, 795]; // ronda 33: 290 vh antes (dos frases en vez de cinco)
  const HOLD = 35;
  const ZOOM = 5.3;
  const EQ = [1, 1, 1, 1, 1];
  // Ronda 25: los carriles avanzan en escalera en todas las secciones (en anchos de carril)
  const LEAD = [4, 3, 2, 1, 0];
  const RELEASE = 915; // el escenario se suelta acá y la cinta sigue en el documento
  const HEAD_Y = 0.75;  // altura de la punta en pantalla cuando avanza con el scroll

  // Largo de un camino de tramos rectos con esquinas de 90° redondeadas (en unidades de alto de pantalla).
  // Sirve para calcular hasta dónde llega la punta (t1) cuando la cámara está en una altura dada.
  function pathMeter(pts, a, rH) {
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot((pts[k][0] - pts[k - 1][0]) * a, pts[k][1] - pts[k - 1][1]));
    const corners = [];
    for (let k = 1; k < pts.length - 1; k++) {
      const d1 = [pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]], d2 = [pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]];
      if (Math.abs(d1[0] * d2[1] - d1[1] * d2[0]) > 1e-6) corners.push(cum[k]);
    }
    const red = rH * (2 - Math.PI / 2);
    const total = cum[cum.length - 1] - corners.length * red;
    const tOf = (sPoly) => (sPoly - corners.filter((c) => c < sPoly).length * red) / total;
    // Punto del camino a una altura y (el camino nunca sube, así que es el primer cruce)
    const atY = (y) => {
      for (let k = 1; k < pts.length; k++) {
        const y0 = pts[k - 1][1], y1 = pts[k][1];
        if (y1 > y0 && y >= y0 && y <= y1) return tOf(cum[k - 1] + (y - y0) / (y1 - y0) * (cum[k] - cum[k - 1]));
      }
      return 1;
    };
    return { tOf, atY, cum };
  }

  // entry: ancho con el que llega la cinta desde Work (más angosta); se ensancha al doblar
  // entryLead/entryCap: cómo llegan los carriles desde Work (en escalera, con puntas rectas)
  function build({ portrait = false, aspect, entry, entryLead, entryCap } = {}) {
    aspect = aspect || (portrait ? 390 / 844 : 1.6);
    const a = aspect;
    const narrow = portrait ? 0.1 : 0.04; // ronda 49: más discreta junto a About
    const FY = 2.5; // altura del mundo donde ocurren los sentidos (ronda 33: el eslalon termina antes)

    // Ronda 8: la cinta baja como un eslalon y la cámara la sigue. Primero a la izquierda (frase a la
    // derecha), después a la derecha (frase a la izquierda); en "The whole…" la cámara se aleja y se ve
    // todo el recorrido. Después se endereza, se ensancha y la cámara entra en Listen.
    const xl = portrait ? 0.15 : 0.16;
    // Ronda 33: solo dos frases. Entra por el centro (viene de Work), dobla a la izquierda (A product is one body
    // of many parts, a la derecha), vuelve al centro, se endereza, se ensancha y la cámara entra en Listen
    // (So I shape it with all my senses). Sin el resto del eslalon ni The whole shapes the experience.
    // Diez puntos, como STRAIGHT: la cinta se transforma punto a punto (los intermedios son colineales)
    const S = [[0.5, -1.6], [0.5, 0], [0.5, 1.3], [xl, 1.3], [xl, 1.9], [xl, FY], [0.5, FY], [0.5, 4], [0.5, 5.5], [0.5, 7]];
    const STRAIGHT = [[0.5, -1.6], [0.5, -1], [0.5, 0], [0.5, 1], [0.5, 2], [0.5, 2.5], [0.5, 3], [0.5, 4], [0.5, 5], [0.5, 7]];
    const Wn = portrait ? 0.2 : 0.11, rn = portrait ? 0.12 : 0.07;
    const M = pathMeter(S, a, Math.max(rn * a, Wn * a * 0.56));
    const head = (fy, off) => M.atY(fy + off);

    const entryW = entry || Wn;
    const base = { pts: STRAIGHT, W: 1, r: 0.6, t0: 0, t1: 1, weights: EQ, cam: [1, 0.5, FY], icons: 0, iconAt: 0.5, iconY: 0.4, iconSize: 0.26, cap: 'pill', lead: LEAD };
    const K = [];
    const add = (at, o) => K.push(Object.assign({}, base, o, { at }));
    const snake = (at, fy, off, o) => add(at, Object.assign({ pts: S, W: Wn, r: rn, cam: [1, 0.5, fy], t1: head(fy, off) }, o || {}));

    // 0 · Llega desde Work bajando por el centro, con la punta a 3/4 de la pantalla (igual que en heroPath)
    add(0, { pts: S, W: entryW, r: rn, cam: [1, 0.5, 0.5], t1: M.atY(HEAD_Y), lead: entryLead || LEAD, cap: entryCap || 'pill' });
    // 1 · Las puntas guían: doblan a la izquierda y la cámara empieza a seguirlas (ronda 32: más corto)
    snake(8, 0.62, 0.45);
    // 2 · A product is one body of many parts (la cinta a la izquierda, la frase a la derecha)
    snake(30, 1.9, 0.32);
    snake(150, 1.98, 0.32);
    // 3 · Vuelve al centro, se endereza y se ensancha hasta ocupar la pantalla
    add(185, { pts: STRAIGHT, W: Wn, r: rn, cam: [1, 0.5, FY], t1: 1 });
    add(212, { W: 1 });
    // 4 · Zoom in a Listen, que llena la pantalla: So I shape it with all my senses
    add(236, { cam: [ZOOM, LANE_X[0], FY] });
    add(262, { cam: [ZOOM, LANE_X[0], FY] });

    // 5 · Los sentidos: la cámara pasa de un carril al siguiente y la franja nueva cambia los textos
    const IS = portrait ? 0.2 : 0.1;
    // Rondas 45 y 47: el carril del sentido siguiente asoma por la derecha (PEEK de la pantalla), así se entiende que hay más.
    // El carril mide 0,2 × ZOOM = 1,06 pantallas: para que asome PEEK, la cámara se corre (0,03 + PEEK) / ZOOM.
    const PEEK = 0.14, shift = portrait ? 0 : (0.03 + PEEK) / ZOOM; // ronda 49: en mobile el siguiente asoma abajo (home-study.html) // ronda 47: asoma más
    ACTS.forEach((c, i) => {
      const at = { cam: [ZOOM, LANE_X[i] + (i < 4 ? shift : 0), FY], icons: 0, iconSize: IS };
      add(c - HOLD, at);
      add(c + HOLD, at);
    });

    // 6 · Zoom out y se angosta: las puntas quedan a la vista y siguen bajando con la página
    add(ACTS[4] + 75, { cam: [1, 0.5, FY], icons: 0 });
    add(RELEASE, { W: narrow, r: portrait ? 0.14 : 0.06, t1: (FY - 0.5 + HEAD_Y + 1.6) / 8.6 });
    return K;
  }

  /* Recorrido de la cinta fuera del escenario, en el documento (px desde arriba de la página).
     m: { w, h, release (scrollY al soltar), work, next } posiciones medidas en la página. */
  function docPath(m, portrait) {
    const W = portrait ? 0.1 : 0.04;
    const xr = portrait ? 0.935 : 0.975, xl = portrait ? 0.12 : 0.1; // ronda 49: más pegada al borde, fuera del texto de About
    const yA = m.work + m.h * (portrait ? 0.04 : 0.07);
    // Baja por el centro, dobla a la derecha sobre Work, baja por el margen derecho detrás de los
    // proyectos y, justo antes de About, dobla a la izquierda: las puntas quedan señalando la sección.
    const yB = m.next - m.h * (portrait ? 0.02 : 0.01);
    return {
      W, r: portrait ? 0.14 : 0.06,
      pts: [[0.5, m.release - 2 * m.h], [0.5, yA], [xr, yA], [xr, yB], [0.7, yB], [0.5, yB], [xl + 0.2, yB]]
    };
  }

  // Textos de cada escena: [entra desde, visible desde, visible hasta, sale hasta] en vh.
  const TEXT = {
    hero: [-1, -1, 25, 70],
    senses: [212, 236, 262, 280],
    acts: ACTS.map((c) => [c - 45, c - 25, c + 25, c + 45]),
  };

  global.Choreo = { HOLD, build, pathMeter, docPath, TEXT, ACTS, LANE_X, LEAD, RELEASE, HEAD_Y, STAGE_VH: RELEASE + 100 };
})(window);
