/* ═══════════════════════════════════════════════════
   IMMO SCHWEIZ GRUPPE — V2 Interactions
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── HAMBURGER MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const navLinks = document.querySelectorAll('[data-nav]');

  function toggleMenu() {
    const isOpen = menuOverlay.classList.contains('open');
    hamburger.classList.toggle('active');
    menuOverlay.classList.toggle('open');
    menuBackdrop.classList.toggle('visible');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  hamburger.addEventListener('click', toggleMenu);
  menuBackdrop.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuOverlay.classList.contains('open')) toggleMenu();
    });
  });

  /* ─── HEADER SCROLL STATE ─── */
  const header = document.getElementById('header');
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ─── SCROLL REVEAL (Intersection Observer) ─── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── ACCORDION ─── */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      // Close all others
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-body').style.maxHeight = null;
          openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        body.style.maxHeight = null;
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  /* ─── CONTACT FORM (demo) ─── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Gesendet';
      btn.style.background = '#4a8a5a';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        form.reset();
      }, 2500);
    });
  }

  /* ─── PROJECT CARD PARALLAX (subtle) ─── */
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const img = card.querySelector('img');
      img.style.transform = `scale(1.03) translate(${x * 8}px, ${y * 8}px)`;
    });
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('img');
      img.style.transform = '';
    });
  });

});
