/**
 * Input validation and sanitization utilities
 */

import { z } from 'zod';

// Maintenance log validation schema
export const maintenanceLogSchema = z.object({
  issue_leaf_id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
  issue_path: z.array(z.string().max(200)).max(10),
  issue_title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  extra: z.record(z.unknown()).optional()
});

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate file uploads
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
  }
  
  return { valid: true };
}

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}
