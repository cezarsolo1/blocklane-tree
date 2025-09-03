import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MeldingVoltooid = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bedankt voor uw melding
        </h1>
        <p className="text-xl text-muted-foreground">
          Uw melding is succesvol geregistreerd
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-900 font-semibold text-center">
              Let op: er is nog geen afspraak ingepland.
            </p>
          </div>
          
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              U ontvangt een e-mail zodra een afspraak met een monteur is bevestigd.
            </p>
            
            <p className="text-muted-foreground">
              Heeft u aanvullende informatie of wilt u een foto toevoegen? Dan kunt u dit doen via de link in de bevestigingsmail.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <Button 
          onClick={() => navigate('/')} 
          className="w-full max-w-sm"
          size="lg"
        >
          Terug naar overzicht
        </Button>
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          className="w-full max-w-sm"
          size="lg"
        >
          Bekijk status
        </Button>
      </div>
    </div>
  );
};

export default MeldingVoltooid;