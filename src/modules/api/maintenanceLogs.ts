/**
 * Maintenance Logs API functions
 * 
 * Handles CRUD operations for maintenance logs in Supabase
 */

import { supabase, getCurrentProfileId } from '../../lib/supabase';
import type { MaintenanceLog, MaintenanceLogInput } from '../../types/maintenance';

/**
 * Submit a new maintenance log to the database
 */
export async function submitMaintenanceLog(logData: MaintenanceLogInput): Promise<MaintenanceLog> {
  const profileId = await getCurrentProfileId();
  
  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert({
      issue_leaf_id: logData.issue_leaf_id,
      issue_path: logData.issue_path,
      issue_title: logData.issue_title,
      description: logData.description,
      photos: logData.photos,
      extra: logData.extra,
      submitted_by: profileId || logData.submitted_by,
      status: 'submitted'
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting maintenance log:', error);
    throw new Error(`Failed to submit maintenance log: ${error.message}`);
  }

  return data;
}

/**
 * Get all maintenance logs (most recent first, limit 500)
 */
export async function getMaintenanceLogs(): Promise<MaintenanceLog[]> {
  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching maintenance logs:', error);
    throw new Error(`Failed to fetch maintenance logs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get maintenance logs for the current user only
 */
export async function getUserMaintenanceLogs(): Promise<MaintenanceLog[]> {
  const profileId = await getCurrentProfileId();
  if (!profileId) return [];

  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('submitted_by', profileId)
    .order('submitted_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching user maintenance logs:', error);
    throw new Error(`Failed to fetch user maintenance logs: ${error.message}`);
  }

  return data || [];
}
