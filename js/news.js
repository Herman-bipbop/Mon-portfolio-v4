// ============================================================
//  news.js — Actualites Tech & Cyber
//  Sources :
//    1. HackerNews Algolia API (gratuit, CORS OK, pas de cle)
//    2. Fallback : HackerNews Firebase API officielle
//  Likes + commentaires persistants via localStorage
// ============================================================

(function () {

    // ── Config ───────────────────────────────────────────────
    const HN_SEARCH  = 'https://hn.algolia.com/api/v1/search';
    const HN_ITEM    = 'https://hacker-news.firebaseio.com/v0/item';
    const HN_TOP     = 'https://hacker-news.firebaseio.com/v0/topstories.json';
    const STORAGE    = 'hk_news_v3';
    const PAGE_SIZE  = 9;

    // Mots-cles par categorie
    const CATEGORIES = [
        { label: 'Cybersecurite', q: 'cybersecurity hacking' },
        { label: 'Reseaux',       q: 'network security firewall' },
        { label: 'Data',          q: 'data privacy GDPR leak' },
        { label: 'IA',            q: 'artificial intelligence LLM' },
        { label: 'Hacking',       q: 'exploit vulnerability CVE' },
        { label: 'Dev Web',       q: 'web development javascript' },
    ];

    // ── Etat ─────────────────────────────────────────────────
    let currentCat  = CATEGORIES[0];
    let currentPage = 0;       // page Algolia (0-based)
    let searchTimer = null;
    let loading     = false;

    // ── DOM ──────────────────────────────────────────────────
    const $ = id => document.getElementById(id);

    // ── LocalStorage ─────────────────────────────────────────
    function getData()   { try { return JSON.parse(localStorage.getItem(STORAGE)) || {}; } catch { return {}; } }
    function saveData(d) { localStorage.setItem(STORAGE, JSON.stringify(d)); }

    function articleKey(id) { return 'hn_' + id; }
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

    // ── API HackerNews Algolia ────────────────────────────────
    async function fetchAlgolia(query, page = 0) {
        const url = `${HN_SEARCH}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${PAGE_SIZE}&page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
            articles: (data.hits || []).filter(h => h.url), // garder seulement ceux avec un lien externe
            hasMore:  page < Math.ceil((data.nbHits || 0) / PAGE_SIZE) - 1,
        };
    }

    // ── Rendu carte ───────────────────────────────────────────
    function getDomain(url) {
        try { return new URL(url).hostname.replace('www.', ''); }
        catch { return 'hackernews'; }
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const h = Math.floor(diff / 36e5);
        const d = Math.floor(diff / 864e5);
        if (d > 0)  return `il y a ${d}j`;
        if (h > 0)  return `il y a ${h}h`;
        return 'a l\'instant';
    }

    // Couleurs de fond par domaine (placeholder visuel)
    const DOMAIN_COLORS = {
        'github.com':          '#1a1a2e',
        'wired.com':           '#0d1117',
        'thehackernews.com':   '#0a1628',
        'arstechnica.com':     '#1a0a0a',
        'bleepingcomputer.com':'#0a1a0a',
        'techcrunch.com':      '#1a0d00',
        'reuters.com':         '#0d0d1a',
        'bbc.com':             '#0a0a1a',
        'krebs':               '#0a1a1a',
    };

    function getDomainBg(url) {
        const d = getDomain(url);
        for (const key in DOMAIN_COLORS) {
            if (d.includes(key)) return DOMAIN_COLORS[key];
        }
        return '#111118';
    }

    function buildCard(hit, cat) {
        const k     = articleKey(hit.objectID);
        const liked = hasLiked(k);
        const likes = getLikes(k);
        const cmts  = getComments(k);
        const bg    = getDomainBg(hit.url || '');
        const dom   = getDomain(hit.url || '');

        const card = document.createElement('div');
        card.className = 'news-card reveal';
        card.dataset.key = k;

        card.innerHTML = `
            <div class="news-card-img" style="background:${bg};">
                <div class="news-card-img-placeholder hn-placeholder">
                    <span class="hn-domain">${esc(dom)}</span>
                </div>
                <div class="news-card-cat">${esc(cat.label)}</div>
            </div>
            <div class="news-card-body">
                <div class="news-card-source">
                    <i class="fab fa-hacker-news"></i>
                    <span class="src-name">Hacker News</span>
                    &nbsp;·&nbsp; ${timeAgo(hit.created_at)}
                </div>
                <div class="news-card-title">${esc(hit.title || 'Sans titre')}</div>
                <div class="news-card-desc">
                    ${hit.points || 0} points &nbsp;·&nbsp;
                    ${hit.num_comments || 0} commentaires HN &nbsp;·&nbsp;
                    par ${esc(hit.author || 'anonyme')}
                </div>
                <div class="news-card-footer">
                    <div class="news-card-date">${timeAgo(hit.created_at)}</div>
                    <button class="like-btn${liked ? ' liked' : ''}" aria-label="Liker">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${likes}</span>
                    </button>
                    <button class="comment-toggle-btn" aria-label="Commenter">
                        <i class="fas fa-comment"></i>
                        <span class="cmt-count">${cmts.length}</span>
                    </button>
                    <a href="${esc(hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`)}"
                       target="_blank" rel="noopener noreferrer" class="news-read-link">
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

        // Commentaire
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
        $('newsGrid').innerHTML = Array(PAGE_SIZE).fill(0).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line w-30"></div>
                    <div class="skeleton-line w-100"></div>
                    <div class="skeleton-line w-80"></div>
                    <div class="skeleton-line w-60"></div>
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
    async function load(cat, page = 0, append = false) {
        if (loading) return;
        loading = true;

        if (!append) showSkeletons();
        $('loadMoreWrap').style.display = 'none';

        // Filtre recherche
        const term   = $('newsSearch').value.trim();
        const query  = term || cat.q;

        let result;
        try {
            result = await fetchAlgolia(query, page);
        } catch (err) {
            if (!append) showState('fa-exclamation-triangle', 'Impossible de charger les articles.', err.message);
            loading = false;
            return;
        }

        if (!append) $('newsGrid').innerHTML = '';

        if (!result.articles.length && !append) {
            showState('fa-search', 'Aucun article trouve.', 'Essayez un autre filtre ou terme de recherche.');
            loading = false;
            return;
        }

        result.articles.forEach((hit, i) => {
            const card = buildCard(hit, cat);
            card.style.transitionDelay = `${i * 55}ms`;
            $('newsGrid').appendChild(card);
        });

        // Reveal animation
        requestAnimationFrame(() => {
            $('newsGrid').querySelectorAll('.news-card:not(.revealed)').forEach(el => {
                el.classList.add('revealed');
            });
        });

        if (result.hasMore) $('loadMoreWrap').style.display = 'block';
        loading = false;
    }

    // ── Utilitaire ────────────────────────────────────────────
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = String(str || '');
        return d.innerHTML;
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        const toolbar    = $('newsToolbar');
        const searchWrap = toolbar.querySelector('.news-search-wrap');

        // Boutons filtres
        CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (cat === currentCat ? ' active' : '');
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCat  = cat;
                currentPage = 0;
                load(currentCat, 0, false);
            });
            toolbar.insertBefore(btn, searchWrap);
        });

        // Recherche
        $('newsSearch').addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                currentPage = 0;
                load(currentCat, 0, false);
            }, 480);
        });

        // Load more
        $('loadMoreBtn').addEventListener('click', () => {
            currentPage++;
            load(currentCat, currentPage, true);
        });

        // Chargement initial
        load(currentCat, 0, false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();