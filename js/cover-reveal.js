// cover-reveal.js: "Cover Reveal", the transition from the menu to the pages with a dark cover
// (About, Approach, Contact). Desktop only, and not with prefers-reduced-motion, the same conditions as
// the original click transition.
//
// Leave: on a click on the About, Approach or Contact tile, the black of the tile grows as in the
// original, but its title travels straight to the place and size of the cover title (no stop in
// the centre), and the central block shrinks to the menu button of the inner pages. A flag is
// stored for the next page. nav-transitions.js still navigates after 600ms.
//
// Enter: an inline script in the <head> of about.html, approach.html and contact.html turns the flag into
// html.cover-reveal before the first paint (css/cover-reveal.css): the cover title is shown in
// place from the first frame, so it never disappears; the lines and the cells come in around it.

(function () {
    const FLAG = "coverReveal";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navContainer = document.querySelector(".nav-container");

    // Keep in sync with the cover title of each page (css/about.css, css/approach.css, css/contact.css): the width
    // of the word in em (Figtree Semi Bold, -0.02em, measured) and the columns of the grid it fills
    // from the line at 1/6.
    const COVERS = {
        tileabout: { em: 2.699, span: 2 },
        tileapproach: { em: 4.26, span: 3 },
        tilecontact: { em: 3.542, span: 3 }
    };

    // Where the capitals of the tile title start in its line box (line height 1.2), in em,
    // measured against the cover title once both are scaled (the cover title has its capitals on
    // the top of its box, line height 0.7)
    const TILE_CAPS = 0.231;

    const TILE_PADDING = 23;

    Object.keys(COVERS).forEach((id) => {
        const tile = document.getElementById(id);
        if (!tile || !navContainer) return;

        tile.addEventListener("click", () => {
            if (window.innerWidth <= 991 || reduced) return;
            // Already on that page: nav-transitions.js and the browser handle it as a normal link
            if (tile.pathname === window.location.pathname) return;

            const cover = COVERS[id];
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // The cover grid (css/about.css): the cover runs under the 60px rail, the grid starts
            // after the rail and a 60px margin, ends 120px before the edge and has six columns
            const grid = Math.min(vw - 240, 1920);
            const size = (vw - 240) * cover.span / 6 / cover.em;
            const gap = 0.13 * vh;
            const row1 = (Math.max(vh, 680) - 2 * gap - size * 0.7) / 2;
            const x = 120 + grid / 6;
            const capsY = row1 + gap;

            // The tile title, as it is now
            const title = tile.querySelector(".tile-title");
            const tileSize = parseFloat(getComputedStyle(title).fontSize);
            const scale = size / tileSize;
            const y = capsY - TILE_CAPS * size;

            // At 36px the word is about 1% wider than at the cover size: a fraction of a pixel of
            // letter spacing per letter (invisible in the tile) makes both widths the same
            const range = document.createRange();
            range.selectNodeContents(title);
            // nav-transitions.js has already scaled the title for its own transition: undo that scale
            const current = title.getBoundingClientRect().width / title.offsetWidth || 1;
            const width = range.getBoundingClientRect().width / current;
            const letters = title.textContent.trim().length;
            const spacing = (cover.em * size / scale - width) / letters;

            navContainer.style.setProperty("--cover-reveal-x", x - TILE_PADDING + "px");
            navContainer.style.setProperty("--cover-reveal-y", y - TILE_PADDING + "px");
            navContainer.style.setProperty("--cover-reveal-scale", String(scale));
            navContainer.style.setProperty("--cover-reveal-spacing", spacing + "px");
            navContainer.classList.add("cover-reveal-leave");
            try { sessionStorage.setItem(FLAG, String(Date.now())); } catch (e) {}

            // Warm the cache while the black expands
            const prefetch = document.createElement("link");
            prefetch.rel = "prefetch";
            prefetch.href = tile.href;
            document.head.appendChild(prefetch);
        });
    });

    // ---- Enter ---------------------------------------------------------------

    const html = document.documentElement;
    if (!html.classList.contains("cover-reveal")) return;

    // The cover entrance takes about 1.8s; then the page is handed back (the rail texts fade in)
    setTimeout(() => html.classList.remove("cover-reveal"), 1800);
})();
