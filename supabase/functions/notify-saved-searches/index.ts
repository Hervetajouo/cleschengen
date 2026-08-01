// Envoie un e-mail à chaque personne ayant une alerte de recherche qui
// correspond à une nouvelle annonce. Appelée par le propriétaire juste
// après la publication de son annonce.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Non authentifié");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) throw new Error("Session invalide");

    const { listingId } = await req.json();
    if (!listingId) throw new Error("listingId manquant");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // On relit l'annonce en base (jamais les valeurs envoyées par le client)
    // et on vérifie que l'appelant en est bien le propriétaire.
    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("listings")
      .select("id, owner_id, type, transaction, country, city, price")
      .eq("id", listingId)
      .single();
    if (listingErr || !listing) throw new Error("Annonce introuvable");
    if (listing.owner_id !== user.id) throw new Error("Non autorisé");

    const { data: matches } = await supabaseAdmin.rpc("matching_search_emails", {
      p_type: listing.type,
      p_transaction: listing.transaction,
      p_country: listing.country,
      p_price: listing.price,
    });

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    let sent = 0;
    for (const row of matches || []) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": Deno.env.get("BREVO_API_KEY")!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: Deno.env.get("SENDER_EMAIL")!, name: "CléSchengen" },
          to: [{ email: row.email }],
          subject: "Une nouvelle annonce correspond à ton alerte",
          htmlContent: `<p>Une nouvelle annonce vient d'être publiée et correspond à ton alerte :</p>
            <p><strong>${listing.city}, ${listing.country}</strong> — ${listing.price} €</p>
            <p><a href="${siteUrl}">Voir sur CléSchengen</a></p>`,
        }),
      });
      if (res.ok) sent++;
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
