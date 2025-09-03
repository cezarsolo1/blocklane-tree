import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FinalizeTicketRequest {
  ticket_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { ticket_id }: FinalizeTicketRequest = await req.json()

    // Validate input
    if (!ticket_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: ticket_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify ticket belongs to user and is in draft status
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, status, description, leaf_reason')
      .eq('id', ticket_id)
      .eq('profile_id', profile.id)
      .single()

    if (!ticket) {
      return new Response(
        JSON.stringify({ error: 'Ticket not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (ticket.status !== 'draft') {
      return new Response(
        JSON.stringify({ error: 'Can only finalize draft tickets' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate required fields for standard_wizard tickets
    if (ticket.leaf_reason === 'standard_wizard') {
      if (!ticket.description || ticket.description.length < 10) {
        return new Response(
          JSON.stringify({ error: 'Description is required and must be at least 10 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Update ticket status to submitted
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .eq('id', ticket_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to finalize ticket' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get ticket data for webhook
    const { data: ticketData } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_answers(key, value),
        media_assets(id, kind, mime, size_bytes, storage_path)
      `)
      .eq('id', ticket_id)
      .single()

    // Create webhook payload
    const webhookPayload = {
      event: 'ticket.submitted',
      ticket_id: ticket_id,
      data: ticketData,
      timestamp: new Date().toISOString()
    }

    // Enqueue webhook
    const { error: webhookError } = await supabase
      .from('webhooks_outbox')
      .insert({
        ticket_id,
        payload: webhookPayload
      })

    if (webhookError) {
      console.error('Failed to enqueue webhook:', webhookError)
      // Don't fail the request if webhook enqueue fails
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
