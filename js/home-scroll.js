// home-scroll.js: scroll-driven choreography of the tiles and the central button (original embed .home-script).

const navForHomeScroll = document.querySelector(".nav");
const navTiles = document.querySelectorAll(".nav-tile");
const navTileGridlines = document.querySelectorAll(".nav-tile.nav-tile-gridlines");
const navButton = document.querySelector("#nav-button");
const navButtonGridline = document.querySelector(".nav-button.nav-button-gridline");
const navButtonTitle1 = document.querySelector(".nav-button-title-1");
const navButtonTitle2 = document.querySelector(".nav-button-title-2");
const horizontalTileLines = document.querySelectorAll(".nav-tile.nav-tile-gridlines .tile-line.nav-t, .nav-tile.nav-tile-gridlines .tile-line.nav-b");
const verticalTileLines = document.querySelectorAll(".nav-tile.nav-tile-gridlines .tile-line.nav-l, .nav-tile.nav-tile-gridlines .tile-line.nav-r");
const navWrapperGridlines = document.querySelector(".nav-wrapper-gridlines");
const outroPage = document.querySelector(".outro-page");
const partnerInfoButton = document.getElementById("partner-info-button");
const scrollChevronsForScroll = document.querySelector(".scroll-chevrons");

let firstNavButtonBreakpoint, secondNavButtonBreakpoint;
let baseWindowSize;
const initialScale = 2;
let scrollTimeout;
let currentMenuTileState;
const easeFunction = cubicBezier(1, 0.25, 0.85, 1);

// Five tiles instead of eight. No new vectors: each tile reuses the vector
// of the original tile that plays the same role, mirrored vertically like the layout
// (About on top, Contact and Resume below the block). Work and Approach take the vectors
// of Color and Logo, the two tiles that peek in from the sides during the second headline
// on desktop (and arrive first, below and above the block, on mobile).
const desktopTransformations = [
    [1, -0.1], //     Work      (original Color: peeks from the left during nav-2)
    [-0.1, -1], //    Contact   (original Voice and Tone, below the centre)
    [-4, -2], //      Resume    (original Typography, bottom-right corner)
    [-1, 0.1], //     Approach  (original Logo: peeks from the right during nav-2)
    [4, 2], //        About     (original Iconography, top-left corner)
];
const mobileTransformations = [
    [2, -3], //       Work      (original Strategy, bottom-left corner)
    [0.25, -1.5], //  Contact   (original Logo: first to arrive, below the block)
    [-2, -3], //      Resume    (original Voice and Tone, bottom-right corner)
    [-2, 3], //       Approach  (original Motion, top-right corner)
    [-0.25, 1.5], //  About     (original Color: first to arrive, above the block)
];

let transitionTimeout;
let shouldSmoothlyTransitionToState3 = false;
let scrollingFromState1 = true;

// Single intro screen. The white 800px block is gone: once the logo is drawn,
// load-in.js calls revealIntroBox() and the block turns into the purple 500px block with
// the first headline, while the tiles slide in to peek from the edges (INTRO_TILE_PEEK is
// the tile progress they rest at, so they move from there as soon as the scroll starts).
// Only a strip of colour peeks in: the title and the graphic of each tile stay hidden and
// fade in while the tiles come closer (TILE_CONTENT_FADE, in tile progress).
// The block shrinks with the logo on its way to the corner, but only turns purple once the
// outline is fully drawn (0.5s later), so the indigo outline is never drawn on indigo.
const INTRO_BOX_SIZE = "min(500px, calc(min(100vw, 100vh) - 64px))";
const INTRO_BOX_EASE = "1.25s cubic-bezier(.5,0,.3,1)";
const INTRO_BOX_COLOR = "0.6s cubic-bezier(.5,0,.2,1) 0.5s";
const INTRO_BOX_TRANSITION = `width ${INTRO_BOX_EASE}, height ${INTRO_BOX_EASE}, background-color ${INTRO_BOX_COLOR}, color ${INTRO_BOX_COLOR}`;
const INTRO_TILE_TRANSITION = "transform 1.5s cubic-bezier(.5,0,.2,1) 0.4s";
const INTRO_REVEAL_DURATION = 1900;
const INTRO_TILE_PEEK = { desktop: 0.12, mobile: 0.27 };
const TILE_CONTENT_FADE = [0.35, 0.6];
let introBoxRevealed = false;
let revealingIntroBox = false;

