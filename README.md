# CléSchengen — plateforme complète (comptes, vérification, paiement, admin)

Ce projet est maintenant une vraie petite plateforme :

- **Annonces partagées** : tout le monde voit les mêmes annonces (base Supabase).
- **Comptes** : « chercheur » (loue/achète) ou « bailleur/vendeur » (publie).
- **Vérification d'identité manuelle** : un bailleur doit envoyer une pièce d'identité ; **toi seul**, via le panneau admin intégré au site, l'approuves ou la refuses avant qu'il puisse publier.
- **Paiement réel** : un chercheur paie 2,99 € via **Stripe** (vrai paiement, plus de simulation) pour débloquer le nom et le téléphone d'un bailleur. Le déblocage est lié à son compte, pas à son navigateur.

Tout ce qui touche à l'argent et à la vérification passe par le serveur (Supabase Edge Functions + Row Level Security) — jamais uniquement par le code du navigateur, sinon n'importe qui pourrait se débloquer un contact ou s'auto-vérifier gratuitement.

---

## Étape 1 — Créer le projet Supabase

1. https://supabase.com → compte gratuit → « New project ».
2. **SQL Editor** → colle et exécute tout le contenu de [`supabase/schema.sql`](./supabase/schema.sql). Il crée :
   - la table `profiles` (rôle, statut de vérification, chemin du document)
   - la table `listings` (les annonces)
   - la table `unlocks` (qui a payé pour quel contact)
   - le bucket de stockage privé `id-documents`
   - toutes les règles de sécurité (RLS), y compris le fait qu'un utilisateur ne peut **jamais** s'auto-vérifier ou s'auto-débloquer un contact — seul un admin ou le webhook Stripe le peuvent.
3. **Project Settings → API** : note `Project URL`, `anon public key`, et `service_role key` (garde cette dernière secrète, ne jamais la mettre côté frontend).

### Créer ton compte admin

