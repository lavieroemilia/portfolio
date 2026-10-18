/* V4 lab · icons.js
   Placeholders geométricos de los cinco sentidos en SVG (mismo dibujo que en ribbon.js).
   Se reemplazarán por las ilustraciones definitivas: no deben tener personalidad propia. */
(function (global) {
  'use strict';
  const G = {
    listen: '<circle cx="-.55" cy="0" r=".14" fill="currentColor" stroke="none"/><path d="M-.193 -.405A.54 .54 0 0 1 -.193 .405M.123 -.765A1.02 1.02 0 0 1 .123 .765"/>',
    see: '<path d="M-1 0Q0 -1.05 1 0Q0 1.05 -1 0Z"/><circle r=".3" fill="currentColor" stroke="none"/>',
    speak: '<ellipse cy="-.05" rx=".95" ry=".68"/><path d="M-.55 .45L-.75 .95L-.1 .58"/>',
    taste: '<path d="M0 -1C.25 -.45 .75 -.05 .75 .3A.75 .75 0 0 1 -.75 .3C-.75 -.05 -.25 -.45 0 -1Z"/>',
    make: '<path d="M-.8 0H.8M0 -.8V.8"/>'
  };
  function icon(sense, cls) {
    return '<svg class="' + (cls || 'sense-icon') + '" viewBox="-1.25 -1.25 2.5 2.5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width=".11" stroke-linecap="round" stroke-linejoin="round">' + G[sense] + '</svg>';
  }
  // Ilustración en círculo, igual a la que dibuja ribbon.js (mismo trazo relativo), para el relevo canvas → HTML.
  function badge(sense, bg, fg, outline) {
    return '<svg class="badge-svg" viewBox="-1.02 -1.02 2.04 2.04" aria-hidden="true"><circle r="1" fill="' + bg + '" stroke="' + outline + '" stroke-width="3" vector-effect="non-scaling-stroke"/>'
      + '<g transform="scale(.62)" fill="none" stroke="' + fg + '" color="' + fg + '" stroke-width=".121" stroke-linecap="round" stroke-linejoin="round">' + G[sense] + '</g></svg>';
  }
  global.SenseIcon = icon;
  global.SenseBadge = badge;
})(window);
