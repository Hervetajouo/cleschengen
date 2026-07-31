// ============================================================
// Système de traduction — CléSchengen
// 24 langues officielles de l'espace Schengen + l'anglais (langue de
// référence internationale, utile pour un service transfrontalier même
// s'il n'est pas une langue officielle Schengen).
//
// Ce premier lot couvre les éléments les plus visibles de l'interface
// (menu, titres, boutons, formulaires principaux). Certains textes plus
// secondaires restent en français par défaut (repli automatique) et
// pourront être complétés progressivement, langue par langue.
// ============================================================

export const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "nl", label: "Nederlands" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "el", label: "Ελληνικά" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "sk", label: "Slovenčina" },
  { code: "hu", label: "Magyar" },
  { code: "ro", label: "Română" },
  { code: "bg", label: "Български" },
  { code: "hr", label: "Hrvatski" },
  { code: "sl", label: "Slovenščina" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "no", label: "Norsk" },
  { code: "is", label: "Íslenska" },
  { code: "et", label: "Eesti" },
  { code: "lv", label: "Latviešu" },
  { code: "lt", label: "Lietuvių" },
  { code: "mt", label: "Malti" },
];

const fr = {
  nav_how: "Comment ça marche", nav_browse: "Rechercher", nav_post: "Poster", nav_premium: "Abonnement",
  nav_contacts: "Mes contacts", nav_contact_us: "Contactez-nous", nav_admin: "Admin",
  login: "Se connecter", logout: "Déconnexion",
  type_maison: "Maison", type_chambre: "Chambre", type_voiture: "Voiture", type_appareils: "Appareils",
  trans_location: "Location", trans_vente: "Vente",
  browse_title: "Parcourir les annonces", browse_subtitle: "Filtre par type de bien, transaction et pays, puis ouvre une annonce pour débloquer le contact du propriétaire.",
  search_placeholder: "Ville, pays, mot-clé…", filter_all_type: "Tout type", filter_all_trans: "Location ou vente", filter_all_country: "Tout pays",
  no_results: "Aucune annonce ne correspond à ces filtres. Essaie d'élargir ta recherche.",
  card_view: "Voir", card_unlocked: "Débloqué",
  modal_locked_message: "Le nom et le numéro du propriétaire sont masqués. Débloque ses coordonnées pour le contacter directement.",
  modal_unlock_button: "Débloquer le contact", modal_secure_payment: "Paiement réel et sécurisé via Stripe",
  modal_processing: "Redirection vers le paiement sécurisé Stripe…", modal_revealed_title: "Contact débloqué",
  modal_call: "Appeler", modal_copied: "Numéro copié.",
  history_title: "Mes contacts débloqués", history_empty: "Tu n'as encore débloqué aucun contact. Va dans « Rechercher » pour trouver une annonce.",
  history_login_prompt: "Connecte-toi pour voir les contacts que tu as débloqués.",
  premium_title: "Abonnement Premium", premium_subscribe: "S'abonner",
  footer_tagline: "CléSchengen — les annonces sont stockées dans une base partagée. Les coordonnées des propriétaires ne sont révélées qu'après paiement.",
  contact_title: "Contactez-nous", contact_prompt: "Une difficulté avec ton compte, un paiement ou une annonce ? Décris-la ici, on te répond par e-mail.",
  contact_email_label: "Ton e-mail", contact_message_label: "Message", contact_send: "Envoyer le message",
  auth_login_title: "Se connecter", auth_signup_title: "Créer un compte", auth_email: "E-mail", auth_password: "Mot de passe",
  auth_role_seeker: "À la recherche d'un bien", auth_role_landlord: "Propriétaire / vendeur",
  auth_submit_login: "Se connecter", auth_submit_signup: "Créer mon compte",
  auth_switch_to_signup: "Pas encore de compte ? Créer un compte", auth_switch_to_login: "Déjà un compte ? Se connecter",
  add_form_title: "Publier une annonce", add_owner_name: "Ton nom", add_phone: "Numéro de téléphone",
  add_type: "Type de bien", add_transaction: "Type d'annonce", add_country: "Pays (espace Schengen)",
  add_city: "Ville", add_neighborhood: "Quartier", add_price: "Prix", add_description: "Description",
  add_photos: "Photos du bien", add_captcha_label: "Vérification anti-robot", add_submit: "Publier l'annonce",
  how_title: "Comment fonctionne la mise en relation",
  how_subtitle: "CléSchengen connecte les propriétaires de biens en location ou en vente dans l'espace Schengen avec des personnes qui cherchent un logement ou une voiture.",
  how_step1_title: "Le propriétaire publie", how_step2_title: "Le client cherche et choisit", how_step3_title: "Le client paie pour être mis en contact",
  how_cta_browse: "Parcourir les annonces", how_cta_post: "Je suis propriétaire, je publie",
  language_label: "Langue",
};

