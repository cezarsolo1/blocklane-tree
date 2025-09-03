/**
 * Centralized Supabase client configuration
 * 
 * Provides authenticated client and helper functions for profile/tenancy management
 */

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Get the current user's profile ID from the profiles table
 */
export async function getCurrentProfileId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  
  return data?.id ?? null;
}

/**
 * Get the user's active tenancy information
 */
export async function getActiveTenancy(): Promise<{
  unitId: string;
  buildingId: string;
  orgId: string;
} | null> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return null;
  
  const { data } = await supabase
    .from('tenancies')
    .select('unit_id, units(building_id, org_id)')
    .eq('profile_id', profileId)
    .is('end_date', null)
    .limit(1);
  
  if (!data?.length) return null;
  
  const row = data[0];
  const units = Array.isArray(row.units) ? row.units[0] : row.units;
  return {
    unitId: row.unit_id,
    buildingId: units?.building_id || '',
    orgId: units?.org_id || '',
  };
}

/**
 * Sign in with email OTP / Magic Link
 */
export async function signInWithEmail(email: string) {
  return await supabase.auth.signInWithOtp({ email });
}

/**
 * Sign out current user
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}
