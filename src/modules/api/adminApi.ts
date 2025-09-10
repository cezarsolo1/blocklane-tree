/**
 * Admin API functions for role management and elevated permissions
 */

import { supabase, getCurrentProfileId } from '../../lib/supabase';
import type { MaintenanceLog } from '../../types/maintenance';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminUser {
  id: string;
  auth_user_id: string;
  email?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Check if current user has admin privileges
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return false;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .single();

  return data?.role === 'admin' || data?.role === 'super_admin';
}

/**
 * Get current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return null;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .single();

  return data?.role || 'user';
}

/**
 * Get all maintenance logs (admin only)
 */
export async function getAllMaintenanceLogsAdmin(): Promise<MaintenanceLog[]> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error('Insufficient permissions. Admin access required.');
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .select(`
      *,
      profiles:submitted_by (
        id,
        email,
        role
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(`Failed to fetch maintenance logs: ${error.message}`);
  }

  return data || [];
}

/**
 * Update maintenance log status (admin only)
 */
export async function updateMaintenanceLogStatus(
  logId: string, 
  status: MaintenanceLog['status']
): Promise<MaintenanceLog> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error('Insufficient permissions. Admin access required.');
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', logId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update maintenance log: ${error.message}`);
  }

  return data;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error('Insufficient permissions. Admin access required.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data || [];
}

/**
 * Update user role (super admin only)
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const currentRole = await getCurrentUserRole();
  if (currentRole !== 'super_admin') {
    throw new Error('Insufficient permissions. Super admin access required.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }
}

/**
 * Grant admin permission to a user (super admin only)
 */
export async function grantAdminPermission(userId: string, permission: string): Promise<void> {
  const currentRole = await getCurrentUserRole();
  const currentProfileId = await getCurrentProfileId();
  
  if (currentRole !== 'super_admin') {
    throw new Error('Insufficient permissions. Super admin access required.');
  }

  const { error } = await supabase
    .from('admin_permissions')
    .insert({
      profile_id: userId,
      permission,
      granted_by: currentProfileId
    });

  if (error) {
    throw new Error(`Failed to grant permission: ${error.message}`);
  }
}
