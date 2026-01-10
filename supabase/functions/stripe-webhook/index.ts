import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("ERROR: No signature provided");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Signature verified", { eventType: event.type });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("ERROR: Signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout.session.completed", { sessionId: session.id });

      // Check if this is a vault_starter purchase via metadata
      const isVaultStarter = session.metadata?.product === "vault_starter";
      
      if (!isVaultStarter) {
        logStep("Not a vault_starter purchase, skipping");
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract purchase data
      const customerEmail = session.customer_details?.email || session.customer_email;
      const userId = session.metadata?.user_id || null;
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id || null;
      const amountTotal = session.amount_total || 1200;
      const currency = session.currency || 'usd';

      logStep("Purchase data extracted", {
        email: customerEmail,
        userId,
        paymentIntentId,
        amount: amountTotal,
        currency,
      });

      if (!customerEmail) {
        logStep("ERROR: No customer email found");
        return new Response(JSON.stringify({ error: "No customer email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Initialize Supabase client with service role key
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Check if this session was already processed
      const { data: existingPurchase } = await supabaseClient
        .from("vault_starter_purchases")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (existingPurchase) {
        logStep("Purchase already recorded, skipping", { purchaseId: existingPurchase.id });
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert the purchase record
      const { data: purchase, error: insertError } = await supabaseClient
        .from("vault_starter_purchases")
        .insert({
          email: customerEmail,
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          amount_paid: amountTotal,
          currency: currency,
          status: "completed",
          emails_started: false,
          current_email_day: 0,
        })
        .select()
        .single();

      if (insertError) {
        logStep("ERROR: Failed to insert purchase", { error: insertError.message });
        throw new Error(`Failed to record purchase: ${insertError.message}`);
      }

      logStep("Purchase recorded successfully", { purchaseId: purchase.id });

      return new Response(JSON.stringify({ received: true, purchaseId: purchase.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Acknowledge other events
    logStep("Event type not handled", { eventType: event.type });
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
