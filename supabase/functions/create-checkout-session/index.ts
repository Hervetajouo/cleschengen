// Supabase Edge Function — crée une session Stripe Checkout pour débloquer
// le contact d'une annonce. Le prix est fixé côté serveur (jamais côté
// client) pour qu'il ne puisse pas être manipulé.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Stripe from "npm:stripe@16.9.0";

const UNLOCK_FEE_CENTS = 299; // 2,99 €

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Non authentifié");

    // Client "utilisateur" : sert uniquement à vérifier qui appelle.
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) throw new Error("Session invalide");

    const { listingId } = await req.json();
    if (!listingId) throw new Error("listingId manquant");

    // Client "service role" : lecture fiable de l'annonce, contourne RLS.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("listings")
      .select("id, city, country")
      .eq("id", listingId)
      .single();
    if (listingErr || !listing) throw new Error("Annonce introuvable");

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: `${user.id}:${listing.id}`,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: UNLOCK_FEE_CENTS,
            product_data: {
              name: `Déblocage contact — ${listing.city}, ${listing.country} (${listing.id})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { user_id: user.id, listing_id: listing.id },
      success_url: `${siteUrl}/?checkout=success&listing=${listing.id}`,
      cancel_url: `${siteUrl}/?checkout=cancel&listing=${listing.id}`,
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
