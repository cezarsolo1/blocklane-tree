/**
 * Create address change request for tenant proposals
 * 
 * Creates audit trail when tenant proposes address changes
 */

import { createClient } from '@supabase/supabase-js';

interface AddressChangeRequest {
  email: string;
  currentAddress?: {
    id: string;
    street: string;
    house_number: string;
    house_number_suffix?: string;
    postal_code: string;
    city: string;
  };
  proposedAddress: {
    street: string;
    house_number: string;
    house_number_suffix?: string;
    postal_code: string;
    city: string;
    telephone?: string;
    country?: string;
  };
  tenantNote?: string;
}

interface CreateAddressChangeRequestResponse {
  ok: boolean;
  requestId?: string;
  error?: string;
}

/**
 * Create address change request for approval workflow
 * @param request - Address change request data
 * @param supabaseClient - Optional Supabase client
 * @returns Response with request ID
 */
export async function createAddressChangeRequest(
  request: AddressChangeRequest,
  supabaseClient?: any
): Promise<CreateAddressChangeRequestResponse> {
  let supabase = supabaseClient;
  
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return { ok: false, error: 'Missing Supabase environment variables' };
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  try {
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', request.email)
      .single();
    
    if (profileError || !profile) {
      return { ok: false, error: 'Profile not found' };
    }
    
    // Create change request
    const { data: changeRequest, error: requestError } = await supabase
      .from('address_change_requests')
      .insert({
        profile_id: profile.id,
        current_address_id: request.currentAddress?.id || null,
        proposed_street: request.proposedAddress.street,
        proposed_house_number: request.proposedAddress.house_number,
        proposed_house_number_suffix: request.proposedAddress.house_number_suffix || null,
        proposed_postal_code: request.proposedAddress.postal_code,
        proposed_city: request.proposedAddress.city,
        proposed_telephone: request.proposedAddress.telephone || null,
        proposed_country: request.proposedAddress.country || 'NL',
        tenant_note: request.tenantNote || null
      })
      .select('id')
      .single();
    
    if (requestError) {
      return { ok: false, error: requestError.message };
    }
    
    return { ok: true, requestId: changeRequest.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