function revealIntroBox() {
    introBoxRevealed = true;
    revealingIntroBox = true;
    currentMenuTileState = 0;

    const movingTiles = [...navTiles, ...navTileGridlines];
    movingTiles.forEach((tile) => { tile.style.transition = INTRO_TILE_TRANSITION; });
    introScrollHandler(true);

    setTimeout(() => {
        revealingIntroBox = false;
        movingTiles.forEach((tile) => { tile.style.transition = ""; });
    }, INTRO_REVEAL_DURATION);
}

function handleIntroResize(animated = false) {
    // Snap to bottom on resize if near bottom
    if (document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 200) {
        window.scrollTo(0, document.documentElement.scrollHeight);
    }

    baseWindowSize = Math.max(window.innerWidth, window.innerHeight);

    secondNavButtonBreakpoint = 0.05 + baseWindowSize / 5000;
    firstNavButtonBreakpoint = 0; //secondNavButtonBreakpoint *0.25;

    handleIntroScroll(animated);
}

function handleIntroScroll(animated = true) {
    // Debounce scroll events
    if (!handleIntroScroll.throttled) {
        handleIntroScroll.throttled = true;
        requestAnimationFrame(() => {
            introScrollHandler(animated);
            handleIntroScroll.throttled = false;
        });
    }
}

