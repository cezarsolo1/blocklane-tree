import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/hooks/useTickets";

interface TicketListViewProps {
  tickets: Ticket[];
  isLoading: boolean;
}

const statusLabels: Record<string, string> = {
  SCHEDULING: "Scheduling",
  WORK_DATE_SCHEDULED: "Work Date Scheduled", 
  CONFIRMING_COMPLETION: "Confirming Completion",
  GETTING_INVOICE: "Getting Invoice",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

export const TicketListView = ({ tickets, isLoading }: TicketListViewProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tickets found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
        <div className="col-span-2">Ticket ID</div>
        <div className="col-span-4">Address</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Created</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Ticket Rows */}
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-2">
              <div className="font-mono text-sm font-medium">{ticket.ref_code}</div>
            </div>
            
            <div className="col-span-4">
              <div className="font-medium">{ticket.street_address}</div>
              <div className="text-sm text-muted-foreground">
                {ticket.city}, {ticket.postal_code}
              </div>
            </div>
            
            <div className="col-span-2">
              <Badge 
                variant={ticket.status === 'COMPLETED' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {statusLabels[ticket.status || 'SCHEDULING']}
              </Badge>
            </div>
            
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </div>
            </div>
            
            <div className="col-span-2">
              <button className="text-sm text-primary hover:text-primary/80 font-medium">
                View Details
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};