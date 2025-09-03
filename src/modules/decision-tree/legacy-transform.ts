/**
 * Legacy to Spec JSON Transform
 * 
 * Converts legacy maintenance.json format to spec-compliant decision tree format.
 * Based on the mapping provided in the requirements.
 */

import { DecisionTree, DecisionNode, TreeNode, VideoCheckNode, LeafNode, LeafType, LeafReason } from '@/types/decision-tree';

interface LegacyMaintenanceItem {
  label: string;
  key: string;
  type: 'menu' | 'leaf';
  children?: LegacyMaintenanceItem[];
  leafType?: 'RESPONSIBILITY' | 'FIX_VIDEO' | 'DESCRIBE' | 'EMERGENCY' | 'AUTO_SEND' | 'OPTION_UNAVAILABLE';
  videoUrl?: string;
  description?: string;
}

interface LegacyTree {
  label: string;
  key: string;
  type: 'menu';
  children: LegacyMaintenanceItem[];
}

const mapLegacyLeafType = (legacyType: string): { leaf_type: LeafType; leaf_reason: LeafReason } => {
  switch (legacyType) {
    case 'RESPONSIBILITY':
      return { leaf_type: 'end_no_ticket', leaf_reason: 'tenant_responsibility' };
    case 'EMERGENCY':
      return { leaf_type: 'end_no_ticket', leaf_reason: 'emergency' };
    case 'DESCRIBE':
      return { leaf_type: 'start_ticket', leaf_reason: 'standard_wizard' };
    case 'OPTION_UNAVAILABLE':
      return { leaf_type: 'start_ticket', leaf_reason: 'option_missing' };
    case 'AUTO_SEND':
      // Convert to standard_wizard as per requirements
      return { leaf_type: 'start_ticket', leaf_reason: 'standard_wizard' };
    default:
      return { leaf_type: 'start_ticket', leaf_reason: 'standard_wizard' };
  }
};

const transformNode = (legacyNode: LegacyMaintenanceItem): DecisionNode => {
  if (legacyNode.type === 'menu') {
    return {
      node_id: legacyNode.key,
      type: 'branch',
      title: { en: legacyNode.label, nl: legacyNode.label }, // TODO: Add proper NL translations
      children: legacyNode.children?.map(child => child.key) || []
    } as TreeNode;
  }

  // Handle FIX_VIDEO as video_check node
  if (legacyNode.leafType === 'FIX_VIDEO') {
    return {
      node_id: legacyNode.key,
      type: 'video_check',
      title: { en: legacyNode.label, nl: legacyNode.label },
      video_url: legacyNode.videoUrl || 'https://example.com/video',
      outcomes: {
        yes: {
          leaf_type: 'end_no_ticket',
          leaf_reason: 'video_resolved'
        },
        no: {
          leaf_type: 'start_ticket',
          leaf_reason: 'video_not_resolved',
          required_fields: ['description'],
          flow: ['describe_media', 'contact_questions', 'review', 'submit'],
          question_groups: ['contact_at_home']
        }
      }
    } as VideoCheckNode;
  }

  // Handle regular leaf nodes
  const { leaf_type, leaf_reason } = mapLegacyLeafType(legacyNode.leafType || 'DESCRIBE');
  
  return {
    node_id: legacyNode.key,
    type: 'leaf',
    title: { en: legacyNode.label, nl: legacyNode.label },
    leaf_type,
    leaf_reason,
    required_fields: leaf_type === 'start_ticket' ? ['description', 'photos'] : undefined,
    flow: leaf_type === 'start_ticket' ? ['describe_media', 'contact_questions', 'review', 'submit'] : undefined,
    question_groups: leaf_type === 'start_ticket' ? ['contact_at_home', 'entry_permission'] : undefined
  } as LeafNode;
};

export const transformLegacyTree = (legacyTree: LegacyTree): DecisionTree => {
  const allNodes: Record<string, DecisionNode> = {};
  
  // First pass: collect all nodes
  const collectNodes = (node: LegacyMaintenanceItem) => {
    const transformed = transformNode(node);
    allNodes[transformed.node_id] = transformed;
    
    if (node.children) {
      node.children.forEach(collectNodes);
    }
  };
  
  collectNodes(legacyTree);
  
  return {
    tree_id: 'maintenance-v1',
    version: 1,
    title: { en: legacyTree.label, nl: legacyTree.label },
    root_node_id: legacyTree.key,
    nodes: allNodes
  };
};

// Example transformations for the three requested cases:
export const exampleTransformations = {
  'plumbing.tap_leak': {
    legacy: {
      label: 'Leaking tap',
      key: 'plumbing.tap_leak',
      type: 'leaf' as const,
      leafType: 'DESCRIBE' as const
    },
    spec: {
      node_id: 'plumbing.tap_leak',
      type: 'leaf' as const,
      title: { en: 'Leaking tap', nl: 'Leaking tap' },
      leaf_type: 'start_ticket' as const,
      leaf_reason: 'standard_wizard' as const,
      required_fields: ['description', 'photos'],
      flow: ['describe_media', 'contact_questions', 'review', 'submit'],
      question_groups: ['contact_at_home', 'entry_permission']
    }
  },
  
  'bathroom.toilet.seat_broken': {
    legacy: {
      label: 'Toilet seat broken or loose',
      key: 'bathroom.toilet.seat_broken',
      type: 'leaf' as const,
      leafType: 'RESPONSIBILITY' as const
    },
    spec: {
      node_id: 'bathroom.toilet.seat_broken',
      type: 'leaf' as const,
      title: { en: 'Toilet seat broken or loose', nl: 'Toilet seat broken or loose' },
      leaf_type: 'end_no_ticket' as const,
      leaf_reason: 'tenant_responsibility' as const
    }
  },
  
  'option_not_listed': {
    legacy: {
      label: 'My option is not listed',
      key: 'option_not_listed',
      type: 'leaf' as const,
      leafType: 'OPTION_UNAVAILABLE' as const
    },
    spec: {
      node_id: 'option_not_listed',
      type: 'leaf' as const,
      title: { en: 'My option is not listed', nl: 'My option is not listed' },
      leaf_type: 'end_no_ticket' as const,
      leaf_reason: 'other_non_ticket' as const
    }
  }
};