function introScrollHandler(animated = true) {
    // Snap to bottom on stop scroll if near bottom
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
    }, 250);

    const scrollProgress = Math.min((window.scrollY || window.pageYOffset) / (document.body.offsetHeight - window.innerHeight), 1);
    const easedScrollProgress = easeFunction(scrollProgress);

    const tilePeek = window.innerWidth <= 991 ? INTRO_TILE_PEEK.mobile : INTRO_TILE_PEEK.desktop;
    const tileProgress = introBoxRevealed ? tilePeek + (1 - tilePeek) * easedScrollProgress : easedScrollProgress;

    // filter instead of opacity: transitions.css already animates the opacity of the graphics
    const contentFade = Math.min(Math.max((tileProgress - TILE_CONTENT_FADE[0]) / (TILE_CONTENT_FADE[1] - TILE_CONTENT_FADE[0]), 0), 1);
    const contentOpacity = contentFade * contentFade * (3 - 2 * contentFade);
    navForHomeScroll.style.setProperty("--tile-content-filter", contentOpacity < 1 ? `opacity(${contentOpacity})` : "none");
    const scale = initialScale - (initialScale - 1) * tileProgress;
    const fwd = tileProgress - 1;
    const bwd = 1 - tileProgress;

    const highestTileYeet = (baseWindowSize - 90) / 2 / initialScale;

    const transformations = window.innerWidth <= 991 ? mobileTransformations : desktopTransformations;

    for (let i = 0; i < transformations.length; i++) {
        const [x, y] = transformations[i];
        const scaleTransform = `scale(${scale})`;
        const xTransform = (x > 0 ? fwd : bwd) * Math.abs(x * highestTileYeet);
        const yTransform = (y > 0 ? fwd : bwd) * Math.abs(y * highestTileYeet);
        const translateTransform = `translate(${xTransform}px, ${yTransform}px)`;

        const transform = `${scaleTransform} ${translateTransform}`;

        navTiles[i].style.transform = transform;
        navTileGridlines[i].style.transform = transform;
    }

    horizontalTileLines.forEach((tile) => {
        tile.style.transform = `translateX(50%) scaleY(${1 / scale})`;
    });
    verticalTileLines.forEach((tile) => {
        tile.style.transform = `translateY(-50%) scaleX(${1 / scale})`;
    });

    if (animated) {
        navButtonTitle1.style.transition = "opacity 0.2s cubic-bezier(.2,.5,.5,1) 0.1s";
        navButtonTitle2.style.transition = "opacity 0.2s cubic-bezier(.2,.5,.5,1) 0.1s";
    } else {
        navButtonTitle1.style.transition = "initial";
        navButtonTitle2.style.transition = "initial";
    }

    if (easedScrollProgress <= firstNavButtonBreakpoint) {
        if (revealingIntroBox) {
            navButton.style.transition = INTRO_BOX_TRANSITION;
            navButtonGridline.style.transition = INTRO_BOX_TRANSITION;
        } else if (animated) {
            navButton.style.transition = "0.6s cubic-bezier(.5,0,.2,1)";
            navButtonGridline.style.transition = "0.6s cubic-bezier(.5,0,.2,1)";
        } else {
            navButton.style.transition = "initial";
            navButtonGridline.style.transition = "initial";
        }

        if (currentMenuTileState != 1) {
            currentMenuTileState = 1;
            scrollingFromState1 = true;

            // White only while the logo is drawn, then purple (see revealIntroBox)
            navButton.style.color = introBoxRevealed ? "white" : "var(--accent--tab)";
            navButton.style.background = introBoxRevealed ? "var(--accent--tab)" : "white";

            navButtonTitle1.style.opacity = "1";
            navButtonTitle2.style.opacity = "0";

            // The chevrons come back when the first headline returns
            // (the original hides them on the first scroll and never shows them again)
            scrollChevronsForScroll.style.opacity = "1";
        }

        const size = introBoxRevealed ? INTRO_BOX_SIZE : "min(800px, calc(min(100vw, 100vh) - 64px))";

        navButton.style.width = `calc(${size} - 2px)`;
        navButton.style.height = `calc(${size} - 2px)`;
        navButtonGridline.style.width = size;
        navButtonGridline.style.height = size;

        navButtonTitle1.style.transform = `scale(1)`;
        navButtonTitle2.style.transform = `scale(1)`;
    } else if (easedScrollProgress < secondNavButtonBreakpoint) {
        if (animated && scrollingFromState1) {
            navButton.style.transition = "0.6s cubic-bezier(.5,0,.2,1)";
            navButtonGridline.style.transition = "0.6s cubic-bezier(.5,0,.2,1)";
            scrollChevronsForScroll.style.transition = "0.6s cubic-bezier(.5,0,.2,1)";
        } else {
            navButton.style.transition = "initial";
            navButtonGridline.style.transition = "initial";
        }

        if (currentMenuTileState != 2) {
            currentMenuTileState = 2;
            shouldSmoothlyTransitionToState3 = true;

            // Set a timeout to reset the transition after 0.65 seconds
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => {
                shouldSmoothlyTransitionToState3 = false;
            }, 650);

            navButton.style.color = "white";
            navButton.style.background = "var(--accent--tab)";

            // The purple block keeps the first headline (Figma nav-2, 62:303);
            // the second headline is no longer shown.
            navButtonTitle1.style.opacity = "1";
            navButtonTitle2.style.opacity = "0";

            scrollChevronsForScroll.style.opacity = "0";
        }

        const size = "min(500px, calc(min(100vw, 100vh) - 64px))";

        navButton.style.width = size;
        navButton.style.height = size;
        navButtonGridline.style.width = size;
        navButtonGridline.style.height = size;

        navButtonTitle1.style.transform = `scale(1)`;
        navButtonTitle2.style.transform = `scale(1)`;
    } else {
        const navButtonShrinkProgress = (easedScrollProgress - secondNavButtonBreakpoint) / (1 - secondNavButtonBreakpoint);

        if (animated && shouldSmoothlyTransitionToState3 && easedScrollProgress < secondNavButtonBreakpoint + 0.1) {
            navButton.style.transition = "0.3s cubic-bezier(0,.8,.4,1)";
            navButtonGridline.style.transition = "0.3s cubic-bezier(0,.8,.4,1)";
        } else {
            navButton.style.transition = "initial";
            navButtonGridline.style.transition = "initial";
        }

        // The central block of the new menu is not square (Figma: 190 x 183),
        // so width and height shrink with the same progress towards their own end value.
        const width = `calc(min(500px, calc(min(100vw, 100vh) - 64px)) - calc(${navButtonShrinkProgress} * calc(min(500px, calc(min(100vw, 100vh) - 64px)) - var(--button-width))))`;
        const height = `calc(min(500px, calc(min(100vw, 100vh) - 64px)) - calc(${navButtonShrinkProgress} * calc(min(500px, calc(min(100vw, 100vh) - 64px)) - var(--button-height))))`;

        navButton.style.width = width;
        navButton.style.height = height;
        navButtonGridline.style.width = width;
        navButtonGridline.style.height = height;

        if (currentMenuTileState != 3) {
            currentMenuTileState = 3;
            scrollingFromState1 = false;

            navButton.style.color = "white";
            navButton.style.background = "var(--accent--tab)";
            navButton.style.border = "1px solid transparent";

            navButtonTitle1.style.opacity = "0";
            navButtonTitle2.style.opacity = "0";
        }

        navButtonTitle1.style.transform = `scale(${1 - navButtonShrinkProgress * 0.9})`;
        navButtonTitle2.style.transform = `scale(${1 - navButtonShrinkProgress * 0.9})`;

        navWrapperGridlines.style.transition = "initial";

        if (easedScrollProgress > 0.95) {
            const opacityProgress = (easedScrollProgress - 0.95) / 0.05;
            const opacity = 0.4 - opacityProgress * 0.4;
            navWrapperGridlines.style.opacity = opacity;
            for (let n = 0; n < navTiles.length; n++) {
                navTiles[n].style.pointerEvents = "auto";
            }
            navForHomeScroll.removeAttribute('inert', '');
        } else {
            navWrapperGridlines.style.opacity = "0.4";
            for (let n = 0; n < navTiles.length; n++) {
                navTiles[n].style.pointerEvents = "none";
            }
            navForHomeScroll.setAttribute('inert', '');
        }
    }
}

