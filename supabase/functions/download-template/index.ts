import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    const { purchase_id, download_token } = await req.json();

    if (!purchase_id) {
      throw new Error("Purchase ID is required");
    }

    // Verify purchase ownership
    const { data: purchase, error: purchaseError } = await supabase
      .from("template_purchases")
      .select(`
        *,
        template:templates(*)
      `)
      .eq("id", purchase_id)
      .eq("buyer_id", user.id)
      .eq("payment_status", "completed")
      .single();

    if (purchaseError || !purchase) {
      throw new Error("Purchase not found or not completed");
    }

    // Check download limits
    const maxDownloads = purchase.max_downloads || 5;
    const currentDownloads = purchase.download_count || 0;

    if (currentDownloads >= maxDownloads) {
      throw new Error("Download limit exceeded");
    }

    // If download token provided, verify it
    if (download_token) {
      const { data: tokenData, error: tokenError } = await supabase
        .from("template_download_tokens")
        .select("*")
        .eq("token", download_token)
        .eq("purchase_id", purchase_id)
        .eq("used", false)
        .single();

      if (tokenError || !tokenData) {
        throw new Error("Invalid or expired download token");
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error("Download token has expired");
      }

      // Mark token as used
      await supabase
        .from("template_download_tokens")
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", tokenData.id);
    }

    // Generate secure download URL
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from("Template Files")
      .createSignedUrl(
        purchase.template.file_url.replace(
          `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/Template Files/`,
          ""
        ),
        60 * 60 * 2 // 2 hours
      );

    if (downloadError) {
      throw new Error("Failed to generate download URL");
    }

    // Update download count
    await supabase
      .from("template_purchases")
      .update({
        download_count: currentDownloads + 1,
        last_download_date: new Date().toISOString(),
      })
      .eq("id", purchase_id);

    // Log download activity
    await supabase
      .from("user_activity_logs")
      .insert({
        user_id: user.id,
        action: "template_download",
        details: {
          template_id: purchase.template.id,
          template_name: purchase.template.name,
          purchase_id: purchase_id,
          download_count: currentDownloads + 1,
          remaining_downloads: maxDownloads - currentDownloads - 1,
        },
      });

    return new Response(JSON.stringify({
      success: true,
      download_url: downloadData.signedUrl,
      template_name: purchase.template.name,
      download_count: currentDownloads + 1,
      remaining_downloads: maxDownloads - currentDownloads - 1,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate download" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});