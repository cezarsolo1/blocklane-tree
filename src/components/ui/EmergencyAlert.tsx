import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface EmergencyAlertProps {
  onBack: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          {/* Emergency Alert Box */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-red-800 mb-3">
                  Dit is een noodgeval
                </h1>
                <p className="text-red-700 mb-4 text-lg">
                  Dit probleem vormt een direct gevaar voor de veiligheid.
                </p>
                <p className="text-red-800 font-bold text-xl mb-4">
                  Bel 112 en verlaat onmiddellijk de woning.
                </p>
                <div className="flex items-center space-x-2 text-red-700">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">
                    Wacht niet en onderneem direct actie.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Terug
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
