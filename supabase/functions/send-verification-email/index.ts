// Envoie un e-mail au bailleur quand un admin approuve ou refuse sa
// vérification d'identité. Utilise l'API Brevo (transactionnel), avec la
// même adresse déjà configurée comme expéditeur dans Supabase Auth.
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (callerProfile?.role !== "admin") throw new Error("Réservé aux admins");

    const { email, status, reason } = await req.json();
    if (!email || !status) throw new Error("Paramètres manquants");

    const isVerified = status === "verified";
    const subject = isVerified
      ? "Ton identité a été vérifiée — tu peux publier sur CléSchengen"
      : "Ta demande de vérification a été refusée";
    const htmlContent = isVerified
      ? `<p>Bonne nouvelle : ta pièce d'identité a été vérifiée par notre équipe.</p>
         <p>Tu peux maintenant publier des annonces sur CléSchengen.</p>`
      : `<p>Ta demande de vérification d'identité n'a pas été acceptée.</p>
         ${reason ? `<p>Motif : ${reason}</p>` : ""}
         <p>Tu peux renvoyer un nouveau document depuis l'onglet « Devenir bailleur ».</p>`;

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": Deno.env.get("BREVO_API_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: Deno.env.get("SENDER_EMAIL")!, name: "CléSchengen" },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    });
    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      throw new Error(`Échec de l'envoi Brevo : ${errText}`);
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
