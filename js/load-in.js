// load-in.js: intro sequence: logo draw-in, gridlines growing, logo shrinking into the button (original embed .home-load-in-script).

// ELEMENTS

const menuGridlinesVertical = document.querySelectorAll(".menu .tile-line.nav-l, .menu .tile-line.nav-r");
const menuGridlinesHorizontal = document.querySelectorAll(".menu .tile-line.nav-t, .menu .tile-line.nav-b");
const additionalGridlinesVertical = document.querySelectorAll(".nav-tile.nav-tile-gridlines .tile-line.nav-l, .nav-tile.nav-tile-gridlines .tile-line.nav-r");
const additionalGridlinesHorizontal = document.querySelectorAll(".nav-tile.nav-tile-gridlines .tile-line.nav-t, .nav-tile.nav-tile-gridlines .tile-line.nav-b");
const navContainerForLoadIn = document.querySelector(".nav-container");
const homeLogoPaths = document.querySelectorAll(".home-logo path");

// Width of the .home-logo viewBox (Emilia's logo, framed as in the Figma 91px block)
const HOME_LOGO_VIEWBOX_SIZE = 606.667;

// STATES

let alreadyAnimatedIn = false;

// FUNCTIONS

function prepareLogoPathForLoadIn() {
    const size = Math.min(800, Math.min(window.innerWidth, window.innerHeight) - 64);
    const scale = size / HOME_LOGO_VIEWBOX_SIZE;

    // The stroke does not scale, so each dash is the shape's outline measured in screen pixels
    homeLogoPaths.forEach((path) => {
        const dashArrayLength = Math.ceil(path.getTotalLength() * scale) + 2;

        path.style.strokeDasharray = `${dashArrayLength} ${dashArrayLength}`;
        path.style.strokeDashoffset = `${dashArrayLength}`;
    });
}

function animateInHome() {
    if (alreadyAnimatedIn) return;

    alreadyAnimatedIn = true;

    navContainerForLoadIn.classList.add("animating-in");

    menuGridlinesVertical.forEach((line) => {
        line.style.transition = "transform 3s cubic-bezier(.5,0,0,1), background-color 1.5s ease-in-out 0.75s";
        line.style.transform = "translate(0, -50%)";
        line.style.backgroundColor = "var(--color--accent--line-solid)";
    });
    menuGridlinesHorizontal.forEach((line) => {
        line.style.transition = "transform 3s cubic-bezier(.5,0,0,1), background-color 1.5s ease-in-out 0.75s";
        line.style.transform = "translate(50%, 0)";
        line.style.backgroundColor = "var(--color--accent--line-solid)";
    });

    additionalGridlinesVertical.forEach((line) => {
        line.style.transition = "opacity 1.5s ease-in-out 1.25s";
        line.style.transform = "translate(0, -50%)";
        line.style.opacity = "1";
    });
    additionalGridlinesHorizontal.forEach((line) => {
        line.style.transition = "opacity 1.5s ease-in-out 1.25s";
        line.style.transform = "translate(50%, 0)";
        line.style.opacity = "1";
    });

    navContainerForLoadIn.classList.add("final");

    // Single intro screen. While the logo travels to the corner (1.25s), the white
    // block turns into the purple one and the tiles peek in (home-scroll.js).
    setTimeout(revealIntroBox, 1250);

    setTimeout(() => {
        document.body.style.overflow = "";
    }, 1800);

    setTimeout(() => {
        navContainerForLoadIn.classList.remove("animating-in");
    }, 3000);
}

// INITIALIZATION

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

document.body.style.overflow = "hidden";
window.scrollTo(0, 0);

prepareLogoPathForLoadIn();

document.addEventListener("DOMContentLoaded", animateInHome);

