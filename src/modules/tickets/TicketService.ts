/**
 * TicketService Interface
 * 
 * Defines the contract for ticket operations.
 * Based on spec section 4.4 - Edge Functions / API Contracts.
 */

import { LeafType, LeafReason } from '@/types/decision-tree';

export interface TicketService {
  createDraft(input: {
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
  }): Promise<{ ticket_id: string }>;

  update(ticket_id: string, patch: any): Promise<{ ok: true }>;

  finalize(ticket_id: string): Promise<{ ok: true }>;
  
  uploadMedia(ticket_id: string, files: File[]): Promise<void>;
}
