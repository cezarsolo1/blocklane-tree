/**
 * Secure error handling utilities
 */

export interface SafeError {
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * Sanitize errors to prevent information leakage
 */
export function sanitizeError(error: unknown): SafeError {
  const timestamp = new Date().toISOString();
  
  // Log full error details for debugging (server-side only in production)
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error details:', error);
  }
  
  // Return safe error messages to users
  if (error instanceof Error) {
    // Known safe error messages
    const safeMessages = [
      'User must be authenticated',
      'Too many submissions',
      'Invalid input',
      'File size too large',
      'Unsupported file type',
      'Network error',
      'Request timeout'
    ];
    
    const isSafeMessage = safeMessages.some(safe => 
      error.message.toLowerCase().includes(safe.toLowerCase())
    );
    
    if (isSafeMessage) {
      return {
        message: error.message,
        timestamp
      };
    }
  }
  
  // Default safe message for unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    timestamp
  };
}

/**
 * Audit log entry for security events
 */
export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Log security-relevant events
 */
export function logSecurityEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const auditEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to your logging service (e.g., Sentry, LogRocket, etc.)
    console.log('AUDIT:', JSON.stringify(auditEntry));
  } else {
    console.log('Security Event:', auditEntry);
  }
}
