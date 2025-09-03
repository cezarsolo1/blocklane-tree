import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateDraftTicketRequest {
  sessionId: string;
  tree: {
    id: string;
    version: number;
    node_id: string;
    leaf_type: 'end_no_ticket' | 'start_ticket';
    leaf_reason: string;
  };
  address?: any;
  contact?: any;
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
    const { sessionId, tree, address, contact }: CreateDraftTicketRequest = await req.json()

    // Validate input
    if (!sessionId || !tree) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sessionId, tree' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!tree.id || !tree.version || !tree.node_id || !tree.leaf_type || !tree.leaf_reason) {
      return new Response(
        JSON.stringify({ error: 'Invalid tree data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Only create draft for start_ticket leaves
    if (tree.leaf_type !== 'start_ticket') {
      return new Response(
        JSON.stringify({ error: 'Draft can only be created for start_ticket leaves' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          auth_user_id: user.id,
          email: user.email!
        })
        .select('id')
        .single()

      if (profileError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      profile = newProfile
    }

    // Check for existing draft with same sessionId and leaf_node_id (idempotency)
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('tree_id', tree.id)
      .eq('tree_version', tree.version)
      .eq('leaf_node_id', tree.node_id)
      .eq('status', 'draft')
      .single()

    if (existingTicket) {
      return new Response(
        JSON.stringify({ ok: true, data: { ticket_id: existingTicket.id } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create new draft ticket
    const { data: ticket, error: insertError } = await supabase
      .from('tickets')
      .insert({
        profile_id: profile.id,
        status: 'draft',
        tree_id: tree.id,
        tree_version: tree.version,
        leaf_node_id: tree.node_id,
        leaf_type: tree.leaf_type,
        leaf_reason: tree.leaf_reason,
        phone_raw: contact?.phone || null,
        email: contact?.email || null,
        contact_name: contact?.name || null
      })
      .select('id')
      .single()

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create draft ticket' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ ok: true, data: { ticket_id: ticket.id } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
