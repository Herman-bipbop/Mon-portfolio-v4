// ============================================================
//  fx.js — Animations avancées du portfolio
//  • Cursor personnalisé + magnetic buttons
//  • Parallaxe hero à la souris
//  • Page transitions
//  • Reveal directionnel (gauche/droite)
//  • Glassmorphism nav
//  • Hover project cards
//  • Compteurs avec easing
// ============================================================

(function () {
'use strict';

// ── Utils ────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const isMobile = () => window.innerWidth < 768;

// ── 1. CURSOR PERSONNALISÉ ───────────────────────────────────
function initCursor() {
  if (isMobile()) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'fx-cursor-dot';
  ring.className = 'fx-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = 0, my = 0;   // position souris
  let rx = 0, ry = 0;   // position ring (lag)
  let isHover = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform  = `translate(${mx}px, ${my}px)`;
  });

  // Hover sur éléments interactifs
  const selectors = 'a, button, .tech-card, .featured-card, .project-item, .stat-item, .soft-card, .value-card, .filter-btn';
  document.querySelectorAll(selectors).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('fx-cursor-ring--hover');
      isHover = true;
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('fx-cursor-ring--hover');
      isHover = false;
    });
  });

  // Annimation ring avec lag
  function tickCursor() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tickCursor);
  }
  tickCursor();

  // Cacher sur sortie fenêtre
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

// ── 2. MAGNETIC BUTTONS ──────────────────────────────────────
function initMagneticButtons() {
  if (isMobile()) return;

  document.querySelectorAll('.btn').forEach(btn => {
    btn.classList.add('fx-magnetic');

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.35;
      const dy   = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      btn.style.transform  = 'translate(0,0)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}

// ── 3. PARALLAXE HERO À LA SOURIS ────────────────────────────
function initHeroParallax() {
  if (isMobile()) return;

  const hero  = document.querySelector('.hero');
  const line1 = document.querySelector('.hero-name .line-1');
  const line2 = document.querySelector('.hero-name .line-2');
  const tag   = document.querySelector('.hero-tag');
  const desc  = document.querySelector('.hero-desc');
  const canvas = document.getElementById('grid-canvas');

  if (!hero || !line1) return;

  let tx1 = 0, ty1 = 0;
  let tx2 = 0, ty2 = 0;
  let ttx = 0, tty = 0;
  let cx1 = 0, cy1 = 0;
  let cx2 = 0, cy2 = 0;
  let ctx = 0, cty = 0;
  let cvx = 0, cvy = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 à 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5;

    tx1 = nx * 18;   ty1 = ny * 8;   // line1 — mouvement modéré
    tx2 = nx * -12;  ty2 = ny * -5;  // line2 — direction opposée
    ttx = nx * 10;   tty = ny * 4;   // tag
    cvx = nx * -6;   cvy = ny * -3;  // canvas
  });

  hero.addEventListener('mouseleave', () => {
    tx1 = ty1 = tx2 = ty2 = ttx = tty = cvx = cvy = 0;
  });

  function tickParallax() {
    cx1 = lerp(cx1, tx1, 0.06);
    cy1 = lerp(cy1, ty1, 0.06);
    cx2 = lerp(cx2, tx2, 0.06);
    cy2 = lerp(cy2, ty2, 0.06);
    ctx = lerp(ctx, ttx, 0.04);
    cty = lerp(cty, tty, 0.04);
    cvx = lerp(cvx, cvx, 0.04);
    cvy = lerp(cvy, cvy, 0.04);

    if (line1) line1.style.transform = `translateX(${cx1}px) translateY(${cy1}px)`;
    if (line2) line2.style.transform = `translateX(${cx2}px) translateY(${cy2}px)`;
    if (tag)   tag.style.transform   = `translateX(${ctx}px) translateY(${cty}px)`;
    if (canvas) canvas.style.transform = `translateX(${cvx}px) translateY(${cvy}px)`;

    requestAnimationFrame(tickParallax);
  }
  tickParallax();
}

// ── 4. PAGE TRANSITIONS ──────────────────────────────────────
function initPageTransitions() {
  // Créer le voile de transition
  const overlay = document.createElement('div');
  overlay.className = 'fx-page-overlay';
  overlay.innerHTML = '<div class="fx-page-overlay-bar"></div>';
  document.body.appendChild(overlay);

  // Entrée : retrait du voile
  requestAnimationFrame(() => {
    setTimeout(() => {
      overlay.classList.add('fx-page-overlay--out');
    }, 100);
  });

  // Sortie : lancer le voile avant navigation
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href') || '';
    // Ignorer liens externes, ancres, mailto, tel
    if (href.startsWith('http') || href.startsWith('#') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        href.startsWith('javascript') || link.target === '_blank') return;

    link.addEventListener('click', e => {
      e.preventDefault();
      const dest = href;
      overlay.classList.remove('fx-page-overlay--out');
      overlay.classList.add('fx-page-overlay--in');
      setTimeout(() => {
        window.location.href = dest;
      }, 500);
    });
  });
}

