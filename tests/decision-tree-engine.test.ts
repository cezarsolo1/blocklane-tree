import { describe, it, expect } from 'vitest';
import { DecisionTreeEngine } from '@/modules/decision-tree/engine';
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
                leaf_reason: 'video_not_resolved',
                required_fields: ['description'],
                flow: ['describe_media', 'submit'],
                question_groups: ['contact_at_home']
              }
            }
          },
          {
            node_id: 'tap-leak',
            type: 'leaf',
            title: { en: 'Leaking Tap', nl: 'Lekkende Kraan' },
            leaf_type: 'start_ticket',
            leaf_reason: 'standard_wizard',
            required_fields: ['description', 'photos'],
            flow: ['describe_media', 'submit'],
            question_groups: ['contact_at_home']
          }
        ]
      }
    ]
  }
};

describe('DecisionTreeEngine', () => {
  let engine: DecisionTreeEngine;

  beforeEach(() => {
    engine = new DecisionTreeEngine(mockTree);
  });

  describe('getNodeByPath', () => {
    it('should return root node for empty path', () => {
      const node = engine.getNodeByPath([]);
      expect(node).toEqual(mockTree.root);
    });

    it('should return correct node for valid path', () => {
      const node = engine.getNodeByPath(['bathroom']);
      expect(node?.node_id).toBe('bathroom');
    });

    it('should return null for invalid path', () => {
      const node = engine.getNodeByPath(['invalid']);
      expect(node).toBeNull();
    });

    it('should return null when trying to traverse from leaf', () => {
      const node = engine.getNodeByPath(['bathroom', 'tap-leak', 'invalid']);
      expect(node).toBeNull();
    });
  });

  describe('hasLeafChildren', () => {
    it('should return true for branch with leaf children', () => {
      const node = engine.getNodeByPath(['bathroom']);
      expect(engine.hasLeafChildren(node!)).toBe(true);
    });

    it('should return false for leaf nodes', () => {
      const node = engine.getNodeByPath(['bathroom', 'tap-leak']);
      expect(engine.hasLeafChildren(node!)).toBe(false);
    });

    it('should return false for video_check nodes', () => {
      const node = engine.getNodeByPath(['bathroom', 'toilet-clog']);
      expect(engine.hasLeafChildren(node!)).toBe(false);
    });
  });

  describe('handleVideoOutcome', () => {
    it('should handle yes outcome correctly', () => {
      const node = engine.getNodeByPath(['bathroom', 'toilet-clog']) as any;
      const result = engine.handleVideoOutcome(node, 'yes');
      
      expect(result.leaf_type).toBe('end_no_ticket');
      expect(result.leaf_reason).toBe('video_resolved');
    });

    it('should handle no outcome correctly', () => {
      const node = engine.getNodeByPath(['bathroom', 'toilet-clog']) as any;
      const result = engine.handleVideoOutcome(node, 'no');
      
      expect(result.leaf_type).toBe('start_ticket');
      expect(result.leaf_reason).toBe('video_not_resolved');
      expect(result.required_fields).toEqual(['description']);
    });
  });

  describe('searchNodes', () => {
    it('should find nodes by title', () => {
      const results = engine.searchNodes('toilet');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('toilet');
    });

    it('should return max 8 results', () => {
      // Create a tree with more than 8 nodes
      const largeTree: DecisionTree = {
        ...mockTree,
        root: {
          ...mockTree.root,
          children: Array.from({ length: 10 }, (_, i) => ({
            node_id: `node-${i}`,
            type: 'leaf' as const,
            title: { en: `Node ${i}`, nl: `Node ${i}` },
            leaf_type: 'end_no_ticket',
            leaf_reason: 'other_non_ticket'
          }))
        }
      };
      
      const largeEngine = new DecisionTreeEngine(largeTree);
      const results = largeEngine.searchNodes('node');
      expect(results.length).toBeLessThanOrEqual(8);
    });
  });

  describe('createInitialState', () => {
    it('should create initial state with root node', () => {
      const state = engine.createInitialState();
      expect(state.current_node).toEqual(mockTree.root);
      expect(state.path).toEqual([]);
      expect(state.history).toEqual([]);
      expect(state.selected_choice).toBeUndefined();
    });
  });
});
