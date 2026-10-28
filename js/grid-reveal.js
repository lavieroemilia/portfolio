// grid-reveal.js: "Grid Reveal", the transition from the menu to Work (desktop only, and not
// with prefers-reduced-motion, the same conditions as the original click transition).
//
// Leave: on a click on the Work tile, the nav container gets "grid-reveal-leave" (see
// grid-reveal.css) and a flag is stored for work.html. nav-transitions.js still runs the
// original click transition and navigates after 600ms.
//
// Enter (work.html): an inline script in <head> turns the flag into html.grid-reveal before
// the first paint, so the page opens on the same black frame. This script then splits the
// black into the cells bounded by the real grid lines of Work, draws those lines and turns
// the cells white from left to right. Nothing depends on the scroll.

(function () {
    const FLAG = "gridReveal";
    const EASE = "cubic-bezier(.65,0,.15,1)"; // the easing of the black tile expansion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Leave ---------------------------------------------------------------

    const workTile = document.getElementById("tilework");
    const navContainer = document.querySelector(".nav-container");

    if (workTile && navContainer) {
        workTile.addEventListener("click", () => {
            if (window.innerWidth <= 991 || reduced) return;

            // The Work title fills three columns (css/work.css): the grid starts after the 60px rail and
            // a 60px margin, ends 120px before the edge, 12 columns with 24px gutters; "Work" is
            // 2.282em wide and runs over three columns and three gutters. Its capitals sit on
            // --work-top (clamp(40px, 8vh, 80px)), 0.25em below the top of its line box.
            const grid = Math.min(document.documentElement.clientWidth - 240, 1920);
            const size = (3 * (grid - 11 * 24) / 12 + 3 * 24) / 2.282;
            const top = Math.min(Math.max(40, 0.08 * window.innerHeight), 80);
            const tileSize = parseFloat(getComputedStyle(workTile.querySelector(".tile-title")).fontSize) || 36;
            navContainer.style.setProperty("--grid-reveal-title-y", top - 0.25 * size + "px");
            navContainer.style.setProperty("--grid-reveal-title-scale", String(size / tileSize));
            navContainer.classList.add("grid-reveal-leave");
            try { sessionStorage.setItem(FLAG, String(Date.now())); } catch (e) {}

            // Warm the cache while the black expands: the page and its first cover.
            const prefetch = document.createElement("link");
            prefetch.rel = "prefetch";
            prefetch.href = workTile.href;
            document.head.appendChild(prefetch);
            const cover = workTile.dataset.firstCover;
            if (cover) new Image().src = cover;
        });
    }

    // ---- Enter ---------------------------------------------------------------

    const html = document.documentElement;
    if (!html.classList.contains("grid-reveal")) return;

    // Timing (seconds). Lines start as the page appears (the black has just finished growing);
    // the cells overlap them, column by column with a very short stagger.
    const LINE_DURATION = 0.45;
    const CELL_START = 0.04;
    const CELL_DURATION = 0.45;
    const COLUMN_STAGGER = 0.045;
    const ROW_STAGGER = 0.02;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = (el) => el.getBoundingClientRect();

    // Columns: the rail, the grid margin, and the columns drawn by the real vertical lines of Work.
    const xs = [0, 60];
    document.querySelectorAll(".work-grid > .line-v").forEach((line) => xs.push(Math.round(rect(line).left)));
    xs.push(vw);
    const columns = [...new Set(xs)].filter((x) => x >= 0 && x <= vw).sort((a, b) => a - b);

    // Rows: the real horizontal lines (the top of each cover) that are on screen.
    const ys = [0, vh];
    const lines = [...document.querySelectorAll(".work-item > .line-h")].filter((line) => {
        const top = rect(line).top;
        if (top > 0 && top < vh) { ys.push(Math.round(top)); return true; }
        return false;
    });
    const rows = [...new Set(ys)].sort((a, b) => a - b);

    // Black cells, one per column and row
    const layer = document.createElement("div");
    layer.className = "grid-reveal-cells";
    layer.setAttribute("aria-hidden", "true");
    const cells = [];
    for (let c = 0; c < columns.length - 1; c++) {
        for (let r = 0; r < rows.length - 1; r++) {
            const cell = document.createElement("i");
            cell.style.left = columns[c] + "px";
            cell.style.top = rows[r] + "px";
            cell.style.width = columns[c + 1] - columns[c] + "px";
            cell.style.height = rows[r + 1] - rows[r] + "px";
            layer.appendChild(cell);
            cells.push({ cell, c, r });
        }
    }
    document.body.appendChild(layer);
    html.classList.add("grid-reveal-ready");

    // Everything already on screen is shown as it is at the end (no second entrance)
    document.querySelectorAll(".work-aside, .work-item").forEach((el) => {
        const r = rect(el);
        if (r.top < vh && r.bottom > 0) el.classList.add("is-in");
    });

    const animations = [];
    const ms = (s) => Math.round(s * 1000);
    const delayOf = (c, r) => CELL_START + c * COLUMN_STAGGER + r * ROW_STAGGER;

    // 1. The grid lines draw in: verticals from the top, horizontals from the left
    const railLine = document.querySelector(".nav-border-line");
    [railLine, ...document.querySelectorAll(".work-grid > .line-v")].forEach((line) => {
        if (!line) return;
        line.style.transformOrigin = "center top";
        animations.push(line.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
            { duration: ms(LINE_DURATION), easing: EASE, fill: "backwards" }));
    });
    lines.forEach((line) => {
        line.style.transformOrigin = "left center";
        animations.push(line.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
            { duration: ms(LINE_DURATION), easing: EASE, fill: "backwards" }));
    });

    // 2. Each cell turns white: its black recedes to the right, so the white advances
    //    left to right inside every cell and from cell to cell.
    cells.forEach(({ cell, c, r }) => {
        animations.push(cell.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
            { duration: ms(CELL_DURATION), delay: ms(delayOf(c, r)), easing: EASE, fill: "both" }));
    });

    // 3. The title (already in its final place) turns from white to the text colour exactly
    //    while the white edge of its cell crosses it.
    const title = document.querySelector(".work-aside .section-title");
    if (title) {
        const t = rect(title);
        const range = document.createRange();
        range.selectNodeContents(title);
        const text = range.getBoundingClientRect();
        const c = columns.findIndex((x, i) => text.left >= x && text.left < columns[i + 1]);
        const r = rows.findIndex((y, i) => t.top >= y && t.top < rows[i + 1]);
        const cellLeft = columns[c];
        const cellWidth = columns[c + 1] - cellLeft;
        const from = Math.max(0, Math.min(1, (text.left - cellLeft) / cellWidth));
        const to = Math.max(from + 0.01, Math.min(1, (text.right - cellLeft) / cellWidth));
        const ink = getComputedStyle(document.body).getPropertyValue("--text--text-light").trim() || "#1e1919";
        animations.push(title.animate(
            [{ color: "#fff", offset: 0 }, { color: "#fff", offset: from }, { color: ink, offset: to }, { color: ink, offset: 1 }],
            { duration: ms(CELL_DURATION), delay: ms(delayOf(c, r)), easing: EASE, fill: "both" }));
    }

    // 4. The title lines draw with the other lines; the rail texts appear at the end
    if (title) {
        ["::before", "::after"].forEach((pseudoElement) => {
            animations.push(title.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
                { duration: ms(LINE_DURATION), easing: EASE, fill: "backwards", pseudoElement }));
        });
    }
    const railTexts = document.querySelectorAll(".nav-page-title, .nav-brand");

    // End: hand everything back to the real page
    Promise.all(animations.map((a) => a.finished)).then(() => {
        html.classList.remove("grid-reveal", "grid-reveal-ready");
        layer.remove();
        animations.forEach((a) => a.cancel());
        railTexts.forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease" }));
    });
})();
