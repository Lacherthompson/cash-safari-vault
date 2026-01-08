import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitedEmail: string;
  vaultId: string;
  vaultName: string;
  inviterEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { invitedEmail, vaultId, vaultName, inviterEmail }: InvitationRequest = await req.json();

    // Validate required fields
    if (!invitedEmail || !vaultId || !vaultName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the invitation link
    const inviteLink = `https://savewith.cash/auth?redirect=/vault/${vaultId}`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SaveTogether <noreply@connect.savetogether.co>",
        to: [invitedEmail],
        subject: `You've been invited to join a savings vault!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">💰 Cash Vault</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
              <h2 style="margin-top: 0; color: #166534;">You're Invited!</h2>
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterEmail}</strong> has invited you to join their savings vault: <strong>"${vaultName}"</strong>
              </p>
              <p style="font-size: 14px; color: #4b5563;">
                Save together by checking off amounts as you save. Track your progress and achieve your goals as a team!
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${inviteLink}" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Join the Vault
              </a>
            </div>
            
            <p style="font-size: 13px; color: #6b7280; text-align: center;">
              If you don't have an account yet, you'll be prompted to create one.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              This invitation was sent from Cash Vault. If you didn't expect this email, you can safely ignore it.
            </p>
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

    console.log("Invitation email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
