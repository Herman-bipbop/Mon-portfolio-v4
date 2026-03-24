// ============================================================
// CONTROLLER — portfolioController.js
// Orchestre Model → View, gère les interactions
// ============================================================

import PortfolioModel from "../models/portfolioModel.js";
import PortfolioView from "../views/portfolioView.js";

const PortfolioController = {

  // ── images stockées par section ──────────────────────────
  _images: {}, // { sectionId: [dataURL, ...] }

  // ── INIT ─────────────────────────────────────────────────
  init() {
    this._loadImagesFromStorage();
    this._buildPage();
    this._bindNav();
    this._bindScrollEffects();
    this._bindIntersectionObserver();
    this._bindBurger();
  },

  // ── BUILD PAGE ────────────────────────────────────────────
  _buildPage() {
    const { profile, skills, experiences, projects, education, languages } = PortfolioModel;

    // Injecter les images sauvegardées dans les données
    experiences.forEach(exp => {
      exp.images = this._images[exp.id] || [];
    });
    projects.forEach(p => {
      p.images = this._images[`proj_${p.id}`] || [];
    });

    // Monter tous les blocs
    document.getElementById("app-nav").innerHTML       = PortfolioView.renderNav(profile);
    document.getElementById("app-hero").innerHTML      = PortfolioView.renderHero(profile);
    document.getElementById("app-about").innerHTML     = PortfolioView.renderAbout(profile, education, languages);
    document.getElementById("app-experience").innerHTML= PortfolioView.renderExperience(experiences);
    document.getElementById("app-projects").innerHTML  = PortfolioView.renderProjects(projects);
    document.getElementById("app-skills").innerHTML    = PortfolioView.renderSkills(skills);
    document.getElementById("app-contact").innerHTML   = PortfolioView.renderContact(profile);
    document.getElementById("app-footer").innerHTML    = PortfolioView.renderFooter(profile);
  },

  // ── NAV SCROLL ────────────────────────────────────────────
  _bindNav() {
    document.addEventListener("click", e => {
      const link = e.target.closest("a[data-nav]");
      if (!link) return;
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  },

  _bindScrollEffects() {
    const nav = document.getElementById("app-nav");
    window.addEventListener("scroll", () => {
      nav?.querySelector(".nav")?.classList.toggle("nav--scrolled", window.scrollY > 60);
    });
  },

  _bindIntersectionObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    // Observer les cartes et sections
    setTimeout(() => {
      document.querySelectorAll(".exp-card, .proj-card, .skill-group, .about-grid, .lang-bar").forEach(el => {
        el.classList.add("fade-up");
        observer.observe(el);
      });
      // Animer les barres de langues
      document.querySelectorAll(".lang-bar__fill").forEach(bar => {
        bar.style.width = "0%";
        const target = bar.getAttribute("style").match(/\d+/)?.[0] || "0";
        observer.observe(bar.parentElement.parentElement);
        bar.dataset.target = target;
      });
    }, 100);
  },

  _bindBurger() {
    document.addEventListener("click", e => {
      if (e.target.closest("#navBurger")) {
        const nav = document.querySelector(".nav__links");
        nav?.classList.toggle("nav__links--open");
        e.target.closest("#navBurger")?.classList.toggle("active");
      }
    });
  },

  // ── IMAGE UPLOAD ──────────────────────────────────────────
  triggerImageUpload(sectionId) {
    const input = document.getElementById(`upload_${sectionId}`);
    input?.click();
  },

  handleImageUpload(event, sectionId) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const promises = files.map(file =>
      new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      })
    );

    Promise.all(promises).then(dataURLs => {
      if (!this._images[sectionId]) this._images[sectionId] = [];
      this._images[sectionId].push(...dataURLs);
      this._saveImagesToStorage();
      this._refreshImages(sectionId);
      PortfolioView.showToast(`${dataURLs.length} image(s) ajoutée(s) ✓`);
    });
  },

  _refreshImages(sectionId) {
    // Repère le container d'images (exp ou proj)
    const container = document.getElementById(`expImages_${sectionId}`)
                   || document.getElementById(`projImages_${sectionId}`);
    if (!container) return;

    const images = this._images[sectionId] || [];
    const imgsHTML = images.map(src =>
      `<img src="${src}" alt="capture" class="${sectionId.startsWith('proj') ? 'proj-img' : 'exp-img'}" />`
    ).join("");

    const addBtn = `<button class="proj-img-add" onclick="PortfolioController.triggerImageUpload('${sectionId}')" title="Ajouter">＋</button>`;
    container.innerHTML = imgsHTML + (sectionId.startsWith("proj") ? addBtn : "");
    container.classList.remove("exp-images--empty");
  },

  // ── LOCAL STORAGE ─────────────────────────────────────────
  _saveImagesToStorage() {
    try {
      localStorage.setItem("portfolio_images", JSON.stringify(this._images));
    } catch { /* quota exceeded — silently skip */ }
  },

  _loadImagesFromStorage() {
    try {
      const saved = localStorage.getItem("portfolio_images");
      if (saved) this._images = JSON.parse(saved);
    } catch { this._images = {}; }
  },

  // ── PROJECT MODAL ─────────────────────────────────────────
  openProjectModal(projectId) {
    const project = PortfolioModel.projects.find(p => p.id === projectId);
    if (!project) return;
    project.images = this._images[`proj_${projectId}`] || [];

    const existing = document.getElementById("projectModal");
    if (existing) existing.remove();

    document.body.insertAdjacentHTML("beforeend", PortfolioView.renderProjectModal(project));
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      document.getElementById("projectModal")?.classList.add("modal-overlay--visible");
    });
  },

  closeProjectModal(event) {
    if (event && event.target !== document.getElementById("projectModal") && !event.target.closest(".modal-close")) return;
    const modal = document.getElementById("projectModal");
    if (modal) {
      modal.classList.remove("modal-overlay--visible");
      setTimeout(() => modal.remove(), 300);
    }
    document.body.style.overflow = "";
  },

  // ── CONTACT FORM ──────────────────────────────────────────
  handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    // Ici intégration mailto ou API
    const mailto = `mailto:${PortfolioModel.profile.email}?subject=Contact Portfolio&body=${encodeURIComponent(data.get("message"))} — ${data.get("name")} (${data.get("email")})`;
    window.location.href = mailto;
    form.reset();
    PortfolioView.showToast("Message envoyé ✓");
  },
};

// Exposer pour les handlers inline HTML
window.PortfolioController = PortfolioController;

export default PortfolioController;
