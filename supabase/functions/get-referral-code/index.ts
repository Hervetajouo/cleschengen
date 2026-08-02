// Renvoie le code de parrainage personnel de l'utilisateur — le crée
// s'il n'en a pas encore, en trouvant automatiquement le coupon
// "Parrainage 20%" déjà créé manuellement dans Stripe.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Stripe from "npm:stripe@16.9.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caractères ambigus
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `REF-${s}`;
}

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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    if (profile?.referral_code) {
      return new Response(JSON.stringify({ code: profile.referral_code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retrouve le coupon "Parrainage 20%" par son nom, sans avoir besoin
    // de connaître son identifiant technique à l'avance.
    const coupons = await stripe.coupons.list({ limit: 100 });
    const coupon = coupons.data.find((c) => c.name === "Parrainage 20%");
    if (!coupon) throw new Error("Coupon « Parrainage 20% » introuvable dans Stripe. Vérifie qu'il existe bien sous ce nom exact.");

    // Génère un code unique, avec quelques tentatives en cas de collision.
    let code = "";
    let promo;
    for (let attempt = 0; attempt < 5; attempt++) {
      code = randomCode();
      try {
        promo = await stripe.promotionCodes.create({
          coupon: coupon.id,
          code,
          restrictions: { first_time_transaction: true },
        });
        break;
      } catch {
        continue; // code déjà pris chez Stripe, on retente
      }
    }
    if (!promo) throw new Error("Impossible de générer un code, réessaie.");

    await supabaseAdmin
      .from("profiles")
      .update({ referral_code: code, referral_stripe_promo_id: promo.id })
      .eq("id", user.id);

    return new Response(JSON.stringify({ code }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
