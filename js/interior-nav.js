// interior-nav.js: global menu on inner pages. Open/close with the "warp" button, page title and
// scroll indicator on the rail, overscroll at the end of the page to open the menu, hover icon
// and Escape key.
// The page title comes from data-page-title, and Cmd/Ctrl-click goes to the home.

const navButton = document.querySelector("#nav-button");
const nav = document.querySelector(".nav");
const navContainer = document.querySelector(".nav-container");
const navPageTitle = document.querySelector(".nav-page-title");
const navScrollIndicator = document.querySelector(".nav-scroll-indicator");
// "Emilia Laviero" at the bottom of the rail
const navBrand = document.querySelector(".nav-brand");
const main = document.querySelector("main");

// Navigation Page Title

navPageTitle.innerText = document.body.dataset.pageTitle || "";
navPageTitle.style.opacity = 1;

// Navigation States

let isNavOpen = false;

initMenuMode(1);

navButton.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        window.location.href = navBrand ? navBrand.href : "index.html";
    } else {
        setNavState(!isNavOpen);
    }
});

function openNav() {
    setNavState(true);
}

function closeNav() {
    setNavState(false);
}

function toggleNav() {
    setNavState(!isNavOpen);
}

function setNavState(open) {
    navContainer.classList.add("warp");

    if (navContainer.classList.contains("close")) return;

    if (open) {
        isNavOpen = true;

        main.setAttribute("inert", "");
        nav.removeAttribute("inert");

        setMenuMode(3);

        navPageTitle.style.transition = "opacity 0.3s var(--nav-easing), transform 0.7s cubic-bezier(.4,0,.1,1)";
        navScrollIndicator.style.transition = "opacity 0.3s var(--nav-easing), transform 0.7s cubic-bezier(.4,0,.1,1)";
        if (navBrand) navBrand.style.transition = "opacity 0.3s var(--nav-easing), transform 0.7s cubic-bezier(.4,0,.1,1)";

        navContainer.classList.add("open");
        navPageTitle.style.opacity = 0;
        if (navBrand) { navBrand.style.opacity = 0; navBrand.style.pointerEvents = "none"; navBrand.setAttribute("inert", ""); }
        navScrollIndicator.style.opacity = 0;

        document.body.style.overflow = "hidden";
    } else {
        isNavOpen = false;

        nav.setAttribute("inert", "");
        main.removeAttribute("inert");

        setMenuMode(1);

        navPageTitle.style.transition = "opacity 0.3s var(--nav-easing) 0.1s, transform 0.7s cubic-bezier(.4,0,.1,1)";
        navScrollIndicator.style.transition = "opacity 0.3s var(--nav-easing) 0.1s, transform 0.7s cubic-bezier(.4,0,.1,1)";
        if (navBrand) navBrand.style.transition = "opacity 0.3s var(--nav-easing) 0.1s, transform 0.7s cubic-bezier(.4,0,.1,1)";

        navContainer.classList.remove("open");
        navPageTitle.style.opacity = 1;
        if (navBrand) { navBrand.style.opacity = 1; navBrand.style.pointerEvents = ""; navBrand.removeAttribute("inert"); }
        navScrollIndicator.style.opacity = 1;

        document.body.style.overflow = "";
    }
}

nav.setAttribute("inert", "");

// A tile that points to a section of this page (Contact, the footer) closes the menu
// and jumps there, under the closing menu (a smooth scroll stops short while lazy images load)
document.querySelectorAll(".nav-tile > a").forEach((link) => {
    link.addEventListener("click", (event) => {
        if (link.pathname !== window.location.pathname || !link.hash) return;

        event.preventDefault();
        closeNav();

        const target = document.querySelector(link.hash);
        if (target) target.scrollIntoView();
    });
});

// Disable transitions while resizing

let navResizeTimer;

window.addEventListener("resize", function () {
    clearTimeout(navResizeTimer);
    nav.parentNode.classList.add("no-transitions");

    navResizeTimer = setTimeout(() => {
        nav.parentNode.classList.remove("no-transitions");
    }, 100);
});

// SCROLL INDICATOR

function handleNavScrollIndicatorResize() {
    handleNavScrollIndicatorScroll();
}

