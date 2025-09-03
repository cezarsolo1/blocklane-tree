import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogAddressEventRequest {
  wizard_session_id: string;
  address: {
    street: string;
    house_number: string;
    house_number_suffix?: string;
    postal_code: string;
    city: string;
    country?: string;
  };
  profile_hint?: {
    email: string;
  };
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
    const { wizard_session_id, address, profile_hint }: LogAddressEventRequest = await req.json()

    // Validate input
    if (!wizard_session_id || !address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: wizard_session_id, address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!address.street || !address.house_number || !address.postal_code || !address.city) {
      return new Response(
        JSON.stringify({ error: 'Invalid address format' }),
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

    // Log address event
    const { data: eventData, error: insertError } = await supabase
      .from('address_events')
      .insert({
        profile_id: profile.id,
        wizard_session_id: wizard_session_id,
        address
      })
      .select('id')
      .single()

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to log address event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        event_id: eventData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
