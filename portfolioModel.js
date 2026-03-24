// ============================================================
// MODEL — portfolioModel.js
// Source unique de données du portfolio
// ============================================================

const PortfolioModel = {
  profile: {
    name: "Herman Kouogang",
    title: "Développeur Web & Cybersécurité",
    subtitle: "Bachelor 2 · Web & Multimédia · My Digital School Lille",
    tagline: "Je construis des applications robustes et sécurisées.",
    email: "hermankouam44@gmail.com",
    phone: "0623806881",
    location: "Lille, France",
    portfolio: "MonPortfolio.com",
    linkedin: "#",
    github: "#",
    about: `Passionné par la cybersécurité depuis les séries Scorpion, Hawaii Five-0 et MacGyver, 
    j'ai voulu comprendre le vrai fonctionnement derrière le piratage. 
    Cette curiosité m'a conduit à quitter le Cameroun pour étudier en France. 
    Aujourd'hui je conçois des applications web sécurisées, propres et scalables.`,
  },

  skills: {
    frontend: ["HTML5", "CSS3 / Sass", "JavaScript ES6+", "TypeScript"],
    backend: ["PHP", "SQL / SQLite", "Node.js", "Electron"],
    security: ["Protection injections SQL", "Authentification sécurisée", "LocalStorage sécurisé", "Gestion des sessions"],
    tools: ["Adobe Illustrator", "Premiere Pro", "Photoshop", "Figma", "C#"],
  },

  experiences: [
    {
      id: "sequoia",
      company: "MD Creations",
      location: "Montpellier",
      role: "Stage · Développeur Web Full-Stack",
      period: "2025 – Actuel",
      description: `Développement de Séquoia Desktop, une application web de gestion de patients 
      pour cliniques et pharmacies. Architecture MVC, persistence localStorage, 
      sécurisation anti-injections SQL.`,
      tags: ["JavaScript", "HTML/CSS", "LocalStorage", "MVC", "SQL", "Electron"],
      achievements: [
        "Conception et développement complet d'une application web de gestion médicale",
        "Implémentation d'une couche de persistance LocalStorage (DataStore) simulant une base de données",
        "Architecture MVC avec routeur SPA, modules séparés et gestion d'état",
        "Module de visualisation graphique (Chart.js) pour courbes d'excitabilité neuro-musculaire",
        "Système d'authentification sécurisé et gestion des sessions utilisateurs",
        "Génération et impression d'ordonnances médicales en HTML dynamique",
        "Protection des formulaires contre les injections et la validation côté client",
      ],
      images: [], // slot pour captures
    },
    {
      id: "fpj",
      company: "FPJ Solutions",
      location: "Cameroun",
      role: "Stage · Informatique",
      period: "Mai – Sept 2023",
      description: `Administration et gestion de données clients. 
      Création numérique et collaboration avec les équipes créatives.`,
      tags: ["Administration", "Gestion de données", "Création numérique"],
      achievements: [
        "Administration et gestion de bases de données clients",
        "Gestion de la relation client et création de contenus numériques",
        "Collaboration avec équipes créatives pour productions engageantes",
      ],
      images: [],
    },
  ],

  projects: [
    {
      id: "sequoia-app",
      title: "Séquoia Desktop",
      category: "Application Web",
      shortDesc: "Application de gestion de patients pour cliniques — architecture MVC complète.",
      fullDesc: `Séquoia Desktop est une application web complète de gestion médicale 
      destinée aux cliniques et pharmacies. Développée avec une architecture MVC stricte, 
      elle gère patients, consultations, examens cliniques, prescriptions et antécédents.`,
      tech: ["JavaScript", "HTML5", "CSS3", "Chart.js", "LocalStorage API", "MVC Pattern"],
      features: [
        "Gestion complète dossiers patients (CRUD avec suppression en cascade)",
        "Module consultations avec onglets antécédents",
        "Examens cliniques avec calcul IMC automatique",
        "Courbes d'excitabilité neuro-musculaire (Chart.js)",
        "Système de prescriptions avec génération d'ordonnances imprimables",
        "Router SPA avec gestion d'historique et sauvegarde d'état",
        "DataStore — couche d'abstraction simulant une vraie BDD",
        "Authentification + contrôle d'accès par route",
      ],
      images: [], // ajouter captures ici
      github: "#",
      demo: "#",
      highlight: true,
    },
    {
      id: "datastore",
      title: "DataStore Engine",
      category: "Architecture",
      shortDesc: "Moteur de données localStorage avec API CRUD complète et suppression en cascade.",
      fullDesc: `Couche d'abstraction de données entièrement développée à la main, 
      simulant le comportement d'une base relationnelle dans le navigateur.`,
      tech: ["JavaScript", "LocalStorage API", "OOP"],
      features: [
        "CRUD générique pour toutes les collections",
        "Suppression en cascade (patients → consultations → examens → prescriptions)",
        "Moteur de recherche multi-filtres",
        "Gestion des compteurs d'ID uniques",
        "Interface API simulant Electron pour compatibilité desktop/web",
      ],
      images: [],
      github: "#",
      highlight: false,
    },
    {
      id: "excitability",
      title: "Excitability Chart Module",
      category: "Data Viz",
      shortDesc: "Visualisation temps-réel de courbes d'excitabilité neuro-musculaire avec Chart.js.",
      fullDesc: `Module de visualisation médicale pour tracer les courbes d'excitabilité 
      neuro-musculaire. Filtrage dynamique, export PNG, impression, et historique des mesures.`,
      tech: ["JavaScript", "Chart.js", "Canvas API"],
      features: [
        "Graphiques ligne interactifs avec Chart.js",
        "Filtrage dynamique par muscle/nerf",
        "Export des courbes en image PNG",
        "Impression dédiée avec mise en page médicale",
        "Historique des mesures avec suppression unitaire",
      ],
      images: [],
      github: "#",
      highlight: false,
    },
  ],

  education: [
    {
      year: "2024 – Actuel",
      degree: "Bachelor 2 · Cycle Web & Multimédia",
      school: "My Digital School Lille",
    },
    {
      year: "2023 – 2024",
      degree: "BTS Génie Logiciel",
      school: "Institut Supérieur Polytechnique",
    },
    {
      year: "2022 – 2023",
      degree: "Licence Sciences Économiques et de Gestion",
      school: "Université de Yaoundé II",
    },
  ],

  languages: [
    { lang: "Français", level: "Langue maternelle", pct: 100 },
    { lang: "Anglais", level: "Notions", pct: 40 },
    { lang: "Espagnol", level: "Notions", pct: 30 },
  ],
};

export default PortfolioModel;
