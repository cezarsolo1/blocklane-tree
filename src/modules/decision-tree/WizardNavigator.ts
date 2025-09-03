/**
 * Wizard Navigator
 * 
 * Manages wizard state and navigation flow.
 * Handles history, breadcrumbs, and flow transitions.
 */

import { DecisionTreeEngine } from './DecisionTreeEngine';
import { DecisionNode, WizardState, LeafNode, VideoCheckNode } from '@/types/decision-tree';

export class WizardNavigator {
  private engine: DecisionTreeEngine;
  private state: WizardState;
  private sessionId: string;

  constructor(engine: DecisionTreeEngine, sessionId?: string) {
    this.engine = engine;
    this.sessionId = sessionId || this.generateSessionId();
    
    // Initialize state with root node
    const rootNode = engine.getRoot();
    this.state = {
      current_node: rootNode,
      path: [rootNode.node_id],
      history: [rootNode.node_id],
    };
  }

  /**
   * Navigate to a child node by index
   */
  navigateToChild(childIndex: number): WizardState {
    const newNode = this.engine.navigateToChild(this.state.current_node, childIndex);
    return this.updateState(newNode);
  }

  /**
   * Navigate directly to a node by ID (for search results)
   */
  navigateToNode(nodeId: string): WizardState {
    const node = this.engine.findNodeById(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    // Build new path from root to this node
    const newPath = this.engine.buildPath(nodeId);
    
    this.state = {
      ...this.state,
      current_node: node,
      path: newPath,
      history: [...this.state.history, nodeId]
    };

    return this.state;
  }

  /**
   * Go back to previous node in history
   */
  goBack(): WizardState | null {
    if (this.state.history.length <= 1) {
      return null; // Can't go back from root
    }

    // Special handling for video resolved pages - go back to the original video check node
    if (this.state.current_node.type === 'leaf') {
      const leafNode = this.state.current_node as LeafNode;
      if (leafNode.leaf_reason === 'video_resolved' && leafNode._videoCheckNodeId) {
        const videoCheckNode = this.engine.findNodeById(leafNode._videoCheckNodeId);
        if (videoCheckNode) {
          const newPath = this.engine.buildPath(leafNode._videoCheckNodeId);
          
          this.state = {
            ...this.state,
            current_node: videoCheckNode,
            path: newPath,
            // Keep history unchanged - we're going back to the video check node that's already in history
          };

          return this.state;
        }
      }
    }

    // Standard back navigation for other nodes
    // Remove current node from history
    const newHistory = [...this.state.history];
    newHistory.pop();

    // Get previous node
    const previousNodeId = newHistory[newHistory.length - 1];
    const previousNode = this.engine.findNodeById(previousNodeId);
    
    if (!previousNode) {
      return null;
    }

    // Build path to previous node
    const newPath = this.engine.buildPath(previousNodeId);

    this.state = {
      ...this.state,
      current_node: previousNode,
      path: newPath,
      history: newHistory
    };

    return this.state;
  }

  /**
   * Handle video check outcome
   */
  handleVideoOutcome(didVideoResolve: boolean): WizardState {
    if (!this.engine.isVideoCheck(this.state.current_node)) {
      throw new Error('Current node is not a video check');
    }

    const videoNode = this.state.current_node as VideoCheckNode;
    const outcome = this.engine.handleVideoOutcome(videoNode, didVideoResolve);

    // Create a virtual leaf node from the outcome
    const virtualLeaf: LeafNode = {
      node_id: `${videoNode.node_id}_${didVideoResolve ? 'yes' : 'no'}`,
      type: 'leaf',
      title: {
        en: didVideoResolve ? 'Issue resolved by video' : 'Video did not resolve issue',
        nl: didVideoResolve ? 'Probleem opgelost door video' : 'Video heeft probleem niet opgelost'
      },
      leaf_type: outcome.leaf_type as any,
      leaf_reason: outcome.leaf_reason as any,
      required_fields: outcome.required_fields,
      flow: outcome.flow,
      question_groups: outcome.question_groups,
      // Store reference to the original video check node for back navigation
      _videoCheckNodeId: videoNode.node_id
    };

    // Update state manually to avoid adding virtual leaf to history
    const newPath = this.engine.buildPath(videoNode.node_id);
    newPath.push(virtualLeaf.node_id);
    
    this.state = {
      ...this.state,
      current_node: virtualLeaf,
      path: newPath,
      // Don't add virtual leaf to history - keep video check node as the last real node
    };

    return this.state;
  }

  /**
   * Start ticket creation flow
   */
  startTicketFlow(): WizardState {
    if (!this.engine.isLeaf(this.state.current_node)) {
      throw new Error('Can only start ticket flow from leaf node');
    }

    const leafNode = this.state.current_node as LeafNode;
    if (leafNode.leaf_type !== 'start_ticket') {
      throw new Error('Leaf node does not start a ticket');
    }

    this.state = {
      ...this.state,
      flow_state: 'describe_media',
      flow_data: {}
    };

    return this.state;
  }

  /**
   * Update flow state (for ticket creation steps)
   */
  updateFlowState(
    newFlowState: 'describe_media' | 'contact_questions' | 'review' | 'submitted',
    flowData?: any
  ): WizardState {
    this.state = {
      ...this.state,
      flow_state: newFlowState,
      flow_data: { ...this.state.flow_data, ...flowData }
    };

    return this.state;
  }

  /**
   * Search nodes and return results with navigation info
   */
  searchNodes(query: string, maxResults: number = 8): Array<{
    node: DecisionNode;
    path: string[];
    title: string;
    canNavigate: boolean;
  }> {
    const results = this.engine.searchNodes(query, maxResults);
    
    return results.map(result => ({
      node: result.node,
      path: result.path,
      title: this.engine.getNodeTitle(result.node),
      canNavigate: true
    }));
  }

  /**
   * Get current state
   */
  getCurrentState(): WizardState {
    return { ...this.state };
  }

  /**
   * Get breadcrumb path with titles
   */
  getBreadcrumbs(): Array<{ nodeId: string; title: string }> {
    return this.state.path.map(nodeId => {
      const node = this.engine.findNodeById(nodeId);
      return {
        nodeId,
        title: node ? this.engine.getNodeTitle(node) : 'Unknown'
      };
    });
  }

  /**
   * Check if current node should show "My option is missing" button
   */
  shouldShowMissingOption(): boolean {
    return this.engine.shouldShowMissingOption(this.state.current_node);
  }

  /**
   * Get available children for current node
   */
  getAvailableChoices(): Array<{ index: number; node: DecisionNode; title: string }> {
    const children = this.engine.getChildren(this.state.current_node);
    return children.map((child, index) => ({
      index,
      node: child,
      title: this.engine.getNodeTitle(child)
    }));
  }

  /**
   * Check if we can go back
   */
  canGoBack(): boolean {
    return this.state.history.length > 1;
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
    return this.engine.getTreeMetadata();
  }

  /**
   * Reset to root node
   */
  reset(): WizardState {
    const rootNode = this.engine.getRoot();
    this.state = {
      current_node: rootNode,
      path: [rootNode.node_id],
      history: [rootNode.node_id],
    };
    return this.state;
  }

  /**
   * Update state with new node
   */
  private updateState(newNode: DecisionNode): WizardState {
    const newPath = this.engine.buildPath(newNode.node_id);
    
    this.state = {
      ...this.state,
      current_node: newNode,
      path: newPath,
      history: [...this.state.history, newNode.node_id]
    };

    return this.state;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Serialize state for persistence
   */
  serialize(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      state: this.state,
      treeMetadata: this.engine.getTreeMetadata()
    });
  }

  /**
   * Restore state from serialized data
   */
  static restore(
    serializedData: string, 
    engine: DecisionTreeEngine
  ): WizardNavigator {
    const data = JSON.parse(serializedData);
    const navigator = new WizardNavigator(engine, data.sessionId);
    
    // Restore state, but validate nodes still exist
    const currentNode = engine.findNodeById(data.state.current_node.node_id);
    if (currentNode) {
      navigator.state = {
        ...data.state,
        current_node: currentNode
      };
    }
    
    return navigator;
  }
}
