/**
 * Get tenant's canonical address data
 * 
 * Reads from tenant_addresses table (canonical source of truth)
 */

import { createClient } from '@supabase/supabase-js';

interface TenantAddress {
  id: string;
  street: string;
  house_number: string;
  house_number_suffix?: string;
  postal_code: string;
  city: string;
  country: string;
}

interface GetTenantAddressResponse {
  ok: boolean;
  address?: TenantAddress;
  error?: string;
}

/**
 * Get tenant's current canonical address
 * @param email - User email
 * @param supabaseClient - Optional Supabase client
 * @returns Current address or null if none exists
 */
export async function getTenantAddress(
  email: string,
  supabaseClient?: any
): Promise<GetTenantAddressResponse> {
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
    // Get user's profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (profileError || !profile) {
      return { ok: false, error: 'Profile not found' };
    }
    
    // Get current canonical address
    const { data: address, error: addressError } = await supabase
      .from('tenant_addresses')
      .select('id, street, house_number, house_number_suffix, postal_code, city, country')
      .eq('profile_id', profile.id)
      .eq('is_current', true)
      .maybeSingle();
    
    if (addressError) {
      return { ok: false, error: addressError.message };
    }
    
    if (!address) {
      return { ok: true, address: undefined };
    }
    
    return { ok: true, address };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
