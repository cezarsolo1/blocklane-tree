/**
 * Security configuration and constants
 */

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    MAINTENANCE_LOG_SUBMIT: { maxAttempts: 5, windowMs: 60000 }, // 5 per minute
    LOGIN_ATTEMPTS: { maxAttempts: 3, windowMs: 300000 }, // 3 per 5 minutes
    FILE_UPLOAD: { maxAttempts: 10, windowMs: 60000 } // 10 per minute
  },
  
  // File upload restrictions
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    MAX_FILES_PER_SUBMISSION: 10
  },
  
  // Input validation
  INPUT_LIMITS: {
    ISSUE_TITLE_MAX_LENGTH: 500,
    DESCRIPTION_MAX_LENGTH: 5000,
    ISSUE_PATH_MAX_ITEMS: 10,
    ISSUE_PATH_ITEM_MAX_LENGTH: 200
  },
  
  // Session security
  SESSION: {
    TIMEOUT_WARNING_MS: 5 * 60 * 1000, // 5 minutes before expiry
    MAX_IDLE_TIME_MS: 30 * 60 * 1000, // 30 minutes
    REFRESH_THRESHOLD_MS: 10 * 60 * 1000 // Refresh if < 10 minutes left
  }
};

/**
 * Security headers for API requests
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

/**
 * Sensitive data patterns to redact from logs
 */
export const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /key/i,
  /secret/i,
  /auth/i,
  /email/i,
  /phone/i,
  /address/i
];

/**
 * Check if a string contains sensitive information
 */
export function containsSensitiveData(text: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Redact sensitive information from objects
 */
export function redactSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
  const redacted = { ...obj };
  
  Object.keys(redacted).forEach(key => {
    if (containsSensitiveData(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'string' && containsSensitiveData(redacted[key] as string)) {
      redacted[key] = '[REDACTED]';
    }
  });
  
  return redacted;
}
