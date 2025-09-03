// Additional types for database tables not yet reflected in auto-generated types.ts
// These will be merged when Supabase types are regenerated

export interface TicketAttachment {
  id: number;
  created_at: string;
  ticket_id: string;
  storage_path: string;
  kind: 'PHOTO' | 'DOCUMENT' | 'VIDEO';
  added_by?: string | null;
}

export interface TicketAttachmentInsert {
  ticket_id: string;
  storage_path: string;
  kind?: 'PHOTO' | 'DOCUMENT' | 'VIDEO';
  added_by?: string | null;
}

export interface TicketMessage {
  id: number;
  created_at: string;
  ticket_id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  channel: 'EMAIL' | 'SMS' | 'PORTAL' | 'PHONE';
  sender_name?: string | null;
  sender_email?: string | null;
  sender_phone?: string | null;
  body: string;
  attachments: any[]; // JSON array
}

export interface TicketMessageInsert {
  ticket_id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  channel: 'EMAIL' | 'SMS' | 'PORTAL' | 'PHONE';
  body: string;
  sender_name?: string | null;
  sender_email?: string | null;
  sender_phone?: string | null;
  attachments?: any[];
}

export interface VendorAssignment {
  id: string;
  created_at: string;
  updated_at: string;
  ticket_id: string;
  vendor_name: string;
  vendor_email?: string | null;
  vendor_phone?: string | null;
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  vendor_token: string;
  token_expires_at: string;
}

export interface VendorAssignmentInsert {
  ticket_id: string;
  vendor_name: string;
  vendor_email?: string | null;
  vendor_phone?: string | null;
  status?: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  vendor_token?: string;
  token_expires_at?: string;
}