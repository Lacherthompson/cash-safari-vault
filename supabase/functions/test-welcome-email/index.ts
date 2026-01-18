import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const UNSUBSCRIBE_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "default-secret";

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 10px 0 0 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 25px; }
    .content h2 { color: #10b981; font-size: 20px; margin-top: 0; }
    .content p { margin: 16px 0; color: #4a5568; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; font-size: 14px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
    .unsubscribe { font-size: 12px; color: #9ca3af; margin-top: 15px; }
    .unsubscribe a { color: #9ca3af; text-decoration: underline; }
  </style>
`;

async function generateUnsubscribeToken(identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier + UNSUBSCRIBE_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

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
      <p><strong>Tomorrow, we take your first step.</strong></p>
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, user_id } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const identifier = user_id || email;
    const token = await generateUnsubscribeToken(identifier);
    const unsubscribeLink = `${SUPABASE_URL}/functions/v1/unsubscribe-emails?user_id=${identifier}&token=${token}`;

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
        subject: "Welcome to Vault Starter. Let's do this together. (TEST)",
        html: getWelcomeEmailHtml(unsubscribeLink),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
