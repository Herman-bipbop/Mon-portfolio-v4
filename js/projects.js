// projects.js — Anchor scroll + gallery lightbox
(function () {
    // Smooth scroll to anchor on load
    const hash = window.location.hash;
    if (hash) {
        setTimeout(() => {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }

    // Lightbox for gallery images
    const imgs = document.querySelectorAll('.gallery-slot img');
    if (!imgs.length) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.93);display:flex;align-items:center;justify-content:center;z-index:9000;opacity:0;visibility:hidden;transition:opacity 0.3s ease;cursor:zoom-out;';
    const lb = document.createElement('img');
    lb.style.cssText = 'max-width:90vw;max-height:88vh;object-fit:contain;box-shadow:0 20px 60px rgba(0,0,0,0.8);';
    overlay.appendChild(lb);
    document.body.appendChild(overlay);

    imgs.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            lb.src = img.src;
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        });
    });

    const close = () => { overlay.style.opacity = '0'; overlay.style.visibility = 'hidden'; };
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
