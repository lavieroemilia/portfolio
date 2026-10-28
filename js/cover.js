// cover.js: shared cover transition, from a project cover (Work or More work) to the hero of
// its case study. Only links that carry the hero data run it (data-hero, see below); the
// others navigate as usual. Not with prefers-reduced-motion: the link simply navigates.
//
// Leave (this page), on click:
//   1. If the grey lid of the hover is up, it goes down with its own leave animation (cover.css).
//   2. A copy of the cover is placed exactly over the original, then grows from that real
//      position to the real position of the hero, with the timing of the menu tiles when they
//      open a section (0.6s, cubic-bezier(.65,0,.15,1)). The rest of the page fades to white.
//   3. The case study opens once the cover has landed; its hero is at that very spot.
//
// The cover of the card and the hero are two original images with the same product capture
// on the same background (the hero is the wide version). During the flight the capture keeps
// one size and position in both images, so it never jumps; the hero image fades in over the
// card image inside the same box until it is the only one left.
//
// Link data (positions as fractions of each image: left, top, right, bottom of the capture):
//   data-hero          hero below 992px (3:2)          data-hero-focus
//   data-hero-wide     hero on desktop (wide version)  data-hero-wide-focus
//   data-cover-focus   the capture in the card image

(function () {
    "use strict";
    const DURATION = 600;
    const EASE = "cubic-bezier(.65,0,.15,1)";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let busy = false;

    // Where the hero of the case study is (case-study.css, .cs-hero): from 992px it sits next
    // to the 60px rail with the height of the screen; below, the whole width at 3:2.
    // WIDE is the media of the wide image in the hero <picture>.
    const DESKTOP = "(min-width: 992px)";
    const WIDE = "(min-width: 992px) and (min-aspect-ratio: 4/3)";

    // Back to this page from the history: no cover left in the air
    window.addEventListener("pageshow", () => {
        document.querySelectorAll(".cover-flight").forEach((el) => el.remove());
        document.querySelectorAll(".cover-leaving").forEach((el) => el.classList.remove("cover-leaving"));
        busy = false;
    });

    const links = [...document.querySelectorAll("a[data-hero]")];
    if (!links.length) return;

    const numbers = (v) => (v ? v.split(",").map(Number) : null);
    const heroSrc = (link) => new URL(window.matchMedia(WIDE).matches ? link.dataset.heroWide : link.dataset.hero, location.href).href;

    function heroRect() {
        const vw = document.documentElement.clientWidth;
        if (window.matchMedia(DESKTOP).matches) return { x: 60, y: 0, w: vw - 60, h: window.innerHeight };
        return { x: 0, y: 0, w: vw, h: vw / 1.5 };
    }

    // object-fit: cover, centred
    function coverFit(box, ratio) {
        let w = box.w, h = w / ratio;
        if (h < box.h) { h = box.h; w = h * ratio; }
        return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
    }
    // The capture of an image placed at r
    const capture = (r, f) => ({ x: r.x + f[0] * r.w, y: r.y + f[1] * r.h, w: (f[2] - f[0]) * r.w, h: (f[3] - f[1]) * r.h });
    // An image placed so that its capture lands on c
    function onCapture(c, f, ratio) {
        const w = c.w / (f[2] - f[0]), h = w / ratio;
        return { x: c.x - f[0] * w, y: c.y - f[1] * h, w, h };
    }
    const px = (r, o = { x: 0, y: 0 }) => ({ left: r.x - o.x + "px", top: r.y - o.y + "px", width: r.w + "px", height: r.h + "px" });

    const images = new Map();
    function warm(link) {
        const src = heroSrc(link);
        if (!images.has(src)) {
            const img = new Image();
            img.alt = "";
            img.src = src;
            images.set(src, img.decode().then(() => img, () => img));
        }
        return images.get(src);
    }

    // 1. The lid goes down (only if it is up)
    function lidDown(link) {
        return new Promise((resolve) => {
            link.classList.add("cover-leaving");
            const lid = link.querySelector(".work-hover");
            if (!lid || getComputedStyle(lid).display === "none") return resolve();
            const y = new DOMMatrixReadOnly(getComputedStyle(lid).transform).m42;
            if (y >= lid.offsetHeight - 1) return resolve();
            let done = false;
            const end = () => { if (!done) { done = true; resolve(); } };
            lid.addEventListener("transitionend", (e) => { if (e.propertyName === "transform") end(); });
            setTimeout(end, 800);
        });
    }

    // 2. The flight
    async function fly(link) {
        const prefetch = document.createElement("link");
        prefetch.rel = "prefetch";
        prefetch.href = link.href;
        document.head.appendChild(prefetch);

        const heroReady = warm(link);
        await lidDown(link);
        const hero = await heroReady;

        const media = link.querySelector(".work-media, .cs-cell-media");
        const source = media.querySelector("img");
        const m = media.getBoundingClientRect();
        const B0 = { x: m.left, y: m.top, w: m.width, h: m.height };
        const B1 = heroRect();
        const sRatio = source.naturalWidth / source.naturalHeight;
        const hRatio = hero.naturalWidth / hero.naturalHeight;
        const wide = window.matchMedia(WIDE).matches;
        const sFocus = numbers(link.dataset.coverFocus);
        const hFocus = numbers(wide ? link.dataset.heroWideFocus : link.dataset.heroFocus) || sFocus;

        // Start: the card image as it is now. End: the hero image as the case study shows it.
        const S0 = coverFit(B0, sRatio);
        const H1 = coverFit(B1, hRatio);
        // The other two keep the capture of both images on the same spot
        const S1 = sFocus ? onCapture(capture(H1, hFocus), sFocus, sRatio) : coverFit(B1, sRatio);
        const H0 = sFocus ? onCapture(capture(S0, sFocus), hFocus, hRatio) : coverFit(B0, hRatio);

        const flight = document.createElement("div");
        flight.className = "cover-flight";
        flight.setAttribute("aria-hidden", "true");
        const veil = document.createElement("div");
        veil.className = "cover-flight-veil";
        const box = document.createElement("div");
        box.className = "cover-flight-box";
        const card = new Image();
        card.alt = "";
        card.src = source.currentSrc || source.src;
        box.append(card, hero);
        flight.append(veil, box);

        Object.assign(veil.style, { opacity: 0 });
        Object.assign(box.style, px(B0));
        Object.assign(card.style, px(S0, B0));
        Object.assign(hero.style, px(H0, B0), { opacity: 0 });
        document.body.appendChild(flight);

        const timing = { duration: DURATION, easing: EASE, fill: "forwards" };
        const flights = [
            veil.animate([{ opacity: 0 }, { opacity: 1 }], timing),
            box.animate([px(B0), px(B1)], timing),
            card.animate([px(S0, B0), px(S1, B1)], timing),
            hero.animate([px(H0, B0), px(H1, B1)], timing),
            hero.animate([{ opacity: 0 }, { opacity: 1, offset: 0.55 }, { opacity: 1 }], timing),
        ];
        await Promise.all(flights.map((a) => a.finished));

        // 3. The case study opens under the cover that has just landed
        window.location.href = link.href;
    }

    links.forEach((link) => {
        const prepare = () => { warm(link); };
        link.addEventListener("pointerenter", prepare);
        link.addEventListener("focus", prepare);
        link.addEventListener("touchstart", prepare, { passive: true });

        link.addEventListener("click", (event) => {
            if (reduced || event.defaultPrevented || event.button !== 0 ||
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
            event.preventDefault();
            if (busy) return;
            busy = true;
            fly(link).catch(() => { window.location.href = link.href; });
        });
    });
})();