1. Inscris-toi normalement sur le site une fois déployé (n'importe quel rôle).
2. Dans **SQL Editor** :
   ```sql
   update profiles set role = 'admin' where email = 'ton-email@exemple.com';
   ```
3. Reconnecte-toi : un onglet **Admin** apparaît, avec la liste des bailleurs en attente de vérification et un bouton pour ouvrir leur pièce d'identité, approuver ou refuser.

---

## Étape 2 — Stripe (paiement réel)

1. https://dashboard.stripe.com → crée un compte (ou utilise le tien).
2. **Developers → API keys** → note la **clé secrète** (`sk_live_...` ou `sk_test_...` pour tester d'abord).
3. Tu configureras le **webhook** une fois les Edge Functions déployées (étape 3, ça a besoin de leur URL).

Les 3 abonnements Premium (`PLANS` dans `src/App.jsx`) utilisent déjà de vrais **Stripe Payment Links** — rien à faire ici, sauf si tu veux changer les tarifs (modifie-les directement dans ton dashboard Stripe et remplace les URLs dans le code).

---

## Étape 3 — Déployer les Edge Functions (paiement + webhook)

Ces fonctions tournent sur les serveurs de Supabase (gratuit dans une large limite), pas sur Hostinger — Hostinger ne sait héberger que le site statique (étape 5), pas ce code serveur.

```bash
npm install -g supabase
supabase login
cd cleschengen-starter
supabase link --project-ref TON_PROJECT_REF   # visible dans l'URL de ton projet Supabase

# Secrets utilisés par les fonctions
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxx
supabase secrets set SITE_URL=https://cleschengen.xxx   # ton futur nom de domaine
# (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY sont déjà fournis automatiquement par Supabase)

supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```

`--no-verify-jwt` est nécessaire pour le webhook : c'est Stripe qui l'appelle, pas un utilisateur connecté.

Note l'URL affichée pour `stripe-webhook`, du type :
`https://TONPROJET.supabase.co/functions/v1/stripe-webhook`

### Brancher le webhook dans Stripe

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL : celle notée ci-dessus.
3. Événement à écouter : `checkout.session.completed`.
4. Stripe te donne un **Signing secret** (`whsec_...`) → :
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxx
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```

---

## Étape 4 — Tester en local

```bash
cd cleschengen-starter
cp .env.example .env.local
```

Remplis `.env.local` :
```
VITE_SUPABASE_URL=https://TONPROJET.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

```bash
npm install
npm run dev
```

Teste le parcours complet :
1. Crée un compte « bailleur ».
2. Onglet « Devenir bailleur » → envoie une pièce d'identité factice (n'importe quelle image pour tester).
3. Connecte-toi avec ton compte admin → onglet **Admin** → approuve.
4. Reconnecte-toi avec le compte bailleur → publie une annonce.
5. Avec un autre compte (« chercheur »), ouvre l'annonce → « Débloquer le contact » → tu es redirigé vers une vraie page de paiement Stripe (utilise une carte de test `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC si tu es en mode `sk_test_`).
6. Après paiement, tu reviens sur le site et le contact est débloqué dans « Mes contacts ».

---

## Étape 5 — Déployer sur Hostinger avec le domaine cleschengen.xx

1. Sur https://hostinger.com, achète :
   - le **nom de domaine** (ex. `cleschengen.com` ou `.fr` selon disponibilité)
   - un **plan d'hébergement web** (le moins cher suffit, ce site est 100% statique côté serveur Hostinger)
2. Construis le site avec les **vraies** clés de production :
   ```bash
   cd cleschengen-starter
   npm run build
   ```
   (vérifie que `.env.local` contient bien tes clés Supabase de production avant de lancer le build — Vite les intègre directement dans les fichiers générés, il n'y a pas de configuration serveur à faire côté Hostinger.)
3. Dans **hPanel Hostinger → Fichiers → Gestionnaire de fichiers**, ouvre le dossier `public_html` de ton domaine et :
   - supprime son contenu par défaut
   - upload **tout le contenu du dossier `dist/`** (pas le dossier `dist` lui-même, son contenu : `index.html`, `assets/…`) directement dans `public_html`
   - (alternative plus rapide pour un gros dossier : connecte-toi en FTP avec les identifiants donnés par Hostinger, via FileZilla par exemple, et transfère `dist/*` vers `public_html/`)
4. Dans **hPanel → Domaines**, vérifie que `cleschengen.xxx` pointe bien vers cet hébergement (c'est automatique si le domaine a été acheté avec le même compte Hostinger). Le certificat SSL gratuit s'active tout seul en général sous « SSL ».
5. Visite `https://cleschengen.xxx` — le site doit s'afficher.

> Ce site n'a pas de routes (`/quelquechose`), tout se passe sur une seule page avec des onglets — pas besoin de règle de réécriture `.htaccess` particulière pour Hostinger.

### Si tu modifies le code plus tard

Refais juste : `npm run build` → ré-upload le contenu de `dist/` par-dessus l'ancien dans `public_html`.

---

## Sécurité — ce qui est déjà en place

- Un utilisateur ne peut pas s'auto-attribuer le statut « vérifié » ni le rôle « admin » (pas de policy SQL qui l'autorise ; seules des fonctions serveur dédiées ou un admin peuvent le faire).
- Le prix du déblocage (2,99 €) est fixé côté serveur (Edge Function), impossible à modifier depuis le navigateur.
- Personne ne peut écrire directement dans la table `unlocks` : seul le webhook Stripe (avec la clé secrète service_role) le fait, après confirmation réelle du paiement.
- Les pièces d'identité sont dans un bucket **privé** : seul son propriétaire et les admins peuvent les consulter (URL signée temporaire, 5 minutes).

## Ce qui reste à ta discrétion

- Le contenu exact de l'e-mail de confirmation de compte (configurable dans Supabase → Authentication → Email Templates).
- Basculer Stripe en mode « live » (clé `sk_live_...`) quand tu es prêt à encaisser de vrais paiements.
- Ajouter d'autres pays/villes ou modifier les tarifs directement dans `src/App.jsx`.
