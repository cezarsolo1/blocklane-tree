import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "@/hooks/useTickets";
import { TicketCard } from "./TicketCard";
import { cn } from "@/lib/utils";

interface DraggableTicketCardProps {
  ticket: Ticket;
}

const DraggableTicketCard = ({ ticket }: DraggableTicketCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <TicketCard ticket={ticket} isDragging={isDragging} />
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  status: string;
  tickets: Ticket[];
  count: number;
}

export const KanbanColumn = ({ title, status, tickets, count }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 min-w-80">
      <div className="bg-muted/30 rounded-t-lg border-b">
        <div className="p-4">
          <h3 className="font-medium text-sm text-foreground mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {count === 0 ? "No jobs in this status" : `${count} job${count === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-96 p-4 bg-background border-l border-r border-b rounded-b-lg transition-colors",
          isOver && "bg-muted/20"
        )}
      >
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <DraggableTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};