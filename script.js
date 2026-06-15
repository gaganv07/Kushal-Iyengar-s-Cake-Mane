/* ═══════════════════════════════════════════════════════════════
   Kushal Iyengar's Cake Mane — JavaScript Interactions
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────
     1. NAVBAR — Scroll Effect & Mobile Toggle
  ───────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile hamburger
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active nav link on scroll
  const sections  = document.querySelectorAll('section[id]');
  const allLinks  = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < bottom) {
        allLinks.forEach(l => l.classList.remove('active-nav'));
        const active = document.querySelector(`.nav-link[href="#${id}"]`);
        if (active) active.classList.add('active-nav');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });


  /* ─────────────────────────────────────────────
     2. SCROLL REVEAL ANIMATION
  ───────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling reveals within same parent
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────────────
     3. REVIEWS CAROUSEL
  ───────────────────────────────────────────── */
  const track      = document.getElementById('reviewsTrack');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const dotsWrap   = document.getElementById('carouselDots');
  const cards      = track ? [...track.querySelectorAll('.review-card')] : [];

  let current      = 0;
  let cardWidth    = 0;
  let cardsPerView = 1;
  let autoTimer;

  function getCardsPerView() {
    if (window.innerWidth >= 1100) return 3;
    if (window.innerWidth >= 720)  return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - cardsPerView);
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const total = getMaxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    const maxIdx = getMaxIndex();
    current = Math.max(0, Math.min(index, maxIdx));
    cardWidth = cards[0] ? cards[0].getBoundingClientRect().width + 28 : 408;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  function next() { goTo(current >= getMaxIndex() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? getMaxIndex() : current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  function startAuto() {
    autoTimer = setInterval(next, 4000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Touch / Swipe
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) {
        dx > 0 ? next() : prev();
        resetAuto();
      }
    }, { passive: true });
  }

  function initCarousel() {
    cardsPerView = getCardsPerView();
    if (current > getMaxIndex()) current = getMaxIndex();
    buildDots();
    goTo(current);
  }

  initCarousel();
  startAuto();
  window.addEventListener('resize', () => {
    initCarousel();
  });


  /* ─────────────────────────────────────────────
     4. SMOOTH SCROLL for anchor links
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────────────────
     5. ACTIVE NAV LINK STYLES
  ───────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active-nav {
      color: var(--golden) !important;
      background: rgba(212, 160, 23, 0.12);
    }
    .navbar:not(.scrolled) .nav-link.active-nav {
      color: var(--golden-light) !important;
    }
  `;
  document.head.appendChild(style);


  /* ─────────────────────────────────────────────
     6. STATS COUNTER ANIMATION
  ───────────────────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statNumbers.forEach(el => {
        const raw = el.textContent.trim();
        const numMatch = raw.match(/\d+\.?\d*/);
        if (!numMatch) return;
        const target  = parseFloat(numMatch[0]);
        const prefix  = raw.slice(0, raw.indexOf(numMatch[0]));
        const suffix  = raw.slice(raw.indexOf(numMatch[0]) + numMatch[0].length);
        const isFloat = numMatch[0].includes('.');
        let start     = 0;
        const duration = 1800;
        const startTime = performance.now();

        function step(now) {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          const value    = isFloat
            ? (start + (target - start) * ease).toFixed(1)
            : Math.round(start + (target - start) * ease);
          el.textContent = prefix + value + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
  }, { threshold: 0.5 });

  const statsBanner = document.querySelector('.stats-banner');
  if (statsBanner) statsObserver.observe(statsBanner);


  /* ─────────────────────────────────────────────
     7. WHATSAPP FLOAT — Show after scroll
  ───────────────────────────────────────────── */
  const waFloat = document.getElementById('whatsappFloat');
  if (waFloat) {
    waFloat.style.opacity = '0';
    waFloat.style.transform = 'scale(0.7)';
    waFloat.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    setTimeout(() => {
      window.addEventListener('scroll', function showWA() {
        if (window.scrollY > 400) {
          waFloat.style.opacity = '1';
          waFloat.style.transform = 'scale(1)';
          window.removeEventListener('scroll', showWA);
        }
      }, { passive: true });
    }, 3000);
  }


  /* ─────────────────────────────────────────────
     8. HERO CONTENT REVEAL ON LOAD
  ───────────────────────────────────────────── */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(30px)';
    heroContent.style.transition = 'opacity 1s ease 0.3s, transform 1s ease 0.3s';
    requestAnimationFrame(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    });
  }


  /* ─────────────────────────────────────────────
     9. PRODUCT CARD — micro-hover ripple
  ───────────────────────────────────────────── */
  document.querySelectorAll('.product-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.4);
        width: 100px;
        height: 100px;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple 0.6s linear;
        left: ${e.offsetX}px;
        top: ${e.offsetY}px;
        pointer-events: none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Ripple keyframe
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple {
      to { transform: translate(-50%, -50%) scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);


  /* ─────────────────────────────────────────────
     10. GALLERY — Lightbox-style hint animation
  ───────────────────────────────────────────── */
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      item.style.transform = 'scale(1.02)';
      setTimeout(() => { item.style.transform = ''; }, 200);
    });
  });


  console.log('🎂 Kushal Iyengar\'s Cake Mane — Website Loaded Successfully!');
});
