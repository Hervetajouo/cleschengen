// ============================================================
// Guides pratiques par pays — CléSchengen
// Contenu couvrant les principaux marchés locatifs. Pour les autres
// pays de l'espace Schengen, un guide générique s'affiche à la place.
// ============================================================

export const COUNTRY_GUIDES = {
  France: {
    fr: {
      documents: "Pièce d'identité, 3 derniers bulletins de salaire, contrat de travail, avis d'imposition, souvent un garant (physique ou via une caution comme Visale).",
      deposit: "Dépôt de garantie plafonné à 1 mois de loyer hors charges (location vide) ou 2 mois (meublé).",
      notice: "Préavis de départ : 1 mois en zone tendue ou meublé, 3 mois ailleurs (non meublé).",
      tip: "Demande une quittance de loyer chaque mois : elle sert de justificatif de domicile et pour tes démarches administratives.",
    },
    en: {
      documents: "ID document, last 3 payslips, employment contract, tax notice, often a guarantor (individual or a scheme like Visale).",
      deposit: "Security deposit capped at 1 month's rent excluding charges (unfurnished) or 2 months (furnished).",
      notice: "Notice period: 1 month in high-demand areas or furnished lets, 3 months elsewhere (unfurnished).",
      tip: "Ask for a monthly rent receipt (quittance de loyer) — it doubles as proof of address for admin procedures.",
    },
  },
  Allemagne: {
    fr: {
      documents: "Pièce d'identité, Schufa (historique de solvabilité), 3 derniers bulletins de salaire, Mieterselbstauskunft (formulaire d'auto-évaluation du locataire).",
      deposit: "Dépôt de garantie (Kaution) plafonné à 3 mois de loyer hors charges, souvent versé en 3 fois.",
      notice: "Préavis légal de 3 mois pour le locataire, sauf clause contraire dans le bail.",
      tip: "La Schufa est quasi systématiquement demandée par les propriétaires allemands — obtiens la tienne à l'avance sur schufa.de pour ne pas perdre de temps.",
    },
    en: {
      documents: "ID document, Schufa credit report, last 3 payslips, Mieterselbstauskunft (tenant self-disclosure form).",
      deposit: "Security deposit (Kaution) capped at 3 months' rent excluding charges, often paid in 3 instalments.",
      notice: "Statutory notice period of 3 months for tenants, unless the lease states otherwise.",
      tip: "Landlords in Germany almost always ask for a Schufa report — get yours in advance at schufa.de to save time.",
    },
  },
  Espagne: {
    fr: {
      documents: "Pièce d'identité ou NIE, justificatifs de revenus (3 derniers bulletins ou contrat de travail), parfois un garant ou une assurance loyers impayés.",
      deposit: "Dépôt de garantie légal d'1 mois de loyer, souvent complété par une garantie supplémentaire (1 à 2 mois) exigée par le propriétaire.",
      notice: "Préavis de 30 jours minimum de la part du locataire.",
      tip: "Le NIE (numéro d'identification pour étrangers) est souvent demandé avant même de visiter — commence les démarches tôt si tu n'es pas résident espagnol.",
    },
    en: {
      documents: "ID document or NIE number, proof of income (last 3 payslips or employment contract), sometimes a guarantor or unpaid-rent insurance.",
      deposit: "Legal deposit of 1 month's rent, often topped up with an extra guarantee (1-2 months) requested by the landlord.",
      notice: "Minimum 30 days' notice from the tenant.",
      tip: "The NIE (foreigner ID number) is often requested even before viewings — start the process early if you're not a Spanish resident.",
    },
  },
  Italie: {
    fr: {
      documents: "Pièce d'identité, codice fiscale (numéro fiscal italien), justificatifs de revenus, garant si étudiant ou revenus limités.",
      deposit: "Dépôt de garantie plafonné à 3 mois de loyer.",
      notice: "Préavis généralement de 6 mois pour un bail standard (4+4 ans), sauf clauses spécifiques pour les baux courts (transitori).",
      tip: "Le contrat de location doit être enregistré (\"registrazione\") auprès de l'Agenzia delle Entrate — vérifie que le propriétaire le fait, c'est une obligation légale.",
    },
    en: {
      documents: "ID document, codice fiscale (Italian tax code), proof of income, guarantor if a student or on limited income.",
      deposit: "Security deposit capped at 3 months' rent.",
      notice: "Typically 6 months' notice for a standard lease (4+4 years), shorter for temporary contracts (transitori).",
      tip: "The lease must be registered (\"registrazione\") with the Agenzia delle Entrate — check the landlord does this, it's a legal requirement.",
    },
  },
  Portugal: {
    fr: {
      documents: "Pièce d'identité ou NIF (numéro fiscal portugais), justificatifs de revenus, parfois un garant pour les étudiants.",
      deposit: "Dépôt de garantie courant d'1 à 2 mois de loyer.",
      notice: "Préavis d'au moins 120 jours pour les baux de plus d'un an, 60 jours pour les baux plus courts.",
      tip: "Obtiens ton NIF avant de signer quoi que ce soit — indispensable pour ouvrir un compte bancaire et signer un bail au Portugal.",
    },
    en: {
      documents: "ID document or NIF (Portuguese tax number), proof of income, sometimes a guarantor for students.",
      deposit: "Common security deposit of 1-2 months' rent.",
      notice: "At least 120 days' notice for leases over a year, 60 days for shorter leases.",
      tip: "Get your NIF before signing anything — it's required to open a bank account and sign a lease in Portugal.",
    },
  },
  "Pays-Bas": {
    fr: {
      documents: "Pièce d'identité, contrat de travail, 3 derniers bulletins de salaire (souvent un revenu minimum de 3x le loyer est exigé).",
      deposit: "Dépôt de garantie courant d'1 à 2 mois de loyer.",
      notice: "Préavis généralement d'1 mois pour le locataire.",
      tip: "Le marché locatif néerlandais est très tendu dans les grandes villes — les dossiers complets et rapides à fournir font souvent la différence.",
    },
    en: {
      documents: "ID document, employment contract, last 3 payslips (a minimum income of 3x the rent is often required).",
      deposit: "Common security deposit of 1-2 months' rent.",
      notice: "Usually 1 month's notice for the tenant.",
      tip: "The Dutch rental market is very competitive in big cities — a complete, fast application often makes the difference.",
    },
  },
};

export const GENERIC_GUIDE = {
  fr: {
    documents: "En général : pièce d'identité, justificatifs de revenus récents, et parfois un garant. Les exigences précises varient selon le pays — renseigne-toi auprès du propriétaire ou d'une agence locale.",
    deposit: "Un dépôt de garantie (souvent 1 à 3 mois de loyer selon le pays) est généralement demandé à la signature.",
    notice: "Le préavis de départ varie fortement d'un pays à l'autre — vérifie les conditions exactes inscrites dans ton contrat de bail.",
    tip: "Avant de signer, fais-toi confirmer par écrit toutes les conditions (dépôt, charges, préavis) — une simple annonce ne fait pas foi.",
  },
  en: {
    documents: "Generally: an ID document, recent proof of income, and sometimes a guarantor. Exact requirements vary by country — check with the landlord or a local agency.",
    deposit: "A security deposit (often 1-3 months' rent depending on the country) is usually requested at signing.",
    notice: "The notice period varies a lot from country to country — check the exact terms written into your lease.",
    tip: "Before signing, get all conditions (deposit, charges, notice period) confirmed in writing — the listing itself isn't a binding document.",
  },
};
