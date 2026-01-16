import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MILESTONES = [25, 50, 75, 100];
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const UNSUBSCRIBE_SECRET = "milestone-unsubscribe-v1";

interface VaultProgress {
  vault_id: string;
  vault_name: string;
  goal_amount: number;
  user_id: string;
  saved_amount: number;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(JSON.stringify({ step, details, timestamp: new Date().toISOString() }));
};

async function generateUnsubscribeToken(userId: string): Promise<string> {
  const data = new TextEncoder().encode(userId + UNSUBSCRIBE_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function getUnsubscribeLink(userId: string, token: string): string {
  return `${SUPABASE_URL}/functions/v1/unsubscribe-emails?user_id=${userId}&token=${token}&type=milestone`;
}

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 25px; text-align: center; }
    .milestone-badge { font-size: 64px; margin: 20px 0; }
    .milestone-percent { font-size: 48px; font-weight: 700; color: #10b981; margin: 10px 0; }
    .vault-name { font-size: 20px; color: #374151; margin: 10px 0; }
    .message { font-size: 16px; color: #4b5563; margin: 20px 0; line-height: 1.7; }
    .progress-visual { background: #e5e7eb; border-radius: 999px; height: 24px; margin: 24px 0; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #10b981, #059669); height: 100%; border-radius: 999px; transition: width 0.5s; }
    .stats-box { background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .stats-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .stats-label { color: #6b7280; }
    .stats-value { color: #059669; font-weight: 600; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; font-size: 14px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
    .unsubscribe { font-size: 12px; color: #9ca3af; margin-top: 15px; }
    .unsubscribe a { color: #9ca3af; text-decoration: underline; }
  </style>
`;

function getMilestoneEmoji(milestone: number): string {
  switch (milestone) {
    case 25: return "🌱";
    case 50: return "🔥";
    case 75: return "⚡";
    case 100: return "🏆";
    default: return "🎉";
  }
}

function getMilestoneMessage(milestone: number, vaultName: string): { subject: string; heading: string; body: string } {
  switch (milestone) {
    case 25:
      return {
        subject: `🌱 25% saved in "${vaultName}" — You're building momentum!`,
        heading: "Quarter of the way there!",
        body: "You've taken the hardest step — starting. A quarter of your goal is now saved, and that momentum is powerful. Keep going, one amount at a time."
      };
    case 50:
      return {
        subject: `🔥 Halfway there! 50% saved in "${vaultName}"`,
        heading: "You're halfway to your goal!",
        body: "This is huge. Half of your goal is complete. Most people never make it this far. You're proving to yourself that you can do this."
      };
    case 75:
      return {
        subject: `⚡ 75% complete! "${vaultName}" is almost full`,
        heading: "Three-quarters of the way!",
        body: "You're in the home stretch now. 75% saved means you've built real discipline and real savings. The finish line is in sight!"
      };
    case 100:
      return {
        subject: `🏆 GOAL COMPLETE! You did it with "${vaultName}"!`,
        heading: "You reached your goal!",
        body: "Incredible. You set a goal, you committed, and you achieved it. This is what financial confidence looks like. Celebrate this moment — you've earned it!"
      };
    default:
      return {
        subject: `🎉 Milestone reached in "${vaultName}"!`,
        heading: "Congratulations!",
        body: "You've hit a savings milestone. Keep up the great work!"
      };
  }
}

function buildMilestoneEmail(
  milestone: number,
  vaultName: string,
  savedAmount: number,
  goalAmount: number,
  unsubscribeLink: string
): { subject: string; html: string } {
  const { subject, heading, body } = getMilestoneMessage(milestone, vaultName);
  const emoji = getMilestoneEmoji(milestone);
  const remaining = goalAmount - savedAmount;
  
  const html = `
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
      <div class="milestone-badge">${emoji}</div>
      <div class="milestone-percent">${milestone}%</div>
      <h2 style="color: #111827; margin: 16px 0;">${heading}</h2>
      <p class="vault-name">${vaultName}</p>
      
      <div class="progress-visual">
        <div class="progress-fill" style="width: ${milestone}%;"></div>
      </div>
      
      <p class="message">${body}</p>
      
      <div class="stats-box">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Saved so far</td>
            <td style="color: #059669; font-weight: 600; text-align: right;">$${savedAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Goal</td>
            <td style="color: #059669; font-weight: 600; text-align: right;">$${goalAmount.toLocaleString()}</td>
          </tr>
          ${milestone < 100 ? `
          <tr>
            <td style="color: #6b7280; padding: 4px 0;">Remaining</td>
            <td style="color: #059669; font-weight: 600; text-align: right;">$${remaining.toLocaleString()}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <a href="https://cash-safari-vault.lovable.app/dashboard" class="cta-button">
        ${milestone === 100 ? 'Start Your Next Vault' : 'Continue Saving'}
      </a>
    </div>
    <div class="footer">
      <p>Keep up the amazing work!</p>
      <p><a href="https://cash-safari-vault.lovable.app">Visit SaveTogether</a></p>
      <p class="unsubscribe">
        <a href="${unsubscribeLink}">Unsubscribe from milestone emails</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html };
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SaveTogether <hello@savetogether.co>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to send email: ${errorData}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting milestone email job");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all vaults with their progress
    const { data: vaults, error: vaultsError } = await supabase
      .from("vaults")
      .select("id, name, goal_amount, created_by");

    if (vaultsError) {
      throw new Error(`Error fetching vaults: ${vaultsError.message}`);
    }

    logStep("Fetched vaults", { count: vaults?.length || 0 });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const vault of vaults || []) {
      try {
        // Calculate saved amount for this vault (sum of all checked amounts)
        const { data: amounts, error: amountsError } = await supabase
          .from("vault_amounts")
          .select("amount, is_checked")
          .eq("vault_id", vault.id);

        if (amountsError) {
          errors.push(`Error fetching amounts for vault ${vault.id}: ${amountsError.message}`);
          continue;
        }

        const savedAmount = (amounts || [])
          .filter(a => a.is_checked)
          .reduce((sum, a) => sum + a.amount, 0);

        const progressPercent = (savedAmount / vault.goal_amount) * 100;

        // Find which milestones have been reached
        const reachedMilestones = MILESTONES.filter(m => progressPercent >= m);

        if (reachedMilestones.length === 0) continue;

        // Check which milestone emails have already been sent
        const { data: sentEmails, error: sentError } = await supabase
          .from("vault_milestone_emails")
          .select("milestone")
          .eq("vault_id", vault.id)
          .eq("user_id", vault.created_by);

        if (sentError) {
          errors.push(`Error checking sent emails for vault ${vault.id}: ${sentError.message}`);
          continue;
        }

        const sentMilestones = new Set((sentEmails || []).map(e => e.milestone));
        const newMilestones = reachedMilestones.filter(m => !sentMilestones.has(m));

        if (newMilestones.length === 0) continue;

        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(vault.created_by);

        if (userError || !userData?.user?.email) {
          errors.push(`Error getting user email for ${vault.created_by}: ${userError?.message || "No email"}`);
          continue;
        }

        // Check if user has unsubscribed
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_unsubscribed")
          .eq("id", vault.created_by)
          .single();

        if (profile?.email_unsubscribed) {
          logStep("Skipping unsubscribed user", { userId: vault.created_by });
          continue;
        }

        // Send email for the highest new milestone only (avoid spam)
        const highestMilestone = Math.max(...newMilestones);
        const unsubscribeToken = await generateUnsubscribeToken(vault.created_by);
        const unsubscribeLink = getUnsubscribeLink(vault.created_by, unsubscribeToken);

        const { subject, html } = buildMilestoneEmail(
          highestMilestone,
          vault.name,
          savedAmount,
          vault.goal_amount,
          unsubscribeLink
        );

        await sendEmail(userData.user.email, subject, html);

        // Record all reached milestones as sent (to avoid sending lower ones later)
        for (const milestone of newMilestones) {
          await supabase.from("vault_milestone_emails").insert({
            vault_id: vault.id,
            user_id: vault.created_by,
            milestone,
          });
        }

        emailsSent++;
        logStep("Sent milestone email", {
          vaultId: vault.id,
          milestone: highestMilestone,
          email: userData.user.email,
        });

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`Error processing vault ${vault.id}: ${message}`);
      }
    }

    logStep("Milestone email job complete", { emailsSent, errors: errors.length });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        errors: errors.length > 0 ? errors : undefined 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Fatal error", { error: message });
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
