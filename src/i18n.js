// ============================================================
// Système de traduction — CléSchengen
// Couverture complète en Français et Anglais.
// ============================================================

export const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

const fr = {
  nav_how: "Comment ça marche", nav_browse: "Rechercher", nav_post: "Poster", nav_premium: "Abonnement",
  nav_contacts: "Mes contacts", nav_contact_us: "Contactez-nous", nav_admin: "Admin",
  login: "Se connecter", logout: "Déconnexion", language_label: "Langue",

  type_maison: "Maison", type_chambre: "Chambre", type_voiture: "Voiture", type_appareils: "Appareils",
  trans_location: "Location", trans_vente: "Vente",

  browse_title: "Parcourir les annonces",
  browse_subtitle: "Filtre par type de bien, transaction et pays, puis ouvre une annonce pour débloquer le contact du propriétaire.",
  search_placeholder: "Ville, pays, mot-clé…", filter_all_type: "Tout type", filter_all_trans: "Location ou vente", filter_all_country: "Tout pays",
  results_found: "annonce(s) trouvée(s)",
  no_results: "Aucune annonce ne correspond à ces filtres. Essaie d'élargir ta recherche.",
  loading_listings: "Chargement des annonces…",
  db_error: "Impossible de synchroniser la base partagée pour le moment — réessaie dans un instant.",

  card_view: "Voir", card_unlocked: "Débloqué",

  modal_locked_message: "Le nom et le numéro du propriétaire sont masqués. Débloque ses coordonnées pour le contacter directement.",
  modal_unlock_button: "Débloquer le contact", modal_secure_payment: "Paiement réel et sécurisé via Stripe",
  modal_processing: "Redirection vers le paiement sécurisé Stripe…", modal_revealed_title: "Contact débloqué",
  modal_call: "Appeler", modal_copied: "Numéro copié.", modal_ref: "RÉF.",
  modal_no_photo: "Aucune photo fournie pour cette annonce",
  modal_account_required: "Un compte est nécessaire pour payer et retrouver ce contact ensuite.",
  modal_history_hint: "Retrouve ce contact dans l'onglet « Mes contacts », même après avoir fermé l'application.",
  modal_verified_badge: "Propriétaire vérifié",

  history_title: "Mes contacts débloqués",
  history_subtitle: "Ces contacts restent enregistrés sur ton compte, même si tu reviens plus tard.",
  history_empty: "Tu n'as encore débloqué aucun contact. Va dans « Rechercher » pour trouver une annonce.",
  history_login_prompt: "Connecte-toi pour voir les contacts que tu as débloqués.",

  premium_title: "Abonnement Premium",
  premium_subtitle: "Pendant toute la durée de validité de ton abonnement : accès libre pour publier des annonces sans attendre la vérification d'identité, et déblocage gratuit et illimité des contacts de toutes les annonces.",
  premium_active_note: "Ton abonnement est actif — profite de l'accès libre dès maintenant.",
  premium_login_prompt: "Connecte-toi pour lier l'abonnement à ton compte.",
  premium_subscribe: "S'abonner",
  premium_benefit_1: "Publication libre, sans attendre la vérification d'identité",
  premium_benefit_2: "Contacts débloqués gratuitement et sans limite",
  premium_benefit_3: "Badge Premium sur tes annonces",

  footer_tagline: "CléSchengen — les annonces sont stockées dans une base partagée. Les coordonnées des propriétaires ne sont révélées qu'après paiement, et la publication d'annonces est réservée aux comptes propriétaires vérifiés.",

  contact_title: "Contactez-nous",
  contact_prompt: "Une difficulté avec ton compte, un paiement ou une annonce ? Décris-la ici, on te répond par e-mail.",
  contact_email_label: "Ton e-mail", contact_message_label: "Message", contact_send: "Envoyer le message",
  contact_placeholder: "Décris ta difficulté…",
  contact_sent: "Message envoyé. On te répond dès que possible à",
  contact_error: "Renseigne ton e-mail et ton message.",

  auth_login_title: "Se connecter", auth_signup_title: "Créer un compte", auth_email: "E-mail", auth_password: "Mot de passe",
  auth_role_seeker: "À la recherche d'un bien", auth_role_landlord: "Propriétaire / vendeur",
  auth_role_note: "Une vérification d'identité sera demandée avant de pouvoir publier une annonce.",
  auth_submit_login: "Se connecter", auth_submit_signup: "Créer mon compte",
  auth_switch_to_signup: "Pas encore de compte ? Créer un compte", auth_switch_to_login: "Déjà un compte ? Se connecter",
  auth_signup_notice: "Compte créé. Si la confirmation par e-mail est activée, vérifie ta boîte mail avant de te connecter.",

  add_form_title: "Publier une annonce",
  add_form_subtitle: "Ton numéro reste masqué sur la plateforme. Il n'est révélé qu'aux personnes ayant payé pour le débloquer.",
  add_owner_name: "Ton nom", add_owner_name_ph: "Nom et prénom",
  add_phone: "Numéro de téléphone",
  add_type: "Type de bien", add_transaction: "Type d'annonce", add_country: "Pays (espace Schengen)",
  add_city: "Ville", add_city_ph: "ex. Lyon", add_neighborhood: "Quartier", add_neighborhood_ph: "ex. Croix-Rousse",
  add_price: "Prix", add_price_ph: "ex. 850", add_price_total: "total",
  unit_month: "/mois", unit_day: "/jour",
  add_description: "Description", add_description_ph: "Décris le bien, sa disponibilité, ses conditions…",
  add_photos: "Photos du bien", add_photos_add: "Ajouter", add_photos_note: "Les photos sont compressées automatiquement pour rester légères. Formats JPG/PNG.",
  add_phone_verif_title: "Vérification du propriétaire",
  add_phone_verified: "Numéro vérifié — ton annonce portera le badge « Propriétaire vérifié ».",
  add_phone_confirm_note: "Confirme que tu es bien joignable à ce numéro avant de publier.",
  add_phone_send_code: "Envoyer un code par SMS",
  add_phone_demo_note: "Code envoyé (démo) : {code} — en production, ce code serait envoyé par SMS via un vrai prestataire (Twilio, Vonage…), jamais affiché à l'écran.",
  add_phone_code_ph: "Code reçu", add_phone_confirm: "Confirmer", add_phone_resend: "Renvoyer",
  add_captcha_label: "Vérification anti-robot",
  add_captcha_note: "Recopie le code affiché pour confirmer que tu n'es pas un robot.",
  add_captcha_ph: "Recopie le code ci-dessus",
  add_submit: "Publier l'annonce", add_submitting: "Publication…",
  add_success_prefix: "Annonce publiée avec la référence", add_success_suffix: "Retrouve-la dans « Rechercher ».",
  add_save_error: "La sauvegarde a échoué — vérifie ta connexion et réessaie. Ton annonce n'a pas été publiée.",
  add_premium_cta: "Mettre mes annonces en avant avec un abonnement Premium",
  add_landlord_gate_title: "Espace propriétaire",
  add_landlord_login_prompt: "Connecte-toi ou crée un compte propriétaire pour publier une annonce.",
  add_create_account: "Créer un compte",
  add_loading_account: "Chargement de ton compte…",

  how_title: "Comment fonctionne la mise en relation",
  how_subtitle: "CléSchengen connecte les propriétaires de biens en location ou en vente dans l'espace Schengen avec des personnes qui cherchent un logement ou une voiture. Le contact n'est jamais visible gratuitement : il faut passer par l'étape de paiement pour l'obtenir.",
  how_step1_title: "Le propriétaire publie",
  how_step1_body: "Le propriétaire d'une maison, d'une chambre ou d'une voiture dépose son annonce : ville, pays de l'espace Schengen, prix et description. Son numéro reste masqué.",
  how_step2_title: "Le client cherche et choisit",
  how_step2_body: "Une personne intéressée filtre les annonces par type, transaction et pays, puis ouvre celle qui lui convient. Le contact du propriétaire reste scellé tant qu'il n'a pas payé.",
  how_step3_title: "Le client paie pour être mis en contact",
  how_step3_body: "En réglant {fee} € de frais de mise en relation, le nom et le numéro du propriétaire sont débloqués immédiatement, pour appeler et décider soi-même.",
  how_cta_browse: "Parcourir les annonces", how_cta_post: "Je suis propriétaire, je publie",

  ev_title: "Vérification par e-mail",
  ev_body: "Avant d'envoyer ta pièce d'identité, confirme que tu as bien accès à {email}. Cette étape évite les faux comptes créés automatiquement.",
  ev_send: "Envoyer le lien de confirmation",
  ev_sent_body: "Un e-mail a été envoyé à {email}. Ouvre-le et clique sur le lien de confirmation — cette page se mettra à jour automatiquement dès que ce sera fait.",
  ev_resend: "Renvoyer l'e-mail",
  ev_error: "Échec de l'envoi de l'e-mail, réessaie.",

  vg_seeker_body: "Ce compte est enregistré comme « à la recherche d'un bien ». Pour publier des annonces, passe ton compte en propriétaire/vendeur — une vérification d'identité sera ensuite demandée.",
  vg_become_landlord: "Devenir propriétaire / vendeur",
  vg_pending_body: "Ta pièce d'identité a été envoyée et est en cours de vérification manuelle. Tu pourras publier dès qu'elle sera validée.",
  vg_title: "Vérification d'identité requise",
  vg_rejected_prefix: "Ta précédente demande a été refusée",
  vg_rejected_suffix: "Tu peux renvoyer un document.",
  vg_upload_intro: "Envoie une photo ou un scan lisible d'une pièce d'identité (carte d'identité, passeport). Un membre de l'équipe vérifie manuellement chaque demande avant d'autoriser la publication d'annonces.",
  vg_choose_file: "Choisir un fichier",
  vg_submit: "Envoyer pour vérification",
  vg_upload_error: "Choisis un fichier (photo ou PDF de ta pièce d'identité).",
  vg_upload_fail: "L'envoi a échoué, réessaie.",

  admin_title: "Espace admin", admin_pending_title: "Vérifications en attente",
  admin_loading: "Chargement…", admin_no_pending: "Aucune demande en attente.",
  admin_status: "Statut", admin_view_doc: "Voir le document", admin_open_doc: "Ouvrir le document",
  admin_approve: "Approuver", admin_reject: "Refuser", admin_reject_reason_ph: "Motif de refus (optionnel)",
  admin_moderation: "Modération", admin_listings_title: "Annonces publiées",
  admin_no_listings: "Aucune annonce publiée pour l'instant.", admin_delete: "Supprimer",
  admin_delete_confirm: "Supprimer définitivement cette annonce ?",
  admin_support: "Support", admin_messages_title: "Messages reçus", admin_no_messages: "Aucun message pour l'instant.",

  nav_dashboard: "Tableau de bord",
  dash_title: "Mes annonces", dash_subtitle: "Vues et déblocages de tes annonces publiées.",
  dash_loading: "Chargement…", dash_empty: "Tu n'as encore publié aucune annonce.",
  dash_col_listing: "Annonce", dash_col_views: "Vues", dash_col_unlocks: "Contacts débloqués", dash_col_price: "Prix",
  dash_col_actions: "Actions", dash_edit: "Modifier", dash_delete: "Supprimer",
  dash_delete_confirm: "Supprimer définitivement cette annonce ?",
  edit_title: "Modifier l'annonce", edit_save: "Enregistrer les modifications", edit_saving: "Enregistrement…",
  edit_saved: "Modifications enregistrées.", edit_error: "Échec de l'enregistrement, réessaie.", edit_cancel: "Annuler",
};

