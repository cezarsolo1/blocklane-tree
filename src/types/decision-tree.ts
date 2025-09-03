/**
 * Decision Tree Types
 * Based on spec section 2.3 - JSON schema and section 4.1 - Enums
 */

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
  title: LocalizedText;
  children: string[];
}

export interface VideoCheckNode {
  node_id: string;
  type: 'video_check';
  title: LocalizedText;
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
  title: LocalizedText;
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
