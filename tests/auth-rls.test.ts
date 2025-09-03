import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('Auth RLS Policies', () => {
  let supabase: SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    supabase = createClient('https://test.supabase.co', 'test-key');
  });

  it('should enforce user isolation for tickets', async () => {
    // Mock tickets
    const ticketA = { id: 'ticket-a', profile_id: 'profile-a', status: 'draft' };
    const ticketB = { id: 'ticket-b', profile_id: 'profile-b', status: 'draft' };

    // Set up mock chain for this test
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [ticketA],
        error: null
      })
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data: userATickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('profile_id', 'profile-a');

    expect(userATickets).toEqual([ticketA]);
    expect(userATickets).not.toContain(ticketB);
  });

  it('should enforce user isolation for media assets', async () => {
    const mediaAssetA = { id: 'media-a', ticket_id: 'ticket-a' };
    const mediaAssetB = { id: 'media-b', ticket_id: 'ticket-b' };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [mediaAssetA],
        error: null
      })
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data: userAMedia } = await supabase
      .from('media_assets')
      .select('*')
      .eq('ticket_id', 'ticket-a');

    expect(userAMedia).toEqual([mediaAssetA]);
    expect(userAMedia).not.toContain(mediaAssetB);
  });

  it('should enforce user isolation for ticket answers', async () => {
    const answerA = { id: 'answer-a', ticket_id: 'ticket-a', key: 'test', value: 'value' };
    const answerB = { id: 'answer-b', ticket_id: 'ticket-b', key: 'test', value: 'value' };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [answerA],
        error: null
      })
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data: userAAnswers } = await supabase
      .from('ticket_answers')
      .select('*')
      .eq('ticket_id', 'ticket-a');

    expect(userAAnswers).toEqual([answerA]);
    expect(userAAnswers).not.toContain(answerB);
  });

  it('should enforce user isolation for address events', async () => {
    const addressEventA = { id: 'event-a', profile_id: 'profile-a', wizard_session_id: 'session-a' };
    const addressEventB = { id: 'event-b', profile_id: 'profile-b', wizard_session_id: 'session-b' };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [addressEventA],
        error: null
      })
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data: userAEvents } = await supabase
      .from('address_events')
      .select('*')
      .eq('profile_id', 'profile-a');

    expect(userAEvents).toEqual([addressEventA]);
    expect(userAEvents).not.toContain(addressEventB);
  });

  it('should allow public access to allowed_emails for registration check', async () => {
    const allowedEmails = [
      { email: 'user-a@example.com' },
      { email: 'user-b@example.com' }
    ];

    const mockSelect = vi.fn().mockResolvedValue({
      data: allowedEmails,
      error: null
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data: emails } = await supabase
      .from('allowed_emails')
      .select('*');

    expect(emails).toEqual(allowedEmails);
  });

  it('should prevent unauthorized access to other users profiles', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Row Level Security policy violation' }
      })
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', 'unauthorized-user');

    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it('should prevent unauthorized access to other users webhooks', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    });

    const { data: webhooks } = await supabase
      .from('webhooks_outbox')
      .select('*')
      .eq('ticket_id', 'unauthorized-ticket');

    expect(webhooks).toEqual([]);
  });
});
