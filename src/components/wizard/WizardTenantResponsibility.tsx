/**
 * Wizard Tenant Responsibility Component
 * 
 * Shows information page for issues that are tenant responsibility
 * Translated from legacy Dutch implementation
 */

import { LeafNode } from '@/types/decision-tree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ExternalLink, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardTenantResponsibilityProps {
  node: LeafNode;
  onBack?: () => void;
  className?: string;
}

export const WizardTenantResponsibility = ({ 
  onBack,
  className 
}: WizardTenantResponsibilityProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <User className="h-6 w-6" />
            This repair is your responsibility as a tenant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 space-y-4">
            <p className="text-sm text-yellow-900/90">
              According to the{' '}
              <a
                href="https://wetten.overheid.nl/BWBR0014931/2003-08-01"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 font-medium hover:text-yellow-800 inline-flex items-center gap-1"
              >
                <strong>Small Repairs Decree</strong>
                <ExternalLink className="h-3 w-3" />
              </a>{' '}
              you as a tenant are responsible for certain small repairs and maintenance tasks in your home.
            </p>
            
            <p className="text-sm text-yellow-900/90">
              The repair you tried to report falls under this category. This means that 
              your property management company cannot perform this work for you through the service desk.
            </p>

            <div className="space-y-3">
              <h4 className="font-medium text-yellow-900">What can you do?</h4>
              <ul className="list-disc list-inside text-sm text-yellow-900/90 space-y-1">
                <li>You can perform the repair yourself.</li>
                <li>Or you can hire a professional at your own expense.</li>
              </ul>
            </div>

            <div className="text-xs text-yellow-900/80 mt-4 p-3 bg-yellow-100/50 rounded border">
              <span className="inline-flex items-center gap-1">
                ℹ️ Want to know exactly which repairs fall under your responsibility?
              </span>
              <br />
              Check the complete overview via the link above.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to wizard
              </Button>
            )}
            
            <Button
              asChild
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <a
                href="https://wetten.overheid.nl/BWBR0014931/2003-08-01"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                View full repair responsibilities
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
