import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAYS_BEFORE_REMINDER = 7;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

interface StuckPurchaser {
  id: string;
  email: string;
  user_id: string | null;
}

interface StuckFreeUser {
  id: string;
  email: string;
}

async function generateUnsubscribeToken(userId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

function getUnsubscribeLink(userId: string, token: string): string {
  return `${SUPABASE_URL}/functions/v1/unsubscribe-emails?user_id=${userId}&token=${token}`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "SaveTogether <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - DAYS_BEFORE_REMINDER);
    const cutoffDate = sevenDaysAgo.toISOString();

    console.log(`Checking for stuck users since ${cutoffDate}`);

    // 1. Find Vault Starter purchasers who haven't created a vault
    const { data: stuckPurchasers, error: purchasersError } = await supabase
      .from("vault_starter_purchases")
      .select("id, email, user_id")
      .eq("status", "completed")
      .is("stuck_reminder_sent_at", null)
      .lt("purchased_at", cutoffDate);

    if (purchasersError) {
      console.error("Error fetching stuck purchasers:", purchasersError);
      throw purchasersError;
    }

    // Filter to those who haven't created a vault and haven't unsubscribed
    const purchasersToEmail: StuckPurchaser[] = [];
    for (const purchaser of stuckPurchasers || []) {
      if (purchaser.user_id) {
        // Check if unsubscribed
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_unsubscribed")
          .eq("id", purchaser.user_id)
          .single();

        if (profile?.email_unsubscribed) {
          console.log(`Skipping purchaser ${purchaser.email} - unsubscribed`);
          continue;
        }

        const { count } = await supabase
          .from("vaults")
          .select("id", { count: "exact", head: true })
          .eq("created_by", purchaser.user_id);

        if (count === 0) {
          purchasersToEmail.push(purchaser);
        }
      } else {
        // No user_id means they haven't even signed up yet
        purchasersToEmail.push(purchaser);
      }
    }

    console.log(`Found ${purchasersToEmail.length} stuck Vault Starter purchasers`);

    // 2. Find free users (profiles) who haven't created a vault and haven't unsubscribed
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, created_at, stuck_reminder_sent_at, email_unsubscribed")
      .is("stuck_reminder_sent_at", null)
      .eq("email_unsubscribed", false)
      .lt("created_at", cutoffDate);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const freeUsersToEmail: StuckFreeUser[] = [];
    for (const profile of profiles || []) {
      // Check if they have any vaults
      const { count: vaultCount } = await supabase
        .from("vaults")
        .select("id", { count: "exact", head: true })
        .eq("created_by", profile.id);

      // Check if they're already a Vault Starter purchaser (don't double-email)
      const { count: purchaseCount } = await supabase
        .from("vault_starter_purchases")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id);

      if (vaultCount === 0 && purchaseCount === 0) {
        // Get email from auth.users
        const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
        if (userData?.user?.email) {
          freeUsersToEmail.push({ id: profile.id, email: userData.user.email });
        }
      }
    }

    console.log(`Found ${freeUsersToEmail.length} stuck free users`);

    const results = {
      purchasersEmailed: 0,
      freeUsersEmailed: 0,
      errors: [] as string[],
    };

    // Send emails to stuck purchasers
    for (const purchaser of purchasersToEmail) {
      try {
        const userId = purchaser.user_id || purchaser.id;
        const unsubscribeToken = await generateUnsubscribeToken(userId);
        const unsubscribeLink = getUnsubscribeLink(userId, unsubscribeToken);

        await sendEmail(
          purchaser.email,
          "Your Savings Challenge is waiting for you! 🎯",
          `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Ready to Start Your Savings Journey?</h1>
              <p>Hi there!</p>
              <p>We noticed you purchased the <strong>14-Day Vault Starter Challenge</strong> but haven't created your first vault yet.</p>
              <p>No worries - getting started is easy! Just:</p>
              <ol>
                <li>Log in to your SaveTogether account</li>
                <li>Click "Create Your First Vault"</li>
                <li>Start checking off amounts as you save</li>
              </ol>
              <p>Your daily guidance emails are ready to help you build lasting savings habits. Don't let this opportunity slip away!</p>
              <p><a href="https://savetogether.co/" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Create Your Vault Now →</a></p>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">Questions? Just reply to this email - we're here to help!</p>
              <p>Happy saving,<br>The SaveTogether Team</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                Don't want to receive these emails? <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          `
        );

        await supabase
          .from("vault_starter_purchases")
          .update({ stuck_reminder_sent_at: new Date().toISOString() })
          .eq("id", purchaser.id);

        results.purchasersEmailed++;
      } catch (error: any) {
        console.error(`Error emailing purchaser ${purchaser.email}:`, error);
        results.errors.push(`Purchaser ${purchaser.email}: ${error.message}`);
      }
    }

    // Send emails to stuck free users
    for (const user of freeUsersToEmail) {
      try {
        const unsubscribeToken = await generateUnsubscribeToken(user.id);
        const unsubscribeLink = getUnsubscribeLink(user.id, unsubscribeToken);

        await sendEmail(
          user.email,
          "Your first vault is just a click away! 💰",
          `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Let's Get You Started!</h1>
              <p>Hi there!</p>
              <p>We noticed you signed up for SaveTogether but haven't created your first vault yet.</p>
              <p>Creating a vault is the first step to building better savings habits. It only takes a minute:</p>
              <ol>
                <li>Choose a savings goal (like $100, $500, or $1,000)</li>
                <li>Pick a fun color theme</li>
                <li>Start checking off amounts as you save</li>
              </ol>
              <p><a href="https://savetogether.co/" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Create Your First Vault →</a></p>
              <p style="margin-top: 24px;"><strong>Want more guidance?</strong> Our <a href="https://savetogether.co/vault-starter" style="color: #10b981;">14-Day Vault Starter Challenge</a> includes daily emails to keep you motivated and on track!</p>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">Questions? Just reply to this email!</p>
              <p>Happy saving,<br>The SaveTogether Team</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                Don't want to receive these emails? <a href="${unsubscribeLink}" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          `
        );

        await supabase
          .from("profiles")
          .update({ stuck_reminder_sent_at: new Date().toISOString() })
          .eq("id", user.id);

        results.freeUsersEmailed++;
      } catch (error: any) {
        console.error(`Error emailing free user ${user.email}:`, error);
        results.errors.push(`Free user ${user.email}: ${error.message}`);
      }
    }

    console.log("Reminder results:", results);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-stuck-user-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
