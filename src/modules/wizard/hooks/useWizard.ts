/**
 * useWizard Hook
 * 
 * Manages wizard state and integrates with the decision tree engine.
 * Based on spec section 1.3 - State machine.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DecisionTreeEngine } from '@/modules/decision-tree/engine';
import { DecisionTree, DecisionNode, WizardState } from '@/types/decision-tree';
import { createTicketService } from '@/modules/tickets/TicketServiceFactory';

interface UseWizardProps {
  tree: DecisionTree;
}

interface UseWizardReturn {
  state: WizardState;
  engine: DecisionTreeEngine;
  ticketService: any;
  currentTicketId?: string;
  navigateToPath: (path: string[]) => void;
  selectNode: (node: DecisionNode) => void;
  handleVideoOutcome: (outcome: 'yes' | 'no') => void;
  handleLeafContinue: () => void;
  goBack: () => void;
  handleMyOptionMissing: () => void;
  breadcrumbs: Array<{ label: string; path: string[] }>;
  // New flow methods
  handleDescribeMediaSubmit: (data: { description: string; photos: File[] }) => void;
  handleContactQuestionsSubmit: (data: { contact: any; answers: any }) => void;
  handleReviewSubmit: () => void;
  handleNewTicket: () => void;
}

export const useWizard = ({ tree }: UseWizardProps): UseWizardReturn => {
  // Initialize engine and ticket service
  const engine = useMemo(() => new DecisionTreeEngine(tree), [tree]);
  const ticketService = useMemo(() => createTicketService(), []);
  
  // Initialize state
  const [state, setState] = useState<WizardState>(() => engine.createInitialState());
  const [currentTicketId, setCurrentTicketId] = useState<string | undefined>();

  // Navigation handlers
  const navigateToPath = useCallback((path: string[]) => {
    const node = engine.getNodeByPath(path);
    if (node) {
      setState(prev => ({
        ...prev,
        current_node: node,
        path,
        selected_choice: undefined
      }));
    }
  }, [engine]);

  const selectNode = useCallback((node: DecisionNode) => {
    if (node.type === 'branch') {
      // For branch nodes, navigate to them
      const newPath = [...state.path, node.node_id];
      const newNode = engine.getNodeByPath(newPath);
      if (newNode) {
        setState(prev => ({
          ...prev,
          current_node: newNode,
          path: newPath,
          selected_choice: node.node_id
        }));
      }
    } else if (node.type === 'leaf' || node.type === 'video_check') {
      // For leaf/video_check nodes, navigate to them
      const newPath = [...state.path, node.node_id];
      setState(prev => ({
        ...prev,
        current_node: node,
        path: newPath,
        selected_choice: node.node_id
      }));
    }
  }, [state.path, engine]);

  const handleVideoOutcome = useCallback((outcome: 'yes' | 'no') => {
    if (state.current_node.type !== 'video_check') return;

    const result = engine.handleVideoOutcome(state.current_node, outcome);
    
    // Create a virtual leaf node for the outcome
    const virtualLeaf: DecisionNode = {
      node_id: `${state.current_node.node_id}-${outcome}`,
      type: 'leaf',
      title: {
        en: outcome === 'yes' ? 'Problem Resolved' : 'Problem Not Resolved',
        nl: outcome === 'yes' ? 'Probleem Opgelost' : 'Probleem Niet Opgelost'
      },
      leaf_type: result.leaf_type as any,
      leaf_reason: result.leaf_reason as any,
      required_fields: result.required_fields,
      flow: result.flow,
      question_groups: result.question_groups
    };

    setState(prev => ({
      ...prev,
      current_node: virtualLeaf,
      path: [...prev.path, virtualLeaf.node_id],
      selected_choice: virtualLeaf.node_id
    }));
  }, [state.current_node, engine]);

  const handleLeafContinue = useCallback(() => {
    if (state.current_node.type !== 'leaf') return;

    if (state.current_node.leaf_type === 'start_ticket' && state.current_node.flow) {
      // Start the flow
      setState(prev => ({
        ...prev,
        flow_state: 'describe_media',
        flow_data: {}
      }));
    } else if (state.current_node.leaf_type === 'end_no_ticket') {
      // End the wizard
      console.log('Wizard completed - no ticket needed');
    }
  }, [state.current_node]);

  const goBack = useCallback(() => {
    if (state.path.length === 0) return;

    const newState = engine.updateState(state, 'back');
    setState(newState);
  }, [state, engine]);

  const handleMyOptionMissing = useCallback(() => {
    // Navigate to a terminal leaf with end_no_ticket / other_non_ticket
    const virtualLeaf: DecisionNode = {
      node_id: 'option-missing-terminal',
      type: 'leaf',
      title: {
        en: 'Option Not Listed',
        nl: 'Optie Niet Vermeld'
      },
      leaf_type: 'start_ticket',
      leaf_reason: 'option_missing'
    };

    setState(prev => ({
      ...prev,
      current_node: virtualLeaf,
      path: [...prev.path, virtualLeaf.node_id],
      selected_choice: virtualLeaf.node_id
    }));
  }, []);

  // New flow methods
  const handleDescribeMediaSubmit = useCallback(async (data: { description: string; photos: File[] }) => {
    if (!currentTicketId) return;

    await ticketService.update(currentTicketId, {
      description: data.description,
      photos: data.photos
    });

    // Move to next step
    setState(prev => ({
      ...prev,
      flow_state: 'contact_questions',
      flow_data: {
        ...prev.flow_data,
        description: data.description,
        photos: data.photos
      }
    }));
  }, [currentTicketId, ticketService]);

  const handleContactQuestionsSubmit = useCallback(async (data: { contact: any; answers: any }) => {
    if (!currentTicketId) return;

    await ticketService.update(currentTicketId, {
      contact: data.contact,
      answers: data.answers
    });

    // Move to review step
    setState(prev => ({
      ...prev,
      flow_state: 'review',
      flow_data: {
        ...prev.flow_data,
        contact: data.contact,
        answers: data.answers
      }
    }));
  }, [currentTicketId, ticketService]);

  const handleReviewSubmit = useCallback(async () => {
    if (!currentTicketId) return;

    await ticketService.finalize(currentTicketId);

    // Move to submitted step
    setState(prev => ({
      ...prev,
      flow_state: 'submitted'
    }));
  }, [currentTicketId, ticketService]);

  const handleNewTicket = useCallback(() => {
    // Reset to initial state
    setState(engine.createInitialState());
    setCurrentTicketId(undefined);
  }, [engine]);

  // Get breadcrumbs
  const breadcrumbs = useMemo(() => {
    return engine.getBreadcrumbs(state.path);
  }, [engine, state.path]);

  // Handle draft creation when reaching start_ticket terminal
  useEffect(() => {
    if (state.current_node.type === 'leaf' && 
        state.current_node.leaf_type === 'start_ticket' && 
        !currentTicketId) {
      
      // Create draft ticket
      ticketService.createDraft({
        sessionId: `session-${Date.now()}`,
        tree: {
          id: tree.tree_id,
          version: tree.version,
          node_id: state.current_node.node_id,
          leaf_type: state.current_node.leaf_type,
          leaf_reason: state.current_node.leaf_reason
        }
      }).then(result => {
        setCurrentTicketId(result.ticket_id);
      });
    }
  }, [state.current_node, currentTicketId, ticketService, tree]);

  return {
    state,
    engine,
    ticketService,
    currentTicketId,
    navigateToPath,
    selectNode,
    handleVideoOutcome,
    handleLeafContinue,
    goBack,
    handleMyOptionMissing,
    breadcrumbs,
    handleDescribeMediaSubmit,
    handleContactQuestionsSubmit,
    handleReviewSubmit,
    handleNewTicket
  };
};
