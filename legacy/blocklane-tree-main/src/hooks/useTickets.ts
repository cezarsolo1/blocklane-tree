import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Ticket {
  id: string;
  ref_code: string | null;
  status: string;
  street_address: string;
  postal_code: string;
  city: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  description: string | null;
  leaf_type: string;
  created_at: string;
  updated_at: string;
  decision_path: any[];
  building_key: string | null;
}

const TICKET_STATUSES = {
  SCHEDULING: "SCHEDULING",
  WORK_DATE_SCHEDULED: "WORK_DATE_SCHEDULED", 
  CONFIRMING_COMPLETION: "CONFIRMING_COMPLETION",
  GETTING_INVOICE: "GETTING_INVOICE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

export const useTickets = (searchQuery?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tickets", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `ref_code.ilike.%${searchQuery}%,street_address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to fetch tickets");
        throw error;
      }

      return data as Ticket[];
    },
    enabled: !!user,
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket status updated");
    },
    onError: (error) => {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
    },
  });
};