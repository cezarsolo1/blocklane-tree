/**
 * TicketServiceFactory
 * 
 * Factory to create the appropriate TicketService implementation.
 * Uses Supabase when NEXT_PUBLIC_BACKEND="supabase", else InMemory.
 */

import { TicketService } from './TicketService';
import { InMemoryTicketService } from './InMemoryTicketService';
import { SupabaseTicketService } from './SupabaseTicketService';

export function createTicketService(): TicketService {
  const backend = import.meta.env.VITE_BACKEND || 'inmemory';
  
  console.log('TicketServiceFactory: Creating service with backend:', backend);
  
  if (backend === 'supabase') {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables not found, falling back to InMemory service');
      return new InMemoryTicketService();
    }
    
    try {
      return new SupabaseTicketService();
    } catch (error) {
      console.error('Failed to create SupabaseTicketService, falling back to InMemory:', error);
      return new InMemoryTicketService();
    }
  } else {
    console.log('Using InMemoryTicketService for development');
    return new InMemoryTicketService();
  }
}
