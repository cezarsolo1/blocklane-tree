/**
 * Wizard Tenant Responsibility Page
 * 
 * Shows information page for issues that are tenant responsibility
 * Translated from legacy Dutch implementation to match video page styling
 */

import { LeafNode } from '@/types/decision-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardTenantResponsibilityPageProps {
  node: LeafNode;
  onBack?: () => void;
  className?: string;
}

export const WizardTenantResponsibilityPage = ({ 
  node,
  onBack,
  className 
}: WizardTenantResponsibilityPageProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {typeof node.title === 'string' ? node.title : node.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-4">
              This maintenance falls under your responsibility
            </h3>
            <p className="text-yellow-800 mb-4">
              The problem you have selected belongs to the maintenance that should be 
              performed by the tenant according to the rental agreement.
            </p>

            <div className="space-y-3">
              <h4 className="font-medium text-yellow-900">Recommended steps:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                <li>First check if you can solve the problem yourself</li>
                <li>Consult the device manual if applicable</li>
                <li>If in doubt, you can contact a certified technician</li>
                <li>Keep receipt/invoice for any warranty claims</li>
              </ul>
            </div>
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
