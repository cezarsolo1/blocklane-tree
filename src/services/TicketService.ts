/**
 * Ticket Service
 * 
 * Handles ticket creation and management via Edge Functions
 * Based on spec section 5 - Edge Functions / API Contracts
 */

import { LeafNode } from '@/types/decision-tree';
import { UploadedPhoto } from '@/components/wizard/PhotoDropzone';

export interface CreateTicketData {
  leafNode: LeafNode;
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  description: string;
  photos: UploadedPhoto[];
}

export interface TicketResponse {
  ok: boolean;
  data?: {
    ticket_id: string;
  };
  error?: string;
}

export interface MediaUploadResponse {
  ok: boolean;
  data?: {
    uploads: Array<{
      media_id: string;
      put_url: string;
      storage_path: string;
    }>;
  };
  error?: string;
}

export class TicketService {
  private static baseUrl = '/api'; // Edge Functions endpoint

  /**
   * Create a draft ticket when start_ticket leaf is reached
   */
  static async createDraftTicket(data: CreateTicketData): Promise<string> {
    const response = await fetch(`${this.baseUrl}/create_draft_ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wizard_session_id: this.getSessionId(),
        tree: {
          id: 'maintenance-v1', // From decision tree
          version: 1,
          node_id: data.leafNode.node_id,
          leaf_type: data.leafNode.leaf_type,
          leaf_reason: data.leafNode.leaf_reason,
        },
        breadcrumbs: data.breadcrumbs,
        description: data.description,
      }),
    });

    const result: TicketResponse = await response.json();
    
    if (!result.ok || !result.data) {
      throw new Error(result.error || 'Failed to create ticket');
    }

    return result.data.ticket_id;
  }

  /**
   * Upload media files for a ticket
   */
  static async uploadMedia(ticketId: string, photos: UploadedPhoto[]): Promise<void> {
    if (photos.length === 0) return;

    // Step 1: Get signed URLs
    const signResponse = await fetch(`${this.baseUrl}/sign_media_upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        files: photos.map(photo => ({
          name: photo.name,
          size: photo.size,
          mime: photo.mime,
        })),
      }),
    });

    const signResult: MediaUploadResponse = await signResponse.json();
    
    if (!signResult.ok || !signResult.data) {
      throw new Error(signResult.error || 'Failed to get upload URLs');
    }

    // Step 2: Upload files to signed URLs
    const uploads = signResult.data.uploads;
    const uploadPromises = photos.map(async (photo, index) => {
      const upload = uploads[index];
      if (!upload) return;

      const uploadResponse = await fetch(upload.put_url, {
        method: 'PUT',
        body: photo.file,
        headers: {
          'Content-Type': photo.mime,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${photo.name}`);
      }
    });

    await Promise.all(uploadPromises);
  }

  /**
   * Update ticket with additional data
   */
  static async updateTicket(ticketId: string, patch: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/update_ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        patch,
      }),
    });

    const result: TicketResponse = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Failed to update ticket');
    }
  }

  /**
   * Finalize ticket (submit)
   */
  static async finalizeTicket(ticketId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/finalize_ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketId,
      }),
    });

    const result: TicketResponse = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Failed to finalize ticket');
    }
  }

  /**
   * Get or create wizard session ID
   */
  private static getSessionId(): string {
    let sessionId = localStorage.getItem('wizard_session_id');
    if (!sessionId) {
      sessionId = `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('wizard_session_id', sessionId);
    }
    return sessionId;
  }
}
