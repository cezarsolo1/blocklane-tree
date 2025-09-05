/**
 * Maintenance Tree Engine
 * 
 * Handles the Dutch maintenance tree format with menu, info, and issue nodes
 */

import { MaintenanceTree, MaintenanceNode, MenuNode, InfoNode, IssueNode } from '@/types/decision-tree';

export class MaintenanceTreeEngine {
  private tree: MaintenanceTree;
  private nodeMap: Map<string, MaintenanceNode>;

  constructor(treeData: MaintenanceTree) {
    this.tree = treeData;
    this.nodeMap = new Map();
    
    // Build node lookup map
    this.tree.nodes.forEach(node => {
      this.nodeMap.set(node.id, node);
    });
  }

  /**
   * Get the root/entry node
   */
  getRoot(): MaintenanceNode {
    const rootNode = this.nodeMap.get(this.tree.entry);
    if (!rootNode) {
      throw new Error(`Root node not found: ${this.tree.entry}`);
    }
    return rootNode;
  }

  /**
   * Find node by ID
   */
  findNodeById(nodeId: string): MaintenanceNode | null {
    return this.nodeMap.get(nodeId) || null;
  }

  /**
   * Get children/options for a node
   */
  getChildren(node: MaintenanceNode): MaintenanceNode[] {
    if (node.type === 'menu') {
      const menuNode = node as MenuNode;
      return menuNode.options
        .map(option => this.findNodeById(option.next))
        .filter((child): child is MaintenanceNode => child !== null);
    }
    
    if (node.type === 'info' && node.next) {
      const nextNode = this.findNodeById(node.next);
      return nextNode ? [nextNode] : [];
    }
    
    return []; // Issue nodes have no children
  }

  /**
   * Navigate to child by option index
   */
  navigateToChild(node: MaintenanceNode, childIndex: number): MaintenanceNode {
    if (node.type === 'menu') {
      const menuNode = node as MenuNode;
      const option = menuNode.options[childIndex];
      if (!option) {
        throw new Error(`Invalid child index: ${childIndex}`);
      }
      
      const nextNode = this.findNodeById(option.next);
      if (!nextNode) {
        throw new Error(`Next node not found: ${option.next}`);
      }
      
      return nextNode;
    }
    
    if (node.type === 'info' && node.next && childIndex === 0) {
      const nextNode = this.findNodeById(node.next);
      if (!nextNode) {
        throw new Error(`Next node not found: ${node.next}`);
      }
      return nextNode;
    }
    
    throw new Error('Cannot navigate from this node type');
  }

  /**
   * Build path from root to a specific node
   */
  buildPath(nodeId: string): string[] {
    const visited = new Set<string>();
    const path: string[] = [];
    
    const findPath = (currentId: string, targetId: string, currentPath: string[]): boolean => {
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      
      const newPath = [...currentPath, currentId];
      
      if (currentId === targetId) {
        path.push(...newPath);
        return true;
      }
      
      const node = this.findNodeById(currentId);
      if (!node) return false;
      
      const children = this.getChildren(node);
      for (const child of children) {
        if (findPath(child.id, targetId, newPath)) {
          return true;
        }
      }
      
      return false;
    };
    
    findPath(this.tree.entry, nodeId, []);
    return path;
  }

  /**
   * Search nodes by query
   */
  searchNodes(query: string, maxResults: number = 8): Array<{
    node: MaintenanceNode;
    path: string[];
    score: number;
  }> {
    const results: Array<{ node: MaintenanceNode; path: string[]; score: number }> = [];
    const queryLower = query.toLowerCase();
    
    for (const node of this.tree.nodes) {
      let score = 0;
      
      // Search in title
      if (node.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Search in menu options
      if (node.type === 'menu') {
        const menuNode = node as MenuNode;
        for (const option of menuNode.options) {
          if (option.label.toLowerCase().includes(queryLower)) {
            score += 8;
          }
          
          // Search in aliases
          if (option.aliases) {
            for (const alias of option.aliases) {
              if (alias.toLowerCase().includes(queryLower)) {
                score += 6;
              }
            }
          }
        }
      }
      
      // Search in info body
      if (node.type === 'info') {
        const infoNode = node as InfoNode;
        if (infoNode.body.toLowerCase().includes(queryLower)) {
          score += 5;
        }
      }
      
      // Search in issue fields
      if (node.type === 'issue') {
        const issueNode = node as IssueNode;
        for (const field of issueNode.fields) {
          if (field.label.toLowerCase().includes(queryLower)) {
            score += 7;
          }
          
          if (field.options) {
            for (const option of field.options) {
              if (option.toLowerCase().includes(queryLower)) {
                score += 5;
              }
            }
          }
        }
      }
      
      if (score > 0) {
        results.push({
          node,
          path: this.buildPath(node.id),
          score
        });
      }
    }
    
    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * Get node title
   */
  getNodeTitle(node: MaintenanceNode): string {
    return node.title;
  }

  /**
   * Check if node should show "missing option" button
   */
  shouldShowMissingOption(node: MaintenanceNode): boolean {
    return node.type === 'menu';
  }

  /**
   * Get tree metadata
   */
  getTreeMetadata(): { tree_id: string; version: string } {
    return {
      tree_id: 'keij-stefels-maintenance',
      version: this.tree.version
    };
  }

  /**
   * Check if node is an issue (terminal) node
   */
  isIssueNode(node: MaintenanceNode): boolean {
    return node.type === 'issue';
  }

  /**
   * Check if node is an info node
   */
  isInfoNode(node: MaintenanceNode): boolean {
    return node.type === 'info';
  }

  /**
   * Check if node is a menu node
   */
  isMenuNode(node: MaintenanceNode): boolean {
    return node.type === 'menu';
  }

  /**
   * Get emergency check node (first node in tree)
   */
  getEmergencyCheck(): MaintenanceNode {
    return this.getRoot();
  }

  /**
   * Check if this is an emergency info node
   */
  isEmergencyInfo(node: MaintenanceNode): boolean {
    return node.type === 'info' && node.id.startsWith('info.emerg_');
  }
}
