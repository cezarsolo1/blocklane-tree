/**
 * Decision Tree Engine
 * 
 * Pure engine for loading and navigating decision trees.
 * Based on spec section 2.3 - JSON schema and navigation rules.
 */

import { DecisionTree, DecisionNode, TreeNode, VideoCheckNode, LeafNode, LangCode } from '@/types/decision-tree';

export class DecisionTreeEngine {
  private tree: DecisionTree | null = null;
  private language: LangCode = 'en';

  constructor(language: LangCode = 'en') {
    this.language = language;
  }

  /**
   * Load a decision tree from JSON
   */
  loadTree(treeData: DecisionTree): void {
    this.validateTree(treeData);
    this.tree = treeData;
  }

  /**
   * Get the root node to start navigation
   */
  getRoot(): DecisionNode {
    if (!this.tree) {
      throw new Error('No tree loaded');
    }
    const rootNode = this.tree.nodes[this.tree.root_node_id];
    if (!rootNode) {
      throw new Error('Root node not found');
    }
    return rootNode;
  }

  /**
   * Navigate to a child node by index
   */
  navigateToChild(currentNode: DecisionNode, childIndex: number): DecisionNode {
    if (currentNode.type !== 'branch') {
      throw new Error('Cannot navigate from non-branch node');
    }

    const branchNode = currentNode as TreeNode;
    if (childIndex < 0 || childIndex >= branchNode.children.length) {
      throw new Error('Invalid child index');
    }

    const childId = branchNode.children[childIndex];
    const childNode = this.tree!.nodes[childId];
    if (!childNode) {
      throw new Error(`Child node not found: ${childId}`);
    }
    return childNode;
  }

  /**
   * Find a node by its node_id (for direct navigation)
   */
  findNodeById(nodeId: string): DecisionNode | null {
    if (!this.tree) {
      return null;
    }
    return this.tree.nodes[nodeId] || null;
  }


  /**
   * Get localized title for a node
   */
  getNodeTitle(node: DecisionNode): string {
    if (typeof node.title === 'string') {
      return node.title;
    }
    return node.title[this.language] || node.title.en || 'Untitled';
  }

  /**
   * Check if a node is a leaf (end of navigation)
   */
  isLeaf(node: DecisionNode): boolean {
    return node.type === 'leaf';
  }

  /**
   * Check if a node is a video check
   */
  isVideoCheck(node: DecisionNode): boolean {
    return node.type === 'video_check';
  }

  /**
   * Check if a node is a branch (has children)
   */
  isBranch(node: DecisionNode): boolean {
    return node.type === 'branch';
  }

  /**
   * Get children of a branch node
   */
  getChildren(node: DecisionNode): DecisionNode[] {
    if (node.type !== 'branch') {
      return [];
    }
    const branchNode = node as TreeNode;
    return branchNode.children.map(childId => {
      const childNode = this.tree!.nodes[childId];
      if (!childNode) {
        throw new Error(`Child node not found: ${childId}`);
      }
      return childNode;
    });
  }

  /**
   * Handle video check outcome
   */
  handleVideoOutcome(node: VideoCheckNode, didVideoResolve: boolean): { leaf_type: string; leaf_reason: string; required_fields?: string[]; flow?: string[]; question_groups?: string[] } {
    const outcome = didVideoResolve ? node.outcomes.yes : node.outcomes.no;
    return outcome;
  }

  /**
   * Search nodes by title (for "My option is missing" feature)
   */
  searchNodes(query: string, maxResults: number = 8): Array<{ node: DecisionNode; path: string[] }> {
    if (!this.tree || !query.trim()) {
      return [];
    }

    const results: Array<{ node: DecisionNode; path: string[] }> = [];
    const searchTerm = query.toLowerCase().trim();

    // Search through all nodes in the flat structure
    for (const [nodeId, node] of Object.entries(this.tree.nodes)) {
      if (results.length >= maxResults) break;
      
      const title = this.getNodeTitle(node).toLowerCase();
      if (title.includes(searchTerm)) {
        const path = this.buildPath(nodeId);
        results.push({ node, path });
      }
    }

    // Sort by relevance (exact match first, then contains)
    return results.sort((a, b) => {
      const titleA = this.getNodeTitle(a.node).toLowerCase();
      const titleB = this.getNodeTitle(b.node).toLowerCase();

      const exactMatchA = titleA === searchTerm ? 1 : 0;
      const exactMatchB = titleB === searchTerm ? 1 : 0;

      if (exactMatchA !== exactMatchB) {
        return exactMatchB - exactMatchA;
      }

      const startsWithA = titleA.startsWith(searchTerm) ? 1 : 0;
      const startsWithB = titleB.startsWith(searchTerm) ? 1 : 0;

      if (startsWithA !== startsWithB) {
        return startsWithB - startsWithA;
      }

      return titleA.localeCompare(titleB);
    });
  }


