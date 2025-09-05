/**
 * DecisionTree Engine (pure)
 * 
 * Loads JSON, traverses nodes, enforces rules (e.g., "My option is missing").
 * Based on spec section 1.2 - Modules to keep modular
 */

import { 
  DecisionNode, 
  VideoCheckNode, 
  DecisionTree,
  WizardState,
  LangCode 
} from '@/types/decision-tree';

export class DecisionTreeEngine {
  private tree: DecisionTree;

  constructor(tree: DecisionTree) {
    this.tree = tree;
  }

  /**
   * Get the current node from a path
   */
  getNodeByPath(path: string[]): DecisionNode | null {
    let currentNodeId = this.tree.root_node_id;

    if (!Array.isArray(path) || path.length === 0) {
      return this.tree.nodes[currentNodeId] || null;
    }

    for (const nodeId of path) {
      const currentNode = this.tree.nodes[currentNodeId];
      if (!currentNode || currentNode.type === 'leaf' || currentNode.type === 'video_check') {
        return null; // can't go deeper from a leaf or video_check
      }

      // Check if nodeId is in children
      if (currentNode.type === 'branch' && currentNode.children.includes(nodeId)) {
        currentNodeId = nodeId;
      } else {
        return null;
      }
    }

    return this.tree.nodes[currentNodeId] || null;
  }

  /**
   * Get the parent path of a given path
   */
  getParentPath(path: string[]): string[] {
    return path.slice(0, -1);
  }

  /**
   * Get breadcrumbs for a path
   */
  getBreadcrumbs(path: string[], lang: LangCode = 'en'): Array<{ label: string; path: string[] }> {
    const breadcrumbs: Array<{ label: string; path: string[] }> = [{ label: 'Start', path: [] }];
    
    let currentPath: string[] = [];
    for (const segment of path) {
      currentPath = [...currentPath, segment];
      const node = this.getNodeByPath(currentPath);
      if (node) {
        breadcrumbs.push({
          label: typeof node.title === 'string' ? node.title : node.title[lang] || node.title.en,
          path: [...currentPath]
        });
      }
    }
    
    return breadcrumbs;
  }

  /**
   * Check if a node has leaf children (for "My option is missing" button)
   * Based on spec section 2.5
   */
  hasLeafChildren(node: DecisionNode | null): boolean {
    if (!node || node.type === 'leaf' || node.type === 'video_check') {
      return false;
    }

    return node.children.some(childId => {
      const child = this.tree.nodes[childId];
      return child && child.type === 'leaf';
    });
  }

  /**
   * Navigate to a child node
   */
  navigateToChild(currentPath: string[], childId: string): string[] | null {
    const currentNode = this.getNodeByPath(currentPath);
    if (!currentNode || currentNode.type === 'leaf' || currentNode.type === 'video_check') {
      return null;
    }

    if (!currentNode.children.includes(childId)) {
      return null;
    }

    return [...currentPath, childId];
  }

  /**
   * Navigate back (removes last segment)
   */
  navigateBack(path: string[]): string[] {
    return this.getParentPath(path);
  }

  /**
   * Get available choices for current node
   */
  getChoices(node: DecisionNode): Array<{ id: string; title: string; type: string }> {
    if (node.type === 'leaf' || node.type === 'video_check') {
      return [];
    }

    return node.children.map(childId => {
      const child = this.tree.nodes[childId];
      if (!child) return null;
      return {
        id: child.node_id,
        title: typeof child.title === 'string' ? child.title : child.title.en,
        type: child.type
      };
    }).filter(Boolean) as Array<{ id: string; title: string; type: string }>;
  }

  /**
   * Handle video check outcome
   */
  handleVideoOutcome(node: VideoCheckNode | null, outcome: 'yes' | 'no'): {
    leaf_type: string;
    leaf_reason: string;
    required_fields?: string[];
    flow?: string[];
    question_groups?: string[];
  } {
    if (!node || node.type !== 'video_check') {
      throw new Error('Invalid video check node');
    }
    return node.outcomes[outcome];
  }

  /**
   * Search nodes by title (simple substring match for v1)
   * Based on spec section 1.2 - Lookup/Search (SAVE FOR LATER)
   */
  searchNodes(query: string, lang: LangCode = 'en'): Array<{
    node_id: string;
    title: string;
    path: string[];
    leaf_type?: string;
    leaf_reason?: string;
  }> {
    const results: Array<{
      node_id: string;
      title: string;
      path: string[];
      leaf_type?: string;
      leaf_reason?: string;
    }> = [];

    const searchRecursive = (node: DecisionNode, path: string[]) => {
      const title = typeof node.title === 'string' ? node.title : node.title[lang] || node.title.en;
      if (title.toLowerCase().includes(query.toLowerCase())) {
        const result: any = {
          node_id: node.node_id,
          title,
          path: [...path]
        };

        if (node.type === 'leaf') {
          result.leaf_type = node.leaf_type;
          result.leaf_reason = node.leaf_reason;
        }

        results.push(result);
      }

      if (node.type === 'branch') {
        node.children.forEach(childId => {
          const child = this.tree.nodes[childId];
          if (child) {
            searchRecursive(child, [...path, child.node_id]);
          }
        });
      }
    };

    const rootNode = this.tree.nodes[this.tree.root_node_id];
    if (rootNode) {
      searchRecursive(rootNode, []);
    }
    return results.slice(0, 8); // Cap results to 8 as per spec
  }

  /**
   * Create initial wizard state
   */
  createInitialState(): WizardState {
    const rootNode = this.tree.nodes[this.tree.root_node_id];
    if (!rootNode) {
      throw new Error('Root node not found in tree');
    }
    
    return {
      current_node: rootNode,
      path: [],
      history: [],
      selected_choice: undefined
    };
  }

  /**
   * Update wizard state based on navigation
   */
  updateState(currentState: WizardState, action: 'forward' | 'back' | 'select', choiceId?: string): WizardState {
    const { current_node, path, history } = currentState;

    switch (action) {
      case 'forward':
        if (!choiceId) return currentState;
        
        const newPath = this.navigateToChild(path, choiceId);
        if (!newPath) return currentState;

        const newNode = this.getNodeByPath(newPath);
        if (!newNode) return currentState;

        return {
          current_node: newNode,
          path: newPath,
          history: [...history, current_node.node_id],
          selected_choice: choiceId
        };

      case 'back':
        const parentPath = this.navigateBack(path);
        const parentNode = this.getNodeByPath(parentPath);
        if (!parentNode) return currentState;

        return {
          current_node: parentNode,
          path: parentPath,
          history: history.slice(0, -1),
          selected_choice: undefined // Back always clears selection (idempotent)
        };

      case 'select':
        return {
          ...currentState,
          selected_choice: choiceId
        };

      default:
        return currentState;
    }
  }

  /**
   * Get next node when a choice is made
   */
  nextNode(currentPath: string[], choiceId: string): DecisionNode | null {
    const newPath = this.navigateToChild(currentPath, choiceId);
    if (!newPath) return null;
    
    return this.getNodeByPath(newPath);
  }
}
