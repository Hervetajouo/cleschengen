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

    if (session.mode === "subscription") {
      // Achat d'un abonnement Premium via un Payment Link. On récupère
      // l'utilisateur via client_reference_id (ajouté par le site à l'URL
      // du lien) et on va chercher la date de fin de période auprès de
      // Stripe pour savoir jusqu'à quand l'accès libre est valide.
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription as string | null;
      if (userId && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await supabaseAdmin.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      // Paiement ponctuel de déblocage de contact.
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
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", sub.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
