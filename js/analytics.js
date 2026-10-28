// analytics.js: sends a Umami event for every link or button with data-track.
// Umami's own data-umami-event cancels same-page links and navigates by itself, which would skip
// the menu and cover transitions; this listener only reports the click and leaves navigation as it is.
// Event name: data-track; event data: every data-track-* attribute (data-track-from="menu" -> from: "menu").
// Umami sends with keepalive, so the event survives the page change.

document.addEventListener("click", (event) => {
    const el = event.target.closest && event.target.closest("[data-track]");
    if (!el || !window.umami) return;

    const data = {};
    Object.keys(el.dataset).forEach((key) => {
        if (key.startsWith("track") && key !== "track") data[key.slice(5).toLowerCase()] = el.dataset[key];
    });

    window.umami.track(el.dataset.track, data);
}, true);
