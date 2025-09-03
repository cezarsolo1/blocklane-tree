export type LeafType = 'RESPONSIBILITY' | 'FIX_VIDEO' | 'DESCRIBE' | 'EMERGENCY' | 'AUTO_SEND' | 'OPTION_UNAVAILABLE';

export interface TreeNode {
  label: string;
  key: string;
  type: 'menu';
  children: (TreeNode | LeafNode)[];
}

export interface LeafNode {
  label: string;
  key: string;
  type: 'leaf';
  leafType: LeafType;
  videoUrl?: string;
  description?: string;
}

export type MaintenanceItem = TreeNode | LeafNode;

export interface TicketData {
  decisionPath: string[];
  leafType: LeafType;
  description?: string;
  photoPaths: string[];
  streetAddress: string;
  postalCode: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  autoSend?: boolean;
  occupant?: {
    name: string;
    phone: string;
    email?: string;
  } | null;
  availability?: Record<string, string[]> | null;
  // Additional fields for detailed information
  hasPets?: boolean;
  petDetails?: string;
  hasAlarm?: boolean;
  alarmDetails?: string;
  neighborDetails?: string;
  accessMethod?: string;
  accessPermission?: string;
  intercomDetails?: string;
  keyBoxDetails?: string;
  notesForContractor?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'TENANT' | 'PM' | 'CONTRACTOR';
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  decision_path: any;
  leaf_type: LeafType;
  description?: string;
  photo_paths: string[];
  contractor_id?: string;
  street_address: string;
  postal_code: string;
  city: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
}