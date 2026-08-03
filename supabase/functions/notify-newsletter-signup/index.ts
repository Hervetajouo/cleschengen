// Envoie un e-mail de confirmation à quelqu'un qui vient de s'inscrire à
// la newsletter. Aucune donnée sensible : juste une confirmation.
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, lang } = await req.json();
    if (!email) throw new Error("E-mail manquant");

    const isEn = lang === "en";
    const subject = isEn ? "Welcome to the CléSchengen newsletter" : "Bienvenue dans la newsletter CléSchengen";
    const body = isEn
      ? `<p>Thanks for subscribing! You'll now receive occasional news about CléSchengen — new features, tips for renting or selling in the Schengen area, and platform updates.</p>`
      : `<p>Merci pour ton inscription ! Tu recevras désormais quelques nouvelles de CléSchengen de temps en temps : nouvelles fonctionnalités, conseils pour louer ou vendre dans l'espace Schengen, et mises à jour de la plateforme.</p>`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": Deno.env.get("BREVO_API_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: Deno.env.get("SENDER_EMAIL")!, name: "CléSchengen" },
        to: [{ email: escapeHtml(email) }],
        subject,
        htmlContent: body,
      }),
    });

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
