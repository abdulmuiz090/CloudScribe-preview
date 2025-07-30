
/**
 * Edge Function: Create Checkout
 * Purpose: Handles product purchases with 10% platform fee calculation
 * Features: Paystack payment integration, automatic fee distribution
 * Platform Fee: 10% deducted from seller earnings on successful sales
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { product_id, quantity = 1 } = await req.json()

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, seller:user_profiles!seller_id(full_name, email)')
      .eq('id', product_id)
      .eq('published', true)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found or not available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate total amount and platform fee
    const subtotal = product.price * quantity
    const platformFeeRate = 0.10 // 10% platform fee
    const platformFee = subtotal * platformFeeRate
    const sellerAmount = subtotal - platformFee
    
    // Create Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('Paystack_test_Key')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: req.headers.get('user-email') || 'customer@example.com',
        amount: subtotal * 100, // Paystack expects amount in kobo
        currency: 'NGN',
        reference: `CS_${Date.now()}_${product_id}`,
        metadata: {
          product_id: product_id,
          product_name: product.name,
          quantity: quantity,
          seller_id: product.seller_id,
          platform_fee: platformFee,
          seller_amount: sellerAmount
        },
        callback_url: `${req.headers.get('origin')}/checkout/success`,
        cancel_url: `${req.headers.get('origin')}/checkout/cancel`
      })
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize payment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        checkout_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        amount: subtotal,
        platform_fee: platformFee,
        seller_amount: sellerAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create checkout error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
