import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TicketMessage, TicketMessageInsert } from '@/types/database-extensions';

export function useTicketMessages(ticketId?: string) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!ticketId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use raw query since ticket_messages is not in auto-generated types yet
      const { data, error: fetchError } = await supabase
        .from('ticket_messages' as any)
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data as unknown as TicketMessage[]) || []);
    } catch (err) {
      console.error('Error fetching ticket messages:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: TicketMessageInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('ticket_messages' as any)
        .insert(message)
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setMessages(prev => [...prev, data as unknown as TicketMessage]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error sending message:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel('ticket-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          const newMessage = payload.new as TicketMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  useEffect(() => {
    fetchMessages();
  }, [ticketId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  };
}