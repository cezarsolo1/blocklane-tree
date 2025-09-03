/**
 * Address event logging API client
 * 
 * Thin wrapper for calling the log_address_event Edge Function.
 */

import { createClient } from '@supabase/supabase-js';

interface AddressEventRequest {
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

interface AddressEventResponse {
  ok: boolean;
  error?: string;
  event_id?: string;
}

/**
 * Log an address event via Edge Function
 * @param request - Address event data
 * @returns Response with success status and optional event ID
 */
export async function logAddressEvent(request: AddressEventRequest): Promise<AddressEventResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { ok: false, error: 'No active session' };
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/log_address_event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        wizard_session_id: request.wizard_session_id,
        address: {
          street: request.address.street,
          house_number: request.address.house_number,
          house_number_suffix: request.address.house_number_suffix,
          postal_code: request.address.postal_code,
          city: request.address.city,
          country: request.address.country
        },
        profile_hint: request.profile_hint
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { ok: false, error: result.error || 'Failed to log address event' };
    }
    
    return { ok: true, event_id: result.event_id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
