import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const UNSUBSCRIBE_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "default-secret";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Email styles and wrapper for welcome email
const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 10px 0 0 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 25px; }
    .content h2 { color: #10b981; font-size: 20px; margin-top: 0; }
    .content p { margin: 16px 0; color: #4a5568; }
    .action-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .action-box h3 { color: #059669; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; }
    .action-box p { margin: 0; color: #065f46; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; font-size: 14px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
    .unsubscribe { font-size: 12px; color: #9ca3af; margin-top: 15px; }
    .unsubscribe a { color: #9ca3af; text-decoration: underline; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; color: #4a5568; }
  </style>
`;

function getWelcomeEmailHtml(unsubscribeLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SaveTogether</h1>
    </div>
    <div class="content">
      <h2>We're really glad you're here.</h2>
      <p>Saving can feel intimidating, especially if money has mostly been about survival, stress, or "I'll deal with it later." Vault Starter exists because we believe saving shouldn't require perfection, spreadsheets, or guilt.</p>
      <p>Over the next 14 days, we'll walk through this together. Small steps. Realistic actions. No shaming. No "just stop buying coffee" nonsense.</p>
      <p>You might see us mention something called "Today's action." That just means the one small step we're suggesting for the day. There's never more than one, and it's always optional.</p>
      <p>Some days will take five minutes. Some days are rest days. All days are designed to help you feel more in control, not more overwhelmed.</p>
      <p><strong>Tomorrow, we start with the easiest win.</strong></p>
      <p>— SaveTogether</p>
    </div>
    <div class="footer">
      <p>Questions? Just hit reply — we read every message.</p>
      <p><a href="https://savetogether.co">Visit SaveTogether</a></p>
      <p class="unsubscribe">
        <a href="${unsubscribeLink}">Unsubscribe from these emails</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

async function generateUnsubscribeToken(identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier + UNSUBSCRIBE_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

function getUnsubscribeLink(userId: string, token: string): string {
  return `${SUPABASE_URL}/functions/v1/unsubscribe-emails?user_id=${userId}&token=${token}`;
}

async function sendWelcomeEmail(email: string, unsubscribeLink: string): Promise<void> {
  if (!RESEND_API_KEY) {
    logStep("RESEND_API_KEY not configured, skipping welcome email");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "SaveTogether <hello@connect.savetogether.co>",
      reply_to: "SaveTogether <reply@savetogether.co>",
      to: [email],
      subject: "Welcome to the 14-Day Vault Starter Challenge! 🎉",
      html: getWelcomeEmailHtml(unsubscribeLink),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logStep("Failed to send welcome email", { error: errorText });
    throw new Error(`Failed to send welcome email: ${response.status}`);
  }

  logStep("Welcome email sent successfully", { email });
}

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

      // Insert the purchase record with emails_started = true and current_email_day = 1
      // (Welcome email sent, ready for Day 1 tomorrow)
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
          emails_started: true,
          current_email_day: 1, // Welcome sent, ready for Day 1
        })
        .select()
        .single();

      if (insertError) {
        logStep("ERROR: Failed to insert purchase", { error: insertError.message });
        throw new Error(`Failed to record purchase: ${insertError.message}`);
      }

      logStep("Purchase recorded successfully", { purchaseId: purchase.id });

      // Send welcome email immediately
      try {
        const identifier = userId || purchase.id;
        const token = await generateUnsubscribeToken(identifier);
        const unsubscribeLink = getUnsubscribeLink(identifier, token);
        await sendWelcomeEmail(customerEmail, unsubscribeLink);
      } catch (emailError) {
        // Log but don't fail the webhook - purchase is already recorded
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        logStep("Warning: Failed to send welcome email", { error: errorMessage });
      }

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