function handleNavScrollIndicatorScroll() {
    // Debounce scroll events
    if (!handleNavScrollIndicatorScroll.throttled) {
        handleNavScrollIndicatorScroll.throttled = true;
        requestAnimationFrame(() => {
            navScrollIndicatorScrollHandler();
            handleNavScrollIndicatorScroll.throttled = false;
        });
    }
}

function navScrollIndicatorScrollHandler() {
    const scrollProgress = Math.min((window.scrollY || window.pageYOffset) / (document.body.scrollHeight - window.innerHeight), 1);
    navScrollIndicator.style.transition = "initial";
    navScrollIndicator.style.transform = window.innerWidth <= 991 ? `scaleX(${scrollProgress})` : `scaleY(${scrollProgress})`;
}

handleNavScrollIndicatorResize();
window.addEventListener("resize", () => handleNavScrollIndicatorResize());
window.addEventListener("scroll", () => handleNavScrollIndicatorScroll(true), { passive: true });

// OVERSCROLL

let overscroll = 0;
let decayInterval = null;
let overscrollThreshold = 1500;
let mobileOverscrollThreshold = 200;
let decayAmount = 15;
let decayFrequency = 2;
let progressHistory = new Array(3).fill(0);
let animationFrameId = null;
let currentProgress = 0;

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

function startDecay() {
    if (isTouchDevice) return;
    // Clear any existing interval first
    if (decayInterval) clearInterval(decayInterval);

    decayInterval = setInterval(() => {
        // Reduce overscroll by 10
        if (overscroll > 0) {
            overscroll = Math.max(0, overscroll - decayAmount);
        }

        updateInterfaceForOverscroll();

        // If we've reached 0, stop the decay
        if (overscroll <= 0) {
            clearInterval(decayInterval);
            decayInterval = null;
        }
        // If we've reached the threshold, stop the decay, but set it to 0 after 1 second
        if (overscroll >= overscrollThreshold) {
            clearInterval(decayInterval);
            decayInterval = null;
            setTimeout(() => {
                overscroll = 0;
                updateInterfaceForOverscroll();
            }, 1000);
        }
    }, decayFrequency);
}

if (isTouchDevice) {
    window.addEventListener("scroll", () => {
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

        const progress = Math.min(Math.max((window.scrollY - maxScrollY) / mobileOverscrollThreshold, 0), 1);
        updateInterfaceForOverscroll(true, progress);
    });
} else {
    window.addEventListener("wheel", (e) => {
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

        if (window.scrollY >= maxScrollY && e.deltaY > 0) {
            // Overscrolling at the bottom
            const overscrollSpeed = e.deltaY;

            overscroll += overscrollSpeed;

            updateInterfaceForOverscroll();

            startDecay();
        }
    });
}

function smoothProgress() {
    const rawProgress = Math.min(overscroll / overscrollThreshold, 1.1);
    const easedProgress = rawProgress;

    // Update progress history
    progressHistory.shift();
    progressHistory.push(easedProgress);

    // Calculate average
    const averageProgress = progressHistory.reduce((a, b) => a + b) / progressHistory.length;

    // Calculate smooth progress
    return currentProgress + (averageProgress - currentProgress) * 0.2;
}

function updateInterfaceForOverscroll(force = false, forcedProgress = 0) {
    // Smooth animation
    const animate = () => {
        currentProgress = force ? forcedProgress : smoothProgress();

        if (currentProgress <= 0.01) currentProgress = 0;

        document.documentElement.style.setProperty("--overscroll-progress", Math.max(0, Math.min(currentProgress, 1)));

        if (currentProgress >= 1) {
            openNav();
        }

        if (Math.abs(currentProgress - smoothProgress()) >= 0.001) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            if (currentProgress <= 0.05) {
                document.documentElement.style.setProperty("--overscroll-progress", 0);
            }
        }
    };

    // Cancel any existing animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Start new animation frame
    animationFrameId = requestAnimationFrame(animate);
}

// MENU ICON HOVER

navButton.addEventListener("mouseenter", () => {
    if (!isNavOpen) setMenuMode(0);
});

navButton.addEventListener("mouseleave", () => {
    if (isNavOpen) setMenuMode(3);
    else setMenuMode(1);
});

// ESCAPE KEY
document.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
        toggleNav();
        document.activeElement.blur();
    }
});
