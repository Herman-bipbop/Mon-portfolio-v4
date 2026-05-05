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

    // ── Fit hero name to viewport width ──────────────────────
    function fitHeroName() {
        const line1 = document.querySelector('.hero-name .line-1');
        const line2 = document.querySelector('.hero-name .line-2');
        if (!line1 || !line2) return;

        const availableW = window.innerWidth * 0.90; // 90vw disponible
        const padding    = window.innerWidth * 0.05; // 5vw padding gauche

        // Test sur line2 (KOUOGANG = le plus long)
        line2.style.fontSize = '10vw';
        let size = window.innerWidth * 0.10; // commence à 10vw

        // Augmenter jusqu'à remplir sans dépasser
        while (line2.scrollWidth < availableW && size < window.innerWidth * 0.15) {
            size += 0.5;
            line1.style.fontSize = size + 'px';
            line2.style.fontSize = size + 'px';
        }
        // Reculer si ça dépasse
        while (line2.scrollWidth > availableW && size > 20) {
            size -= 0.5;
            line1.style.fontSize = size + 'px';
            line2.style.fontSize = size + 'px';
        }
    }

    fitHeroName();
    window.addEventListener('resize', fitHeroName);

})();