// ── 5. REVEAL DIRECTIONNEL ───────────────────────────────────
function initDirectionalReveal() {
  // Les éléments .reveal existants gardent leur comportement
  // On ajoute des variantes left/right automatiquement
  const items = document.querySelectorAll(
    '.project-item, .tl-item, .detail-block, .soft-card, .value-card, .stat-item'
  );

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('fx-revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  items.forEach((el, i) => {
    // Alterner gauche/droite selon position
    const dir = i % 2 === 0 ? 'fx-from-left' : 'fx-from-right';
    el.classList.add('fx-dir-reveal', dir);
    obs.observe(el);
  });
}

// ── 6. GLASSMORPHISM NAV ────────────────────────────────────
function initGlassmorphismNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 20) {
          nav.classList.add('fx-glass');
        } else {
          nav.classList.remove('fx-glass');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── 7. HOVER CARDS PROJETS ───────────────────────────────────
function initProjectCards() {
  document.querySelectorAll('.project-item').forEach(card => {
    const imgWrap = card.querySelector('.project-img-wrap');
    if (!imgWrap) return;

    // Créer un overlay vert qui monte au hover
    const overlay = document.createElement('div');
    overlay.className = 'fx-card-overlay';
    imgWrap.style.position = 'relative';
    imgWrap.appendChild(overlay);

    card.addEventListener('mouseenter', () => {
      imgWrap.classList.add('fx-img-hovered');
    });
    card.addEventListener('mouseleave', () => {
      imgWrap.classList.remove('fx-img-hovered');
    });
  });

  // Tilt 3D léger sur featured cards
  if (!isMobile()) {
    document.querySelectorAll('.featured-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const rx   = ((e.clientY - cy) / rect.height) * -8;
        const ry   = ((e.clientX - cx) / rect.width)  *  8;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }
}

// ── 8. GRAIN TEXTURE ────────────────────────────────────────
function initGrain() {
  const grain = document.createElement('div');
  grain.className = 'fx-grain';
  document.body.appendChild(grain);
}

// ── 9. SECTION TAG UNDERLINE ANIMATION ──────────────────────
function initSectionTags() {
  const tags = document.querySelectorAll('.section-tag, .page-hero-tag, .about-side-tag');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('fx-tag-animate');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  tags.forEach(t => obs.observe(t));
}

// ── 10. SMOOTH SCROLL AVEC EASING ───────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── 11. LUEUR VERTE SUR LES ÉLÉMENTS ACTIFS (dark mode) ─────
function initGlowEffects() {
  // Observer le theme actuel
  function applyGlow() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.body.classList.toggle('fx-dark-glow', isDark);
  }
  applyGlow();

  // Observer les changements de theme
  const mo = new MutationObserver(applyGlow);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}


// ── 12. BACK TO TOP ─────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── INIT GÉNÉRAL ─────────────────────────────────────────────
function init() {
  initGrain();
  initCursor();
  initGlassmorphismNav();
  initPageTransitions();
  initDirectionalReveal();
  initSectionTags();
  initGlowEffects();
  initSmoothScroll();
  initProjectCards();
  initBackToTop();

  // Délai léger pour que le DOM soit prêt
  setTimeout(() => {
    initMagneticButtons();
    initHeroParallax();
  }, 200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
