// Emilia Laviero — Portfolio
// Small progressive-enhancement touches. No frameworks, no build step.

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Smooth-scroll for in-page nav links (Work / Playground / About)
  document.querySelectorAll('.nav-links a[href^="#"], .nav-mobile-menu a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Nav: sección activa (punto debajo del link)
  // - En el home: la sección visible mientras se hace scroll, y la que se toca.
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href').endsWith('#' + id)));
  };
  // [elemento, link que se activa]. La experiencia y las fotos también son "About".
  const homeSections = [
    [document.getElementById('work'), 'work'],
    [document.getElementById('about'), 'about'],
    [document.getElementById('experiments'), 'experiments'],
    [document.querySelector('.experience'), 'about'],
  ].filter(([el]) => el);

  if (homeSections.length) {
    const updateActive = () => {
      const line = window.innerHeight * 0.4;
      let current = null;
      let currentTop = -Infinity;
      homeSections.forEach(([el, id]) => {
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > currentTop) { current = id; currentTop = top; }
      });
      setActive(current);
    };
    window.addEventListener('scroll', updateActive, { passive: true });
    navLinks.forEach((a) => a.addEventListener('click', () => setActive(a.getAttribute('href').split('#')[1])));
    updateActive();
  }

  // Mobile menu toggle
  const toggleBtn = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('navMobileMenu');

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // Contact dropdown (nav)
  const contactBtn = document.getElementById('navContactBtn');
  const contactDropdown = document.getElementById('contactDropdown');

  function setContactOpen(open) {
    if (contactDropdown) contactDropdown.classList.toggle('open', open);
    if (contactBtn) {
      contactBtn.setAttribute('aria-expanded', String(open));
      contactBtn.classList.toggle('is-active', open); // punto debajo de "Contact" mientras está abierto
      // Mientras Contact está abierto, se oculta el punto de la sección para que nunca haya dos marcados
      const links = contactBtn.closest('.nav-links');
      if (links) links.classList.toggle('contact-open', open);
    }
  }

  function closeContactDropdown() {
    setContactOpen(false);
  }

  if (contactBtn && contactDropdown) {
    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileMenu();
      setContactOpen(!contactDropdown.classList.contains('open'));
    });

    // "Contact" dentro del menú mobile abre el mismo panel
    const mobileContact = document.querySelector('.nav-mobile-contact');
    if (mobileContact) {
      mobileContact.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileMenu();
        setContactOpen(true);
      });
    }

    document.addEventListener('click', (e) => {
      if (!contactDropdown.contains(e.target) && !contactBtn.contains(e.target) && !e.target.closest('.nav-mobile-contact')) {
        closeContactDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeContactDropdown();
    });
  }

  // Copy email to clipboard (nav dropdown + footer)
  document.querySelectorAll('.copy-email-btn').forEach((btn) => {
    const email = btn.getAttribute('data-email');
    const label = btn.querySelector('.copy-email-label');
    const text = btn.querySelector('.copy-email-text');

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        const temp = document.createElement('textarea');
        temp.value = email;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      btn.classList.add('copied');
      const target = label || text;
      const original = target ? target.textContent : null;
      if (target) target.textContent = '¡Copiado!';
      if (btn.classList.contains('copy-icon-btn')) btn.setAttribute('aria-label', '¡Copiado!');
      // El check del botón de ícono dura 3s; el "¡Copiado!" del menú, 2s
      const duration = btn.classList.contains('copy-icon-btn') ? 3000 : 2000;
      setTimeout(() => {
        if (target) target.textContent = original;
        if (btn.classList.contains('copy-icon-btn')) btn.setAttribute('aria-label', 'Copiar email');
        btn.classList.remove('copied');
      }, duration);
    });
  });

  // ---------------------------------------------------------------------------
  // More case studies (carrusel)
  // Lista única de proyectos del portfolio. Para agregar o editar uno, cambiarlo
  // acá y se actualiza en todos los case studies. `id` = nombre del archivo en /pages.
  // ---------------------------------------------------------------------------
  const PROJECTS = [
    { id: 'dino', title: 'Designing a new learning experience from research to launch', services: 'Product Discovery, Product Strategy, App Design, Design System, Prototyping.', image: 'project-dino-app.jpg' },
    { id: 'quota-pms', title: 'Simplifying a complex rental-management service for agencies and tenants', services: 'Product Strategy, Research & Insights, UX Writing, Design System, Visual Design, Prototyping, User Testing.', image: 'project-quota-pms.jpg' },
    { id: 'dino-design-system', title: 'Dino Design System', services: 'Design System, Claude Code, Astro.', image: 'project-dino-design-system.jpg' },
    { id: 'tenant-scoring', title: 'Reducing friction in a complex tenant screening process', services: 'Product Strategy, Research & Insights, Interaction, UX Writing, Visual Design, Prototyping.', image: 'project-tenant-scoring.jpg' },
    { id: 'attomo', title: 'Designing ATTOMO\u2019s website', services: 'Web Design, Information Architecture, UX Writing, Visual Design & Guidelines, Prototyping.', image: 'project-attomo.jpg' },
    { id: 'wow', title: 'WOW, the cultural social network', services: 'App Design, Product Strategy, User Research, Interaction, UX Writing, Visual Design, Prototyping.', image: 'project-wow.jpg' },
    { id: 'feature-advisor', title: 'Feature Advisor, an agentic tool', services: 'AI-powered tool, Product Strategy.', image: 'lab-dino-preview.jpg' },
  ];

  const ARROW_UP_RIGHT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  document.querySelectorAll('.related-section[data-current]').forEach((section) => {
    const track = section.querySelector('.related-track');
    const dots = section.querySelector('.related-dots');
    const prev = section.querySelector('.related-prev');
    const next = section.querySelector('.related-next');
    const current = section.dataset.current;

    // Todos menos el actual, empezando por el proyecto que le sigue en la lista
    const start = PROJECTS.findIndex((p) => p.id === current);
    const ordered = PROJECTS.slice(start + 1).concat(PROJECTS.slice(0, Math.max(start, 0)));

    ordered.forEach((p) => {
      const external = Boolean(p.url);
      const a = document.createElement('a');
      a.className = 'related-card';
      a.href = p.url || `./${p.id}.html`;
      if (external) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = `
        <div class="related-card-img">
          <img src="../assets/images/${p.image}" alt="" loading="lazy">
          <span class="related-card-arrow">${ARROW_UP_RIGHT}</span>
        </div>
        <h3></h3>
        <p></p>`;
      a.querySelector('h3').textContent = p.title;
      a.querySelector('p').textContent = p.services;
      track.appendChild(a);
    });

    const cards = () => Array.from(track.children);
    const step = () => {
      const c = cards();
      return c.length > 1 ? c[1].offsetLeft - c[0].offsetLeft : track.clientWidth;
    };
    // Cantidad de posiciones = tarjetas que no entran en la primera vista + 1
    const positions = () => {
      const perView = Math.max(1, Math.round((track.clientWidth + 1) / step()));
      return Math.max(1, cards().length - perView + 1);
    };
    const index = () => Math.round(track.scrollLeft / step());
    const render = (target) => {
      const total = positions();
      const i = Math.max(0, Math.min(typeof target === 'number' ? target : index(), total - 1));
      if (dots.children.length !== total) {
        dots.innerHTML = '';
        for (let d = 0; d < total; d++) {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', `Ir al proyecto ${d + 1} de ${total}`);
          b.addEventListener('click', () => goTo(d));
          dots.appendChild(b);
        }
      }
      Array.from(dots.children).forEach((b, d) => b.setAttribute('aria-current', String(d === i)));
      prev.disabled = i <= 0;
      next.disabled = i >= total - 1;
    };

    // Al tocar una flecha o un punto, el stepper se actualiza en el momento (sin esperar al scroll)
    const goTo = (i) => {
      const total = positions();
      const target = Math.max(0, Math.min(i, total - 1));
      track.scrollTo({ left: target * step() });
      render(target);
    };

    prev.addEventListener('click', () => goTo(index() - 1));
    next.addEventListener('click', () => goTo(index() + 1));
    track.addEventListener('scroll', () => render(), { passive: true });
    window.addEventListener('resize', () => render());
    render();
  });
});
