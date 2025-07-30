
/**
 * Email Campaign Sender
 * Purpose: Send email campaigns to users using Resend
 * Features: Bulk email sending, template support, delivery tracking
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    )

    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is super-admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super-admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const { campaign_id } = await req.json()

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return new Response('Campaign not found', { status: 404, headers: corsHeaders })
    }

    // Get all users to send to
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .not('email', 'is', null)

    if (usersError || !users) {
      return new Response('Failed to fetch users', { status: 500, headers: corsHeaders })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found')
      return new Response('Email service not configured', { status: 500, headers: corsHeaders })
    }

    const resend = new Resend(resendApiKey)
    let deliveredCount = 0
    const batchSize = 100 // Send in batches to avoid rate limits

    // Update campaign status to sending
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id)

    // Send emails in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      try {
        const emailPromises = batch.map(async (user) => {
          const emailContent = campaign.content
            .replace(/\{\{name\}\}/g, user.full_name || 'User')
            .replace(/\{\{email\}\}/g, user.email)

          return resend.emails.send({
            from: 'CloudScribe <noreply@cloudscribe.com>',
            to: [user.email],
            subject: campaign.subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">CloudScribe</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Creator Platform</p>
                </div>
                <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
                  <h2 style="color: #333; margin-top: 0;">${campaign.subject}</h2>
                  <div style="color: #666; line-height: 1.6; font-size: 16px;">
                    ${emailContent}
                  </div>
                </div>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    You received this email because you're a member of CloudScribe.<br>
                    <a href="#" style="color: #667eea;">Visit Platform</a> | <a href="#" style="color: #667eea;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            `,
          })
        })

        const results = await Promise.allSettled(emailPromises)
        const successful = results.filter(result => result.status === 'fulfilled').length
        deliveredCount += successful

        console.log(`Batch ${Math.floor(i/batchSize) + 1}: ${successful}/${batch.length} emails sent`)
      } catch (error) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error)
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        delivered_count: deliveredCount,
        recipient_count: users.length
      })
      .eq('id', campaign_id)

    return new Response(
      JSON.stringify({
        success: true,
        delivered: deliveredCount,
        total: users.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email campaign error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
