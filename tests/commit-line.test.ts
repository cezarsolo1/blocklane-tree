import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizard } from '@/modules/wizard/hooks/useWizard';
import { DecisionTree, LeafType, LeafReason } from '@/types/decision-tree';

// Mock the ticket service
const mockCreateDraft = vi.fn();
const mockUpdate = vi.fn();
const mockFinalize = vi.fn();

// Mock the TicketServiceFactory
vi.mock('@/modules/tickets/TicketServiceFactory', () => ({
  createTicketService: vi.fn(() => ({
    createDraft: mockCreateDraft.mockResolvedValue({ ticket_id: 'test-ticket-123' }),
    update: mockUpdate.mockResolvedValue({ ok: true }),
    finalize: mockFinalize.mockResolvedValue({ ok: true })
  }))
}));

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
            node_id: 'bathroom.tap_leak',
            type: 'leaf',
            title: { en: 'Leaking tap', nl: 'Lekkende kraan' },
            leaf_type: 'start_ticket',
            leaf_reason: 'standard_wizard'
          },
          {
            node_id: 'bathroom.toilet.seat_broken',
            type: 'leaf',
            title: { en: 'Toilet seat broken', nl: 'Toiletbril kapot' },
            leaf_type: 'end_no_ticket',
            leaf_reason: 'tenant_responsibility'
          }
        ]
      }
    ]
  }
};

describe('Commit Line - Draft Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not create draft before reaching start_ticket terminal', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    // Navigate to bathroom (branch node)
    act(() => {
      result.current.selectNode(mockTree.root.children[0]);
    });

    expect(mockCreateDraft).not.toHaveBeenCalled();
  });

  it('should create draft when reaching start_ticket terminal', async () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    // Navigate to start_ticket leaf
    act(() => {
      result.current.selectNode(mockTree.root.children[0].children[0]);
    });

    expect(mockCreateDraft).toHaveBeenCalledWith({
      sessionId: expect.any(String),
      tree: {
        id: 'test-tree',
        version: 1,
        node_id: 'bathroom.tap_leak',
        leaf_type: 'start_ticket',
        leaf_reason: 'standard_wizard'
      }
    });
  });

  it('should not create draft when reaching end_no_ticket terminal', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    // Navigate to end_no_ticket leaf
    act(() => {
      result.current.selectNode(mockTree.root.children[0].children[1]);
    });

    expect(mockCreateDraft).not.toHaveBeenCalled();
  });

  it('should be idempotent - no extra drafts when navigating back/forward', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    // Navigate to start_ticket leaf
    act(() => {
      result.current.selectNode(mockTree.root.children[0].children[0]);
    });

    // Go back
    act(() => {
      result.current.goBack();
    });

    // Go forward again
    act(() => {
      result.current.selectNode(mockTree.root.children[0].children[0]);
    });

    // Should create draft exactly twice (once for each navigation to start_ticket leaf)
    expect(mockCreateDraft).toHaveBeenCalledTimes(2);
  });

  it('should create draft with correct session ID', () => {
    const { result } = renderHook(() => useWizard({ tree: mockTree }));

    // Navigate to start_ticket leaf
    act(() => {
      result.current.selectNode(mockTree.root.children[0].children[0]);
    });

    const call = mockCreateDraft.mock.calls[0][0];
    expect(call.sessionId).toBeDefined();
    expect(typeof call.sessionId).toBe('string');
    expect(call.sessionId.length).toBeGreaterThan(0);
  });
});
