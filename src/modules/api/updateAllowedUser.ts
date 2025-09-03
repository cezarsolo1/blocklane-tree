/**
 * Update allowed user address information
 * 
 * Updates the user's row in the allowed_users table with new address data.
 */

import { createClient } from '@supabase/supabase-js';

interface UpdateAllowedUserRequest {
  email: string;
  address: {
    street: string;
    house_number: string;
    house_number_suffix?: string;
    postal_code: string;
    city: string;
  };
}

interface UpdateAllowedUserResponse {
  ok: boolean;
  error?: string;
}

/**
 * Update allowed user address information
 * @param request - User email and address data
 * @param supabaseClient - Optional Supabase client to use (prevents multiple instances)
 * @returns Response with success status
 */
export async function updateAllowedUser(
  request: UpdateAllowedUserRequest, 
  supabaseClient?: any
): Promise<UpdateAllowedUserResponse> {
  let supabase = supabaseClient;
  
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { ok: false, error: 'No active session' };
  }
  
  try {
    // Update the allowed_users table (excluding house_number_suffix since it doesn't exist)
    const { error } = await supabase
      .from('allowed_users')
      .update({
        street: request.address.street,
        house_number: request.address.house_number,
        postal_code: request.address.postal_code,
        city: request.address.city
      })
      .eq('email', request.email);
    
    if (error) {
      return { ok: false, error: error.message };
    }
    
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
