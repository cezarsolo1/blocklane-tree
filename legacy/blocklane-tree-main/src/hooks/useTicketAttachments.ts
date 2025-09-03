import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TicketAttachment, TicketAttachmentInsert } from '@/types/database-extensions';

export function useTicketAttachments(ticketId?: string) {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    if (!ticketId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use raw query since ticket_attachments is not in auto-generated types yet
      const { data, error: fetchError } = await supabase
        .from('ticket_attachments' as any)
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAttachments((data as unknown as TicketAttachment[]) || []);
    } catch (err) {
      console.error('Error fetching ticket attachments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addAttachment = async (attachment: TicketAttachmentInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('ticket_attachments' as any)
        .insert(attachment)
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setAttachments(prev => [data as unknown as TicketAttachment, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error adding attachment:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const removeAttachment = async (attachmentId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('ticket_attachments' as any)
        .delete()
        .eq('id', attachmentId);

      if (deleteError) throw deleteError;

      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      return { error: null };
    } catch (err) {
      console.error('Error removing attachment:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [ticketId]);

  return {
    attachments,
    loading,
    error,
    addAttachment,
    removeAttachment,
    refetch: fetchAttachments
  };
}