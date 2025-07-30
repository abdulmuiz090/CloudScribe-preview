
/**
 * Edge Function: Verify Bank Account
 * Purpose: Verifies Nigerian bank account details using Paystack API
 * Security: Server-side verification to protect API keys
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { account_number, bank_code } = await req.json()

    // Validate input
    if (!account_number || !bank_code) {
      return new Response(
        JSON.stringify({ error: 'Account number and bank code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Paystack secret key from environment
    const paystackSecretKey = Deno.env.get('Paystack_test_Key')
    if (!paystackSecretKey) {
      console.error('Paystack_test_Key not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Paystack API to resolve account
    const paystackResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error('Paystack verification failed:', paystackData)
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Bank account verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return verified account details
    return new Response(
      JSON.stringify({ 
        account_name: paystackData.data.account_name,
        account_number: paystackData.data.account_number,
        bank_code: bank_code
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Bank verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Bank verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
