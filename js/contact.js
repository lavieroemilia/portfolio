// contact.js: Contact cover entrance: the lines draw, then the title and the cells appear
// (css/about.css, css/contact.css). The "Copy email" button is handled by js/case-study.js.

(function () {
    "use strict";
    const cover = document.querySelector(".ab-cover");
    // Two frames, so the empty state is painted before the lines start to draw
    if (cover) requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add("is-in")));
})();
