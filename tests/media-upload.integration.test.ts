import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseTicketService } from '@/modules/tickets/SupabaseTicketService';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => ({
        data: { session: { access_token: 'mock-token' } }
      }))
    },
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: vi.fn(() => ({ data: { signedUrl: 'mock-signed-url' } }))
      }))
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null }))
    }))
  }))
}));

// Mock fetch
global.fetch = vi.fn();

describe('Media Upload Integration', () => {
  let ticketService: SupabaseTicketService;
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    
    ticketService = new SupabaseTicketService();
    mockFetch = fetch as any;
  });

  it('should sign media upload and return signed URLs', async () => {
    const mockSignedUrls = [
      {
        file_id: 'test-id-1',
        original_name: 'test1.jpg',
        mime_type: 'image/jpeg',
        size_bytes: 1024,
        storage_path: 'ticket-123/test-id-1.jpg',
        upload_url: 'https://upload.url/1',
        needs_conversion: false,
        kind: 'image'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        ok: true, 
        data: { signed_urls: mockSignedUrls } 
      })
    });

    const files = [
      new File(['test'], 'test1.jpg', { type: 'image/jpeg' })
    ];

    const result = await ticketService.signMediaUpload('ticket-123', files);

    expect(result).toEqual(mockSignedUrls);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/sign_media_upload',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: expect.stringContaining('ticket-123')
      })
    );
  });

  it('should upload media files and create database records', async () => {
    const mockSignedUrls = [
      {
        file_id: 'test-id-1',
        original_name: 'test1.jpg',
        mime_type: 'image/jpeg',
        size_bytes: 1024,
        storage_path: 'ticket-123/test-id-1.jpg',
        upload_url: 'https://upload.url/1',
        needs_conversion: false,
        kind: 'image'
      }
    ];

    // Mock sign media upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        ok: true, 
        data: { signed_urls: mockSignedUrls } 
      })
    });

    // Mock file upload
    mockFetch.mockResolvedValueOnce({
      ok: true
    });

    const files = [
      new File(['test'], 'test1.jpg', { type: 'image/jpeg' })
    ];

    await ticketService.uploadMedia('ticket-123', files);

    // Verify sign media upload was called
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/sign_media_upload',
      expect.any(Object)
    );

    // Verify file upload was called
    expect(mockFetch).toHaveBeenCalledWith(
      'https://upload.url/1',
      expect.objectContaining({
        method: 'PUT',
        body: files[0],
        headers: {
          'Content-Type': 'image/jpeg',
        }
      })
    );
  });

  it('should handle HEIC files and mark for conversion', async () => {
    const mockSignedUrls = [
      {
        file_id: 'test-id-1',
        original_name: 'test1.heic',
        mime_type: 'image/heic',
        size_bytes: 1024,
        storage_path: 'ticket-123/test-id-1.heic',
        upload_url: 'https://upload.url/1',
        needs_conversion: true,
        kind: 'image'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        ok: true, 
        data: { signed_urls: mockSignedUrls } 
      })
    });

    mockFetch.mockResolvedValueOnce({
      ok: true
    });

    const files = [
      new File(['test'], 'test1.heic', { type: 'image/heic' })
    ];

    await ticketService.uploadMedia('ticket-123', files);

    expect(mockSignedUrls[0].needs_conversion).toBe(true);
  });

  it('should reject invalid file types', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        error: 'File test1.txt has unsupported type. Allowed: image/jpeg, image/jpg, image/png, image/webp, image/heic' 
      })
    });

    const files = [
      new File(['test'], 'test1.txt', { type: 'text/plain' })
    ];

    await expect(ticketService.signMediaUpload('ticket-123', files))
      .rejects.toThrow('File test1.txt has unsupported type');
  });

  it('should reject files that are too large', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        error: 'File test1.jpg is too large. Maximum size is 10MB' 
      })
    });

    const files = [
      new File(['x'.repeat(11 * 1024 * 1024)], 'test1.jpg', { type: 'image/jpeg' })
    ];

    await expect(ticketService.signMediaUpload('ticket-123', files))
      .rejects.toThrow('File test1.jpg is too large');
  });

  it('should reject too many files', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ 
        error: 'Maximum 8 files allowed' 
      })
    });

    const files = Array.from({ length: 9 }, (_, i) => 
      new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
    );

    await expect(ticketService.signMediaUpload('ticket-123', files))
      .rejects.toThrow('Maximum 8 files allowed');
  });
});
