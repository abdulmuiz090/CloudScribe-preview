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

    const { reference, trxref } = await req.json();
    const paymentRef = reference || trxref;

    if (!paymentRef) {
      throw new Error("Payment reference is required");
    }

    const paystackKey = Deno.env.get("Paystack_test_Key");
    if (!paystackKey) {
      throw new Error("Paystack key not configured");
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${paymentRef}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${paystackKey}`,
        },
      }
    );

    if (!verifyResponse.ok) {
      throw new Error("Failed to verify payment");
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    // Get purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("template_purchases")
      .select(`
        *,
        template:templates(*)
      `)
      .eq("payment_reference", paymentRef)
      .eq("buyer_id", user.id)
      .single();

    if (purchaseError || !purchase) {
      throw new Error("Purchase not found");
    }

    // If already completed, return success
    if (purchase.payment_status === "completed") {
      return new Response(JSON.stringify({
        success: true,
        verified: true,
        purchase_id: purchase.id,
        template: purchase.template,
        can_download: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update purchase status
    const { error: updateError } = await supabase
      .from("template_purchases")
      .update({
        payment_status: "completed",
        purchase_date: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (updateError) {
      throw new Error("Failed to update purchase status");
    }

    // Generate download token
    const { data: downloadToken, error: tokenError } = await supabase
      .rpc("generate_download_token", { purchase_uuid: purchase.id });

    if (tokenError) {
      console.error("Error generating download token:", tokenError);
    }

    // Create notification for buyer
    await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "purchase_success",
        title: "Template Purchase Successful",
        message: `You have successfully purchased "${purchase.template.name}". You can now download it.`,
        metadata: {
          template_id: purchase.template.id,
          purchase_id: purchase.id,
          download_token: downloadToken,
        },
      });

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      purchase_id: purchase.id,
      template: purchase.template,
      can_download: true,
      download_token: downloadToken,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Payment verification failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});