import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { testEmail } = await req.json();

    if (!testEmail) {
      return new Response(
        JSON.stringify({ error: "testEmail is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Test data
    const vaultName = "Family Vacation Fund";
    const inviterEmail = "john.smith@example.com";
    const inviterDisplayName = "John";
    const goalAmount = 5000;
    const vaultId = "test-vault-id";
    const redirectTarget = `/vault/${vaultId}?invited=${encodeURIComponent(testEmail)}`;
    const inviteLink = `https://savetogether.co/auth?redirect=${encodeURIComponent(redirectTarget)}`;

    // Fetch real social proof stats
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const [profilesResult, vaultsResult, amountsResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('vaults').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('vault_amounts').select('amount').eq('is_checked', true),
    ]);

    const userCount = profilesResult.count ?? 0;
    const vaultCount = vaultsResult.count ?? 0;
    const totalSaved = amountsResult.data?.reduce((sum, row) => sum + row.amount, 0) ?? 0;

    const formattedTotalSaved = totalSaved >= 1000 
      ? `$${(totalSaved / 1000).toFixed(0)}k+` 
      : `$${totalSaved.toLocaleString()}`;

    console.log(`Sending test invitation email to ${testEmail}`);
    console.log(`Social proof: ${userCount} users, ${vaultCount} vaults, ${formattedTotalSaved} saved`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SaveTogether <noreply@connect.savetogether.co>",
        to: [testEmail],
        subject: `${inviterDisplayName} wants to save money with you 💰`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #10b981; margin: 0; font-size: 28px;">💰 SaveTogether</h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">The savings method that actually works</p>
            </div>
            
            <!-- Main Card -->
            <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              
              <!-- Personal Invitation -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 28px;">🤝</span>
                </div>
                <h2 style="margin: 0 0 8px; color: #111827; font-size: 22px;">You're Invited to Save Together!</h2>
                <p style="font-size: 16px; color: #4b5563; margin: 0;">
                  <strong style="color: #10b981;">${inviterDisplayName}</strong> thinks you'd be a great savings partner
                </p>
              </div>
              
              <!-- Vault Details -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">You're invited to join</p>
                <p style="font-size: 20px; font-weight: 700; color: #166534; margin: 0 0 12px;">"${vaultName}"</p>
                <div style="background: white; border-radius: 8px; padding: 12px 20px; display: inline-block;">
                  <p style="font-size: 12px; color: #6b7280; margin: 0 0 2px;">Savings Goal</p>
                  <p style="font-size: 24px; font-weight: 700; color: #10b981; margin: 0;">$${goalAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <!-- Benefits -->
              <div style="margin-bottom: 28px;">
                <p style="font-size: 15px; color: #374151; margin-bottom: 16px; text-align: center;">
                  SaveTogether makes saving money feel like a game. Here's how it works:
                </p>
                <div style="display: block;">
                  <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #10b981; font-weight: bold;">✓</span>
                    <span style="color: #374151; margin-left: 8px;">Check off amounts as you save them to your real account</span>
                  </div>
                  <div style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #10b981; font-weight: bold;">✓</span>
                    <span style="color: #374151; margin-left: 8px;">Watch your progress grow with satisfying visual feedback</span>
                  </div>
                  <div style="padding: 8px 0;">
                    <span style="color: #10b981; font-weight: bold;">✓</span>
                    <span style="color: #374151; margin-left: 8px;">Save together with ${inviterDisplayName} and stay accountable</span>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);">
                  Accept Invitation →
                </a>
              </div>
              
              <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
                Takes less than 30 seconds to join. Free forever.
              </p>
            </div>
            
            <!-- Social Proof -->
            ${userCount > 10 ? `
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="font-size: 13px; color: #6b7280; margin: 0 0 12px;">Join a growing community of savers</p>
              <div style="display: inline-block;">
                <span style="display: inline-block; padding: 0 16px; border-right: 1px solid #e5e7eb;">
                  <span style="display: block; font-size: 20px; font-weight: 700; color: #10b981;">${userCount.toLocaleString()}</span>
                  <span style="font-size: 11px; color: #9ca3af;">Savers</span>
                </span>
                <span style="display: inline-block; padding: 0 16px; border-right: 1px solid #e5e7eb;">
                  <span style="display: block; font-size: 20px; font-weight: 700; color: #10b981;">${vaultCount.toLocaleString()}</span>
                  <span style="font-size: 11px; color: #9ca3af;">Vaults</span>
                </span>
                <span style="display: inline-block; padding: 0 16px;">
                  <span style="display: block; font-size: 20px; font-weight: 700; color: #10b981;">${formattedTotalSaved}</span>
                  <span style="font-size: 11px; color: #9ca3af;">Saved</span>
                </span>
              </div>
            </div>
            ` : ''}
            
            <!-- Footer -->
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
                ${inviterDisplayName} (${inviterEmail}) invited you via SaveTogether
              </p>
              <p style="font-size: 11px; color: #d1d5db;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="font-size: 10px; color: #e5e7eb; margin-top: 16px;">
                ⚠️ This is a TEST email sent from the development environment
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Test invitation email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending test invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
