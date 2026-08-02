// Envoie un e-mail à la personne concernée (propriétaire ou chercheur)
// quand un nouveau message arrive dans une conversation liée à une annonce.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "*",
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

    const { listingId, seekerId, fromOwner } = await req.json();
    if (!listingId || !seekerId) throw new Error("Paramètres manquants");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: listing } = await supabaseAdmin
      .from("listings")
      .select("id, city, country, owner_id")
      .eq("id", listingId)
      .single();
    if (!listing) throw new Error("Annonce introuvable");

    // Le destinataire est l'autre partie : le propriétaire si le message
    // vient du chercheur, ou le chercheur si le message vient du propriétaire.
    const recipientId = fromOwner ? seekerId : listing.owner_id;
    const { data: recipientProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", recipientId)
      .single();
    if (!recipientProfile) throw new Error("Destinataire introuvable");

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": Deno.env.get("BREVO_API_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: Deno.env.get("SENDER_EMAIL")!, name: "CléSchengen" },
        to: [{ email: recipientProfile.email }],
        subject: "Nouveau message concernant une annonce CléSchengen",
        htmlContent: `<p>Tu as reçu un nouveau message concernant l'annonce à ${escapeHtml(listing.city)}, ${escapeHtml(listing.country)}.</p>
          <p><a href="${siteUrl}">Voir sur CléSchengen</a></p>`,
      }),
    });

    return new Response(JSON.stringify({ sent: res.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
