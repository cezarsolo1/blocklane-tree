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
            node_id: 'bathroom.toilet_clog',
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
            node_id: 'bathroom.tap_leak',
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

describe('DecisionTreeEngine - nextNode', () => {
  let engine: DecisionTreeEngine;

  beforeEach(() => {
    engine = new DecisionTreeEngine(mockTree);
  });

  describe('simple choice', () => {
    it('should navigate from root to bathroom', () => {
      const nextNode = engine.nextNode([], 'bathroom');
      expect(nextNode?.node_id).toBe('bathroom');
      expect(nextNode?.type).toBe('branch');
    });

    it('should navigate from bathroom to tap_leak', () => {
      const nextNode = engine.nextNode(['bathroom'], 'bathroom.tap_leak');
      expect(nextNode?.node_id).toBe('bathroom.tap_leak');
      expect(nextNode?.type).toBe('leaf');
      expect(nextNode?.leaf_type).toBe('start_ticket');
      expect(nextNode?.leaf_reason).toBe('standard_wizard');
    });
  });

  describe('video_check yes/no', () => {
    it('should navigate to video_check node', () => {
      const nextNode = engine.nextNode(['bathroom'], 'bathroom.toilet_clog');
      expect(nextNode?.node_id).toBe('bathroom.toilet_clog');
      expect(nextNode?.type).toBe('video_check');
    });

    it('should handle video outcome yes', () => {
      const videoNode = engine.getNodeByPath(['bathroom', 'bathroom.toilet_clog']);
      const outcome = engine.handleVideoOutcome(videoNode as any, 'yes');
      
      expect(outcome.leaf_type).toBe('end_no_ticket');
      expect(outcome.leaf_reason).toBe('video_resolved');
    });

    it('should handle video outcome no', () => {
      const videoNode = engine.getNodeByPath(['bathroom', 'bathroom.toilet_clog']);
      const outcome = engine.handleVideoOutcome(videoNode as any, 'no');
      
      expect(outcome.leaf_type).toBe('start_ticket');
      expect(outcome.leaf_reason).toBe('video_not_resolved');
      expect(outcome.required_fields).toEqual(['description']);
    });
  });

  describe('bad option guard', () => {
    it('should return null for invalid choice', () => {
      const nextNode = engine.nextNode([], 'invalid');
      expect(nextNode).toBeNull();
    });

    it('should return null when trying to navigate from leaf', () => {
      const nextNode = engine.nextNode(['bathroom', 'bathroom.tap_leak'], 'invalid');
      expect(nextNode).toBeNull();
    });

    it('should return null when trying to navigate from video_check', () => {
      const nextNode = engine.nextNode(['bathroom', 'bathroom.toilet_clog'], 'invalid');
      expect(nextNode).toBeNull();
    });
  });

  describe('path-based navigation', () => {
    it('should handle dot notation IDs correctly', () => {
      const node = engine.getNodeByPath(['bathroom', 'bathroom.tap_leak']);
      expect(node?.node_id).toBe('bathroom.tap_leak');
    });

    it('should handle nested dot notation', () => {
      // Add a nested node for testing
      const nestedTree: DecisionTree = {
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
                  node_id: 'bathroom.toilet',
                  type: 'branch',
                  title: { en: 'Toilet', nl: 'Toilet' },
                  children: [
                    {
                      node_id: 'bathroom.toilet.seat_broken',
                      type: 'leaf',
                      title: { en: 'Seat Broken', nl: 'Seat Broken' },
                      leaf_type: 'end_no_ticket',
                      leaf_reason: 'tenant_responsibility'
                    }
                  ]
                }
              ]
            }
          ]
        }
      };

      const nestedEngine = new DecisionTreeEngine(nestedTree);
      const node = nestedEngine.getNodeByPath(['bathroom', 'bathroom.toilet', 'bathroom.toilet.seat_broken']);
      expect(node?.node_id).toBe('bathroom.toilet.seat_broken');
    });
  });
});
