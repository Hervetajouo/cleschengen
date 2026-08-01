// Fonction serveur Vercel — appelée pour toute URL du type /annonce/:id
// (voir vercel.json). Elle récupère le HTML déjà construit par Vite et y
// injecte un vrai titre + une vraie description propres à cette annonce,
// pour que Google, WhatsApp, Facebook, etc. affichent un aperçu correct
// au lieu du titre générique "CléSchengen" pour toutes les pages.
export default async function handler(req, res) {
  const id = req.query.id;

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  let title = "CléSchengen — location et vente dans l'espace Schengen";
  let description = "Annonces vérifiées de location et vente (maison, chambre, voiture, appareils) partout dans l'espace Schengen.";

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/public_listing_meta`, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_id: id }),
    });
    const rows = await r.json();
    const l = Array.isArray(rows) ? rows[0] : null;
    if (l) {
      const priceStr = Number(l.price).toLocaleString("fr-FR");
      title = `${l.type} · ${l.transaction} — ${l.city}, ${l.country} | CléSchengen`;
      description = `${priceStr} € — Annonce vérifiée sur CléSchengen. Débloquez le contact du propriétaire en toute sécurité.`;
    }
  } catch {
    // En cas d'échec, on garde le titre générique ci-dessus plutôt que
    // de faire planter la page.
  }

  let html;
  try {
    const origin = `https://${req.headers.host}`;
    const baseRes = await fetch(`${origin}/index.html`);
    html = await baseRes.text();
  } catch {
    html = "<!doctype html><html><head></head><body><div id=\"root\"></div></body></html>";
  }

  const escape = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const metaTags = `
    <meta name="description" content="${escape(description)}" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
  `;

  html = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`);
  html = html.replace("</head>", `${metaTags}</head>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
