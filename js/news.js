// ============================================================
//  news.js — Actualites : GNews API + likes + commentaires
// ============================================================

(function () {

    // ── Config ──────────────────────────────────────────────
    const API_KEY      = '55a3e66be87a76d4f7ac7755efee47c6';
    const API_BASE     = 'https://gnews.io/api/v4/search';
    const MAX_RESULTS  = 9;
    const STORAGE_KEY  = 'hk_news_interactions';

    const CATEGORIES = [
        { label: 'Cybersecurite', query: 'cybersecurity' },
        { label: 'Reseaux',       query: 'network security' },
        { label: 'Data',          query: 'data privacy' },
        { label: 'IA',            query: 'artificial intelligence' },
        { label: 'Hacking',       query: 'hacking' },
        { label: 'Dev Web',       query: 'web development' },
    ];

    // ── State ────────────────────────────────────────────────
    let currentQuery = 'cybersecurity';
    let currentPage  = 1;
    let searchTimer  = null;

    // ── DOM refs ─────────────────────────────────────────────
    const grid         = () => document.getElementById('newsGrid');
    const loadMoreWrap = () => document.getElementById('loadMoreWrap');
    const searchInput  = () => document.getElementById('newsSearch');

    // ── LocalStorage helpers ─────────────────────────────────
    function getData() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
        catch { return {}; }
    }

    function saveData(d) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }

    function getArticleKey(article) {
        const raw = (article.url || article.title || '').slice(0, 80);
        // Simple hash → base62-ish
        let h = 0;
        for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
        return 'a' + Math.abs(h).toString(36);
    }

    function getLikes(key)    { return getData()[key]?.likes    || 0; }
    function hasLiked(key)    { return !!getData()[key]?.userLiked; }
    function getComments(key) { return getData()[key]?.comments || []; }

    function toggleLike(key) {
        const d = getData();
        if (!d[key]) d[key] = { likes: 0, userLiked: false, comments: [] };
        d[key].userLiked = !d[key].userLiked;
        d[key].likes = Math.max(0, d[key].likes + (d[key].userLiked ? 1 : -1));
        saveData(d);
        return d[key];
    }

    function addComment(key, text) {
        const d = getData();
        if (!d[key]) d[key] = { likes: 0, userLiked: false, comments: [] };
        d[key].comments.push({
            text: text.trim().slice(0, 280),
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        });
        saveData(d);
        return d[key].comments;
    }

    // ── API ──────────────────────────────────────────────────
    async function fetchArticles(query, page, lang = 'fr') {
        const url = `${API_BASE}?q=${encodeURIComponent(query)}&lang=${lang}&max=${MAX_RESULTS}&page=${page}&token=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw Object.assign(new Error(err.errors?.[0] || `HTTP ${res.status}`), { status: res.status });
        }
        const data = await res.json();
        return data.articles || [];
    }

    async function loadArticles(query, page, append = false) {
        if (!append) showSkeletons();
        loadMoreWrap().style.display = 'none';

        let articles = [];
        try {
            // Try French first, fallback to English
            articles = await fetchArticles(query, page, 'fr');
            if (articles.length === 0) {
                articles = await fetchArticles(query, page, 'en');
            }
        } catch (err) {
            if (!append) {
                if (err.status === 429) {
                    showState('fa-clock', 'Limite de 100 requetes/jour atteinte.', 'Revenez demain ou utilisez une autre cle.');
                } else {
                    showState('fa-exclamation-triangle', 'Impossible de charger les articles.', err.message || '');
                }
            }
            return;
        }

        // Apply search filter client-side
        const term = searchInput().value.toLowerCase().trim();
        const filtered = term
            ? articles.filter(a => (a.title + (a.description || '')).toLowerCase().includes(term))
            : articles;

        if (!append) grid().innerHTML = '';

        if (filtered.length === 0 && !append) {
            showState('fa-search', 'Aucun article trouve.', 'Essayez un autre filtre ou terme de recherche.');
            return;
        }

        filtered.forEach((article, i) => {
            const card = buildCard(article, query);
            card.style.transitionDelay = `${i * 55}ms`;
            grid().appendChild(card);
        });

        // Trigger reveal
        requestAnimationFrame(() => {
            grid().querySelectorAll('.news-card.reveal:not(.revealed)').forEach(el => {
                el.classList.add('revealed');
            });
        });

        if (articles.length >= MAX_RESULTS) {
            loadMoreWrap().style.display = 'block';
        }
    }

    // ── Card builder ─────────────────────────────────────────
    function buildCard(article, query) {
        const key       = getArticleKey(article);
        const liked     = hasLiked(key);
        const likeCount = getLikes(key);
        const comments  = getComments(key);
        const catLabel  = CATEGORIES.find(c => c.query === query)?.label || query;

        const card = document.createElement('div');
        card.className = 'news-card reveal';
        card.dataset.key = key;

        card.innerHTML = `
            <div class="news-card-img">
                ${article.image
                    ? `<img src="${escHtml(article.image)}" alt="" loading="lazy"
                            onerror="this.parentElement.innerHTML='<div class=news-card-img-placeholder><i class=fas fa-newspaper></i></div>'">`
                    : `<div class="news-card-img-placeholder"><i class="fas fa-newspaper"></i></div>`
                }
                <div class="news-card-cat">${escHtml(catLabel)}</div>
            </div>
            <div class="news-card-body">
                <div class="news-card-source">
                    <i class="fas fa-rss"></i>
                    <span class="src-name">${escHtml(article.source?.name || 'Source')}</span>
                    &nbsp;·&nbsp; ${formatDate(article.publishedAt)}
                </div>
                <div class="news-card-title">${escHtml(article.title || 'Sans titre')}</div>
                <div class="news-card-desc">${escHtml(article.description || '')}</div>
                <div class="news-card-footer">
                    <div class="news-card-date">${formatDate(article.publishedAt)}</div>
                    <button class="like-btn${liked ? ' liked' : ''}" aria-label="Liker">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${likeCount}</span>
                    </button>
                    <button class="comment-toggle-btn" aria-label="Commenter">
                        <i class="fas fa-comment"></i>
                        <span class="cmt-count">${comments.length}</span>
                    </button>
                    <a href="${escHtml(article.url)}" target="_blank" rel="noopener noreferrer" class="news-read-link">
                        Lire <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
            <div class="comment-section" id="cs-${key}">
                <div class="comments-list" id="cl-${key}">
                    ${renderComments(comments)}
                </div>
                <div class="comment-form">
                    <input type="text" class="comment-input" id="ci-${key}"
                           placeholder="Votre commentaire..." maxlength="280">
                    <button class="comment-submit" aria-label="Envoyer">
                        <i class="fas fa-paper-plane"></i> Envoyer
                    </button>
                </div>
            </div>
        `;

        // ── Interactions ─────────────────────────────────────
        // Like
        const likeBtn = card.querySelector('.like-btn');
        likeBtn.addEventListener('click', e => {
            e.stopPropagation();
            const result = toggleLike(key);
            likeBtn.classList.toggle('liked', result.userLiked);
            likeBtn.querySelector('.like-count').textContent = result.likes;
            likeBtn.style.transform = 'scale(1.25)';
            setTimeout(() => { likeBtn.style.transform = ''; }, 200);
        });

        // Comment toggle
        const toggleBtn = card.querySelector('.comment-toggle-btn');
        const section   = card.querySelector(`#cs-${key}`);

        toggleBtn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = section.classList.toggle('open');
            toggleBtn.classList.toggle('open', isOpen);
            if (isOpen) {
                card.querySelector(`#ci-${key}`).focus();
            }
        });

        // Comment submit
        const input  = card.querySelector(`#ci-${key}`);
        const submit = card.querySelector('.comment-submit');

        function sendComment() {
            const text = input.value.trim();
            if (!text) return;
            const updated = addComment(key, text);
            card.querySelector(`#cl-${key}`).innerHTML = renderComments(updated);
            card.querySelector('.cmt-count').textContent = updated.length;
            input.value = '';
            input.focus();
        }

        submit.addEventListener('click', sendComment);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') sendComment(); });

        return card;
    }

    function renderComments(comments) {
        if (!comments.length) {
            return `<p class="comments-empty">Aucun commentaire — soyez le premier !</p>`;
        }
        return comments.map(c => `
            <div class="comment-item">
                <div class="comment-meta">
                    <i class="fas fa-user-circle"></i> Visiteur
                    <span class="comment-date">${c.date} · ${c.time}</span>
                </div>
                <div class="comment-text">${escHtml(c.text)}</div>
            </div>
        `).join('');
    }

    // ── UI states ────────────────────────────────────────────
    function showSkeletons(n = 6) {
        grid().innerHTML = Array.from({ length: n }, () => `
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
        grid().innerHTML = `
            <div class="news-state">
                <i class="fas ${icon}"></i>
                <p>${msg}</p>
                ${sub ? `<small>${sub}</small>` : ''}
            </div>
        `;
    }

    // ── Utilities ────────────────────────────────────────────
    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    function formatDate(iso) {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        // Build filter buttons
        const toolbar = document.getElementById('newsToolbar');
        CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (cat.query === currentQuery ? ' active' : '');
            btn.dataset.query = cat.query;
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentQuery = cat.query;
                currentPage  = 1;
                loadArticles(currentQuery, currentPage, false);
            });
            toolbar.appendChild(btn);
        });

        // Search
        searchInput().addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                currentPage = 1;
                loadArticles(currentQuery, currentPage, false);
            }, 480);
        });

        // Load more
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            currentPage++;
            loadArticles(currentQuery, currentPage, true);
        });

        // Initial load
        loadArticles(currentQuery, 1, false);
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();