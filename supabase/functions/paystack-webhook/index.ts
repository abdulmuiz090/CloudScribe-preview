
/**
 * Paystack Webhook Handler
 * Purpose: Handle Paystack payment events and update wallet balances
 * Security: Verifies webhook signatures for security
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
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

    // Get the raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    
    if (!signature) {
      console.error('No signature provided')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Verify webhook signature
    const paystackSecret = Deno.env.get('Paystack_test_Key') || ''
    const hash = createHmac('sha512', paystackSecret).update(body).digest('hex')
    
    if (hash !== signature) {
      console.error('Invalid signature')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const event = JSON.parse(body)
    console.log('Paystack webhook event:', event.event, event.data)

    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(supabase, event.data)
        break
      
      case 'transfer.success':
        await handleTransferSuccess(supabase, event.data)
        break
        
      case 'transfer.failed':
        await handleTransferFailed(supabase, event.data)
        break
        
      default:
        console.log('Unhandled event type:', event.event)
    }

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})

async function handleChargeSuccess(supabase: any, data: any) {
  const { reference, amount, metadata } = data
  
  // Handle template purchases
  if (metadata?.template_id) {
    await handleTemplateChargeSuccess(supabase, { reference, amount, metadata })
    return
  }
  
  // Handle product purchases (existing logic)
  if (!metadata?.product_id || !metadata?.seller_id) {
    console.log('No product/seller metadata, skipping')
    return
  }

  const platformFeeRate = 0.10
  const totalAmount = amount / 100 // Convert from kobo to naira
  const platformFee = totalAmount * platformFeeRate
  const sellerAmount = totalAmount - platformFee

  // Create transaction for seller
  const { error: transactionError } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: metadata.seller_id,
      amount: sellerAmount,
      type: 'sale',
      status: 'completed',
      description: `Sale: ${metadata.product_name}`,
      reference: reference,
      metadata: {
        product_id: metadata.product_id,
        platform_fee: platformFee,
        original_amount: totalAmount
      }
    })

  if (transactionError) {
    console.error('Failed to create seller transaction:', transactionError)
  }

  // Create platform fee transaction
  const { error: feeError } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: metadata.seller_id,
      amount: platformFee,
      type: 'fee',
      status: 'completed',
      description: 'Platform fee (10%)',
      reference: reference,
      metadata: {
        product_id: metadata.product_id,
        seller_amount: sellerAmount,
        original_amount: totalAmount
      }
    })

  if (feeError) {
    console.error('Failed to create fee transaction:', feeError)
  }

  console.log(`Processed sale: ₦${sellerAmount} to seller, ₦${platformFee} platform fee`)
}

async function handleTemplateChargeSuccess(supabase: any, { reference, amount, metadata }: any) {
  console.log('Processing template purchase:', reference)

  // Update template purchase status
  const { data: purchase, error: purchaseError } = await supabase
    .from('template_purchases')
    .update({
      payment_status: 'completed',
      purchase_date: new Date().toISOString(),
    })
    .eq('payment_reference', reference)
    .select()
    .single()

  if (purchaseError) {
    console.error('Error updating template purchase:', purchaseError)
    return
  }

  const platformFeeRate = 0.10
  const totalAmount = amount / 100 // Convert from kobo to naira
  const platformFee = totalAmount * platformFeeRate
  const sellerAmount = totalAmount - platformFee

  // Create wallet transactions for template sale
  const transactions = [
    {
      user_id: metadata.seller_id,
      amount: sellerAmount,
      type: 'sale',
      status: 'completed',
      description: `Template sale: ${metadata.template_name}`,
      reference: reference,
      metadata: {
        template_id: metadata.template_id,
        buyer_id: metadata.buyer_id,
        purchase_id: purchase.id,
        gross_amount: totalAmount,
        platform_fee: platformFee,
      },
    },
    {
      user_id: metadata.seller_id,
      amount: platformFee,
      type: 'fee',
      status: 'completed',
      description: `Platform fee for template: ${metadata.template_name}`,
      reference: reference,
      metadata: {
        template_id: metadata.template_id,
        purchase_id: purchase.id,
        fee_percentage: 10,
      },
    },
  ]

  const { error: transactionError } = await supabase
    .from('wallet_transactions')
    .insert(transactions)

  if (transactionError) {
    console.error('Error creating wallet transactions:', transactionError)
  }

  // Get template details for post-purchase questions
  const { data: template } = await supabase
    .from('templates')
    .select('post_purchase_questions')
    .eq('id', metadata.template_id)
    .single()

  // Create feedback record if there are post-purchase questions
  if (template?.post_purchase_questions?.length > 0) {
    const { error: feedbackError } = await supabase
      .from('template_feedback')
      .insert({
        template_id: metadata.template_id,
        purchase_id: purchase.id,
        buyer_id: metadata.buyer_id,
        seller_id: metadata.seller_id,
        questions_and_answers: template.post_purchase_questions.map((q: any) => ({
          question: q.question,
          type: q.type,
          required: q.required,
          answer: null,
        })),
      })

    if (feedbackError) {
      console.error('Error creating feedback record:', feedbackError)
    }
  }

  // Create notification for buyer
  await supabase
    .from('notifications')
    .insert({
      user_id: metadata.buyer_id,
      type: 'purchase_success',
      title: 'Template Purchase Successful',
      message: `You have successfully purchased "${metadata.template_name}". You can now download it.`,
      metadata: {
        template_id: metadata.template_id,
        purchase_id: purchase.id,
      },
    })

  console.log(`Template purchase processed: ₦${sellerAmount} to seller, ₦${platformFee} platform fee`)
}

async function handleTransferSuccess(supabase: any, data: any) {
  const { reference } = data
  
  // Update payout transaction status
  const { error } = await supabase
    .from('wallet_transactions')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('reference', reference)
    .eq('type', 'payout')

  if (error) {
    console.error('Failed to update payout status:', error)
  } else {
    console.log(`Payout completed: ${reference}`)
  }
}

async function handleTransferFailed(supabase: any, data: any) {
  const { reference, recipient } = data
  
  // Update payout transaction status and refund balance
  const { data: transaction, error: fetchError } = await supabase
    .from('wallet_transactions')
    .select('user_id, amount')
    .eq('reference', reference)
    .eq('type', 'payout')
    .single()

  if (fetchError || !transaction) {
    console.error('Failed to fetch transaction:', fetchError)
    return
  }

  // Mark transaction as failed
  const { error: updateError } = await supabase
    .from('wallet_transactions')
    .update({ 
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('reference', reference)

  if (updateError) {
    console.error('Failed to update transaction status:', updateError)
  }

  // Refund the amount back to available balance
  const { error: walletError } = await supabase
    .from('user_wallets')
    .update({
      available_balance: supabase.raw(`available_balance + ${transaction.amount}`),
      pending_balance: supabase.raw(`pending_balance - ${transaction.amount}`),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', transaction.user_id)

  if (walletError) {
    console.error('Failed to refund balance:', walletError)
  }

  console.log(`Payout failed and refunded: ${reference}`)
}
