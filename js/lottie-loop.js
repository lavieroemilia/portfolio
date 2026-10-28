// lottie-loop.js: illustrations that loop (lottie-web). Every element with data-lottie-loop="file.json"
// plays its Lottie in a loop while it is on screen and pauses off screen. With
// prefers-reduced-motion it stays on its first frame. Used by the senses of Approach and the
// mantras of About.

(function () {
    "use strict";
    if (!window.lottie) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const anim = entry.target.lottieAnim;
            if (!anim) return;
            if (entry.isIntersecting) anim.play();
            else anim.pause();
        });
    }, { threshold: 0.2 });

    document.querySelectorAll("[data-lottie-loop]").forEach((holder) => {
        holder.lottieAnim = window.lottie.loadAnimation({
            container: holder,
            renderer: "svg",
            loop: true,
            autoplay: false,
            path: holder.dataset.lottieLoop,
            rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
        });
        if (!reduced) observer.observe(holder);
    });
})();