  /**
   * Build breadcrumb path from root to current node
   */
  buildPath(nodeId: string): string[] {
    if (!this.tree) {
      return [];
    }

    const path: string[] = [];
    const rootNode = this.tree.nodes[this.tree.root_node_id];
    if (rootNode) {
      this.buildPathRecursive(rootNode, nodeId, path);
    }
    return path;
  }

  private buildPathRecursive(node: DecisionNode, targetId: string, currentPath: string[]): boolean {
    currentPath.push(node.node_id);

    if (node.node_id === targetId) {
      return true;
    }

    if (node.type === 'branch') {
      const branchNode = node as TreeNode;
      for (const childId of branchNode.children) {
        const childNode = this.tree!.nodes[childId];
        if (childNode && this.buildPathRecursive(childNode, targetId, currentPath)) {
          return true;
        }
      }
    }

    currentPath.pop();
    return false;
  }

  /**
   * Check if "My option is missing" should be shown
   * Show when current node has at least one leaf child
   */
  shouldShowMissingOption(node: DecisionNode): boolean {
    if (node.type !== 'branch') {
      return false;
    }

    const branchNode = node as TreeNode;
    return branchNode.children.some(childId => {
      const childNode = this.tree!.nodes[childId];
      return childNode && childNode.type === 'leaf';
    });
  }

  /**
   * Get tree metadata
   */
  getTreeMetadata(): { tree_id: string; version: number } | null {
    if (!this.tree) {
      return null;
    }
    return {
      tree_id: this.tree.tree_id,
      version: this.tree.version
    };
  }

  /**
   * Validate tree structure
   */
  private validateTree(tree: DecisionTree): void {
    if (!tree.tree_id || !tree.version || !tree.root_node_id || !tree.nodes) {
      throw new Error('Invalid tree structure: missing required fields');
    }

    const rootNode = tree.nodes[tree.root_node_id];
    if (!rootNode) {
      throw new Error('Root node not found');
    }

    // Validate all nodes
    for (const node of Object.values(tree.nodes)) {
      this.validateNode(node, tree);
    }
  }

  private validateNode(node: DecisionNode, tree: DecisionTree): void {
    if (!node.node_id || !node.type || !node.title) {
      throw new Error(`Invalid node structure: ${node.node_id}`);
    }

    if (typeof node.title !== 'string' && !node.title.en) {
      throw new Error(`Node ${node.node_id} missing English title`);
    }

    switch (node.type) {
      case 'branch':
        const branchNode = node as TreeNode;
        if (!branchNode.children || branchNode.children.length === 0) {
          throw new Error(`Branch node has no children: ${node.node_id}`);
        }
        // Validate that all child IDs exist in the tree
        branchNode.children.forEach(childId => {
          if (!tree.nodes[childId]) {
            throw new Error(`Child node not found: ${childId}`);
          }
        });
        break;

      case 'video_check':
        const videoNode = node as VideoCheckNode;
        if (!videoNode.video_url || !videoNode.outcomes) {
          throw new Error(`Video check node missing required fields: ${node.node_id}`);
        }
        break;

      case 'leaf':
        const leafNode = node as LeafNode;
        if (!leafNode.leaf_type || !leafNode.leaf_reason) {
          throw new Error(`Leaf node missing required fields: ${node.node_id}`);
        }
        break;

      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  /**
   * Change language
   */
  setLanguage(language: LangCode): void {
    this.language = language;
  }

  /**
   * Get current language
   */
  getLanguage(): LangCode {
    return this.language;
  }
}
