// Crée une session Stripe Checkout pour mettre en avant une annonce
// pendant 7 jours. Le prix et la durée sont fixés côté serveur.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Stripe from "npm:stripe@16.9.0";

const BOOST_FEE_CENTS = 299; // 2,99 €
const BOOST_DAYS = 7;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

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

    const { listingId } = await req.json();
    if (!listingId) throw new Error("listingId manquant");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("listings")
      .select("id, owner_id, city, country")
      .eq("id", listingId)
      .single();
    if (listingErr || !listing) throw new Error("Annonce introuvable");
    if (listing.owner_id !== user.id) throw new Error("Non autorisé");

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "paypal", "bancontact", "ideal", "klarna", "amazon_pay", "link", "mb_way", "mobilepay", "revolut_pay", "satispay", "multibanco", "blik", "twint", "eps"],
      client_reference_id: `boost:${listing.id}`,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: BOOST_FEE_CENTS,
            product_data: {
              name: `Mise en avant 7 jours — ${listing.city}, ${listing.country} (${listing.id})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { boost_listing_id: listing.id, boost_days: String(BOOST_DAYS) },
      success_url: `${siteUrl}/?boost=success&listing=${listing.id}`,
      cancel_url: `${siteUrl}/?boost=cancel&listing=${listing.id}`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