// EASING

function customTileEasing(t) {
    return (3 * Math.pow(t, 6) - 2 * Math.pow(t, 9)) * 0.7 + 0.3 - 0.3 * Math.pow(1 - t, 2);
}

function calcBezier(t, a1, a2) {
    return (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;
}

function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
    let currentX, currentT;
    let i = 0;

    const subdivisionPrecision = 0.0000001;
    const subdivisionMaxIterations = 12;

    do {
        currentT = lowerBound + (upperBound - lowerBound) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - x;
        if (currentX > 0.0) {
            upperBound = currentT;
        } else {
            lowerBound = currentT;
        }
    } while (Math.abs(currentX) > subdivisionPrecision && ++i < subdivisionMaxIterations);

    return currentT;
}

function cubicBezier(mX1, mY1, mX2, mY2) {
    if (mX1 === mY1 && mX2 === mY2) return (t) => t;
    const getTForX = (aX) => binarySubdivide(aX, 0, 1, mX1, mX2);
    return (t) => (t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2));
}

// LISTENERS

handleIntroResize(false);
window.addEventListener("load", () => handleIntroResize(false));
window.addEventListener("resize", () => handleIntroResize(false));
window.addEventListener("scroll", () => handleIntroScroll(true), { passive: true });

document.querySelector(".nav").style.transform = "translateX(0px)";

initMenuMode(0);

document.querySelector('#nav-button').tabIndex = -1;
navForHomeScroll.setAttribute('inert', '');
// The outro page and the name button belong to the interior pages
// and are not reproduced, so these two calls are guarded.
outroPage?.setAttribute('inert', '');
partnerInfoButton?.setAttribute('inert', '');

