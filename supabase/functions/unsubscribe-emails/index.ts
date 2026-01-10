import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const token = url.searchParams.get("token");

    if (!userId || !token) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Link</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Link</h1>
            <p>This unsubscribe link is invalid or has expired.</p>
          </div>
        </body>
        </html>`,
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "text/html" } 
        }
      );
    }

    // Simple token validation: token should be a hash of user_id + secret
    const expectedToken = await generateToken(userId);
    if (token !== expectedToken) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Token</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Invalid Token</h1>
            <p>This unsubscribe link is invalid or has expired.</p>
          </div>
        </body>
        </html>`,
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "text/html" } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Update the user's email preference
    const { error } = await supabase
      .from("profiles")
      .update({ email_unsubscribed: true })
      .eq("id", userId);

    if (error) {
      console.error("Error updating unsubscribe status:", error);
      throw error;
    }

    console.log(`User ${userId} successfully unsubscribed from emails`);

    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 400px; }
          h1 { color: #333; margin-bottom: 16px; }
          p { color: #666; line-height: 1.6; }
          .icon { font-size: 48px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>You've been unsubscribed</h1>
          <p>You won't receive any more reminder emails from Cash Vault.</p>
          <p style="margin-top: 20px; font-size: 14px; color: #999;">You can always log back in to continue your savings journey!</p>
        </div>
      </body>
      </html>`,
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "text/html" } 
      }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Something went wrong</h1>
          <p>We couldn't process your unsubscribe request. Please try again later.</p>
        </div>
      </body>
      </html>`,
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "text/html" } 
      }
    );
  }
});

async function generateToken(userId: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}
