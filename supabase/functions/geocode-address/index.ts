// Convertit une adresse texte en coordonnées (latitude/longitude) via
// Nominatim (OpenStreetMap) — service de géocodage gratuit, sans clé API.
// Appelé côté serveur pour respecter sa politique d'usage (identification
// via un en-tête User-Agent descriptif).
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { address, city, country } = await req.json();
    const query = [address, city, country].filter(Boolean).join(", ");
    if (!query) throw new Error("Adresse manquante");

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CleSchengen/1.0 (contact via site)" },
    });
    const data = await res.json();

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ lat: null, lng: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
