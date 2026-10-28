// approach-tile.js: Approach tile visual.
// Emilia's balancing shapes (assets/lottie-animations/approach.svg, a Lottie exported as an
// animated SVG) are inlined in the tile, still on the first frame. Each hover plays one swing
// and rests on that frame again, even if the pointer stays.
// The same stack also sits in the Approach page cover: every .approach-visual swings when the
// pointer enters its trigger (the tile link, or the element marked data-approach-trigger).

(() => {
    // The export lasts 6.433s but the shapes only appear at 72.26% of it. From there the stack
    // swings and is back on its first frame at 94.02%; the rest (shapes vanishing one by one)
    // is how the export restarts, so the swing stops there.
    const DURATION = 6.433;
    const SWING_START = 0.722631 * DURATION;
    const SWING_END = 0.940236 * DURATION;

    // In the export's 1080 x 1080 space: from the still stack's left edge (396), which the CSS
    // mirror turns into the right edge, to the far end of the swing (863); top of the swing
    // (253) to the base (854). "xMinYMax" anchors that edge before the mirror.
    const VIEWBOX = "396 253 467 601";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.querySelectorAll(".approach-visual[data-src]").forEach((holder, n) => {
        const trigger = holder.closest("[data-approach-trigger], a");
        if (!trigger) return;

        let svg = null;
        let frame = null;

        function rest() {
            svg.pauseAnimations();
            svg.setCurrentTime(SWING_START);
            frame = null;
        }

        function tick() {
            const time = svg.getCurrentTime();

            if (time >= SWING_END) return rest();

            frame = requestAnimationFrame(tick);
        }

        trigger.addEventListener("mouseenter", () => {
            if (!svg || frame !== null || reducedMotion.matches) return;

            svg.unpauseAnimations();
            frame = requestAnimationFrame(tick);
        });

        fetch(holder.dataset.src)
            .then((response) => response.text())
            .then((markup) => {
                // Prefix the export's ids (i0, i1...) so they cannot clash with other inline SVGs
                holder.innerHTML = markup
                    .replace(/id="(i\d+)"/g, `id="approach-${n}-$1"`)
                    .replace(/url\(#(i\d+)\)/g, `url(#approach-${n}-$1)`);

                svg = holder.querySelector("svg");
                svg.removeAttribute("width");
                svg.removeAttribute("height");
                svg.setAttribute("viewBox", VIEWBOX);
                svg.setAttribute("preserveAspectRatio", "xMinYMax meet");
                svg.setAttribute("aria-hidden", "true");

                rest();
            });
    });
})();
