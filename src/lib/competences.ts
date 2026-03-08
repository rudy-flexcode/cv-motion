export const COMPETENCES_GROUPED: Record<string, Record<string, string[]>> = {
  "Tech & IT": {
    "Développeur Web": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Svelte", "Vue", "Node.js", "SQL", "Git"],
    "Développeur Frontend": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Svelte", "UX", "Accessibilité", "Tests"],
    "Développeur Backend": ["Node.js", "Python", "Java", "API REST", "SQL", "NoSQL", "Auth", "Tests", "Docker", "Git"],
    "Développeur Full Stack": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "API", "CI/CD", "Docker", "Git", "Cloud"],
    "Développeur Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Android Studio", "Xcode"],
    "Ingénieur DevOps": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Ansible", "Monitoring"],
    "Architecte Cloud": ["AWS", "Azure", "GCP", "Sécurité", "Réseau", "Kubernetes", "FinOps"],
    "Administrateur Systèmes": ["Windows", "Linux", "Active Directory", "Sauvegarde", "Réseau", "Sécurité"],
    "Administrateur Réseaux": ["Routage", "Switching", "Firewall", "VPN", "Wi-Fi", "Sécurité"],
    "Analyste Cybersécurité": ["SIEM", "Analyse risques", "SOC", "Réseau", "Threat intel", "IAM"],
    "QA / Test": ["Tests manuels", "Tests automatisés", "Selenium", "Cypress", "Bug tracking"],
    "Consultant IT": ["Analyse", "SQL", "Python", "Cloud", "Communication"],
    "Technicien Support": ["Support IT", "Diagnostic", "SLA", "Ticketing", "Communication"]
  },
  "Data & IA": {
    "Data Analyst": ["SQL", "Python", "Excel", "Tableau", "Power BI", "Data Visualization", "Statistiques"],
    "Data Scientist": ["Python", "Pandas", "Machine Learning", "Stats", "SQL", "Visualisation", "Modélisation"],
    "Ingénieur IA": ["Python", "ML", "Deep Learning", "NLP", "MLOps", "GPU", "Déploiement"]
  },
  "Design & Création": {
    "Designer UI/UX": ["Figma", "Adobe XD", "Wireframes", "Prototyping", "Design System", "Responsive"],
    "UX Researcher": ["Interviews", "Tests utilisateurs", "Personas", "Analyse", "Synthèse", "Prototypes"],
    "Graphiste": ["Photoshop", "Illustrator", "InDesign", "Branding", "Print", "Création visuelle"],
    "Motion Designer": ["After Effects", "Premiere Pro", "Animation", "Storyboard", "Sound design"]
  },
  "Produit & Gestion": {
    "Product Manager": ["Roadmap", "Discovery", "KPI", "User stories", "Priorisation", "Vision produit"],
    "Chef de projet": ["Gestion de projet", "Leadership", "Communication", "Agile", "Scrum"],
    "Scrum Master": ["Agile", "Scrum", "Facilitation", "Coaching", "Rituels"]
  },
  "Marketing & Communication": {
    "Marketing Digital": ["SEO", "SEA", "Google Analytics", "Social Media", "Email Marketing", "Content Marketing"],
    "Community Manager": ["Réseaux sociaux", "Calendrier éditorial", "Engagement", "Création contenu"],
    "Rédacteur": ["Rédaction", "Copywriting", "SEO", "Storytelling", "Veille"]
  },
  "Vente & Business": {
    "Commercial": ["Prospection", "Négociation", "CRM", "Relation client", "Closing"],
    "Business Developer": ["Prospection", "Partenariats", "KPI", "Pipeline", "Négociation"]
  },
  "RH & Administratif": {
    "RH / Recruteur": ["Sourcing", "Entretiens", "Onboarding", "Paie", "Droit du travail"],
    "Assistant Administratif": ["Organisation", "Bureautique", "Planning", "Facturation", "Accueil"]
  },
  "Finance & Juridique": {
    "Comptable": ["Comptabilité générale", "TVA", "Bilan", "Excel", "Sage"],
    "Contrôleur de gestion": ["Budgets", "Reporting", "KPI", "Analyse financière", "Excel"],
    "Juriste": ["Droit", "Contrats", "Veille juridique", "Conformité"],
    "Acheteur": ["Négociation", "Sourcing", "Appels d'offres", "Gestion fournisseurs"]
  },
  "Logistique & Supply": {
    "Supply Chain": ["Logistique", "Stocks", "Planification", "ERP", "Transport"],
    "Logisticien": ["Gestion stocks", "WMS", "Préparation commandes", "Expédition"],
    "Chauffeur / Livreur": ["Conduite", "Optimisation tournée", "Sécurité", "Service client"]
  },
  "BTP & Industrie": {
    "Ingénieur Civil": ["BTP", "Plans", "Chantier", "Matériaux", "Sécurité"],
    "Architecte (Bâtiment)": ["Conception", "Plans", "Règlementation", "Revit", "AutoCAD"],
    "Électricien": ["Câblage", "Normes", "Maintenance", "Sécurité"],
    "Plombier": ["Installation", "Dépannage", "Lecture plans", "Soudure"],
    "Mécanicien": ["Diagnostic", "Réparation", "Maintenance", "Outils"]
  },
  "Santé & Social": {
    "Infirmier": ["Soins", "Surveillance", "Protocoles", "Relation patient"],
    "Aide-soignant": ["Hygiène", "Assistance", "Écoute", "Organisation"],
    "Pharmacien": ["Conseil", "Dispensation", "Gestion stock", "Réglementation"],
    "Médecin": ["Diagnostic", "Suivi patient", "Coordination", "Protocoles"],
    "Kinésithérapeute": ["Rééducation", "Anatomie", "Suivi patient"],
    "Psychologue": ["Écoute", "Évaluation", "Accompagnement", "Éthique"]
  },
  "Éducation & Formation": {
    "Professeur": ["Pédagogie", "Animation", "Évaluation", "Programmes"],
    "Formateur": ["Pédagogie", "Animation", "Création contenus", "Évaluation"]
  },
  "Hôtellerie & Restauration": {
    "Chef cuisinier": ["Cuisine", "Gestion brigade", "Hygiène", "Créativité"],
    "Serveur": ["Service", "Relation client", "Organisation", "Encaissement"],
    "Barman": ["Mixologie", "Service", "Stock", "Accueil"],
    "Hôtelier": ["Accueil", "Réservations", "Service", "Qualité"]
  },
  "Autre": {
    "Autre": ["Communication", "Organisation", "Créativité", "Polyvalence"]
  }
};

export const COMPETENCES: Record<string, string[]> = Object.fromEntries(
  Object.values(COMPETENCES_GROUPED).flatMap((group) => Object.entries(group))
);