const en = {
  nav_how: "How it works", nav_browse: "Search", nav_post: "Post", nav_premium: "Subscription",
  nav_contacts: "My contacts", nav_contact_us: "Contact us", nav_admin: "Admin",
  login: "Log in", logout: "Log out",
  type_maison: "House", type_chambre: "Room", type_voiture: "Car", type_appareils: "Appliances",
  trans_location: "Rent", trans_vente: "Sale",
  browse_title: "Browse listings", browse_subtitle: "Filter by property type, transaction and country, then open a listing to unlock the owner's contact.",
  search_placeholder: "City, country, keyword…", filter_all_type: "Any type", filter_all_trans: "Rent or sale", filter_all_country: "Any country",
  no_results: "No listing matches these filters. Try widening your search.",
  card_view: "View", card_unlocked: "Unlocked",
  modal_locked_message: "The owner's name and number are hidden. Unlock their contact to reach them directly.",
  modal_unlock_button: "Unlock contact", modal_secure_payment: "Real, secure payment via Stripe",
  modal_processing: "Redirecting to secure Stripe payment…", modal_revealed_title: "Contact unlocked",
  modal_call: "Call", modal_copied: "Number copied.",
  history_title: "My unlocked contacts", history_empty: "You haven't unlocked any contact yet. Go to \u201cSearch\u201d to find a listing.",
  history_login_prompt: "Log in to see the contacts you've unlocked.",
  premium_title: "Premium subscription", premium_subscribe: "Subscribe",
  footer_tagline: "CléSchengen — listings are stored in a shared database. Owners' contact details are only revealed after payment.",
  contact_title: "Contact us", contact_prompt: "Trouble with your account, a payment or a listing? Describe it here and we'll reply by e-mail.",
  contact_email_label: "Your e-mail", contact_message_label: "Message", contact_send: "Send message",
  auth_login_title: "Log in", auth_signup_title: "Create an account", auth_email: "E-mail", auth_password: "Password",
  auth_role_seeker: "Looking for a property", auth_role_landlord: "Owner / seller",
  auth_submit_login: "Log in", auth_submit_signup: "Create my account",
  auth_switch_to_signup: "No account yet? Create one", auth_switch_to_login: "Already have an account? Log in",
  add_form_title: "Publish a listing", add_owner_name: "Your name", add_phone: "Phone number",
  add_type: "Property type", add_transaction: "Listing type", add_country: "Country (Schengen area)",
  add_city: "City", add_neighborhood: "Neighbourhood", add_price: "Price", add_description: "Description",
  add_photos: "Property photos", add_captcha_label: "Anti-robot check", add_submit: "Publish listing",
  how_title: "How the connection works",
  how_subtitle: "CléSchengen connects owners renting or selling properties across the Schengen area with people looking for housing or a car.",
  how_step1_title: "The owner posts", how_step2_title: "The client searches and chooses", how_step3_title: "The client pays to get connected",
  how_cta_browse: "Browse listings", how_cta_post: "I'm an owner, I want to post",
  language_label: "Language",
};

