import { format } from "date-fns";
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { Ticket } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticket: Ticket;
  isDragging?: boolean;
}

const getStatusInfo = (status: string, ticket: Ticket) => {
  switch (status) {
    case "WORK_DATE_SCHEDULED":
      return {
        icon: <Calendar className="h-4 w-4" />,
        text: `Scheduled for ${format(new Date(ticket.updated_at), "MMM d, yyyy 'at' h:mm a")}`,
        color: "text-blue-600"
      };
    case "COMPLETED":
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        text: `Completed ${format(new Date(ticket.updated_at), "MMM d, yyyy 'at' h:mm a")}`,
        color: "text-green-600",
        indicator: true
      };
    case "CANCELLED":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        text: `Cancelled ${format(new Date(ticket.updated_at), "MMM d, yyyy")}`,
        color: "text-red-600"
      };
    case "CONFIRMING_COMPLETION":
      return {
        icon: <Clock className="h-4 w-4" />,
        text: "Awaiting completion confirmation",
        color: "text-orange-600"
      };
    case "GETTING_INVOICE":
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Awaiting invoice",
        color: "text-purple-600"
      };
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        text: "No status update",
        color: "text-muted-foreground"
      };
  }
};

export const TicketCard = ({ ticket, isDragging = false }: TicketCardProps) => {
  const statusInfo = getStatusInfo(ticket.status, ticket);

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-3 shadow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        {statusInfo.indicator && (
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-foreground">
              {ticket.ref_code || `#${ticket.id.slice(0, 8)}`}
            </span>
            <span className="text-sm text-muted-foreground truncate">
              {ticket.leaf_type || "General Issue"}
            </span>
          </div>
          
          <div className="flex items-start gap-1 mb-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="truncate">
              {ticket.street_address}, {ticket.city}
            </span>
          </div>

          <div className={cn("flex items-center gap-2 text-xs", statusInfo.color)}>
            {statusInfo.icon}
            <span className="truncate">{statusInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};