// home.js — Typing effect + dot grid canvas
(function () {
    // Typing effect
    const target = document.getElementById('typeTarget');
    if (target) {
        const phrases = [
            'Etudiant en Cybersecurite',
            'Developpeur Web Front-End',
            'Designer UI/UX',
            'Passionne de technologie'
        ];
        let pi = 0, ci = 0, del = false;
        function tick() {
            const p = phrases[pi];
            if (!del) {
                target.textContent = p.slice(0, ++ci);
                if (ci === p.length) { del = true; setTimeout(tick, 2200); return; }
            } else {
                target.textContent = p.slice(0, --ci);
                if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
            }
            setTimeout(tick, del ? 45 : 90);
        }
        setTimeout(tick, 1400);
    }

    // Dot grid canvas
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        draw();
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const sp = 40;
        for (let r = 0; r * sp < canvas.height + sp; r++) {
            for (let c = 0; c * sp < canvas.width + sp; c++) {
                ctx.beginPath();
                ctx.arc(c * sp + sp / 2, r * sp + sp / 2, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(24,232,90,0.55)';
                ctx.fill();
            }
        }
    }
    resize();
    window.addEventListener('resize', resize);
})();
