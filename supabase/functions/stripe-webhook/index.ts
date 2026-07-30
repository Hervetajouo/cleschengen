// Supabase Edge Function — reçoit les événements Stripe. Quand un paiement
// de déblocage est confirmé, écrit la ligne dans "unlocks" avec la clé
// service role (le client n'a jamais le droit d'écrire directement dans
// cette table — voir schema.sql).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Stripe from "npm:stripe@16.9.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Signature invalide: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const listingId = session.metadata?.listing_id;

    if (userId && listingId) {
      const { error } = await supabaseAdmin.from("unlocks").upsert({
        user_id: userId,
        listing_id: listingId,
        stripe_session_id: session.id,
      });
      if (error) {
        console.error("Échec écriture unlock:", error.message);
        return new Response("db error", { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
