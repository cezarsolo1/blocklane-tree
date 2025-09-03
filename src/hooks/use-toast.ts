/**
 * Toast Hook
 * 
 * Simple toast notification hook for user feedback
 */

import { useState, useCallback } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Toast) => {
    // For now, just log to console
    // In production, this would integrate with a toast notification system
    if (toast.variant === 'destructive') {
      console.error(`Toast: ${toast.title}`, toast.description);
    } else {
      console.log(`Toast: ${toast.title}`, toast.description);
    }
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);
  }, []);

  return { toast, toasts };
}
