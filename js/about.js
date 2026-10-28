// about.js: About cover.
// 1. Entrance: the lines draw, then the title, the colour box and the photos appear (css/about.css).
// 2. Change approach : the colour box shows one sense of the approach;
//    the button brings the next one, after a short wait with three dots, in its own colour.
//    Taglines validated earlier.

(function () {
    "use strict";
    const cover = document.querySelector(".ab-cover");
    if (!cover) return;

    // ---- 1. Entrance ----------------------------------------------------------
    // Two frames, so the empty state is painted before the lines start to draw
    requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add("is-in")));

    // ---- 2. Change approach ------------------------------------------------
    const SENSES = [
        { text: "The user’s voice, even when they’re not in the room.", color: "is-green" },
        { text: "Understanding people before defining problems.", color: "is-blue" },
        { text: "Seeing the bigger picture.", color: "is-pink" },
        { text: "Good design takes good taste.", color: "is-purple" },
        { text: "Beyond ideas and prototypes.", color: "is-plum" }
    ];
    const box = cover.querySelector(".ab-quote");
    const button = cover.querySelector(".ab-suggest-btn");
    const text = cover.querySelector(".ab-quote-text");
    if (!box || !button) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let busy = false;

    button.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        box.classList.add("is-changing");
        setTimeout(() => {
            box.classList.remove(SENSES[index].color);
            index = (index + 1) % SENSES.length;
            const next = SENSES[index];
            text.textContent = next.text;
            box.classList.add(next.color);
            box.classList.remove("is-changing");
            busy = false;
        }, reduced ? 0 : 700);
    });
})();
