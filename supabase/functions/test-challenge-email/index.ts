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
    .action-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .action-box h3 { color: #059669; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; }
    .action-box p { margin: 0; color: #065f46; }
    .action-box ul { margin: 10px 0 0 0; padding-left: 20px; color: #065f46; }
    .action-box li { margin: 4px 0; }
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

async function generateUnsubscribeToken(identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier + UNSUBSCRIBE_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

function getDay1EmailHtml(unsubscribeLink: string): string {
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
      <p>We used to think saving had to start with a big lifestyle change. Turns out, momentum matters more than amount.</p>
      <p>Today is about creating a place for your savings to live.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Open SaveTogether and create ONE vault.</p>
        <p style="margin-top: 12px;">Pick a goal that feels emotionally motivating, not "responsible."</p>
        <p style="margin-top: 8px;"><strong>Examples:</strong></p>
        <ul>
          <li>Emergency cushion</li>
          <li>Pay off a card</li>
          <li>Trip fund</li>
          <li>Peace-of-mind buffer</li>
        </ul>
        <p style="margin-top: 12px;">Set the total amount. You'll manually add savings as you go.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Create Your Vault</a>
      <p>If you want, hit reply and tell us what you named it.</p>
      <p>Tomorrow, we'll make this vault feel more real without adding stress.</p>
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
        reply_to: "SaveTogether <reply@connect.savetogether.co>",
        to: [email],
        subject: "Day 1: The easiest win (promise) (TEST)",
        html: getDay1EmailHtml(unsubscribeLink),
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
