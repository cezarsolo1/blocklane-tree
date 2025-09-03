import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTicketService } from '@/modules/tickets/TicketServiceFactory';

describe('Environment Guard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('should throw error when VITE_BACKEND=supabase but env vars are missing', () => {
    // Mock environment variables
    vi.stubEnv('VITE_BACKEND', 'supabase');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    expect(() => {
      createTicketService();
    }).toThrow('Supabase backend requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  });

  it('should not throw error when VITE_BACKEND=inmemory', () => {
    // Mock environment variables
    vi.stubEnv('VITE_BACKEND', 'inmemory');

    expect(() => {
      createTicketService();
    }).not.toThrow();
  });

  it('should not throw error when VITE_BACKEND=supabase and env vars are present', () => {
    // Mock environment variables
    vi.stubEnv('VITE_BACKEND', 'supabase');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    expect(() => {
      createTicketService();
    }).not.toThrow();
  });
});

