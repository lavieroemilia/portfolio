// scroll-chevrons.js: pulsing chevrons inviting to scroll (original embed .scroll-chevrons-script).

const scrollChevrons = document.querySelectorAll(".scroll-chevron");

const scrollChevronVisibleDelay = 2500;
const scrollChevronPulseDelay = scrollChevronVisibleDelay + 500;
const scrollChevronInterval = 2500;
const scrollChevronOffset = 75;

document.addEventListener("DOMContentLoaded", () => {
		document.querySelector(".scroll-chevrons").style.display = "block";

    setTimeout(() => {
        document.querySelector(".scroll-chevrons-container").classList.add("visible");
    }, scrollChevronVisibleDelay);

    setTimeout(() => {
		    pulseScrollChevrons();
        setInterval(pulseScrollChevrons, scrollChevronInterval);
    }, scrollChevronPulseDelay);
});

function pulseScrollChevrons() {
    scrollChevrons.forEach(async (scrollChevron, index) => {
        setTimeout(async () => {
            scrollChevron.classList.add("activated");
            await Promise.allSettled(scrollChevron.getAnimations().map(a => a.finished));
            scrollChevron.classList.remove("activated");
        }, index * scrollChevronOffset);
    });
}

