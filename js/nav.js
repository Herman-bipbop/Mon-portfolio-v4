// nav.js — Dark mode toggle + scroll hide + mobile burger
(function () {
    // Apply saved theme IMMEDIATELY before page renders (prevents flash)
    const saved = localStorage.getItem('hk-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    const nav      = document.getElementById('nav');
    const burger   = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    const toggle   = document.getElementById('themeToggle');

    // Theme toggle
    if (toggle) {
        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('hk-theme', next);
        });
    }

    if (!nav) return;

    // Hide nav on scroll down, show on scroll up
    let lastY = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('hidden', y > lastY && y > 80);
        nav.classList.toggle('scrolled', y > 10);
        lastY = y <= 0 ? 0 : y;
    }, { passive: true });

    // Mobile burger
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                burger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // Mark active nav link
    const path = window.location.pathname;
    nav.querySelectorAll('.nav-links a').forEach(a => {
        const href = (a.getAttribute('href') || '').replace('../', '');
        if (path.endsWith(href) || (path.endsWith('/') && href === 'index.html')) {
            a.classList.add('active');
        }
    });
})();
