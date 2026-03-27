// animations.js — Reveal on scroll + skill bars + stat counters
(function () {
    // Scroll reveal
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const d = parseInt(e.target.dataset.delay || 0);
                    setTimeout(() => e.target.classList.add('revealed'), d);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => obs.observe(el));
    }

    // Skill level bars
    const bars = document.querySelectorAll('.level-fill');
    if (bars.length) {
        const barObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.width = (e.target.dataset.level || 0) + '%';
                    barObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.2 });
        bars.forEach(el => barObs.observe(el));
    }

    // Stat number counters
    const nums = document.querySelectorAll('.stat-number');
    if (nums.length) {
        const numObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const target = parseInt(e.target.textContent);
                    const suffix = e.target.textContent.replace(/[0-9]/g, '');
                    let cur = 0;
                    const step = Math.ceil(target / 30);
                    const tick = setInterval(() => {
                        cur = Math.min(cur + step, target);
                        e.target.textContent = cur + suffix;
                        if (cur >= target) clearInterval(tick);
                    }, 40);
                    numObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        nums.forEach(el => numObs.observe(el));
    }
})();
