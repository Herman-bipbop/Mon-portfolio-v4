// ============================================================
//  news.js — Actualites
//  API : NewsData.io (autorise les appels navigateur, CORS OK)
//  Likes + commentaires persistants via localStorage
// ============================================================

(function () {

    // ── Config ───────────────────────────────────────────────
    // NewsData.io — gratuit 200 req/jour, CORS autorise
    // Cle GNews conservee pour reference : 55a3e66be87a76d4f7ac7755efee47c6
    const API_KEY   = 'pub_86998cde62374e1a87e3fc3e3f68af4a9f68';
    const API_BASE  = 'https://newsdata.io/api/1/news';
    const STORAGE   = 'hk_news_v2';

    // Categories affichees
    const CATEGORIES = [
        { label: 'Cybersecurite', q: 'cybersecurity',          cat: 'technology' },
        { label: 'Reseaux',       q: 'network security',       cat: 'technology' },
        { label: 'Data',          q: 'data privacy',           cat: 'technology' },
        { label: 'IA',            q: 'artificial intelligence',cat: 'technology' },
        { label: 'Hacking',       q: 'hacking',                cat: 'technology' },
        { label: 'Dev Web',       q: 'web development',        cat: 'technology' },
    ];

    // ── Etat ─────────────────────────────────────────────────
    let currentCat   = CATEGORIES[0];
    let nextPage     = null;   // token de pagination NewsData
    let searchTimer  = null;

    // ── DOM ──────────────────────────────────────────────────
    const $ = id => document.getElementById(id);

    // ── LocalStorage ─────────────────────────────────────────
    function getData()     { try { return JSON.parse(localStorage.getItem(STORAGE)) || {}; } catch { return {}; } }
    function saveData(d)   { localStorage.setItem(STORAGE, JSON.stringify(d)); }

    function articleKey(a) {
        const raw = (a.link || a.title || '').slice(0, 80);
        let h = 0;
        for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
        return 'n' + Math.abs(h).toString(36);
    }

    function getLikes(k)    { return getData()[k]?.likes    || 0; }
    function hasLiked(k)    { return !!getData()[k]?.liked; }
    function getComments(k) { return getData()[k]?.comments || []; }

    function toggleLike(k) {
        const d = getData();
        if (!d[k]) d[k] = { likes: 0, liked: false, comments: [] };
        d[k].liked  = !d[k].liked;
        d[k].likes  = Math.max(0, d[k].likes + (d[k].liked ? 1 : -1));
        saveData(d);
        return d[k];
    }

    function addComment(k, text) {
        const d = getData();
        if (!d[k]) d[k] = { likes: 0, liked: false, comments: [] };
        d[k].comments.push({
            text: text.trim().slice(0, 280),
            date: new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }),
            time: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
        });
        saveData(d);
        return d[k].comments;
    }

    // ── API NewsData.io ───────────────────────────────────────
    async function fetchNews(cat, page = null) {
        // Params de base
        const params = new URLSearchParams({
            apikey:   API_KEY,
            q:        cat.q,
            language: 'fr,en',
            size:     '9',
        });

        if (page) params.set('page', page);

        const res = await fetch(`${API_BASE}?${params}`);

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.results?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.status !== 'success') {
            throw new Error(data.results?.message || 'Erreur API');
        }

        return {
            articles: data.results || [],
            nextPage: data.nextPage || null,
        };
    }

    // ── Rendu ─────────────────────────────────────────────────
    function buildCard(article, cat) {
        const k    = articleKey(article);
        const liked = hasLiked(k);
        const likes = getLikes(k);
        const cmts  = getComments(k);

        const card = document.createElement('div');
        card.className = 'news-card reveal';
        card.dataset.key = k;

        const img = article.image_url
            ? `<img src="${esc(article.image_url)}" alt="" loading="lazy"
                    onerror="this.parentElement.innerHTML='<div class=news-card-img-placeholder><i class=fas\\ fa-newspaper></i></div>'">`
            : `<div class="news-card-img-placeholder"><i class="fas fa-newspaper"></i></div>`;

        const date = article.pubDate
            ? new Date(article.pubDate).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
            : '';

        const source = article.source_name || article.source_id || 'Source';

        card.innerHTML = `
            <div class="news-card-img">
                ${img}
                <div class="news-card-cat">${esc(cat.label)}</div>
            </div>
            <div class="news-card-body">
                <div class="news-card-source">
                    <i class="fas fa-rss"></i>
                    <span class="src-name">${esc(source)}</span>
                    &nbsp;·&nbsp; ${date}
                </div>
                <div class="news-card-title">${esc(article.title || 'Sans titre')}</div>
                <div class="news-card-desc">${esc(article.description || '')}</div>
                <div class="news-card-footer">
                    <div class="news-card-date">${date}</div>
                    <button class="like-btn${liked ? ' liked' : ''}" aria-label="Liker">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${likes}</span>
                    </button>
                    <button class="comment-toggle-btn" aria-label="Commenter">
                        <i class="fas fa-comment"></i>
                        <span class="cmt-count">${cmts.length}</span>
                    </button>
                    <a href="${esc(article.link || '#')}" target="_blank" rel="noopener noreferrer" class="news-read-link">
                        Lire <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
            <div class="comment-section" id="cs-${k}">
                <div class="comments-list" id="cl-${k}">${renderComments(cmts)}</div>
                <div class="comment-form">
                    <input type="text" class="comment-input" id="ci-${k}"
                           placeholder="Votre commentaire..." maxlength="280">
                    <button class="comment-submit">
                        <i class="fas fa-paper-plane"></i> Envoyer
                    </button>
                </div>
            </div>
        `;

        // Like
        const likeBtn = card.querySelector('.like-btn');
        likeBtn.addEventListener('click', e => {
            e.stopPropagation();
            const r = toggleLike(k);
            likeBtn.classList.toggle('liked', r.liked);
            likeBtn.querySelector('.like-count').textContent = r.likes;
            likeBtn.style.transform = 'scale(1.25)';
            setTimeout(() => { likeBtn.style.transform = ''; }, 200);
        });

        // Toggle commentaires
        const toggleBtn = card.querySelector('.comment-toggle-btn');
        const section   = card.querySelector(`#cs-${k}`);
        toggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            const open = section.classList.toggle('open');
            toggleBtn.classList.toggle('open', open);
            if (open) card.querySelector(`#ci-${k}`).focus();
        });

        // Envoyer commentaire
        const input  = card.querySelector(`#ci-${k}`);
        const submit = card.querySelector('.comment-submit');
        const send   = () => {
            const t = input.value.trim();
            if (!t) return;
            const updated = addComment(k, t);
            card.querySelector(`#cl-${k}`).innerHTML = renderComments(updated);
            card.querySelector('.cmt-count').textContent = updated.length;
            input.value = '';
            input.focus();
        };
        submit.addEventListener('click', send);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

        return card;
    }

    function renderComments(list) {
        if (!list.length) return `<p class="comments-empty">Aucun commentaire — soyez le premier !</p>`;
        return list.map(c => `
            <div class="comment-item">
                <div class="comment-meta">
                    <i class="fas fa-user-circle"></i> Visiteur
                    <span class="comment-date">${c.date} · ${c.time}</span>
                </div>
                <div class="comment-text">${esc(c.text)}</div>
            </div>
        `).join('');
    }

    // ── States ────────────────────────────────────────────────
    function showSkeletons() {
        $('newsGrid').innerHTML = Array(6).fill(0).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-line w-100"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-60"></div>
                    <div class="skeleton-line w-100"></div>
                </div>
            </div>
        `).join('');
    }

    function showState(icon, msg, sub = '') {
        $('newsGrid').innerHTML = `
            <div class="news-state">
                <i class="fas ${icon}"></i>
                <p>${msg}</p>
                ${sub ? `<small>${sub}</small>` : ''}
            </div>
        `;
    }

    // ── Load ──────────────────────────────────────────────────
    async function load(cat, page = null, append = false) {
        if (!append) { showSkeletons(); nextPage = null; }
        $('loadMoreWrap').style.display = 'none';

        let data;
        try {
            data = await fetchNews(cat, page);
        } catch (err) {
            if (!append) showState('fa-exclamation-triangle', 'Impossible de charger les articles.', err.message);
            console.error('NewsData error:', err);
            return;
        }

        // Filtre recherche cote client
        const term = $('newsSearch').value.toLowerCase().trim();
        const list = term
            ? data.articles.filter(a => ((a.title || '') + (a.description || '')).toLowerCase().includes(term))
            : data.articles;

        if (!append) $('newsGrid').innerHTML = '';

        if (!list.length && !append) {
            showState('fa-search', 'Aucun article trouve.', 'Essayez un autre filtre ou terme de recherche.');
            return;
        }

        list.forEach((article, i) => {
            const card = buildCard(article, cat);
            card.style.transitionDelay = `${i * 55}ms`;
            $('newsGrid').appendChild(card);
        });

        // Reveal
        requestAnimationFrame(() => {
            $('newsGrid').querySelectorAll('.news-card:not(.revealed)').forEach(el => {
                el.classList.add('revealed');
            });
        });

        nextPage = data.nextPage;
        if (nextPage) $('loadMoreWrap').style.display = 'block';
    }

    // ── Utilitaire ────────────────────────────────────────────
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = String(str || '');
        return d.innerHTML;
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        const toolbar = $('newsToolbar');

        // Injecter les boutons filtres avant le champ de recherche
        const searchWrap = toolbar.querySelector('.news-search-wrap');

        CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (cat === currentCat ? ' active' : '');
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCat = cat;
                nextPage   = null;
                load(currentCat, null, false);
            });
            toolbar.insertBefore(btn, searchWrap);
        });

        // Recherche
        $('newsSearch').addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => load(currentCat, null, false), 480);
        });

        // Load more
        $('loadMoreBtn').addEventListener('click', () => {
            if (nextPage) load(currentCat, nextPage, true);
        });

        // Chargement initial
        load(currentCat, null, false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();