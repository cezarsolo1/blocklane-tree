/**
 * Decision Tree Types
 * Updated to support the Dutch maintenance tree format
 */

export type NodeType = 'menu' | 'info' | 'issue';

export type FieldType = 'single_select' | 'multi_select' | 'yes_no' | 'text' | 'files';

export interface MenuOption {
  label: string;
  next: string;
  aliases?: string[];
}

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface MenuNode {
  id: string;
  type: 'menu';
  title: string;
  options: MenuOption[];
}

export interface InfoNode {
  id: string;
  type: 'info';
  title: string;
  body: string;
  next?: string;
}

export interface IssueNode {
  id: string;
  type: 'issue';
  title: string;
  fields: FormField[];
  related?: string[];
}

export type MaintenanceNode = MenuNode | InfoNode | IssueNode;

export interface MaintenanceTree {
  version: string;
  locale: string;
  entry: string;
  meta: {
    name: string;
    notes: string;
    bins: string[];
  };
  nodes: MaintenanceNode[];
}

// Legacy types for backward compatibility
export type LeafType = 'end_no_ticket' | 'start_ticket';

export type LeafReason = 
  | 'emergency'
  | 'tenant_responsibility'
  | 'video_resolved'
  | 'video_not_resolved'
  | 'standard_wizard'
  | 'option_missing';

export type LangCode = 'en' | 'nl';

export interface LocalizedText {
  en: string;
  nl: string;
}

export interface TreeNode {
  node_id: string;
  type: 'branch';
  title: LocalizedText | string;
  children: string[];
}

export interface VideoCheckNode {
  node_id: string;
  type: 'video_check';
  title: LocalizedText | string;
  video_url: string;
  description?: LocalizedText;
  outcomes: {
    yes: {
      leaf_type: LeafType;
      leaf_reason: LeafReason;
    };
    no: {
      leaf_type: LeafType;
      leaf_reason: LeafReason;
      required_fields?: string[];
      flow?: string[];
      question_groups?: string[];
    };
  };
}

export interface LeafNode {
  node_id: string;
  type: 'leaf';
  title: LocalizedText | string;
  leaf_type: LeafType;
  leaf_reason: LeafReason;
  required_fields?: string[];
  flow?: string[];
  question_groups?: string[];
  _videoCheckNodeId?: string; // For back navigation from video resolved pages
}

export type DecisionNode = TreeNode | VideoCheckNode | LeafNode;

export interface DecisionTree {
  tree_id: string;
  version: number;
  title: LocalizedText;
  root_node_id: string;
  nodes: Record<string, DecisionNode>;
}

export interface TreeMetadata {
  tree_id: string;
  version: number;
  created_at: string;
  is_active: boolean;
}

/**
 * Wizard state types
 */
export interface WizardState {
  current_node: DecisionNode;
  path: string[];
  history: string[];
  selected_choice?: string;
  flow_state?: 'describe_media' | 'contact_questions' | 'review' | 'submitted';
  flow_data?: {
    description?: string;
    photos?: File[];
    contact?: any;
    answers?: any;
  };
}

export interface WizardSession {
  session_id: string;
  tree_id: string;
  version: number;
  current_state: WizardState;
  created_at: string;
  updated_at: string;
}