const it = {
  nav_how: "Come funziona", nav_browse: "Cerca", nav_post: "Pubblica", nav_premium: "Abbonamento",
  nav_contacts: "I miei contatti", nav_contact_us: "Contattaci", nav_admin: "Admin",
  login: "Accedi", logout: "Esci",
  type_maison: "Casa", type_chambre: "Stanza", type_voiture: "Auto", type_appareils: "Elettrodomestici",
  trans_location: "Affitto", trans_vente: "Vendita",
  browse_title: "Sfoglia gli annunci", browse_subtitle: "Filtra per tipo di immobile, transazione e paese, poi apri un annuncio per sbloccare il contatto del proprietario.",
  search_placeholder: "Città, paese, parola chiave…", filter_all_type: "Ogni tipo", filter_all_trans: "Affitto o vendita", filter_all_country: "Ogni paese",
  no_results: "Nessun annuncio corrisponde a questi filtri. Prova ad ampliare la ricerca.",
  card_view: "Vedi", card_unlocked: "Sbloccato",
  modal_locked_message: "Il nome e il numero del proprietario sono nascosti. Sblocca il contatto per raggiungerlo direttamente.",
  modal_unlock_button: "Sblocca il contatto", modal_secure_payment: "Pagamento reale e sicuro tramite Stripe",
  modal_processing: "Reindirizzamento al pagamento sicuro Stripe…", modal_revealed_title: "Contatto sbloccato",
  modal_call: "Chiama", modal_copied: "Numero copiato.",
  history_title: "I miei contatti sbloccati", history_empty: "Non hai ancora sbloccato nessun contatto. Vai su «Cerca» per trovare un annuncio.",
  history_login_prompt: "Accedi per vedere i contatti che hai sbloccato.",
  premium_title: "Abbonamento Premium", premium_subscribe: "Abbonati",
  footer_tagline: "CléSchengen — gli annunci sono conservati in un database condiviso. I contatti dei proprietari vengono rivelati solo dopo il pagamento.",
  contact_title: "Contattaci", contact_prompt: "Difficoltà con il tuo account, un pagamento o un annuncio? Descrivila qui, ti risponderemo via e-mail.",
  contact_email_label: "La tua e-mail", contact_message_label: "Messaggio", contact_send: "Invia messaggio",
  auth_login_title: "Accedi", auth_signup_title: "Crea un account", auth_email: "E-mail", auth_password: "Password",
  auth_role_seeker: "In cerca di un immobile", auth_role_landlord: "Proprietario / venditore",
  auth_submit_login: "Accedi", auth_submit_signup: "Crea il mio account",
  auth_switch_to_signup: "Non hai un account? Creane uno", auth_switch_to_login: "Hai già un account? Accedi",
  add_form_title: "Pubblica un annuncio", add_owner_name: "Il tuo nome", add_phone: "Numero di telefono",
  add_type: "Tipo di immobile", add_transaction: "Tipo di annuncio", add_country: "Paese (area Schengen)",
  add_city: "Città", add_neighborhood: "Quartiere", add_price: "Prezzo", add_description: "Descrizione",
  add_photos: "Foto dell'immobile", add_captcha_label: "Verifica anti-robot", add_submit: "Pubblica annuncio",
  how_title: "Come funziona la messa in contatto",
  how_subtitle: "CléSchengen collega proprietari che affittano o vendono immobili nell'area Schengen con persone in cerca di un alloggio o di un'auto.",
  how_step1_title: "Il proprietario pubblica", how_step2_title: "Il cliente cerca e sceglie", how_step3_title: "Il cliente paga per essere messo in contatto",
  how_cta_browse: "Sfoglia gli annunci", how_cta_post: "Sono un proprietario, voglio pubblicare",
  language_label: "Lingua",
};

