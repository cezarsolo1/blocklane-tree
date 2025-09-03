import { Button } from '@/components/ui/button';
import { useBuildingActiveTicket } from '@/hooks/useBuildingActiveTicket';
import { useNavigate } from 'react-router-dom';
import { keysToLabels } from '@/lib/tree';

export default function Level() {
  const { ticket, loading } = useBuildingActiveTicket();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Laden...</div>
        </div>
      </div>
    );
  }

  const issueText = ticket?.decision_path ? 
    `Probleem: ${Array.isArray(ticket.decision_path) && ticket.decision_path.length 
      ? keysToLabels(ticket.decision_path).join(' → ') 
      : 'Onbekend probleem'}` :
    'Geen actieve melding gevonden';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center space-y-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Is het probleem opgelost?
          </h1>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-foreground font-medium">
              {issueText}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate('/review')}
              className="px-8 py-3 text-lg"
              size="lg"
            >
              Ja
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-3 text-lg"
              size="lg"
            >
              Nee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}