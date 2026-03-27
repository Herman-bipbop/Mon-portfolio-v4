// contact.js — Form feedback
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = 'Message envoye !';
        btn.disabled = true;
        btn.style.cssText = 'background:#0fad44;border-color:#0fad44;color:#000;width:100%;justify-content:center;';
        setTimeout(() => {
            btn.textContent = orig;
            btn.disabled = false;
            btn.style.cssText = 'width:100%;justify-content:center;';
            form.reset();
        }, 3000);
    });
})();
