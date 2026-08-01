// ============================================================
// Contenu légal — CléSchengen
// ⚠️ Modèle standard à faire relire par un professionnel du droit
// avant l'ouverture publique du site. Les champs entre [crochets]
// doivent être complétés avec vos vraies informations.
// ============================================================

export const TERMS_CONTENT = {
  fr: {
    title: "Conditions Générales d'Utilisation",
    updated: "Dernière mise à jour : 1er août 2026",
    sections: [
      {
        h: "1. Objet",
        p: "CléSchengen est une plateforme de mise en relation entre des personnes proposant un bien (maison, chambre, voiture, appareil) à la location ou à la vente dans l'espace Schengen, et des personnes recherchant ce type de bien. CléSchengen n'est ni agence immobilière, ni partie aux transactions conclues entre utilisateurs.",
      },
      {
        h: "2. Comptes utilisateurs",
        p: "L'inscription nécessite une adresse e-mail valide. Les comptes « propriétaire » doivent faire vérifier leur identité (pièce d'identité) avant de pouvoir publier une annonce. Toute fausse déclaration peut entraîner la suspension du compte.",
      },
      {
        h: "3. Annonces",
        p: "Chaque propriétaire est seul responsable de l'exactitude des informations publiées (description, prix, disponibilité, photos). CléSchengen se réserve le droit de retirer toute annonce non conforme, frauduleuse ou signalée comme telle, sans préavis.",
      },
      {
        h: "4. Paiement et déblocage de contact",
        p: "L'accès aux coordonnées d'un propriétaire est payant (montant affiché au moment du paiement) et traité de façon sécurisée par Stripe. Ce paiement rémunère la mise en relation, pas une transaction immobilière ou commerciale : il n'inclut aucune garantie sur l'issue de la mise en relation. Sauf erreur technique avérée de notre part, les frais de mise en relation ne sont pas remboursables.",
      },
      {
        h: "5. Abonnement Premium",
        p: "Les formules d'abonnement (hebdomadaire, mensuel, annuel) donnent accès à la publication sans vérification préalable et au déblocage illimité des contacts pendant leur durée de validité. Elles sont gérées via Stripe et renouvelées automatiquement sauf résiliation avant la date d'échéance.",
      },
      {
        h: "6. Responsabilité",
        p: "CléSchengen agit comme simple intermédiaire technique. Nous ne vérifions pas l'état réel des biens proposés, ne garantissons pas la conclusion d'une transaction, et ne pouvons être tenus responsables des litiges entre utilisateurs. Chaque utilisateur est invité à faire preuve de la prudence habituelle avant tout engagement financier (visite du bien, vérification des documents, etc.).",
      },
      {
        h: "7. Utilisation interdite",
        p: "Sont interdits : la publication d'annonces mensongères ou frauduleuses, l'usurpation d'identité, le harcèlement d'autres utilisateurs, et toute tentative de contourner le système de paiement.",
      },
      {
        h: "8. Contact",
        p: "Pour toute question relative à ces conditions : utilisez le formulaire « Contactez-nous » du site, ou écrivez à [votre e-mail de contact].",
      },
      {
        h: "9. Droit applicable",
        p: "Les présentes conditions sont soumises au droit [pays à préciser]. Tout litige sera soumis aux tribunaux compétents de [ville/pays à préciser].",
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: "Last updated: 1 August 2026",
    sections: [
      {
        h: "1. Purpose",
        p: "CléSchengen is a platform connecting people offering a property (house, room, car, appliance) for rent or sale within the Schengen area with people looking for such a property. CléSchengen is neither a real estate agency nor a party to the transactions concluded between users.",
      },
      {
        h: "2. User accounts",
        p: "Registration requires a valid e-mail address. \"Owner\" accounts must have their identity verified (ID document) before they can publish a listing. Any false statement may result in account suspension.",
      },
      {
        h: "3. Listings",
        p: "Each owner is solely responsible for the accuracy of the information published (description, price, availability, photos). CléSchengen reserves the right to remove any listing that is non-compliant, fraudulent, or reported as such, without notice.",
      },
      {
        h: "4. Payment and contact unlocking",
        p: "Access to an owner's contact details is paid (amount shown at payment time) and processed securely via Stripe. This payment covers the introduction service, not a real estate or commercial transaction: it includes no guarantee on the outcome of the introduction. Except in the case of a proven technical error on our part, connection fees are non-refundable.",
      },
      {
        h: "5. Premium subscription",
        p: "Subscription plans (weekly, monthly, yearly) grant access to publishing without prior verification and unlimited contact unlocking for their duration. They are managed via Stripe and renew automatically unless cancelled before the renewal date.",
      },
      {
        h: "6. Liability",
        p: "CléSchengen acts solely as a technical intermediary. We do not verify the actual condition of the properties listed, do not guarantee that a transaction will be concluded, and cannot be held liable for disputes between users. Each user is invited to exercise ordinary caution before any financial commitment (visiting the property, checking documents, etc.).",
      },
      {
        h: "7. Prohibited use",
        p: "The following are prohibited: publishing false or fraudulent listings, identity theft, harassing other users, and any attempt to bypass the payment system.",
      },
      {
        h: "8. Contact",
        p: "For any question regarding these terms: use the \"Contact us\" form on the site, or write to [your contact e-mail].",
      },
      {
        h: "9. Governing law",
        p: "These terms are governed by the law of [country to specify]. Any dispute shall be submitted to the competent courts of [city/country to specify].",
      },
    ],
  },
};

export const PRIVACY_CONTENT = {
  fr: {
    title: "Politique de Confidentialité",
    updated: "Dernière mise à jour : 1er août 2026",
    sections: [
      {
        h: "1. Responsable du traitement",
        p: "[Votre nom ou raison sociale], [adresse], [e-mail de contact] — ci-après « CléSchengen », responsable du traitement des données décrites ci-dessous.",
      },
      {
        h: "2. Données collectées",
        p: "Compte : adresse e-mail, mot de passe (chiffré). Vérification propriétaire : pièce d'identité (stockée de façon privée, jamais publique). Annonces : nom, téléphone, adresse du bien (révélés uniquement après paiement). Paiement : traité entièrement par Stripe — nous ne stockons jamais vos données bancaires. Navigation : un identifiant anonyme (aucune donnée personnelle) pour des statistiques de fréquentation internes.",
      },
      {
        h: "3. Finalités",
        p: "Ces données servent à : créer et sécuriser votre compte, vérifier l'identité des propriétaires (prévention des fraudes), traiter les paiements, vous envoyer les e-mails liés au service (confirmation, alertes, messages), et améliorer le site.",
      },
      {
        h: "4. Destinataires",
        p: "Vos données sont hébergées par Supabase (base de données) et traitées par Stripe (paiements) et Brevo (envoi d'e-mails), en tant que sous-traitants. Elles ne sont ni vendues ni louées à des tiers à des fins commerciales.",
      },
      {
        h: "5. Durée de conservation",
        p: "Les données de compte sont conservées tant que le compte est actif. Les pièces d'identité sont conservées le temps nécessaire à la vérification et à la lutte contre la fraude. Vous pouvez demander la suppression de votre compte et de vos données à tout moment.",
      },
      {
        h: "6. Vos droits (RGPD)",
        p: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et de portabilité de vos données, ainsi que du droit de vous opposer à leur traitement. Pour exercer ces droits, contactez-nous via le formulaire « Contactez-nous » ou à [votre e-mail de contact].",
      },
      {
        h: "7. Cookies et stockage local",
        p: "Le site utilise le stockage local de votre navigateur pour : rester connecté, mémoriser votre langue préférée, et générer un identifiant anonyme de statistiques de fréquentation. Aucun cookie publicitaire tiers n'est utilisé.",
      },
      {
        h: "8. Contact",
        p: "Pour toute question sur cette politique ou vos données personnelles : formulaire « Contactez-nous » du site, ou [votre e-mail de contact].",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 1 August 2026",
    sections: [
      {
        h: "1. Data controller",
        p: "[Your name or company name], [address], [contact e-mail] — hereinafter \"CléSchengen\", controller of the data described below.",
      },
      {
        h: "2. Data collected",
        p: "Account: e-mail address, password (encrypted). Owner verification: ID document (stored privately, never public). Listings: name, phone number, property address (only revealed after payment). Payment: processed entirely by Stripe — we never store your banking details. Browsing: an anonymous identifier (no personal data) for internal traffic statistics.",
      },
      {
        h: "3. Purposes",
        p: "This data is used to: create and secure your account, verify owners' identity (fraud prevention), process payments, send you service-related e-mails (confirmation, alerts, messages), and improve the site.",
      },
      {
        h: "4. Recipients",
        p: "Your data is hosted by Supabase (database) and processed by Stripe (payments) and Brevo (e-mail sending) as processors. It is never sold or rented to third parties for commercial purposes.",
      },
      {
        h: "5. Retention period",
        p: "Account data is kept as long as the account is active. ID documents are kept for as long as needed for verification and fraud prevention. You may request deletion of your account and data at any time.",
      },
      {
        h: "6. Your rights (GDPR)",
        p: "In accordance with GDPR, you have the right to access, rectify, erase, restrict, and port your data, as well as the right to object to its processing. To exercise these rights, contact us via the \"Contact us\" form or at [your contact e-mail].",
      },
      {
        h: "7. Cookies and local storage",
        p: "The site uses your browser's local storage to: keep you logged in, remember your preferred language, and generate an anonymous identifier for traffic statistics. No third-party advertising cookies are used.",
      },
      {
        h: "8. Contact",
        p: "For any question about this policy or your personal data: the \"Contact us\" form on the site, or [your contact e-mail].",
      },
    ],
  },
};
