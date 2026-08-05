// Fonction serveur Vercel qui génère le sitemap.xml dynamiquement, en y
// incluant toutes les annonces actives et tous les articles publiés du
// Journal — au lieu d'un fichier statique qui ne listait que la page
// d'accueil.
export default async function handler(req, res) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  const SITE = "https://cleschengen.com";

  let listingIds = [];
  let posts = [];

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/public_listings`, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/json" },
      body: "{}",
    });
    const rows = await r.json();
    if (Array.isArray(rows)) listingIds = rows.map((l) => ({ id: l.id, created_at: l.created_at }));
  } catch {
    // Si la récupération échoue, le sitemap contiendra au moins la home
    // et le journal plutôt que d'échouer entièrement.
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/journal_posts?published=eq.true&select=slug,updated_at`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    );
    const rows = await r.json();
    if (Array.isArray(rows)) posts = rows;
  } catch {
    // idem
  }

  const urls = [
    { loc: `${SITE}/`, priority: "1.0" },
    { loc: `${SITE}/journal`, priority: "0.7" },
    ...listingIds.filter((l) => l.id).map((l) => ({ loc: `${SITE}/annonce/${l.id}`, lastmod: l.created_at, priority: "0.8" })),
    ...posts.filter((p) => p.slug).map((p) => ({ loc: `${SITE}/journal/${p.slug}`, lastmod: p.updated_at, priority: "0.6" })),
  ].filter((u) => u.loc);

  const escape = (s) => String(s).replace(/&/g, "&amp;");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escape(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>\n` : ""}    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.status(200).send(xml);
}
