// Fonction serveur Vercel — appelée pour toute URL du type /journal/:slug
// (voir vercel.json). Injecte un titre/description propres à l'article
// dans le HTML déjà construit par Vite, pour un bon aperçu sur Google et
// les réseaux sociaux.
export default async function handler(req, res) {
  const slug = req.query.slug;

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  let title = "Journal | CléSchengen";
  let description = "Actualités, conseils et nouveautés de CléSchengen.";

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/journal_posts?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=title,excerpt`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );
    const rows = await r.json();
    const p = Array.isArray(rows) ? rows[0] : null;
    if (p) {
      title = `${p.title} | CléSchengen`;
      if (p.excerpt) description = p.excerpt;
    }
  } catch {
    // En cas d'échec, on garde le titre générique ci-dessus.
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
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
  `;

  html = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`);
  html = html.replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="https://cleschengen.com/journal/${escape(slug)}" />`);
  html = html.replace("</head>", `${metaTags}</head>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
