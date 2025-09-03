/**
 * InMemoryTicketService
 * 
 * In-memory implementation of TicketService for development/testing.
 * TODO: Replace with SupabaseTicketService for production.
 */

import { TicketService } from './TicketService';
import { LeafType, LeafReason } from '@/types/decision-tree';

interface Ticket {
  ticket_id: string;
  sessionId: string;
  tree: {
    id: string;
    version: number;
    node_id: string;
    leaf_type: LeafType;
    leaf_reason: LeafReason;
  };
  status: 'draft' | 'submitted';
  data: any;
  created_at: string;
  updated_at: string;
}

export class InMemoryTicketService implements TicketService {
  private tickets: Map<string, Ticket> = new Map();
  private nextId = 1;

  async createDraft(input: {
    sessionId: string;
    tree: {
      id: string;
      version: number;
      node_id: string;
      leaf_type: LeafType;
      leaf_reason: LeafReason;
    };
    address?: any;
    contact?: any;
  }): Promise<{ ticket_id: string }> {
    const ticket_id = `ticket-${this.nextId++}`;
    const now = new Date().toISOString();

    const ticket: Ticket = {
      ticket_id,
      sessionId: input.sessionId,
      tree: input.tree,
      status: 'draft',
      data: {
        address: input.address,
        contact: input.contact,
        description: '',
        photos: [],
        answers: {}
      },
      created_at: now,
      updated_at: now
    };

    this.tickets.set(ticket_id, ticket);

    return { ticket_id };
  }

  async update(ticket_id: string, patch: any): Promise<{ ok: true }> {
    const ticket = this.tickets.get(ticket_id);
    if (!ticket) {
      throw new Error(`Ticket ${ticket_id} not found`);
    }

    // Merge patch into ticket data
    ticket.data = { ...ticket.data, ...patch };
    ticket.updated_at = new Date().toISOString();

    return { ok: true };
  }

  async finalize(ticket_id: string): Promise<{ ok: true }> {
    const ticket = this.tickets.get(ticket_id);
    if (!ticket) {
      throw new Error(`Ticket ${ticket_id} not found`);
    }

    ticket.status = 'submitted';
    ticket.updated_at = new Date().toISOString();

    // TODO: Dispatch webhook to PM/Make
    console.log('Webhook dispatched for ticket:', ticket_id);

    return { ok: true };
  }

  async uploadMedia(ticket_id: string, files: File[]): Promise<void> {
    const ticket = this.tickets.get(ticket_id);
    if (!ticket) {
      throw new Error(`Ticket ${ticket_id} not found`);
    }

    // In memory implementation just stores file references
    ticket.data.photos = files;
    ticket.updated_at = new Date().toISOString();
  }

  // Helper methods for testing
  getTicket(ticket_id: string): Ticket | undefined {
    return this.tickets.get(ticket_id);
  }

  getAllTickets(): Ticket[] {
    return Array.from(this.tickets.values());
  }

  clear(): void {
    this.tickets.clear();
    this.nextId = 1;
  }
}
