import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DescribeMedia } from '@/pages/DescribeMedia';

// Mock the ticket service factory
const mockUpdate = vi.fn().mockResolvedValue({ ok: true });
const mockUploadMedia = vi.fn().mockResolvedValue(undefined);

vi.mock('@/modules/tickets/TicketServiceFactory', () => ({
  createTicketService: vi.fn(() => ({
    update: mockUpdate,
    uploadMedia: mockUploadMedia
  }))
}));

describe('Media Validation', () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({ ok: true });
    mockUploadMedia.mockResolvedValue(undefined);
  });

  it('should block next when required photo missing', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        requiredFields={['photos']}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('should allow next when required photo provided', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        requiredFields={['photos']}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Simulate file upload
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });

    const continueButton = screen.getByText('Continue');
    expect(continueButton).not.toBeDisabled();
  });

  it('should reject invalid file types', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
  });

  it('should reject files larger than 10MB', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Create a mock file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/File too large/)).toBeInTheDocument();
  });

  it('should reject more than 8 files', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const files = Array.from({ length: 9 }, (_, i) => 
      new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
    );
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files } });

    expect(screen.getByText(/Maximum 8 files allowed/)).toBeInTheDocument();
  });

  it('should accept valid files', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const validFiles = [
      new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      new File(['test'], 'test.png', { type: 'image/png' }),
      new File(['test'], 'test.webp', { type: 'image/webp' }),
      new File(['test'], 'test.heic', { type: 'image/heic' })
    ];
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: validFiles } });

    expect(screen.getByText('Selected Photos (4/8)')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid file type/)).not.toBeInTheDocument();
  });

  it('should mark HEIC files for conversion', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
    const input = screen.getByTestId('file-input');
    
    fireEvent.change(input, { target: { files: [heicFile] } });

    expect(screen.getByText('HEIC (converting...)')).toBeInTheDocument();
  });

  it('should show visual nudge for optional photos', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/Adding photos helps contractors/)).toBeInTheDocument();
  });

  it('should not show nudge when photos are required', () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        requiredFields={['photos']}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.queryByText(/Adding photos helps contractors/)).not.toBeInTheDocument();
  });

  it('should call update with correct data', async () => {
    render(
      <DescribeMedia
        ticketId="test-ticket"
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Add description
    const textarea = screen.getByPlaceholderText('Describe the issue in detail...');
    fireEvent.change(textarea, { target: { value: 'Test description' } });

    // Add photo
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('file-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Submit
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockUpdate).toHaveBeenCalledWith('test-ticket', { description: 'Test description' });
    expect(mockUploadMedia).toHaveBeenCalledWith('test-ticket', [file]);
    expect(mockOnNext).toHaveBeenCalledWith({
      description: 'Test description',
      photos: [file]
    });
  });
});