const es = {
  nav_how: "Cómo funciona", nav_browse: "Buscar", nav_post: "Publicar", nav_premium: "Suscripción",
  nav_contacts: "Mis contactos", nav_contact_us: "Contáctanos", nav_admin: "Admin",
  login: "Iniciar sesión", logout: "Cerrar sesión",
  type_maison: "Casa", type_chambre: "Habitación", type_voiture: "Coche", type_appareils: "Electrodomésticos",
  trans_location: "Alquiler", trans_vente: "Venta",
  browse_title: "Explorar anuncios", browse_subtitle: "Filtra por tipo de propiedad, transacción y país, luego abre un anuncio para desbloquear el contacto del propietario.",
  search_placeholder: "Ciudad, país, palabra clave…", filter_all_type: "Cualquier tipo", filter_all_trans: "Alquiler o venta", filter_all_country: "Cualquier país",
  no_results: "Ningún anuncio coincide con estos filtros. Intenta ampliar tu búsqueda.",
  card_view: "Ver", card_unlocked: "Desbloqueado",
  modal_locked_message: "El nombre y el número del propietario están ocultos. Desbloquea su contacto para llamarlo directamente.",
  modal_unlock_button: "Desbloquear contacto", modal_secure_payment: "Pago real y seguro con Stripe",
  modal_processing: "Redirigiendo al pago seguro de Stripe…", modal_revealed_title: "Contacto desbloqueado",
  modal_call: "Llamar", modal_copied: "Número copiado.",
  history_title: "Mis contactos desbloqueados", history_empty: "Todavía no has desbloqueado ningún contacto. Ve a «Buscar» para encontrar un anuncio.",
  history_login_prompt: "Inicia sesión para ver los contactos que has desbloqueado.",
  premium_title: "Suscripción Premium", premium_subscribe: "Suscribirse",
  footer_tagline: "CléSchengen — los anuncios se almacenan en una base de datos compartida. Los datos de contacto de los propietarios solo se revelan tras el pago.",
  contact_title: "Contáctanos", contact_prompt: "¿Problemas con tu cuenta, un pago o un anuncio? Descríbelo aquí, te responderemos por e-mail.",
  contact_email_label: "Tu e-mail", contact_message_label: "Mensaje", contact_send: "Enviar mensaje",
  auth_login_title: "Iniciar sesión", auth_signup_title: "Crear una cuenta", auth_email: "E-mail", auth_password: "Contraseña",
  auth_role_seeker: "Buscando una propiedad", auth_role_landlord: "Propietario / vendedor",
  auth_submit_login: "Iniciar sesión", auth_submit_signup: "Crear mi cuenta",
  auth_switch_to_signup: "¿Aún no tienes cuenta? Crea una", auth_switch_to_login: "¿Ya tienes cuenta? Inicia sesión",
  add_form_title: "Publicar un anuncio", add_owner_name: "Tu nombre", add_phone: "Número de teléfono",
  add_type: "Tipo de propiedad", add_transaction: "Tipo de anuncio", add_country: "País (espacio Schengen)",
  add_city: "Ciudad", add_neighborhood: "Barrio", add_price: "Precio", add_description: "Descripción",
  add_photos: "Fotos de la propiedad", add_captcha_label: "Verificación anti-robot", add_submit: "Publicar anuncio",
  how_title: "Cómo funciona la puesta en contacto",
  how_subtitle: "CléSchengen conecta a propietarios que alquilan o venden propiedades en el espacio Schengen con personas que buscan vivienda o coche.",
  how_step1_title: "El propietario publica", how_step2_title: "El cliente busca y elige", how_step3_title: "El cliente paga para ser puesto en contacto",
  how_cta_browse: "Explorar anuncios", how_cta_post: "Soy propietario, quiero publicar",
  language_label: "Idioma",
};

