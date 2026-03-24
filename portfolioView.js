// ============================================================
// VIEW — portfolioView.js
// Tous les rendus HTML du portfolio
// ============================================================

const PortfolioView = {

  // ── HERO ──────────────────────────────────────────────────
  renderHero(profile) {
    return `
      <section id="hero" class="hero">
        <div class="hero__bg">
          <div class="hero__grid"></div>
          <div class="hero__glow"></div>
        </div>
        <div class="hero__content">
          <div class="hero__badge">
            <span class="dot dot--green"></span>
            Disponible · Stage &amp; Alternance
          </div>
          <h1 class="hero__name">
            <span class="hero__firstname">${profile.name.split(" ")[0]}</span>
            <span class="hero__lastname">${profile.name.split(" ")[1]}</span>
          </h1>
          <p class="hero__title">${profile.title}</p>
          <p class="hero__sub">${profile.subtitle}</p>
          <p class="hero__tagline">${profile.tagline}</p>
          <div class="hero__actions">
            <a href="#projects" class="btn btn--primary">Voir mes projets</a>
            <a href="#contact" class="btn btn--ghost">Me contacter</a>
          </div>
          <div class="hero__scroll">
            <span></span>
          </div>
        </div>
      </section>
    `;
  },

  // ── NAV ───────────────────────────────────────────────────
  renderNav(profile) {
    return `
      <nav class="nav" id="nav">
        <div class="nav__logo">
          <span class="nav__logo-bracket">&lt;</span>HK<span class="nav__logo-bracket">/&gt;</span>
        </div>
        <ul class="nav__links">
          <li><a href="#about" data-nav>À propos</a></li>
          <li><a href="#experience" data-nav>Expérience</a></li>
          <li><a href="#projects" data-nav>Projets</a></li>
          <li><a href="#skills" data-nav>Compétences</a></li>
          <li><a href="#contact" data-nav>Contact</a></li>
        </ul>
        <a href="mailto:${profile.email}" class="btn btn--sm btn--outline">Recruter</a>
        <button class="nav__burger" id="navBurger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
    `;
  },

  // ── ABOUT ─────────────────────────────────────────────────
  renderAbout(profile, education, languages) {
    const eduHTML = education.map(e => `
      <div class="edu-item">
        <span class="edu-item__year">${e.year}</span>
        <div>
          <strong>${e.degree}</strong>
          <span class="edu-item__school">${e.school}</span>
        </div>
      </div>
    `).join("");

    const langHTML = languages.map(l => `
      <div class="lang-bar">
        <div class="lang-bar__header">
          <span>${l.lang}</span>
          <span class="lang-bar__level">${l.level}</span>
        </div>
        <div class="lang-bar__track">
          <div class="lang-bar__fill" style="width:${l.pct}%"></div>
        </div>
      </div>
    `).join("");

    return `
      <section id="about" class="section">
        <div class="container">
          <h2 class="section__title"><span class="accent">//</span> À propos</h2>
          <div class="about-grid">
            <div class="about-text">
              <p>${profile.about}</p>
              <div class="about-meta">
                <div class="about-meta__item">
                  <i class="ico">📍</i> ${profile.location}
                </div>
                <div class="about-meta__item">
                  <i class="ico">✉️</i> ${profile.email}
                </div>
                <div class="about-meta__item">
                  <i class="ico">📱</i> ${profile.phone}
                </div>
              </div>
            </div>
            <div class="about-side">
              <div class="card-block">
                <h3 class="card-block__title">Formation</h3>
                <div class="edu-list">${eduHTML}</div>
              </div>
              <div class="card-block">
                <h3 class="card-block__title">Langues</h3>
                <div class="lang-list">${langHTML}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  // ── EXPERIENCE ────────────────────────────────────────────
  renderExperience(experiences) {
    const items = experiences.map((exp, i) => {
      const tagsHTML = exp.tags.map(t => `<span class="tag">${t}</span>`).join("");
      const achHTML = exp.achievements.map(a => `<li>${a}</li>`).join("");
      const imagesHTML = exp.images.length
        ? `<div class="exp-images" id="expImages_${exp.id}">
            ${exp.images.map(src => `<img src="${src}" alt="capture" class="exp-img" />`).join("")}
           </div>`
        : `<div class="exp-images exp-images--empty" id="expImages_${exp.id}" data-expid="${exp.id}">
            <div class="exp-img-drop" onclick="PortfolioController.triggerImageUpload('${exp.id}')">
              <span>＋</span>
              <p>Ajouter des captures</p>
            </div>
           </div>`;

      return `
        <div class="exp-card ${i === 0 ? 'exp-card--active' : ''}" data-aos="${i % 2 === 0 ? 'fade-right' : 'fade-left'}">
          <div class="exp-card__header">
            <div>
              <span class="exp-card__period">${exp.period}</span>
              <h3 class="exp-card__role">${exp.role}</h3>
              <span class="exp-card__company">${exp.company} — ${exp.location}</span>
            </div>
            ${i === 0 ? '<span class="badge badge--green">En cours</span>' : ''}
          </div>
          <p class="exp-card__desc">${exp.description}</p>
          <ul class="exp-card__ach">${achHTML}</ul>
          <div class="exp-tags">${tagsHTML}</div>
          ${imagesHTML}
          <input type="file" accept="image/*" multiple class="img-upload-input hidden" id="upload_${exp.id}" 
            onchange="PortfolioController.handleImageUpload(event, '${exp.id}')" />
        </div>
      `;
    }).join("");

    return `
      <section id="experience" class="section section--dark">
        <div class="container">
          <h2 class="section__title"><span class="accent">//</span> Expériences</h2>
          <div class="exp-timeline">${items}</div>
        </div>
      </section>
    `;
  },

  // ── PROJECTS ──────────────────────────────────────────────
  renderProjects(projects) {
    const cards = projects.map(p => {
      const techHTML = p.tech.map(t => `<span class="tag tag--mono">${t}</span>`).join("");
      const featHTML = p.features.slice(0, 4).map(f => `<li>${f}</li>`).join("");
      const imagesSection = `
        <div class="proj-images" id="projImages_${p.id}">
          ${p.images.map(src => `<img src="${src}" alt="capture ${p.title}" class="proj-img" />`).join("")}
          <button class="proj-img-add" onclick="PortfolioController.triggerImageUpload('proj_${p.id}')" title="Ajouter une image">＋</button>
        </div>
        <input type="file" accept="image/*" multiple class="img-upload-input hidden" id="upload_proj_${p.id}" 
          onchange="PortfolioController.handleImageUpload(event, 'proj_${p.id}')" />
      `;

      return `
        <div class="proj-card ${p.highlight ? 'proj-card--highlight' : ''}">
          ${p.highlight ? '<div class="proj-card__badge">⭐ Projet principal</div>' : ''}
          <div class="proj-card__top">
            <div class="proj-card__cat">${p.category}</div>
            <h3 class="proj-card__title">${p.title}</h3>
            <p class="proj-card__desc">${p.shortDesc}</p>
          </div>
          ${imagesSection}
          <ul class="proj-card__feat">${featHTML}</ul>
          <div class="proj-card__tech">${techHTML}</div>
          <div class="proj-card__links">
            <button class="btn btn--sm btn--outline" onclick="PortfolioController.openProjectModal('${p.id}')">
              Voir détails →
            </button>
          </div>
        </div>
      `;
    }).join("");

    return `
      <section id="projects" class="section">
        <div class="container">
          <h2 class="section__title"><span class="accent">//</span> Projets</h2>
          <div class="proj-grid">${cards}</div>
        </div>
      </section>
    `;
  },

  // ── PROJECT MODAL ─────────────────────────────────────────
  renderProjectModal(project) {
    const techHTML = project.tech.map(t => `<span class="tag">${t}</span>`).join("");
    const featHTML = project.features.map(f => `<li>${f}</li>`).join("");
    const imagesHTML = project.images.length
      ? project.images.map(src => `<img src="${src}" class="modal-img" alt="capture" />`).join("")
      : `<div class="modal-img-empty">Aucune capture — <button onclick="PortfolioController.triggerImageUpload('proj_${project.id}')">Ajouter</button></div>`;

    return `
      <div class="modal-overlay" id="projectModal" onclick="PortfolioController.closeProjectModal(event)">
        <div class="modal-box">
          <button class="modal-close" onclick="PortfolioController.closeProjectModal()">✕</button>
          <div class="modal-box__cat">${project.category}</div>
          <h2 class="modal-box__title">${project.title}</h2>
          <p class="modal-box__desc">${project.fullDesc}</p>
          <div class="modal-images">${imagesHTML}</div>
          <h4>Fonctionnalités</h4>
          <ul class="modal-feat">${featHTML}</ul>
          <div class="modal-tech">${techHTML}</div>
        </div>
      </div>
    `;
  },

  // ── SKILLS ────────────────────────────────────────────────
  renderSkills(skills) {
    const groups = [
      { label: "Frontend", icon: "⬡", items: skills.frontend },
      { label: "Backend & Data", icon: "◈", items: skills.backend },
      { label: "Sécurité", icon: "◉", items: skills.security },
      { label: "Outils & Design", icon: "◫", items: skills.tools },
    ];

    const groupsHTML = groups.map(g => `
      <div class="skill-group">
        <div class="skill-group__header">
          <span class="skill-group__icon">${g.icon}</span>
          <span>${g.label}</span>
        </div>
        <div class="skill-group__items">
          ${g.items.map(s => `<span class="skill-pill">${s}</span>`).join("")}
        </div>
      </div>
    `).join("");

    return `
      <section id="skills" class="section section--dark">
        <div class="container">
          <h2 class="section__title"><span class="accent">//</span> Compétences</h2>
          <div class="skills-grid">${groupsHTML}</div>
        </div>
      </section>
    `;
  },

  // ── CONTACT ───────────────────────────────────────────────
  renderContact(profile) {
    return `
      <section id="contact" class="section">
        <div class="container">
          <h2 class="section__title"><span class="accent">//</span> Contact</h2>
          <div class="contact-grid">
            <div class="contact-info">
              <p class="contact-lead">Disponible pour un stage ou une alternance. N'hésitez pas à me contacter.</p>
              <a href="mailto:${profile.email}" class="contact-link">
                <span class="contact-link__ico">✉</span>
                ${profile.email}
              </a>
              <a href="tel:${profile.phone}" class="contact-link">
                <span class="contact-link__ico">☎</span>
                ${profile.phone}
              </a>
              <div class="contact-socials">
                <a href="${profile.github}" class="social-btn">GitHub</a>
                <a href="${profile.linkedin}" class="social-btn">LinkedIn</a>
                <a href="http://${profile.portfolio}" class="social-btn" target="_blank">Portfolio</a>
              </div>
            </div>
            <form class="contact-form" id="contactForm" onsubmit="PortfolioController.handleContactForm(event)">
              <input type="text" name="name" placeholder="Votre nom" required />
              <input type="email" name="email" placeholder="Votre email" required />
              <textarea name="message" placeholder="Votre message" rows="5" required></textarea>
              <button type="submit" class="btn btn--primary">Envoyer →</button>
            </form>
          </div>
        </div>
      </section>
    `;
  },

  // ── FOOTER ────────────────────────────────────────────────
  renderFooter(profile) {
    return `
      <footer class="footer">
        <p>
          <span class="footer__code">&lt;</span>
          ${profile.name} · ${new Date().getFullYear()}
          <span class="footer__code">/&gt;</span>
        </p>
        <p class="footer__sub">Construit avec HTML · CSS · JS · Architecture MVC</p>
      </footer>
    `;
  },

  // ── TOAST ─────────────────────────────────────────────────
  showToast(message, type = "success") {
    const t = document.createElement("div");
    t.className = `toast toast--${type}`;
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("toast--visible"));
    setTimeout(() => {
      t.classList.remove("toast--visible");
      setTimeout(() => t.remove(), 400);
    }, 3000);
  },
};

export default PortfolioView;
