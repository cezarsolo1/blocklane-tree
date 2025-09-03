/**
 * Wizard Video Resolved Page
 * 
 * Shows success message when video helped resolve the issue
 */

import { LeafNode } from '@/types/decision-tree';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardVideoResolvedPageProps {
  node: LeafNode;
  className?: string;
}

export const WizardVideoResolvedPage = ({ 
  node,
  className 
}: WizardVideoResolvedPageProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardContent className="p-8 text-center">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Great job!</h3>
            <p className="text-base text-blue-900/90">
              Excellent work, Bob the Builder! The problem is resolved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
