import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Ticket } from '../../packages/core/types';
import { Clock, CheckCircle, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { keysToLabels } from '@/lib/tree';
import { supabase } from '@/integrations/supabase/client';
import { useBuildingActiveTicket } from '@/hooks/useBuildingActiveTicket';

export default function Status() {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { loading: bLoading, ticket: buildingTicket } = useBuildingActiveTicket();

  useEffect(() => {
    const fetchLatestTicket = async () => {
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setTicket(data ?? null);
      } catch (err) {
        console.error('Error fetching latest ticket:', err);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTicket();
  }, [user]);

  // derive active state
  const isActive =
    !!ticket && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS');

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Toegang vereist</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            U moet ingelogd zijn om uw meldingen te bekijken.
          </p>
          <Button asChild className="w-full">
            <Link to="/auth">Inloggen</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Melding Status</h1>
        <p className="text-muted-foreground">
          Bekijk de status van uw huidige en vorige meldingen.
        </p>
      </div>

      {/* Building-level active ticket (if any) */}
      {!bLoading && buildingTicket && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="text-sm text-amber-900">
            <span className="font-semibold">Actieve melding in uw gebouw:</span>{' '}
            {Array.isArray(buildingTicket.decision_path) && buildingTicket.decision_path.length
              ? keysToLabels(buildingTicket.decision_path).join(' → ')
              : 'Onbekend probleem'}
          </div>
          <div className="text-xs text-amber-900/90 mt-1">
            Status: <span className="font-medium">{buildingTicket.status}</span>
            {(() => {
              const vendor =
                (buildingTicket as any).assigned_vendor ||
                (buildingTicket as any).vendor ||
                (buildingTicket as any).contractor_name;
              return vendor ? <> • Uitvoerder: <span className="font-medium">{vendor}</span></> : null;
            })()}
          </div>
        </div>
      )}

      {isActive ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {ticket.status === 'OPEN' && <Clock className="h-6 w-6 text-orange-600" />}
                  {ticket.status === 'IN_PROGRESS' && <AlertCircle className="h-6 w-6 text-blue-600" />}
                  {ticket.status === 'DONE' && <CheckCircle className="h-6 w-6 text-green-600" />}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Actieve melding
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We hebben uw melding ontvangen en zijn bezig met de verwerking.
                  </p>
                  <div className="mt-2 text-sm space-y-1">
                    <div><span className="font-medium">Status:</span> {ticket.status === 'OPEN' ? 'Openstaand' : ticket.status === 'IN_PROGRESS' ? 'In behandeling' : 'Afgerond'}</div>
                    <div><span className="font-medium">Aangemaakt:</span> {new Date(ticket.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant={
                    ticket.status === 'OPEN' ? 'secondary' :
                    ticket.status === 'IN_PROGRESS' ? 'default' : 'outline'
                  } className="mt-3">
                    {ticket.status === 'OPEN' && 'Openstaand'}
                    {ticket.status === 'IN_PROGRESS' && 'In behandeling'}
                    {ticket.status === 'DONE' && 'Afgerond'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Melding Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Melding ID
                </h4>
                <p className="text-sm text-foreground font-mono">
                  {ticket.id}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Ingediend op
                </h4>
                <p className="text-sm text-foreground">
                  {new Date(ticket.created_at).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Probleem</h4>
                <p className="text-sm text-foreground">
                  {Array.isArray(ticket.decision_path) && ticket.decision_path.length
                    ? keysToLabels(ticket.decision_path).join(' → ')
                    : 'Onbekend probleem'}
                </p>
              </div>

              {ticket.description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Beschrijving
                  </h4>
                  <p className="text-sm text-foreground">
                    {ticket.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Adres
                </h4>
                <div className="text-sm text-foreground">
                  <p>{ticket.street_address}</p>
                  <p>{ticket.postal_code} {ticket.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* No Ticket State */
        <div className="flex flex-col items-center justify-center py-12">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Geen actieve melding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                U heeft momenteel geen actieve onderhoudsmeldingen. 
                Maak een nieuwe melding aan om te beginnen.
              </p>
              <Button asChild className="w-full">
                <Link to="/wizard">
                  Nieuwe melding maken
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">
                  Terug naar home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}