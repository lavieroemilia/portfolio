// case-study.js: case study template.
// 1. Entrance: each section gets "is-in" once, the first time it enters the screen.
// 2. Dialogs: a button with data-dialog opens the <dialog> with that id (Dino: the principles).
// 3. Copy email: a button with data-copy copies the address (the footer, the Contact cover).
// 4. Screens carousel (Practice): the arrows move one screen and fade at either end; the counter
//    follows the screen in place. Swipe, trackpad and keyboard scroll work natively.

(function () {
    "use strict";
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];

    // ---- 1. Entrance ----------------------------------------------------------
    const reveals = $$(".cs-reveal");
    const reveal = (el) => el.classList.add("is-in");
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => entries.forEach((e) => {
            if (!e.isIntersecting) return;
            reveal(e.target);
            io.unobserve(e.target);
        }), { threshold: 0.08 });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach(reveal);
    }

    // ---- 2. Dialogs -----------------------------------------------------------
    // Esc and the close button close it (native <dialog>); so does a click on the backdrop.
    $$("[data-dialog]").forEach((button) => {
        const dialog = document.getElementById(button.dataset.dialog);
        if (!dialog || !dialog.showModal) return;
        button.addEventListener("click", () => dialog.showModal());
        dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    });

    // ---- 3. Copy email ----------------------------------------------------------
    // A button with data-copy copies its value (no mailto) and its .copy-label says "Copied"
    // for two seconds. Without the Clipboard API, or if it refuses, it falls back to a hidden textarea.
    const copyWithTextarea = (text) => new Promise((resolve, reject) => {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        ok ? resolve() : reject();
    });
    const copy = (text) => navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(text).catch(() => copyWithTextarea(text))
        : copyWithTextarea(text);

    $$("[data-copy]").forEach((button) => {
        const label = button.querySelector(".copy-label");
        const idle = label ? label.textContent : "";
        let timer;
        button.addEventListener("click", () => {
            copy(button.dataset.copy).then(() => {
                button.classList.add("is-copied");
                if (label) label.textContent = "Copied";
                clearTimeout(timer);
                timer = setTimeout(() => {
                    button.classList.remove("is-copied");
                    if (label) label.textContent = idle;
                }, 2000);
            }, () => {});
        });
    });

    // ---- 4. Screens carousel ----------------------------------------------------
    $$(".cs-car").forEach((car) => {
        const track = car.querySelector(".cs-car-track");
        const slides = $$(".cs-car-slide", track);
        const buttons = $$(".cs-car-btn", car);
        const count = car.querySelector(".cs-car-now");
        if (!track || slides.length < 2) return;

        // The screen whose left edge is closest to the start of the track
        const current = () => {
            const start = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).scrollPaddingLeft || 0);
            let best = 0;
            slides.forEach((slide, i) => {
                if (Math.abs(slide.getBoundingClientRect().left - start) < Math.abs(slides[best].getBoundingClientRect().left - start)) best = i;
            });
            return best;
        };

        function update() {
            const max = track.scrollWidth - track.clientWidth - 2;
            const atStart = track.scrollLeft <= 2;
            const atEnd = track.scrollLeft >= max;
            buttons.forEach((button) => {
                button.setAttribute("aria-disabled", (button.dataset.dir === "1" ? atEnd : atStart) ? "true" : "false");
            });
            // At the end the last screens may all be in view: count the last one
            if (count) count.textContent = String(atEnd ? slides.length : current() + 1).padStart(2, "0");
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                if (button.getAttribute("aria-disabled") === "true") return;
                const next = Math.min(slides.length - 1, Math.max(0, current() + Number(button.dataset.dir)));
                const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft || 0);
                // The track is positioned, so offsetLeft is measured from its scroll origin
                track.scrollTo({ left: slides[next].offsetLeft - pad });
            });
        });

        track.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        // The screens load lazily: the track only has its real width once they are in
        $$("img", track).forEach((img) => img.addEventListener("load", update));
        update();
    });
})();
