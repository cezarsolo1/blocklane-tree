/**
 * SupabaseTicketService
 * 
 * Real Supabase-backed implementation of TicketService.
 * Based on spec section 4.4 - Edge Functions / API Contracts.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TicketService } from './TicketService';
import { LeafType, LeafReason } from '@/types/decision-tree';
import { getCurrentSession } from '@/lib/supabase';

interface CreateDraftInput {
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
}

interface SignMediaUploadResponse {
  media_id: string;
  put_url: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  needs_conversion: boolean;
  kind: 'image' | 'video';
}

export class SupabaseTicketService implements TicketService {
  private supabase: SupabaseClient;
  private supabaseUrl: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(this.supabaseUrl, supabaseKey);
  }

  async createDraft(input: CreateDraftInput): Promise<{ ticket_id: string }> {
    // Try to get authenticated session first, fallback to anonymous
    const session = await getCurrentSession();
    const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${this.supabaseUrl}/functions/v1/create_draft_ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create draft ticket error:', errorText);
      throw new Error(`Failed to create draft ticket: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { ticket_id: result.data.ticket_id };
  }

  async update(ticket_id: string, patch: any): Promise<{ ok: true }> {
    // Use anonymous key for public ticket updates
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${this.supabaseUrl}/functions/v1/update_ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ ticket_id, patch }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update ticket error:', errorText);
      throw new Error(`Failed to update ticket: ${response.status} ${response.statusText}`);
    }

    return { ok: true };
  }

  async finalize(ticket_id: string): Promise<{ ok: true }> {
    // Use anonymous key for public ticket finalization
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${this.supabaseUrl}/functions/v1/finalize_ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ ticket_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Finalize ticket error:', errorText);
      throw new Error(`Failed to finalize ticket: ${response.status} ${response.statusText}`);
    }

    return { ok: true };
  }

  // Additional methods for media upload
  async signMediaUpload(ticket_id: string, files: File[]): Promise<SignMediaUploadResponse[]> {
    // Use anonymous key for public media upload signing
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    const response = await fetch(`${this.supabaseUrl}/functions/v1/sign_media_upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ ticket_id, files: fileData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sign media upload error:', errorText);
      throw new Error(`Failed to sign media upload: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.uploads;
  }

  async uploadMedia(ticket_id: string, files: File[]): Promise<void> {
    // Get signed URLs and create media asset records
    const uploads = await this.signMediaUpload(ticket_id, files);

    // Upload each file to the signed URL
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const upload = uploads[i];

      // Upload to signed URL
      const uploadResponse = await fetch(upload.put_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file ${file.name}: ${uploadResponse.statusText}`);
      }
    }
  }

  async getMediaThumbnailUrl(storage_path: string): Promise<string> {
    const { data } = await this.supabase.storage
      .from('media-assets')
      .createSignedUrl(storage_path, 300); // 5 minutes

    return data?.signedUrl || '';
  }
}
