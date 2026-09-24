// Emilia Laviero — Portfolio
// Small progressive-enhancement touches. No frameworks, no build step.

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Smooth-scroll for in-page nav links (Work / Lab / About)
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

  function closeContactDropdown() {
    if (contactDropdown) contactDropdown.classList.remove('open');
    if (contactBtn) contactBtn.setAttribute('aria-expanded', 'false');
  }

  if (contactBtn && contactDropdown) {
    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileMenu();
      const isOpen = contactDropdown.classList.toggle('open');
      contactBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!contactDropdown.contains(e.target) && !contactBtn.contains(e.target)) {
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
      if (target) {
        const original = target.textContent;
        target.textContent = '¡Copiado!';
        setTimeout(() => {
          target.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  });
});
