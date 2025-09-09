/**
 * Maintenance Wizard Navigator
 * 
 * Adapts the maintenance tree format to work with the existing wizard interface
 */

import { MaintenanceTreeEngine } from './MaintenanceTreeEngine';
import { MaintenanceNode, MenuNode, InfoNode, DecisionNode, LeafNode, TreeNode } from '@/types/decision-tree';
import { STEP2_QUESTIONS_CONFIG } from '@/types/custom-questions';

export class MaintenanceWizardNavigator {
  public state: any; // Compatibility property
  private engine: MaintenanceTreeEngine;
  private currentNode: MaintenanceNode;
  private history: string[];
  private sessionId: string;

  constructor(engine: MaintenanceTreeEngine, sessionId?: string) {
    this.engine = engine;
    this.sessionId = sessionId || this.generateSessionId();
    this.currentNode = engine.getRoot();
    this.history = [this.currentNode.id];
  }

  /**
   * Navigate to a child node by index
   */
  navigateToChild(childIndex: number): any {
    const newNode = this.engine.navigateToChild(this.currentNode, childIndex);
    this.currentNode = newNode;
    this.history.push(newNode.id);
    return this.getCurrentState();
  }

  /**
   * Navigate directly to a node by ID
   */
  navigateToNode(nodeId: string): any {
    const node = this.engine.findNodeById(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    
    this.currentNode = node;
    this.history.push(nodeId);
    return this.getCurrentState();
  }

  /**
   * Go back to previous node
   */
  goBack(): any | null {
    if (this.history.length <= 1) {
      return null;
    }
    
    this.history.pop();
    const previousNodeId = this.history[this.history.length - 1];
    const previousNode = this.engine.findNodeById(previousNodeId);
    
    if (!previousNode) {
      return null;
    }
    
    this.currentNode = previousNode;
    return this.getCurrentState();
  }

  /**
   * Get current state (adapted to legacy format)
   */
  getCurrentState(): any {
    return {
      current_node: this.adaptNodeToLegacyFormat(this.currentNode),
      path: this.engine.buildPath(this.currentNode.id),
      history: [...this.history]
    };
  }

  /**
   * Get available choices (adapted to legacy format)
   */
  getAvailableChoices(): Array<{ index: number; node: DecisionNode; title: string }> {
    if (this.currentNode.type === 'menu') {
      const menuNode = this.currentNode as MenuNode;
      return menuNode.options.map((option, index) => {
        // Handle both 'next' and 'code' properties
        const targetId = option.next || (option as any).code;
        const nextNode = targetId ? this.engine.findNodeById(targetId) : null;
        return {
          index,
          node: nextNode ? this.adaptNodeToLegacyFormat(nextNode) : this.createVirtualLeaf(option),
          title: option.label
        };
      });
    }
    
    if (this.currentNode.type === 'info' && this.currentNode.next) {
      const nextNode = this.engine.findNodeById(this.currentNode.next);
      if (nextNode) {
        return [{
          index: 0,
          node: this.adaptNodeToLegacyFormat(nextNode),
          title: 'Continue'
        }];
      }
    }
    
    return [];
  }

  /**
   * Get breadcrumbs
   */
  getBreadcrumbs(): Array<{ nodeId: string; title: string }> {
    const path = this.engine.buildPath(this.currentNode.id);
    return path.map(nodeId => {
      const node = this.engine.findNodeById(nodeId);
      return {
        nodeId,
        title: node ? this.engine.getNodeTitle(node) : 'Unknown'
      };
    });
  }

  /**
   * Search nodes
   */
  searchNodes(query: string, maxResults: number = 8): Array<{
    node: DecisionNode;
    path: string[];
    title: string;
    canNavigate: boolean;
  }> {
    const results = this.engine.searchNodes(query, maxResults);
    
    return results.map(result => ({
      node: this.adaptNodeToLegacyFormat(result.node),
      path: result.path,
      title: this.engine.getNodeTitle(result.node),
      canNavigate: true
    }));
  }

  /**
   * Check if should show missing option
   */
  shouldShowMissingOption(): boolean {
    return this.engine.shouldShowMissingOption(this.currentNode);
  }

  /**
   * Can go back
   */
  canGoBack(): boolean {
    return this.history.length > 1;
  }

  /**
   * Reset to root
   */
  reset(): any {
    this.currentNode = this.engine.getRoot();
    this.history = [this.currentNode.id];
    return this.getCurrentState();
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get tree metadata
   */
  getTreeMetadata(): { tree_id: string; version: number } | null {
    const meta = this.engine.getTreeMetadata();
    return {
      tree_id: meta.tree_id,
      version: parseFloat(meta.version) || 1
    };
  }

  /**
   * Adapt maintenance node to legacy decision node format
   */
  private adaptNodeToLegacyFormat(node: MaintenanceNode): DecisionNode {
    if (node.type === 'menu') {
      return {
        node_id: node.id,
        type: 'branch',
        title: node.title,
        children: (node as MenuNode).options.map(opt => opt.next)
      } as TreeNode;
    }
    
    if (node.type === 'info') {
      const infoNode = node as InfoNode;
      
      // Check if this is an emergency info node
      if (this.engine.isEmergencyInfo(node)) {
        return {
          node_id: node.id,
          type: 'leaf',
          title: node.title,
          leaf_type: 'end_no_ticket',
          leaf_reason: 'emergency'
        } as LeafNode;
      }
      
      // Regular info nodes act as branches if they have a next node
      if (infoNode.next) {
        return {
          node_id: node.id,
          type: 'branch',
          title: node.title,
          children: [infoNode.next]
        } as TreeNode;
      }
      
      // Info nodes without next are terminal
      return {
        node_id: node.id,
        type: 'leaf',
        title: node.title,
        leaf_type: 'end_no_ticket',
        leaf_reason: 'standard_wizard'
      } as LeafNode;
    }
    
    if (node.type === 'issue') {
      return {
        node_id: node.id,
        type: 'leaf',
        title: node.title,
        leaf_type: 'start_ticket',
        leaf_reason: 'standard_wizard'
      } as LeafNode;
    }
    
    throw new Error(`Unknown node type: ${(node as any).type}`);
  }

  /**
   * Create virtual leaf node for missing options
   */
  private createVirtualLeaf(option: any): LeafNode {
    const targetId = option.next || (option as any).code;
    if (STEP2_QUESTIONS_CONFIG[targetId]) {
      return {
        node_id: targetId,
        type: 'leaf',
        title: option.label,
        leaf_type: 'start_ticket',
        leaf_reason: 'standard_wizard'
      };
    }
    
    return {
      node_id: `${targetId}`,
      type: 'leaf',
      title: option.label,
      leaf_type: 'start_ticket',
      leaf_reason: 'standard_wizard'
    };
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle video outcome (not used in maintenance tree but needed for compatibility)
   */
  handleVideoOutcome(_didVideoResolve: boolean): any {
    // Not applicable for maintenance tree
    return this.getCurrentState();
  }

  /**
   * Start ticket flow (compatibility method)
   */
  startTicketFlow(): any {
    return this.getCurrentState();
  }

  /**
   * Update flow state (compatibility method)
   */
  updateFlowState(_newFlowState: string, _flowData?: any): any {
    return this.getCurrentState();
  }

  /**
   * Serialize state (compatibility method)
   */
  serialize(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      currentNodeId: this.currentNode.id,
      history: this.history
    });
  }

  /**
   * Update state (compatibility method)
   */
  updateState(_newNode: any): any {
    return this.getCurrentState();
  }
}
