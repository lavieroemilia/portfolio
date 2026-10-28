// approach.js: Approach page.
// 1. Cover entrance, as About: the lines draw, then the title, the squares and the colours appear (css/about.css).
// The eye loops with js/lottie-loop.js.
// 2. Reviews carousel: the arrows move one card; they fade at either end. Swipe and keyboard scroll work natively.

(function () {
    "use strict";

    // ---- 1. Entrance ----------------------------------------------------------
    const cover = document.querySelector(".ap-cover");
    // Two frames, so the empty state is painted before the lines start to draw
    if (cover) requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add("is-in")));

    // ---- 2. Reviews carousel -------------------------------------------------
    const track = document.getElementById("reviews-track");
    if (!track) return;
    const buttons = document.querySelectorAll(".ap-rv-btn");

    function cardWidth() {
        const card = track.querySelector(".ap-rv-card");
        return card ? card.getBoundingClientRect().width : track.clientWidth;
    }

    function update() {
        const max = track.scrollWidth - track.clientWidth - 2;
        buttons.forEach((button) => {
            const atEnd = button.dataset.dir === "1" ? track.scrollLeft >= max : track.scrollLeft <= 2;
            button.setAttribute("aria-disabled", atEnd ? "true" : "false");
        });
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            if (button.getAttribute("aria-disabled") === "true") return;
            // To the next card from the one in place (a relative scrollBy stops short with snap)
            const step = cardWidth();
            const index = Math.round(track.scrollLeft / step) + Number(button.dataset.dir);
            track.scrollTo({ left: index * step });
        });
    });

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
})();
