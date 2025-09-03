import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useBuildingActiveTicket } from '@/hooks/useBuildingActiveTicket';
import { useToast } from '@/hooks/use-toast';
import { keysToLabels } from '@/lib/tree';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: activeLoading, ticket: buildingTicket } = useBuildingActiveTicket();
  const { toast } = useToast();
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);
  const [hideBuildingCard, setHideBuildingCard] = useState(false);

  const isBuildingTicketVisible = !!(
    buildingTicket && localStorage.getItem('dismissedActiveTicketId') !== buildingTicket.id && !hideBuildingCard
  );

  const handleDeleteTicket = async () => {
    if (!buildingTicket) return;
    setIsDeletingTicket(true);
    try {
      localStorage.setItem('dismissedActiveTicketId', buildingTicket.id);
      setHideBuildingCard(true);
      toast({
        title: 'Melding verborgen',
        description: 'De melding is verborgen. Nieuwe meldingen verschijnen hier weer.',
      });
    } finally {
      setIsDeletingTicket(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welkom{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Beheer uw onderhoudsverzoeken en bekijk de status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Status in uw gebouw</CardTitle>
              {isBuildingTicketVisible && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteTicket}
                  disabled={isDeletingTicket}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeletingTicket && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {activeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : isBuildingTicketVisible ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-amber-900">Probleem:</span>{' '}
                        <span className="text-amber-800">
                          {Array.isArray(buildingTicket.decision_path) && buildingTicket.decision_path.length
                            ? keysToLabels(buildingTicket.decision_path).join(' → ')
                            : 'Onbekend probleem'}
                        </span>
                      </div>
                      {(() => {
                        const vendor =
                          (buildingTicket as any).assigned_vendor ||
                          (buildingTicket as any).vendor ||
                          (buildingTicket as any).contractor_name;
                        return vendor ? (
                          <div>
                            <span className="font-medium text-amber-900">Uitvoerder:</span>{' '}
                            <span className="text-amber-800">{vendor}</span>
                          </div>
                        ) : null;
                      })()}
                      <div>
                        <span className="font-medium text-amber-900">Aangemaakt:</span>{' '}
                        <span className="text-amber-800">
                          {buildingTicket.created_at
                            ? new Date(buildingTicket.created_at).toLocaleString()
                            : 'Onbekend'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 p-6 bg-amber-200 border-2 border-amber-400 rounded-xl shadow-sm">
                      <p className="text-base font-bold text-amber-900 mb-2">
                        Deze storing is al bekend en wordt opgelost.
                      </p>
                      <p className="text-base font-medium text-amber-800">
                        U hoeft geen nieuwe melding te maken als het om dit probleem gaat. Gaat het om iets anders? Dan kunt u hier een nieuwe melding maken.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Geen actieve melding in uw gebouw.
                  </p>
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/wizard')} 
                className="w-full"
                size="lg"
              >
                Nieuwe melding maken
              </Button>
              <Button 
                onClick={() => navigate('/status')} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                Bekijk status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}