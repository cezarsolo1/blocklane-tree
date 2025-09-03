import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the request body
    const { step, leaf_reason, timestamp, form_data } = await req.json()

    // Validate required fields
    if (!step || !leaf_reason || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: step, leaf_reason, timestamp' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the step event to the database
    const { error: insertError } = await supabaseClient
      .from('step_events')
      .insert({
        user_id: user.id,
        step: step,
        leaf_reason: leaf_reason,
        timestamp: timestamp,
        form_data: form_data || null,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to log step event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Also log to console for debugging
    console.log('Step event logged:', {
      user_id: user.id,
      step,
      leaf_reason,
      timestamp,
      form_data: form_data ? Object.keys(form_data) : null
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Step event logged successfully',
        logged_data: {
          step,
          leaf_reason,
          user_id: user.id,
          timestamp
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
