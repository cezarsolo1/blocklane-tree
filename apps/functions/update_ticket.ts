import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateTicketRequest {
  ticket_id: string;
  patch: {
    description?: string;
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    answers?: Record<string, any>;
  };
}

// Phone validation and normalization
function validateAndNormalizePhone(phone: string): { raw: string; e164: string | null } {
  if (!phone) return { raw: '', e164: null }

  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '')
  
  // NL local format: 10 digits starting with 0
  if (digits.length === 10 && digits.startsWith('0')) {
    return { 
      raw: phone, 
      e164: `+31${digits.substring(1)}` 
    }
  }
  
  // E.164 format: +31 followed by 9 digits
  if (phone.startsWith('+31') && digits.length === 12) {
    return { raw: phone, e164: phone }
  }
  
  // Formatted with spaces/dashes
  const formatted = phone.replace(/[\s\-\(\)]/g, '')
  if (formatted.startsWith('+31') && formatted.length === 12) {
    return { raw: phone, e164: formatted }
  }
  
  return { raw: phone, e164: null }
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
    const { ticket_id, patch }: UpdateTicketRequest = await req.json()

    // Validate input
    if (!ticket_id || !patch) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: ticket_id, patch' }),
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

    // Verify ticket belongs to user
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, status')
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
        JSON.stringify({ error: 'Can only update draft tickets' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate description if provided
    if (patch.description !== undefined) {
      if (patch.description.length < 10) {
        return new Response(
          JSON.stringify({ error: 'Description must be at least 10 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (patch.description !== undefined) {
      updateData.description = patch.description
    }

    if (patch.contact) {
      if (patch.contact.name !== undefined) {
        updateData.contact_name = patch.contact.name
      }
      if (patch.contact.email !== undefined) {
        updateData.email = patch.contact.email
      }
      if (patch.contact.phone !== undefined) {
        const phoneData = validateAndNormalizePhone(patch.contact.phone)
        updateData.phone_raw = phoneData.raw
        updateData.phone_e164 = phoneData.e164
      }
    }

    // Update ticket
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket_id)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update ticket' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Handle answers
    if (patch.answers) {
      for (const [key, value] of Object.entries(patch.answers)) {
        const { error: answerError } = await supabase
          .from('ticket_answers')
          .upsert({
            ticket_id,
            key,
            value
          })

        if (answerError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update answers' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
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
