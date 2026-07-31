// Envoie un e-mail à l'admin quand un visiteur soumet le formulaire
// "Contactez-nous". Utilise l'API Brevo (déjà configurée pour les autres
// notifications). Peut être appelée par un visiteur non connecté — c'est
// volontaire, le formulaire de contact doit rester accessible à tous.
Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, message } = await req.json();
    if (!email || !message) throw new Error("Paramètres manquants");

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": Deno.env.get("BREVO_API_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: Deno.env.get("SENDER_EMAIL")!, name: "CléSchengen" },
        to: [{ email: Deno.env.get("ADMIN_EMAIL")! }],
        subject: "Nouveau message via « Contactez-nous »",
        htmlContent: `<p><strong>De :</strong> ${email}</p><p><strong>Message :</strong></p><p>${message.replace(/\n/g, "<br/>")}</p>`,
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
