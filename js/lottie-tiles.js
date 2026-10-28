// lottie-tiles.js: tile visuals made with Emilia's Lottie files, played with
// lottie-web. Each .lottie-visual is still on its first drawn frame; it plays while its tile
// is hovered and, when the pointer leaves, finishes the current motion and rests on that frame.
//
// Markup: <div class="lottie-visual" data-src="file.json" data-viewbox="x y w h"
//         data-motion="start,end"></div>
// data-viewbox crops the Lottie canvas to the drawing at rest. data-motion is the stretch that
// moves: "start" is the frame shown at rest (the first one with a drawing) and where every
// hover and every loop begins; leaving rests on it once the frame reaches "end". When "end"
// is not the same picture as "start" (the plane flies away), the jump back is part of the loop.
// Optional data-rest-hidden="Layer name, ...": layers hidden at rest and during the first
// pass of a hover (so the motion itself brings them in); from the second pass they show,
// and they fade out again when the tile rests.
// Optional data-hollow: every layer is drawn twice, the copies (class "lottie-hollow-inner")
// above all the originals, and fills are dropped. CSS keeps both as one line at rest; on
// hover the copy narrows in the tile colour, so the line empties and only its edges show.
// With all the copies on top, lines that meet merge into a single outline.
// Optional data-once: one pass of data-motion per hover; it rests on "start" when the frame
// reaches "end", even if the pointer stays (so "end" must look like "start").

(() => {
    if (!window.lottie) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function hollow(data) {
        const offset = Math.max(...data.layers.map((layer) => layer.ind));
        const strip = (items) => items
            .filter((item) => item.ty !== "fl")
            .map((item) => (item.it ? { ...item, it: strip(item.it) } : item));
        const layers = data.layers.map((layer) => ({ ...layer, shapes: strip(layer.shapes || []) }));
        // Deep copies: lottie rewrites the data it loads, so no object can be shared
        const copies = layers.map((layer) => ({
            ...structuredClone(layer),
            ind: layer.ind + offset,
            parent: layer.parent && layer.parent + offset,
            hollowInner: true
        }));
        // Lottie draws the first layer on top
        return { ...data, layers: copies.concat(layers) };
    }

    function load(holder, source) {
        return lottie.loadAnimation({
            container: holder,
            renderer: "svg",
            loop: true,
            autoplay: false,
            ...source,
            rendererSettings: { preserveAspectRatio: "xMaxYMax meet" }
        });
    }

    document.querySelectorAll(".lottie-visual").forEach(async (holder) => {
        const tile = holder.closest(".tile");
        const [start, end] = holder.dataset.motion.split(",").map(Number);
        const once = holder.hasAttribute("data-once");
        let hovered = false;

        const animation = holder.hasAttribute("data-hollow")
            ? load(holder, { animationData: hollow(await (await fetch(holder.dataset.src)).json()) })
            : load(holder, { path: holder.dataset.src });

        function rest() {
            // pause first: goToAndStop also fires enterFrame
            animation.pause();
            animation.goToAndStop(start, true);
            holder.classList.add("is-resting");
        }

        animation.addEventListener("DOMLoaded", () => {
            const svg = holder.querySelector("svg");
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("viewBox", holder.dataset.viewbox);

            const hidden = (holder.dataset.restHidden || "").split(",").map((name) => name.trim());
            animation.renderer.elements.forEach((layer) => {
                if (!layer || !layer.layerElement) return;
                if (hidden.includes(layer.data.nm)) layer.layerElement.classList.add("lottie-rest-hidden");
                if (layer.data.hollowInner) layer.layerElement.classList.add("lottie-hollow-inner");
            });

            holder.classList.add("is-resting");
            animation.goToAndStop(start, true);
        });

        animation.addEventListener("enterFrame", () => {
            if (animation.isPaused) return;
            const frame = animation.currentFrame;
            // A loop wraps to frame 0: skip the frames before the drawing
            if (hovered && !(once && frame >= end)) {
                if (frame < start) animation.goToAndPlay(start, true);
            } else if (frame < start || frame >= end) {
                rest();
            }
        });

        // A motion that runs to the last frame wraps without passing "end"
        animation.addEventListener("loopComplete", () => {
            if (hovered && !once) holder.classList.remove("is-resting");
            else rest();
        });

        tile.addEventListener("mouseenter", () => {
            hovered = true;
            if (reducedMotion.matches || !animation.isPaused) return;
            animation.goToAndPlay(start, true);
        });

        tile.addEventListener("mouseleave", () => {
            hovered = false;
        });
    });
})();
