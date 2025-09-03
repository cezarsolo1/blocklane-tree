import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyOptionMissing } from '@/modules/wizard/components/MyOptionMissing';
import { DecisionNode } from '@/types/decision-tree';

describe('MyOptionMissing', () => {
  const mockOnClick = vi.fn();

  it('should not render when no leaf children', () => {
    const node: DecisionNode = {
      node_id: 'branch-only',
      type: 'branch',
      title: { en: 'Branch Only', nl: 'Branch Only' },
      children: [
        {
          node_id: 'child1',
          type: 'branch',
          title: { en: 'Child 1', nl: 'Child 1' },
          children: []
        }
      ]
    };

    render(<MyOptionMissing node={node} onClick={mockOnClick} />);
    
    expect(screen.queryByText('My option is missing')).not.toBeInTheDocument();
  });

  it('should render when has leaf children', () => {
    const node: DecisionNode = {
      node_id: 'has-leaves',
      type: 'branch',
      title: { en: 'Has Leaves', nl: 'Has Leaves' },
      children: [
        {
          node_id: 'leaf1',
          type: 'leaf',
          title: { en: 'Leaf 1', nl: 'Leaf 1' },
          leaf_type: 'start_ticket',
          leaf_reason: 'standard_wizard'
        }
      ]
    };

    render(<MyOptionMissing node={node} onClick={mockOnClick} />);
    
    expect(screen.getByText('My option is missing')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const node: DecisionNode = {
      node_id: 'has-leaves',
      type: 'branch',
      title: { en: 'Has Leaves', nl: 'Has Leaves' },
      children: [
        {
          node_id: 'leaf1',
          type: 'leaf',
          title: { en: 'Leaf 1', nl: 'Leaf 1' },
          leaf_type: 'start_ticket',
          leaf_reason: 'standard_wizard'
        }
      ]
    };

    render(<MyOptionMissing node={node} onClick={mockOnClick} />);
    
    const button = screen.getByText('My option is missing');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should not render for leaf nodes', () => {
    const node: DecisionNode = {
      node_id: 'leaf-node',
      type: 'leaf',
      title: { en: 'Leaf Node', nl: 'Leaf Node' },
      leaf_type: 'end_no_ticket',
      leaf_reason: 'tenant_responsibility'
    };

    render(<MyOptionMissing node={node} onClick={mockOnClick} />);
    
    expect(screen.queryByText('My option is missing')).not.toBeInTheDocument();
  });

  it('should not render for video_check nodes', () => {
    const node: DecisionNode = {
      node_id: 'video-node',
      type: 'video_check',
      title: { en: 'Video Node', nl: 'Video Node' },
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
    };

    render(<MyOptionMissing node={node} onClick={mockOnClick} />);
    
    expect(screen.queryByText('My option is missing')).not.toBeInTheDocument();
  });
});
