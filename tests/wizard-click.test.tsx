import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useWizard } from '@/modules/wizard/hooks/useWizard';
import { DecisionTree } from '@/types/decision-tree';

// Mock tree for testing
const mockTree: DecisionTree = {
  tree_id: 'test-tree',
  version: 1,
  root: {
    node_id: 'root',
    type: 'branch',
    title: { en: 'Maintenance and Repairs', nl: 'Onderhoud en Reparaties' },
    children: [
      {
        node_id: 'bathroom',
        type: 'branch',
        title: { en: 'Bathroom and Toilet', nl: 'Badkamer en Toilet' },
        children: [
          {
            node_id: 'bathroom.tap_leak',
            type: 'leaf',
            title: { en: 'Leaking tap', nl: 'Lekkende kraan' },
            leaf_type: 'start_ticket',
            leaf_reason: 'standard_wizard',
            required_fields: ['description', 'photos'],
            flow: ['describe_media', 'contact_questions', 'review', 'submit'],
            question_groups: ['contact_at_home', 'entry_permission']
          },
          {
            node_id: 'bathroom.toilet.seat_broken',
            type: 'leaf',
            title: { en: 'Toilet seat broken or loose', nl: 'Toiletbril kapot of los' },
            leaf_type: 'end_no_ticket',
            leaf_reason: 'tenant_responsibility'
          }
        ]
      }
    ]
  }
};

// Test component to test the hook
const TestWizard = () => {
  const { state, selectNode, goBack, breadcrumbs } = useWizard({ tree: mockTree });

  return (
    <div>
      <h1>{state.current_node.title.en}</h1>
      {state.current_node.type === 'branch' && (
        <div>
          {state.current_node.children.map(child => (
            <button
              key={child.node_id}
              onClick={() => selectNode(child)}
              data-testid={child.node_id}
            >
              {child.title.en}
            </button>
          ))}
        </div>
      )}
      {state.current_node.type === 'leaf' && (
        <div>
          <p>Leaf: {state.current_node.leaf_type} - {state.current_node.leaf_reason}</p>
        </div>
      )}
      {state.path.length > 0 && (
        <button onClick={goBack} data-testid="back-button">
          Back
        </button>
      )}
      <div data-testid="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>{crumb.label}</span>
        ))}
      </div>
    </div>
  );
};

describe('Wizard Click Integration', () => {
  it('should render initial state with root node', () => {
    render(<TestWizard />);
    
    expect(screen.getByText('Maintenance and Repairs')).toBeInTheDocument();
    expect(screen.getByTestId('bathroom')).toBeInTheDocument();
  });

  it('should navigate when clicking a tile', () => {
    render(<TestWizard />);
    
    // Click on bathroom tile
    const bathroomTile = screen.getByTestId('bathroom');
    fireEvent.click(bathroomTile);
    
    // Should now show bathroom children
    expect(screen.getByTestId('bathroom.tap_leak')).toBeInTheDocument();
    expect(screen.getByTestId('bathroom.toilet.seat_broken')).toBeInTheDocument();
  });

  it('should navigate to leaf node and show correct leaf_type and leaf_reason', () => {
    render(<TestWizard />);
    
    // Navigate to bathroom
    const bathroomTile = screen.getByTestId('bathroom');
    fireEvent.click(bathroomTile);
    
    // Click on leaking tap (start_ticket leaf)
    const leakingTapTile = screen.getByTestId('bathroom.tap_leak');
    fireEvent.click(leakingTapTile);
    
    // Should show leaf content
    expect(screen.getByText('Leaf: start_ticket - standard_wizard')).toBeInTheDocument();
  });

  it('should navigate to end_no_ticket leaf and show correct content', () => {
    render(<TestWizard />);
    
    // Navigate to bathroom
    const bathroomTile = screen.getByTestId('bathroom');
    fireEvent.click(bathroomTile);
    
    // Click on toilet seat broken (end_no_ticket leaf)
    const seatBrokenTile = screen.getByTestId('bathroom.toilet.seat_broken');
    fireEvent.click(seatBrokenTile);
    
    // Should show leaf content
    expect(screen.getByText('Leaf: end_no_ticket - tenant_responsibility')).toBeInTheDocument();
  });

  it('should go back when clicking back button', () => {
    render(<TestWizard />);
    
    // Navigate to bathroom
    const bathroomTile = screen.getByTestId('bathroom');
    fireEvent.click(bathroomTile);
    
    // Should show bathroom children
    expect(screen.getByTestId('bathroom.tap_leak')).toBeInTheDocument();
    
    // Click back button
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
    
    // Should be back at root
    expect(screen.getByText('Maintenance and Repairs')).toBeInTheDocument();
    expect(screen.queryByTestId('bathroom.tap_leak')).not.toBeInTheDocument();
  });

  it('should show breadcrumbs for navigation', () => {
    render(<TestWizard />);
    
    // Navigate to bathroom
    const bathroomTile = screen.getByTestId('bathroom');
    fireEvent.click(bathroomTile);
    
    // Should show breadcrumbs
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveTextContent('Start');
    expect(breadcrumbs).toHaveTextContent('Bathroom and Toilet');
  });
});