const de = {
  nav_how: "So funktioniert's", nav_browse: "Suchen", nav_post: "Inserieren", nav_premium: "Abonnement",
  nav_contacts: "Meine Kontakte", nav_contact_us: "Kontaktiere uns", nav_admin: "Admin",
  login: "Anmelden", logout: "Abmelden",
  type_maison: "Haus", type_chambre: "Zimmer", type_voiture: "Auto", type_appareils: "Geräte",
  trans_location: "Miete", trans_vente: "Verkauf",
  browse_title: "Anzeigen durchsuchen", browse_subtitle: "Filtere nach Objektart, Transaktion und Land, öffne dann eine Anzeige, um den Kontakt des Eigentümers freizuschalten.",
  search_placeholder: "Stadt, Land, Stichwort…", filter_all_type: "Alle Typen", filter_all_trans: "Miete oder Verkauf", filter_all_country: "Alle Länder",
  no_results: "Keine Anzeige entspricht diesen Filtern. Versuche, die Suche zu erweitern.",
  card_view: "Ansehen", card_unlocked: "Freigeschaltet",
  modal_locked_message: "Name und Nummer des Eigentümers sind verborgen. Schalte den Kontakt frei, um ihn direkt zu erreichen.",
  modal_unlock_button: "Kontakt freischalten", modal_secure_payment: "Echte, sichere Zahlung über Stripe",
  modal_processing: "Weiterleitung zur sicheren Stripe-Zahlung…", modal_revealed_title: "Kontakt freigeschaltet",
  modal_call: "Anrufen", modal_copied: "Nummer kopiert.",
  history_title: "Meine freigeschalteten Kontakte", history_empty: "Du hast noch keinen Kontakt freigeschaltet. Gehe zu «Suchen», um eine Anzeige zu finden.",
  history_login_prompt: "Melde dich an, um die von dir freigeschalteten Kontakte zu sehen.",
  premium_title: "Premium-Abonnement", premium_subscribe: "Abonnieren",
  footer_tagline: "CléSchengen — Anzeigen werden in einer gemeinsamen Datenbank gespeichert. Kontaktdaten der Eigentümer werden erst nach Zahlung offengelegt.",
  contact_title: "Kontaktiere uns", contact_prompt: "Probleme mit deinem Konto, einer Zahlung oder einer Anzeige? Beschreibe es hier, wir antworten per E-Mail.",
  contact_email_label: "Deine E-Mail", contact_message_label: "Nachricht", contact_send: "Nachricht senden",
  auth_login_title: "Anmelden", auth_signup_title: "Konto erstellen", auth_email: "E-Mail", auth_password: "Passwort",
  auth_role_seeker: "Auf der Suche nach einer Immobilie", auth_role_landlord: "Eigentümer / Verkäufer",
  auth_submit_login: "Anmelden", auth_submit_signup: "Konto erstellen",
  auth_switch_to_signup: "Noch kein Konto? Konto erstellen", auth_switch_to_login: "Schon ein Konto? Anmelden",
  add_form_title: "Anzeige veröffentlichen", add_owner_name: "Dein Name", add_phone: "Telefonnummer",
  add_type: "Objektart", add_transaction: "Anzeigenart", add_country: "Land (Schengen-Raum)",
  add_city: "Stadt", add_neighborhood: "Stadtviertel", add_price: "Preis", add_description: "Beschreibung",
  add_photos: "Fotos der Immobilie", add_captcha_label: "Anti-Roboter-Prüfung", add_submit: "Anzeige veröffentlichen",
  how_title: "So funktioniert die Kontaktvermittlung",
  how_subtitle: "CléSchengen verbindet Eigentümer, die Immobilien im Schengen-Raum vermieten oder verkaufen, mit Menschen, die eine Wohnung oder ein Auto suchen.",
  how_step1_title: "Der Eigentümer inseriert", how_step2_title: "Der Kunde sucht und wählt aus", how_step3_title: "Der Kunde zahlt, um vermittelt zu werden",
  how_cta_browse: "Anzeigen durchsuchen", how_cta_post: "Ich bin Eigentümer, ich möchte inserieren",
  language_label: "Sprache",
};

