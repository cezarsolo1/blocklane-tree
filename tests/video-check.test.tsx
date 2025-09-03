import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoCheck } from '@/modules/wizard/components/VideoCheck';
import { VideoCheckNode } from '@/types/decision-tree';

describe('VideoCheck', () => {
  const mockVideoNode: VideoCheckNode = {
    node_id: 'bathroom.toilet_clog',
    type: 'video_check',
    title: { en: 'Clogged toilet', nl: 'Verstopt toilet' },
    video_url: 'https://www.youtube.com/watch?v=test123',
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
  };

  it('should render video element with correct source', () => {
    render(<VideoCheck node={mockVideoNode} onOutcome={() => {}} />);
    
    const video = screen.getByRole('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://www.youtube.com/watch?v=test123');
  });

  it('should render both outcome buttons', () => {
    render(<VideoCheck node={mockVideoNode} onOutcome={() => {}} />);
    
    expect(screen.getByText('Yes, resolved')).toBeInTheDocument();
    expect(screen.getByText('No, not resolved')).toBeInTheDocument();
  });

  it('should call onOutcome with "yes" when yes button clicked', () => {
    const mockOnOutcome = vi.fn();
    render(<VideoCheck node={mockVideoNode} onOutcome={mockOnOutcome} />);
    
    const yesButton = screen.getByText('Yes, resolved');
    fireEvent.click(yesButton);
    
    expect(mockOnOutcome).toHaveBeenCalledWith('yes');
  });

  it('should call onOutcome with "no" when no button clicked', () => {
    const mockOnOutcome = vi.fn();
    render(<VideoCheck node={mockVideoNode} onOutcome={mockOnOutcome} />);
    
    const noButton = screen.getByText('No, not resolved');
    fireEvent.click(noButton);
    
    expect(mockOnOutcome).toHaveBeenCalledWith('no');
  });

  it('should render title correctly', () => {
    render(<VideoCheck node={mockVideoNode} onOutcome={() => {}} />);
    
    expect(screen.getByText('Clogged toilet')).toBeInTheDocument();
  });

  it('should render fallback when video fails to load', () => {
    render(<VideoCheck node={mockVideoNode} onOutcome={() => {}} />);
    
    const video = screen.getByRole('video');
    fireEvent.error(video);
    
    expect(screen.getByText('Video not available')).toBeInTheDocument();
  });
});
