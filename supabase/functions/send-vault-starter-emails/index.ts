import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { challengeEmails } from "./emails.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const UNSUBSCRIBE_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "default-secret";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VAULT-STARTER-EMAILS] ${step}${detailsStr}`);
};

interface VaultStarterPurchase {
  id: string;
  email: string;
  user_id: string | null;
  emails_started: boolean;
  current_email_day: number;
  purchased_at: string;
  email_unsubscribed: boolean;
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

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
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
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
  }

  logStep("Email sent successfully", { to, subject });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting daily vault starter email job");

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Get all active purchases that haven't completed the email series
    const { data: purchases, error: fetchError } = await supabaseClient
      .from("vault_starter_purchases")
      .select("*")
      .eq("status", "completed")
      .eq("email_unsubscribed", false)
      .lt("current_email_day", 15);

    if (fetchError) {
      throw new Error(`Failed to fetch purchases: ${fetchError.message}`);
    }

    if (!purchases || purchases.length === 0) {
      logStep("No eligible purchases found");
      return new Response(JSON.stringify({ sent: 0, message: "No eligible recipients" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep(`Found ${purchases.length} potential recipients`);

    const now = new Date();
    let sentCount = 0;
    const errors: string[] = [];

    for (const purchase of purchases as VaultStarterPurchase[]) {
      try {
        // Check if user has unsubscribed via profiles table (if they have a user_id)
        if (purchase.user_id) {
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("email_unsubscribed")
            .eq("id", purchase.user_id)
            .maybeSingle();

          if (profile?.email_unsubscribed) {
            logStep("User unsubscribed via profile, skipping", { email: purchase.email });
            continue;
          }
        }

        // Calculate days since purchase
        const purchasedAt = new Date(purchase.purchased_at);
        const daysSincePurchase = Math.floor((now.getTime() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24));

        // Determine which email to send
        // current_email_day tracks how many emails have been sent (0 = none, 1 = welcome sent, etc.)
        // Day 0 (welcome) is sent by webhook, so cron starts at day 1
        const nextEmailDay = purchase.current_email_day;

        // Skip if we've already sent all emails or if it's too early
        if (nextEmailDay >= 15) {
          logStep("All emails sent, skipping", { email: purchase.email });
          continue;
        }

        // For Day 1+, check if enough time has passed
        // Day 1 should be sent 1 day after purchase, Day 2 after 2 days, etc.
        if (daysSincePurchase < nextEmailDay) {
          logStep("Too early for next email", { 
            email: purchase.email, 
            daysSincePurchase, 
            nextEmailDay 
          });
          continue;
        }

        // Find the email content
        const emailContent = challengeEmails.find(e => e.day === nextEmailDay);
        if (!emailContent) {
          logStep("No email content found for day", { day: nextEmailDay });
          continue;
        }

        // Generate unsubscribe link
        const identifier = purchase.user_id || purchase.id;
        const token = await generateUnsubscribeToken(identifier);
        const unsubscribeLink = getUnsubscribeLink(identifier, token);

        // Send the email
        await sendEmail(
          purchase.email,
          emailContent.subject,
          emailContent.getHtml(unsubscribeLink)
        );

        // Update the purchase record
        const { error: updateError } = await supabaseClient
          .from("vault_starter_purchases")
          .update({
            current_email_day: nextEmailDay + 1,
            emails_started: true,
          })
          .eq("id", purchase.id);

        if (updateError) {
          logStep("Failed to update purchase record", { error: updateError.message });
        }

        sentCount++;
        logStep(`Sent Day ${nextEmailDay} email`, { email: purchase.email });

      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        logStep("Error processing purchase", { email: purchase.email, error: errorMessage });
        errors.push(`${purchase.email}: ${errorMessage}`);
      }
    }

    logStep("Job complete", { sent: sentCount, errors: errors.length });

    return new Response(JSON.stringify({ 
      sent: sentCount, 
      errors: errors.length > 0 ? errors : undefined 
    }), {
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