// ---- Langues supplémentaires : traduction du menu et des titres principaux ----
// (couverture volontairement plus légère pour ce premier lot — le reste de
// l'interface repose sur le français par défaut pour ces langues, à
// compléter progressivement)
const nl = { nav_how: "Hoe het werkt", nav_browse: "Zoeken", nav_post: "Plaatsen", nav_premium: "Abonnement", nav_contacts: "Mijn contacten", nav_contact_us: "Neem contact op", nav_admin: "Admin", login: "Inloggen", logout: "Uitloggen", type_maison: "Huis", type_chambre: "Kamer", type_voiture: "Auto", type_appareils: "Apparaten", trans_location: "Huur", trans_vente: "Verkoop", browse_title: "Advertenties doorbladeren", card_view: "Bekijken", card_unlocked: "Ontgrendeld", premium_title: "Premium-abonnement", premium_subscribe: "Abonneren", language_label: "Taal" };
const pt = { nav_how: "Como funciona", nav_browse: "Pesquisar", nav_post: "Publicar", nav_premium: "Subscrição", nav_contacts: "Meus contactos", nav_contact_us: "Contacte-nos", nav_admin: "Admin", login: "Iniciar sessão", logout: "Terminar sessão", type_maison: "Casa", type_chambre: "Quarto", type_voiture: "Carro", type_appareils: "Eletrodomésticos", trans_location: "Arrendamento", trans_vente: "Venda", browse_title: "Ver anúncios", card_view: "Ver", card_unlocked: "Desbloqueado", premium_title: "Subscrição Premium", premium_subscribe: "Subscrever", language_label: "Idioma" };
const el = { nav_how: "Πώς λειτουργεί", nav_browse: "Αναζήτηση", nav_post: "Δημοσίευση", nav_premium: "Συνδρομή", nav_contacts: "Οι επαφές μου", nav_contact_us: "Επικοινωνήστε μαζί μας", nav_admin: "Διαχειριστής", login: "Σύνδεση", logout: "Αποσύνδεση", type_maison: "Σπίτι", type_chambre: "Δωμάτιο", type_voiture: "Αυτοκίνητο", type_appareils: "Συσκευές", trans_location: "Ενοικίαση", trans_vente: "Πώληση", browse_title: "Περιήγηση αγγελιών", card_view: "Προβολή", card_unlocked: "Ξεκλειδώθηκε", premium_title: "Συνδρομή Premium", premium_subscribe: "Εγγραφή", language_label: "Γλώσσα" };
const pl = { nav_how: "Jak to działa", nav_browse: "Szukaj", nav_post: "Dodaj ogłoszenie", nav_premium: "Subskrypcja", nav_contacts: "Moje kontakty", nav_contact_us: "Skontaktuj się", nav_admin: "Admin", login: "Zaloguj się", logout: "Wyloguj się", type_maison: "Dom", type_chambre: "Pokój", type_voiture: "Samochód", type_appareils: "Sprzęt AGD", trans_location: "Wynajem", trans_vente: "Sprzedaż", browse_title: "Przeglądaj ogłoszenia", card_view: "Zobacz", card_unlocked: "Odblokowano", premium_title: "Subskrypcja Premium", premium_subscribe: "Subskrybuj", language_label: "Język" };
const cs = { nav_how: "Jak to funguje", nav_browse: "Hledat", nav_post: "Přidat inzerát", nav_premium: "Předplatné", nav_contacts: "Moje kontakty", nav_contact_us: "Kontaktujte nás", nav_admin: "Admin", login: "Přihlásit se", logout: "Odhlásit se", type_maison: "Dům", type_chambre: "Pokoj", type_voiture: "Auto", type_appareils: "Spotřebiče", trans_location: "Pronájem", trans_vente: "Prodej", browse_title: "Procházet inzeráty", card_view: "Zobrazit", card_unlocked: "Odemčeno", premium_title: "Předplatné Premium", premium_subscribe: "Předplatit", language_label: "Jazyk" };
const sk = { nav_how: "Ako to funguje", nav_browse: "Hľadať", nav_post: "Pridať inzerát", nav_premium: "Predplatné", nav_contacts: "Moje kontakty", nav_contact_us: "Kontaktujte nás", nav_admin: "Admin", login: "Prihlásiť sa", logout: "Odhlásiť sa", type_maison: "Dom", type_chambre: "Izba", type_voiture: "Auto", type_appareils: "Spotrebiče", trans_location: "Prenájom", trans_vente: "Predaj", browse_title: "Prehliadať inzeráty", card_view: "Zobraziť", card_unlocked: "Odomknuté", premium_title: "Predplatné Premium", premium_subscribe: "Predplatiť", language_label: "Jazyk" };
const hu = { nav_how: "Hogyan működik", nav_browse: "Keresés", nav_post: "Hirdetés feladása", nav_premium: "Előfizetés", nav_contacts: "Kapcsolataim", nav_contact_us: "Lépjen kapcsolatba velünk", nav_admin: "Admin", login: "Bejelentkezés", logout: "Kijelentkezés", type_maison: "Ház", type_chambre: "Szoba", type_voiture: "Autó", type_appareils: "Készülékek", trans_location: "Bérlés", trans_vente: "Eladás", browse_title: "Hirdetések böngészése", card_view: "Megtekintés", card_unlocked: "Feloldva", premium_title: "Prémium előfizetés", premium_subscribe: "Feliratkozás", language_label: "Nyelv" };
const ro = { nav_how: "Cum funcționează", nav_browse: "Căutare", nav_post: "Publică anunț", nav_premium: "Abonament", nav_contacts: "Contactele mele", nav_contact_us: "Contactează-ne", nav_admin: "Admin", login: "Conectare", logout: "Deconectare", type_maison: "Casă", type_chambre: "Cameră", type_voiture: "Mașină", type_appareils: "Electrocasnice", trans_location: "Închiriere", trans_vente: "Vânzare", browse_title: "Răsfoiește anunțurile", card_view: "Vezi", card_unlocked: "Deblocat", premium_title: "Abonament Premium", premium_subscribe: "Abonează-te", language_label: "Limbă" };
const bg = { nav_how: "Как работи", nav_browse: "Търсене", nav_post: "Публикувай", nav_premium: "Абонамент", nav_contacts: "Моите контакти", nav_contact_us: "Свържете се с нас", nav_admin: "Админ", login: "Вход", logout: "Изход", type_maison: "Къща", type_chambre: "Стая", type_voiture: "Кола", type_appareils: "Уреди", trans_location: "Наем", trans_vente: "Продажба", browse_title: "Разгледай обявите", card_view: "Виж", card_unlocked: "Отключено", premium_title: "Премиум абонамент", premium_subscribe: "Абонирай се", language_label: "Език" };
const hr = { nav_how: "Kako radi", nav_browse: "Pretraži", nav_post: "Objavi oglas", nav_premium: "Pretplata", nav_contacts: "Moji kontakti", nav_contact_us: "Kontaktirajte nas", nav_admin: "Admin", login: "Prijava", logout: "Odjava", type_maison: "Kuća", type_chambre: "Soba", type_voiture: "Auto", type_appareils: "Uređaji", trans_location: "Najam", trans_vente: "Prodaja", browse_title: "Pregledaj oglase", card_view: "Pogledaj", card_unlocked: "Otključano", premium_title: "Premium pretplata", premium_subscribe: "Pretplati se", language_label: "Jezik" };
const sl = { nav_how: "Kako deluje", nav_browse: "Iskanje", nav_post: "Objavi oglas", nav_premium: "Naročnina", nav_contacts: "Moji stiki", nav_contact_us: "Kontaktirajte nas", nav_admin: "Admin", login: "Prijava", logout: "Odjava", type_maison: "Hiša", type_chambre: "Soba", type_voiture: "Avto", type_appareils: "Naprave", trans_location: "Najem", trans_vente: "Prodaja", browse_title: "Prebrskaj oglase", card_view: "Poglej", card_unlocked: "Odklenjeno", premium_title: "Premium naročnina", premium_subscribe: "Naroči se", language_label: "Jezik" };
const sv = { nav_how: "Så fungerar det", nav_browse: "Sök", nav_post: "Publicera", nav_premium: "Prenumeration", nav_contacts: "Mina kontakter", nav_contact_us: "Kontakta oss", nav_admin: "Admin", login: "Logga in", logout: "Logga ut", type_maison: "Hus", type_chambre: "Rum", type_voiture: "Bil", type_appareils: "Apparater", trans_location: "Hyra", trans_vente: "Försäljning", browse_title: "Bläddra bland annonser", card_view: "Visa", card_unlocked: "Upplåst", premium_title: "Premium-prenumeration", premium_subscribe: "Prenumerera", language_label: "Språk" };
const da = { nav_how: "Sådan fungerer det", nav_browse: "Søg", nav_post: "Opret annonce", nav_premium: "Abonnement", nav_contacts: "Mine kontakter", nav_contact_us: "Kontakt os", nav_admin: "Admin", login: "Log ind", logout: "Log ud", type_maison: "Hus", type_chambre: "Værelse", type_voiture: "Bil", type_appareils: "Apparater", trans_location: "Leje", trans_vente: "Salg", browse_title: "Gennemse annoncer", card_view: "Se", card_unlocked: "Låst op", premium_title: "Premium-abonnement", premium_subscribe: "Abonnér", language_label: "Sprog" };
const fi = { nav_how: "Miten se toimii", nav_browse: "Haku", nav_post: "Julkaise ilmoitus", nav_premium: "Tilaus", nav_contacts: "Omat yhteystiedot", nav_contact_us: "Ota yhteyttä", nav_admin: "Admin", login: "Kirjaudu sisään", logout: "Kirjaudu ulos", type_maison: "Talo", type_chambre: "Huone", type_voiture: "Auto", type_appareils: "Laitteet", trans_location: "Vuokraus", trans_vente: "Myynti", browse_title: "Selaa ilmoituksia", card_view: "Näytä", card_unlocked: "Avattu", premium_title: "Premium-tilaus", premium_subscribe: "Tilaa", language_label: "Kieli" };
const no = { nav_how: "Slik fungerer det", nav_browse: "Søk", nav_post: "Publiser annonse", nav_premium: "Abonnement", nav_contacts: "Mine kontakter", nav_contact_us: "Kontakt oss", nav_admin: "Admin", login: "Logg inn", logout: "Logg ut", type_maison: "Hus", type_chambre: "Rom", type_voiture: "Bil", type_appareils: "Apparater", trans_location: "Leie", trans_vente: "Salg", browse_title: "Bla gjennom annonser", card_view: "Vis", card_unlocked: "Låst opp", premium_title: "Premium-abonnement", premium_subscribe: "Abonner", language_label: "Språk" };
const is = { nav_how: "Hvernig það virkar", nav_browse: "Leita", nav_post: "Birta auglýsingu", nav_premium: "Áskrift", nav_contacts: "Tengiliðirnir mínir", nav_contact_us: "Hafðu samband", nav_admin: "Stjórnandi", login: "Skrá inn", logout: "Skrá út", type_maison: "Hús", type_chambre: "Herbergi", type_voiture: "Bíll", type_appareils: "Tæki", trans_location: "Leiga", trans_vente: "Sala", browse_title: "Skoða auglýsingar", card_view: "Skoða", card_unlocked: "Aflæst", premium_title: "Premium áskrift", premium_subscribe: "Gerast áskrifandi", language_label: "Tungumál" };
const et = { nav_how: "Kuidas see töötab", nav_browse: "Otsi", nav_post: "Postita kuulutus", nav_premium: "Tellimus", nav_contacts: "Minu kontaktid", nav_contact_us: "Võta meiega ühendust", nav_admin: "Admin", login: "Logi sisse", logout: "Logi välja", type_maison: "Maja", type_chambre: "Tuba", type_voiture: "Auto", type_appareils: "Seadmed", trans_location: "Üürile", trans_vente: "Müük", browse_title: "Sirvi kuulutusi", card_view: "Vaata", card_unlocked: "Avatud", premium_title: "Premium tellimus", premium_subscribe: "Telli", language_label: "Keel" };
const lv = { nav_how: "Kā tas darbojas", nav_browse: "Meklēt", nav_post: "Publicēt sludinājumu", nav_premium: "Abonements", nav_contacts: "Mani kontakti", nav_contact_us: "Sazinieties ar mums", nav_admin: "Admin", login: "Pieslēgties", logout: "Izrakstīties", type_maison: "Māja", type_chambre: "Istaba", type_voiture: "Automašīna", type_appareils: "Ierīces", trans_location: "Īre", trans_vente: "Pārdošana", browse_title: "Pārlūkot sludinājumus", card_view: "Skatīt", card_unlocked: "Atbloķēts", premium_title: "Premium abonements", premium_subscribe: "Abonēt", language_label: "Valoda" };
const lt = { nav_how: "Kaip tai veikia", nav_browse: "Paieška", nav_post: "Skelbti", nav_premium: "Prenumerata", nav_contacts: "Mano kontaktai", nav_contact_us: "Susisiekite su mumis", nav_admin: "Admin", login: "Prisijungti", logout: "Atsijungti", type_maison: "Namas", type_chambre: "Kambarys", type_voiture: "Automobilis", type_appareils: "Prietaisai", trans_location: "Nuoma", trans_vente: "Pardavimas", browse_title: "Naršyti skelbimus", card_view: "Žiūrėti", card_unlocked: "Atrakinta", premium_title: "Premium prenumerata", premium_subscribe: "Prenumeruoti", language_label: "Kalba" };
const mt = { nav_how: "Kif jaħdem", nav_browse: "Fittex", nav_post: "Ippubblika", nav_premium: "Abbonament", nav_contacts: "Il-kuntatti tiegħi", nav_contact_us: "Ikkuntattjana", nav_admin: "Admin", login: "Idħol", logout: "Oħroġ", type_maison: "Dar", type_chambre: "Kamra", type_voiture: "Karozza", type_appareils: "Apparat", trans_location: "Kiri", trans_vente: "Bejgħ", browse_title: "Ejja ara l-avviżi", card_view: "Ara", card_unlocked: "Miftuħ", premium_title: "Abbonament Premium", premium_subscribe: "Abbona", language_label: "Lingwa" };

export const translations = { fr, en, it, es, de, nl, pt, el, pl, cs, sk, hu, ro, bg, hr, sl, sv, da, fi, no, is, et, lv, lt, mt };

// t(lang, key) : renvoie la traduction, ou le français par défaut si la
// clé n'existe pas encore pour cette langue (repli automatique), ou la clé
// elle-même en tout dernier recours.
export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.fr[key] ?? key;
}