const en = {
  nav_how: "How it works", nav_browse: "Search", nav_post: "Post", nav_premium: "Subscription",
  nav_contacts: "My contacts", nav_contact_us: "Contact us", nav_admin: "Admin",
  login: "Log in", logout: "Log out", language_label: "Language",

  type_maison: "House", type_chambre: "Room", type_voiture: "Car", type_appareils: "Appliances",
  trans_location: "Rent", trans_vente: "Sale",

  browse_title: "Browse listings",
  browse_subtitle: "Filter by property type, transaction and country, then open a listing to unlock the owner's contact.",
  search_placeholder: "City, country, keyword…", filter_all_type: "Any type", filter_all_trans: "Rent or sale", filter_all_country: "Any country",
  results_found: "listing(s) found",
  no_results: "No listing matches these filters. Try widening your search.",
  loading_listings: "Loading listings…",
  db_error: "Unable to sync the shared database right now — try again in a moment.",

  card_view: "View", card_unlocked: "Unlocked",

  modal_locked_message: "The owner's name and number are hidden. Unlock their contact to reach them directly.",
  modal_unlock_button: "Unlock contact", modal_secure_payment: "Real, secure payment via Stripe",
  modal_processing: "Redirecting to secure Stripe payment…", modal_revealed_title: "Contact unlocked",
  modal_call: "Call", modal_copied: "Number copied.", modal_ref: "REF.",
  modal_no_photo: "No photo provided for this listing",
  modal_account_required: "An account is required to pay and find this contact again later.",
  modal_history_hint: "Find this contact again in the \u201cMy contacts\u201d tab, even after closing the app.",
  modal_verified_badge: "Verified owner",

  history_title: "My unlocked contacts",
  history_subtitle: "These contacts stay saved to your account, even if you come back later.",
  history_empty: "You haven't unlocked any contact yet. Go to \u201cSearch\u201d to find a listing.",
  history_login_prompt: "Log in to see the contacts you've unlocked.",

  premium_title: "Premium subscription",
  premium_subtitle: "For the entire duration of your subscription: free access to publish listings without waiting for identity verification, and free, unlimited unlocking of every listing's contact.",
  premium_active_note: "Your subscription is active — enjoy free access right now.",
  premium_login_prompt: "Log in to link the subscription to your account.",
  premium_subscribe: "Subscribe",
  premium_benefit_1: "Free publishing, no waiting for identity verification",
  premium_benefit_2: "Contacts unlocked for free, with no limit",
  premium_benefit_3: "Premium badge on your listings",

  footer_tagline: "CléSchengen — listings are stored in a shared database. Owners' contact details are only revealed after payment, and publishing listings is reserved for verified owner accounts.",

  contact_title: "Contact us",
  contact_prompt: "Trouble with your account, a payment or a listing? Describe it here and we'll reply by e-mail.",
  contact_email_label: "Your e-mail", contact_message_label: "Message", contact_send: "Send message",
  contact_placeholder: "Describe your issue…",
  contact_sent: "Message sent. We'll get back to you as soon as possible at",
  contact_error: "Please fill in your e-mail and your message.",

  auth_login_title: "Log in", auth_signup_title: "Create an account", auth_email: "E-mail", auth_password: "Password",
  auth_role_seeker: "Looking for a property", auth_role_landlord: "Owner / seller",
  auth_role_note: "Identity verification will be required before you can publish a listing.",
  auth_submit_login: "Log in", auth_submit_signup: "Create my account",
  auth_switch_to_signup: "No account yet? Create one", auth_switch_to_login: "Already have an account? Log in",
  auth_signup_notice: "Account created. If e-mail confirmation is enabled, check your inbox before logging in.",

  add_form_title: "Publish a listing",
  add_form_subtitle: "Your number stays hidden on the platform. It's only revealed to people who paid to unlock it.",
  add_owner_name: "Your name", add_owner_name_ph: "Full name",
  add_phone: "Phone number",
  add_type: "Property type", add_transaction: "Listing type", add_country: "Country (Schengen area)",
  add_city: "City", add_city_ph: "e.g. Lyon", add_neighborhood: "Neighbourhood", add_neighborhood_ph: "e.g. Croix-Rousse",
  add_price: "Price", add_price_ph: "e.g. 850", add_price_total: "total",
  unit_month: "/month", unit_day: "/day",
  add_description: "Description", add_description_ph: "Describe the property, its availability, its conditions…",
  add_photos: "Property photos", add_photos_add: "Add", add_photos_note: "Photos are compressed automatically to stay lightweight. JPG/PNG formats.",
  add_phone_verif_title: "Owner verification",
  add_phone_verified: "Number verified — your listing will carry the \u201cVerified owner\u201d badge.",
  add_phone_confirm_note: "Confirm you can be reached at this number before publishing.",
  add_phone_send_code: "Send a code by SMS",
  add_phone_demo_note: "Code sent (demo): {code} — in production this code would be sent by SMS through a real provider (Twilio, Vonage…), never shown on screen.",
  add_phone_code_ph: "Code received", add_phone_confirm: "Confirm", add_phone_resend: "Resend",
  add_captcha_label: "Anti-robot check",
  add_captcha_note: "Retype the code shown to confirm you're not a robot.",
  add_captcha_ph: "Retype the code above",
  add_submit: "Publish listing", add_submitting: "Publishing…",
  add_success_prefix: "Listing published with reference", add_success_suffix: "Find it under \u201cSearch\u201d.",
  add_save_error: "Saving failed — check your connection and try again. Your listing was not published.",
  add_premium_cta: "Boost your listings with a Premium subscription",
  add_landlord_gate_title: "Owner area",
  add_landlord_login_prompt: "Log in or create an owner account to publish a listing.",
  add_create_account: "Create an account",
  add_loading_account: "Loading your account…",

  how_title: "How the connection works",
  how_subtitle: "CléSchengen connects owners renting or selling properties across the Schengen area with people looking for housing or a car. Contact details are never free to see: payment is required to unlock them.",
  how_step1_title: "The owner posts",
  how_step1_body: "The owner of a house, room or car submits their listing: city, Schengen country, price and description. Their number stays hidden.",
  how_step2_title: "The client searches and chooses",
  how_step2_body: "An interested person filters listings by type, transaction and country, then opens the one that suits them. The owner's contact stays sealed until they pay.",
  how_step3_title: "The client pays to get connected",
  how_step3_body: "By paying a {fee} € connection fee, the owner's name and number are unlocked immediately, ready to call and decide for themselves.",
  how_cta_browse: "Browse listings", how_cta_post: "I'm an owner, I want to post",

  ev_title: "E-mail verification",
  ev_body: "Before sending your ID document, confirm you have access to {email}. This step prevents automatically created fake accounts.",
  ev_send: "Send confirmation link",
  ev_sent_body: "An e-mail has been sent to {email}. Open it and click the confirmation link — this page will update automatically once it's done.",
  ev_resend: "Resend e-mail",
  ev_error: "Failed to send the e-mail, try again.",

  vg_seeker_body: "This account is registered as \u201clooking for a property\u201d. To publish listings, switch your account to owner/seller — identity verification will then be requested.",
  vg_become_landlord: "Become an owner / seller",
  vg_pending_body: "Your ID document has been sent and is under manual review. You'll be able to publish once it's approved.",
  vg_title: "Identity verification required",
  vg_rejected_prefix: "Your previous request was rejected",
  vg_rejected_suffix: "You can resend a document.",
  vg_upload_intro: "Send a clear photo or scan of an ID document (ID card, passport). A team member manually reviews every request before allowing listings to be published.",
  vg_choose_file: "Choose a file",
  vg_submit: "Submit for verification",
  vg_upload_error: "Choose a file (photo or PDF of your ID document).",
  vg_upload_fail: "Upload failed, try again.",

  admin_title: "Admin area", admin_pending_title: "Pending verifications",
  admin_loading: "Loading…", admin_no_pending: "No pending requests.",
  admin_status: "Status", admin_view_doc: "View document", admin_open_doc: "Open document",
  admin_approve: "Approve", admin_reject: "Reject", admin_reject_reason_ph: "Rejection reason (optional)",
  admin_moderation: "Moderation", admin_listings_title: "Published listings",
  admin_no_listings: "No listings published yet.", admin_delete: "Delete",
  admin_delete_confirm: "Permanently delete this listing?",
  admin_support: "Support", admin_messages_title: "Messages received", admin_no_messages: "No messages yet.",

  nav_dashboard: "Dashboard",
  dash_title: "My listings", dash_subtitle: "Views and unlocks for your published listings.",
  dash_loading: "Loading…", dash_empty: "You haven't published any listing yet.",
  dash_col_listing: "Listing", dash_col_views: "Views", dash_col_unlocks: "Contacts unlocked", dash_col_price: "Price",
  dash_col_actions: "Actions", dash_edit: "Edit", dash_delete: "Delete",
  dash_delete_confirm: "Permanently delete this listing?",
  edit_title: "Edit listing", edit_save: "Save changes", edit_saving: "Saving…",
  edit_saved: "Changes saved.", edit_error: "Failed to save, try again.", edit_cancel: "Cancel",
};

export const translations = { fr, en };

// t(lang, key, vars?) : renvoie la traduction, avec remplacement optionnel
// de {variable} dans le texte. Repli sur le français si la clé manque.
export function t(lang, key, vars) {
  let str = translations[lang]?.[key] ?? translations.fr[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}
