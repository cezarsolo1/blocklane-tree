/**
 * Video Success Page Component
 * 
 * Shown when users click "Gelukt!" on video cases
 * Celebrates successful self-resolution of the issue
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Wrench } from 'lucide-react';

interface VideoSuccessPageProps {
  onComplete: () => void;
  className?: string;
}

export const VideoSuccessPage = ({
  onComplete,
  className
}: VideoSuccessPageProps) => {
  return (
    <div className={className}>
      <Card>
        <CardContent className="text-center py-12">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <Wrench className="w-8 h-8 text-blue-500 mx-auto" />
          </div>
          
          {/* Main Message */}
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Puik werk, Bob de Bouwer!
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Goed gedaan! 🎉
          </h2>
          
          {/* Description */}
          <div className="max-w-md mx-auto mb-8">
            <p className="text-lg text-gray-600 mb-4">
              Geweldig dat je het probleem zelf hebt kunnen oplossen!
            </p>
            <p className="text-sm text-gray-500">
              Je hebt laten zien dat je een echte klusser bent. Het probleem is opgelost zonder dat er een monteur langs hoefde te komen.
            </p>
          </div>
          
          {/* Celebration Elements */}
          <div className="text-4xl mb-6">
            🔧 ⭐ 🏆 ⭐ 🔧
          </div>
          
          {/* Action Button */}
          <Button 
            onClick={onComplete} 
            className="bg-[#0052FF] hover:bg-blue-600 text-white px-8 py-3 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Terug naar hoofdmenu
          </Button>
          
          {/* Footer Note */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-green-700">
              💡 <strong>Tip:</strong> Bewaar deze oplossing voor de volgende keer dat je hetzelfde probleem tegenkomt!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
