// work.js: entrance of the Work page. Each element gets "is-in" once, the first time it
// enters the screen; CSS draws its line and fades its cover and caption. The scroll is never
// touched: no snap, no autoplay, nothing moves the covers.

(function () {
    const targets = document.querySelectorAll(".work-aside, .work-item");
    const reveal = (el) => el.classList.add("is-in");

    if (!("IntersectionObserver" in window)) {
        targets.forEach(reveal);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    targets.forEach((el) => observer.observe(el));
})();
