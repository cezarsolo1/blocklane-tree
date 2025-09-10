/**
 * Maintenance Logs API functions
 * 
 * Handles CRUD operations for maintenance logs in Supabase
 */

import { supabase, getCurrentProfileId } from '../../lib/supabase';
import type { MaintenanceLog, MaintenanceLogInput } from '../../types/maintenance';
import { maintenanceLogSchema, sanitizeHtml, RateLimiter } from '../../utils/validation';
import { sanitizeError, logSecurityEvent } from '../../utils/errorHandler';

// Rate limiter for submissions
const submitLimiter = new RateLimiter();

/**
 * Submit a new maintenance log to the database
 */
export async function submitMaintenanceLog(logData: MaintenanceLogInput): Promise<MaintenanceLog> {
  const profileId = await getCurrentProfileId();
  if (!profileId) {
    throw new Error('User must be authenticated to submit maintenance logs');
  }

  // Rate limiting check
  if (!submitLimiter.isAllowed(profileId, 5, 60000)) { // 5 submissions per minute
    throw new Error('Too many submissions. Please wait before submitting again.');
  }

  // Validate input data
  const validationResult = maintenanceLogSchema.safeParse(logData);
  if (!validationResult.success) {
    throw new Error(`Invalid input: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
  }

  // Sanitize text inputs
  const sanitizedData = {
    ...validationResult.data,
    issue_title: sanitizeHtml(validationResult.data.issue_title),
    description: validationResult.data.description ? sanitizeHtml(validationResult.data.description) : undefined,
    issue_path: validationResult.data.issue_path.map(path => sanitizeHtml(path))
  };
  
  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert({
      issue_leaf_id: sanitizedData.issue_leaf_id,
      issue_path: sanitizedData.issue_path,
      issue_title: sanitizedData.issue_title,
      description: sanitizedData.description,
      photos: sanitizedData.photos,
      extra: sanitizedData.extra,
      submitted_by: profileId,
      status: 'submitted'
    })
    .select()
    .single();

  if (error) {
    logSecurityEvent({
      userId: profileId,
      action: 'maintenance_log_submit_failed',
      resource: 'maintenance_logs',
      success: false,
      error: error.message,
      metadata: { issue_leaf_id: sanitizedData.issue_leaf_id }
    });
    
    const safeError = sanitizeError(error);
    throw new Error(safeError.message);
  }

  // Log successful submission
  logSecurityEvent({
    userId: profileId,
    action: 'maintenance_log_submitted',
    resource: 'maintenance_logs',
    success: true,
    metadata: { 
      log_id: data.id,
      issue_leaf_id: data.issue_leaf_id 
    }
  });

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
