/**
 * Tree Loader
 * 
 * Handles loading decision trees from various sources (JSON files, API, etc.)
 * Converts legacy format to new spec format.
 */

import { DecisionTree, DecisionNode, TreeNode, LeafNode, LocalizedText, LeafType, LeafReason } from '@/types/decision-tree';

interface LegacyNode {
  label: string;
  key: string;
  type: 'menu' | 'leaf';
  leafType?: string;
  videoUrl?: string;
  children?: LegacyNode[];
}

interface LegacyTree {
  label: string;
  key: string;
  type: 'menu';
  children: LegacyNode[];
}

export class TreeLoader {
  /**
   * Load tree from JSON file or URL
   */
  static async loadFromUrl(url: string): Promise<DecisionTree> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      return TreeLoader.parseTree(data);
    } catch (error) {
      throw new Error(`Failed to load decision tree: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load tree from JSON data
   */
  static loadFromData(data: any): DecisionTree {
    return TreeLoader.parseTree(data);
  }

  /**
   * Parse tree data and convert legacy format if needed
   */
  private static parseTree(data: any): DecisionTree {
    // Check if it's already in new format
    if (data.tree_id && data.version && data.root) {
      return data as DecisionTree;
    }

    // Convert from legacy format
    if (data.label && data.children) {
      return TreeLoader.convertLegacyTree(data as LegacyTree);
    }

    throw new Error('Invalid tree format');
  }

  /**
   * Convert legacy tree format to new spec format
   */
  private static convertLegacyTree(legacyTree: LegacyTree): DecisionTree {
    const convertNode = (legacyNode: LegacyNode): DecisionNode => {
      const nodeId = legacyNode.key;
      const title: LocalizedText = {
        en: TreeLoader.translateToEnglish(legacyNode.label),
        nl: legacyNode.label
      };

      if (legacyNode.type === 'menu' && legacyNode.children) {
        // Branch node
        return {
          node_id: nodeId,
          type: 'branch',
          title,
          children: legacyNode.children.map(child => child.key)
        } as TreeNode;
      } else if (legacyNode.type === 'leaf') {
        // Leaf node - convert legacy leafType to new format
        const { leaf_type, leaf_reason, required_fields, flow, question_groups } = TreeLoader.convertLegacyLeafType(legacyNode.leafType);
        
        return {
          node_id: nodeId,
          type: 'leaf',
          title,
          leaf_type,
          leaf_reason,
          required_fields,
          flow,
          question_groups
        } as LeafNode;
      }

      throw new Error(`Unknown legacy node type: ${legacyNode.type}`);
    };

    const allNodes: Record<string, DecisionNode> = {};
    
    // First pass: collect all nodes
    const collectNodes = (node: LegacyNode) => {
      const transformed = convertNode(node);
      allNodes[transformed.node_id] = transformed;
      
      if (node.children) {
        node.children.forEach(collectNodes);
      }
    };
    
    collectNodes(legacyTree);
    
    return {
      tree_id: 'maintenance',
      version: 1,
      title: {
        en: TreeLoader.translateToEnglish(legacyTree.label),
        nl: legacyTree.label
      },
      root_node_id: legacyTree.key,
      nodes: allNodes
    };
  }

  /**
   * Convert legacy leafType to new leaf_type/leaf_reason format
   */
  private static convertLegacyLeafType(leafType?: string): {
    leaf_type: LeafType;
    leaf_reason: LeafReason;
    required_fields?: string[];
    flow?: string[];
    question_groups?: string[];
  } {
    switch (leafType) {
      case 'FIX_VIDEO':
        return {
          leaf_type: 'end_no_ticket',
          leaf_reason: 'video_resolved'
        };

      case 'DESCRIBE':
        return {
          leaf_type: 'start_ticket',
          leaf_reason: 'standard_wizard',
          required_fields: ['description'],
          flow: ['describe_media', 'contact_questions', 'review'],
          question_groups: ['basic_contact']
        };

      case 'RESPONSIBILITY':
        return {
          leaf_type: 'end_no_ticket',
          leaf_reason: 'tenant_responsibility'
        };

      case 'EMERGENCY':
        return {
          leaf_type: 'start_ticket',
          leaf_reason: 'emergency',
          required_fields: ['description', 'phone'],
          flow: ['describe_media', 'contact_questions', 'review'],
          question_groups: ['emergency_contact']
        };

      case 'AUTO_SEND':
        return {
          leaf_type: 'start_ticket',
          leaf_reason: 'standard_wizard',
          required_fields: ['description'],
          flow: ['describe_media', 'contact_questions', 'review'],
          question_groups: ['contact_at_home']
        };

      default:
        return {
          leaf_type: 'start_ticket',
          leaf_reason: 'standard_wizard',
          required_fields: ['description'],
          flow: ['describe_media', 'contact_questions', 'review'],
          question_groups: ['basic_contact']
        };
    }
  }

  /**
   * Basic Dutch to English translation for common maintenance terms
   */
  private static translateToEnglish(dutch: string): string {
    const translations: Record<string, string> = {
      // Main categories
      'Onderhoud en Reparaties': 'Maintenance and Repairs',
      'Badkamer en Toilet': 'Bathroom and Toilet',
      'Keuken': 'Kitchen',
      'Verwarming en Ketel': 'Heating and Boiler',
      'Water en Lekken': 'Water and Leaks',
      'Deuren, Garages en Sloten': 'Doors, Garages and Locks',
      'Gemeenschappelijke ruimtes': 'Common Areas',
      'Elektriciteit': 'Electricity',

      // Bathroom issues
      'Lekkende kraan': 'Leaking tap',
      'Toilet spoelt niet door': 'Toilet not flushing',
      'Toiletbril kapot of los': 'Toilet seat broken or loose',
      'Brand': 'Fire',
      'Afvoer verstopt': 'Drain clogged',

      // Kitchen issues
      'Afzuigkap werkt niet': 'Extractor fan not working',
      'Koelkast maakt lawaai': 'Refrigerator making noise',
      'Kraan lekt': 'Tap leaking',

      // Heating issues
      'Geen warm water': 'No hot water',
      'Radiator wordt niet warm': 'Radiator not heating',
      'Ketel maakt geluid': 'Boiler making noise',

      // Water issues
      'Lekkage uit plafond': 'Ceiling leak',
      'Druppelende kraan': 'Dripping tap',
      'Lage waterdruk': 'Low water pressure',

      // Door issues
      'Deur sluit niet goed': 'Door not closing properly',
      'Slot werkt niet': 'Lock not working',
      'Garagedeur defect': 'Garage door broken',

      // Common areas
      'Lift': 'Elevator',
      'Lift storing (werkt helemaal niet)': 'Elevator outage (not working at all)',
      'Lift blijft hangen / persoon opgesloten': 'Elevator stuck / person trapped',
      'Liftdeur opent/sluit niet goed': 'Elevator door not opening/closing properly',
      'Lift maakt lawaai / rijdt schokkerig': 'Elevator noisy / jerky movement',
      'Portiekverlichting': 'Entrance lighting',
      'Trappenhuisdeur': 'Stairwell door',

      // Electrical issues
      'Geen stroom': 'No power',
      'Stopcontact werkt niet': 'Socket not working',
      'Lichtschakelaar defect': 'Light switch broken'
    };

    return translations[dutch] || dutch;
  }

  /**
   * Create a default maintenance tree for testing
   */
  static createDefaultTree(): DecisionTree {
    return {
      tree_id: 'maintenance',
      version: 1,
      title: {
        en: 'Maintenance and Repairs',
        nl: 'Onderhoud en Reparaties'
      },
      root_node_id: 'root',
      nodes: {
        'root': {
          node_id: 'root',
          type: 'branch',
          title: {
            en: 'Maintenance and Repairs',
            nl: 'Onderhoud en Reparaties'
          },
          children: ['bathroom']
        } as TreeNode,
        'bathroom': {
          node_id: 'bathroom',
          type: 'branch',
          title: {
            en: 'Bathroom and Toilet',
            nl: 'Badkamer en Toilet'
          },
          children: ['bathroom.tap_leak']
        } as TreeNode,
        'bathroom.tap_leak': {
          node_id: 'bathroom.tap_leak',
          type: 'leaf',
          title: {
            en: 'Leaking tap',
            nl: 'Lekkende kraan'
          },
          leaf_type: 'start_ticket',
          leaf_reason: 'standard_wizard'
        } as LeafNode
      }
    };
  }
}
