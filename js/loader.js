// loader.js — Soft page loader
(function () {
    const loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('done');
            setTimeout(() => loader.remove(), 600);
        }, 800);
    });
})();
