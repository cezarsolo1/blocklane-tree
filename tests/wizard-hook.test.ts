import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizard } from '@/modules/wizard/hooks/useWizard';
import { DecisionTree } from '@/types/decision-tree';

// Mock tree for testing
const mockTree: DecisionTree = {
  tree_id: 'test-tree',
  version: 1,
  root: {
    node_id: 'root',
    type: 'branch',
    title: { en: 'Root', nl: 'Root' },
    children: [
      {
        node_id: 'bathroom',
        type: 'branch',
        title: { en: 'Bathroom', nl: 'Badkamer' },
        children: [
          {
            node_id: 'tap-leak',
            type: 'leaf',
            title: { en: 'Leaking Tap', nl: 'Lekkende Kraan' },
            leaf_type: 'start_ticket',
            leaf_reason: 'standard_wizard'
          }
        ]
      }
    ]
  }
};

describe('useWizard', () => {
  it('should initialize with root node', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    expect(result.current.state.current_node).toEqual(mockTree.root);
    expect(result.current.state.path).toEqual([]);
    expect(result.current.state.history).toEqual([]);
  });

  it('should navigate to path correctly', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    act(() => {
      result.current.navigateToPath(['bathroom']);
    });

    expect(result.current.state.current_node.node_id).toBe('bathroom');
    expect(result.current.state.path).toEqual(['bathroom']);
  });

  it('should select node correctly', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    const bathroomNode = mockTree.root.children[0];
    
    act(() => {
      result.current.selectNode(bathroomNode);
    });

    expect(result.current.state.selected_choice).toBe('bathroom');
  });

  it('should handle video outcome correctly', () => {
    // Create tree with video_check node
    const videoTree: DecisionTree = {
      ...mockTree,
      root: {
        ...mockTree.root,
        children: [
          {
            node_id: 'bathroom',
            type: 'branch',
            title: { en: 'Bathroom', nl: 'Badkamer' },
            children: [
              {
                node_id: 'toilet-clog',
                type: 'video_check',
                title: { en: 'Clogged Toilet', nl: 'Verstopt Toilet' },
                video_url: 'https://example.com/video',
                outcomes: {
                  yes: {
                    leaf_type: 'end_no_ticket',
                    leaf_reason: 'video_resolved'
                  },
                  no: {
                    leaf_type: 'start_ticket',
                    leaf_reason: 'video_not_resolved'
                  }
                }
              }
            ]
          }
        ]
      }
    };

    const { result } = renderHook(() => useWizard({ tree: videoTree }));

    // Navigate to video_check node
    act(() => {
      result.current.navigateToPath(['bathroom', 'toilet-clog']);
    });

    // Handle video outcome
    act(() => {
      result.current.handleVideoOutcome('no');
    });

    expect(result.current.state.current_node.type).toBe('leaf');
    expect(result.current.state.current_node.leaf_type).toBe('start_ticket');
  });

  it('should go back correctly', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    // Navigate forward
    act(() => {
      result.current.navigateToPath(['bathroom']);
    });

    expect(result.current.state.path).toEqual(['bathroom']);

    // Go back
    act(() => {
      result.current.goBack();
    });

    expect(result.current.state.path).toEqual([]);
    expect(result.current.state.current_node.node_id).toBe('root');
  });

  it('should provide breadcrumbs', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    act(() => {
      result.current.navigateToPath(['bathroom']);
    });

    expect(result.current.breadcrumbs).toHaveLength(2);
    expect(result.current.breadcrumbs[0].label).toBe('Start');
    expect(result.current.breadcrumbs[1].label).toBe('Bathroom');
  });
});
