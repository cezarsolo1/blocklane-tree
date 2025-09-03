/**
 * Wizard Emergency Page
 * 
 * Shows emergency information page for critical safety issues
 * Based on legacy Dutch implementation, translated to English with red styling
 */

import { LeafNode } from '@/types/decision-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardEmergencyPageProps {
  node: LeafNode;
  onBack?: () => void;
  className?: string;
}

export const WizardEmergencyPage = ({ 
  node,
  onBack,
  className 
}: WizardEmergencyPageProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Emergency Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {typeof node.title === 'string' ? node.title : node.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4">
              This is an emergency
            </h3>
            <p className="text-base text-red-900 mb-4">
              This problem poses a direct danger to safety.
            </p>
            <p className="text-base text-red-900 font-semibold mb-4">
              Call <strong>112</strong> and immediately leave the property.
            </p>
            <p className="text-base text-red-900">
              ⚠️ Do not wait and take immediate action.
            </p>
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="flex justify-start pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
};
