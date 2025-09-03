import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorAssignment, VendorAssignmentInsert } from '@/types/database-extensions';

export function useVendorAssignments(ticketId?: string) {
  const [assignments, setAssignments] = useState<VendorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!ticketId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use raw query since vendor_assignments is not in auto-generated types yet
      const { data, error: fetchError } = await supabase
        .from('vendor_assignments' as any)
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAssignments((data as unknown as VendorAssignment[]) || []);
    } catch (err) {
      console.error('Error fetching vendor assignments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignment: VendorAssignmentInsert) => {
    try {
      const { data, error: insertError } = await supabase
        .from('vendor_assignments' as any)
        .insert(assignment)
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setAssignments(prev => [data as unknown as VendorAssignment, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error creating vendor assignment:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: VendorAssignment['status']) => {
    try {
      const { data, error: updateError } = await supabase
        .from('vendor_assignments' as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', assignmentId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setAssignments(prev => prev.map(a => a.id === assignmentId ? data as unknown as VendorAssignment : a));
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error updating assignment status:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [ticketId]);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignmentStatus,
    refetch: fetchAssignments
  };
}