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

    const { template_id, return_url, cancel_url } = await req.json();

    if (!template_id) {
      throw new Error("Template ID is required");
    }

    // Get template details
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select("*")
      .eq("id", template_id)
      .eq("published", true)
      .single();

    if (templateError || !template) {
      throw new Error("Template not found or not published");
    }

    // Check if it's a free template
    if (template.is_free) {
      // For free templates, create a purchase record directly
      const { data: purchase, error: purchaseError } = await supabase
        .from("template_purchases")
        .insert({
          template_id,
          buyer_id: user.id,
          seller_id: template.author_id,
          purchase_price: 0,
          currency: "NGN",
          payment_status: "completed",
          payment_reference: `free_${Date.now()}`,
        })
        .select()
        .single();

      if (purchaseError) {
        throw new Error("Failed to create purchase record");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        purchase_id: purchase.id,
        is_free: true,
        download_url: `${return_url}?purchase_id=${purchase.id}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For paid templates, create Paystack payment
    const paystackKey = Deno.env.get("Paystack_test_Key");
    if (!paystackKey) {
      throw new Error("Paystack key not configured");
    }

    // Calculate final price (including discount)
    const currentPrice = template.discount_price && 
      template.discount_end_date && 
      new Date(template.discount_end_date) > new Date() 
        ? template.discount_price 
        : template.price;

    const amount = Math.round(currentPrice * 100); // Convert to kobo

    // Create purchase record first
    const { data: purchase, error: purchaseError } = await supabase
      .from("template_purchases")
      .insert({
        template_id,
        buyer_id: user.id,
        seller_id: template.author_id,
        purchase_price: currentPrice,
        currency: "NGN",
        payment_status: "pending",
      })
      .select()
      .single();

    if (purchaseError) {
      throw new Error("Failed to create purchase record");
    }

    // Get user profile for payment
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: profile?.email || user.email,
        amount: amount,
        currency: "NGN",
        reference: `template_${purchase.id}_${Date.now()}`,
        callback_url: return_url,
        cancel_url: cancel_url,
        metadata: {
          template_id,
          template_name: template.name,
          buyer_id: user.id,
          seller_id: template.author_id,
          purchase_id: purchase.id,
          buyer_name: profile?.full_name || "Unknown"
        },
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
      }),
    });

    if (!paystackResponse.ok) {
      throw new Error("Failed to initialize payment");
    }

    const paystackData = await paystackResponse.json();

    // Update purchase record with payment reference
    await supabase
      .from("template_purchases")
      .update({
        payment_reference: paystackData.data.reference,
      })
      .eq("id", purchase.id);

    return new Response(JSON.stringify({
      success: true,
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      purchase_id: purchase.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Purchase creation error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create purchase" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});