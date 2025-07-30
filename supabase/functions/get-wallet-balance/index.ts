
/**
 * Edge Function: Get Wallet Balance
 * Purpose: Retrieves the current wallet balance for authenticated users
 * Security: Uses Row Level Security to ensure users can only access their own wallet data
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for cross-origin requests
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
    // Initialize Supabase client with anon key and pass through auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! } 
        } 
      }
    )

    // Get authenticated user from JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching wallet for user:', user.id)

    // Fetch wallet data using RLS - user can only see their own wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (walletError) {
      console.error('Wallet fetch error:', walletError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch wallet data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If wallet doesn't exist, create one
    if (!wallet) {
      console.log('Creating new wallet for user:', user.id)
      const { data: newWallet, error: createError } = await supabase
        .from('user_wallets')
        .insert({ 
          user_id: user.id,
          available_balance: 0,
          pending_balance: 0,
          total_earnings: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating wallet:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create wallet' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          balance: 0,
          pending: 0,
          total_earnings: 0,
          bank_details: {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return wallet balance information
    return new Response(
      JSON.stringify({ 
        balance: wallet?.available_balance || 0,
        pending: wallet?.pending_balance || 0,
        total_earnings: wallet?.total_earnings || 0,
        bank_details: wallet?.bank_details || {}
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get wallet balance error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
