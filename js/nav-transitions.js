// nav-transitions.js: click transition to a section + menu icon modes (original embed .nav-enlarge-and-menu-icon-script).

  //page transitions
  const navDec = document.querySelector('.nav-container')
  const navTilesDec = document.querySelectorAll('.nav-tile')
  const navLinksDec = document.querySelectorAll('.nav-tile > a')

  const prefersReducedMotionForTransition = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  navLinksDec.forEach((link, i) => {
    link.addEventListener('click', function(event) {
      // A link to a section of this same page (#contact) never leaves the page, so the
      // enlarged tile would stay on screen. It skips the transition (interior-nav.js scrolls there).
      if (this.pathname === window.location.pathname && this.hash) return;
      // A tile that opens in a new tab (Resume) keeps this page as it is.
      if (this.target === '_blank') return;

      if (window.innerWidth > 991 && !prefersReducedMotionForTransition) {
        event.preventDefault();
        const href = this.href;

        navDec.classList.add('close');
        navTilesDec[i].classList.add('enlarge');

        setMenuMode(1);

        setTimeout(() => {
          window.location.href = href;
        }, 600);
      }
    });
  });

  // Nav menu svg icons
  const menuIcons = [
      document.querySelector('.nav-button-svg.menu-logo'),
      document.querySelector('.nav-button-svg.menu-hamburger'),
      document.querySelector('.nav-button-svg.menu-arrow'),
      document.querySelector('.nav-button-svg.menu-close')
  ];

  function setMenuMode(mode) {
      menuIcons.forEach((icon, index) => {
          if (icon) index === mode ? icon.classList.remove('menu-svg-hidden') : icon.classList.add('menu-svg-hidden');
      });
  }

  function initMenuMode(mode) {
      setMenuMode(mode);
      menuIcons.forEach(icon => {
          icon.style.transition = "transform 0.3s cubic-bezier(.25,0,.25,1), opacity 0.3s cubic-bezier(.25,0,.25,1)";
      });
  }

  // Reload if loading from a cache, like when using the browser back/next buttons
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });

