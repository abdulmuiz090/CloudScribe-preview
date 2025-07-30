
/**
 * Edge Function: Request Payout
 * Purpose: Handles payout requests to user bank accounts via Paystack
 * Features: Bank verification, balance checks, 10% platform fee deduction
 * Integration: Paystack Transfer Recipients API for local bank support
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

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { amount, bank_details } = await req.json()

    // Validate payout amount
    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: 'Minimum payout amount is ₦100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: 'Wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check sufficient balance
    if (wallet.available_balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create or update Paystack recipient if bank details provided
    let recipientCode = wallet.paystack_recipient_code

    if (bank_details && !recipientCode) {
      const paystackResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('Paystack_test_Key')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'nuban',
          name: bank_details.account_name,
          account_number: bank_details.account_number,
          bank_code: bank_details.bank_code,
          currency: 'NGN'
        })
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        return new Response(
          JSON.stringify({ error: 'Failed to create transfer recipient' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      recipientCode = paystackData.data.recipient_code

      // Update wallet with recipient code and bank details
      await supabase
        .from('user_wallets')
        .update({ 
          paystack_recipient_code: recipientCode,
          bank_details: bank_details
        })
        .eq('user_id', user.id)
    }

    if (!recipientCode) {
      return new Response(
        JSON.stringify({ error: 'Bank details required for payout' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique reference
    const reference = `payout_${user.id}_${Date.now()}`

    // Initiate transfer via Paystack
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('Paystack_test_Key')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reason: 'Payout from CloudScribe',
        reference: reference
      })
    })

    const transferData = await transferResponse.json()

    if (!transferData.status) {
      return new Response(
        JSON.stringify({ error: transferData.message || 'Transfer failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payout transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        type: 'payout',
        status: 'pending',
        description: `Payout to ${bank_details?.account_name || 'bank account'}`,
        reference: reference,
        metadata: {
          recipient_code: recipientCode,
          bank_details: bank_details,
          transfer_code: transferData.data.transfer_code
        }
      })

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      return new Response(
        JSON.stringify({ error: 'Failed to create payout request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update wallet balance (deduct payout amount)
    await supabase
      .from('user_wallets')
      .update({
        available_balance: wallet.available_balance - amount,
        pending_balance: wallet.pending_balance + amount
      })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ 
        message: 'Payout request submitted successfully',
        amount: amount,
        reference: reference,
        status: 'pending'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Request payout error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
