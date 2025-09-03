/**
 * Submitted Page (Step 5)
 * 
 * Shows confirmation screen after successful ticket submission.
 * Based on spec section 3.1 - Step 5: Submitted.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, Clock, Home } from 'lucide-react';

interface SubmittedProps {
  ticketId?: string;
  onNewTicket: () => void;
}

export const Submitted = ({ ticketId, onNewTicket }: SubmittedProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Ticket Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-lg">
              Your maintenance ticket has been submitted and is being processed.
            </p>
            
            {ticketId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Ticket ID:</strong> {ticketId}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <p className="text-sm">
                  We'll call you within 24 hours to schedule the repair
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-sm">
                  Typical response time: 1-2 business days
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Home className="h-5 w-5 text-green-600" />
                <p className="text-sm">
                  Please ensure someone is available at the address provided
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button onClick={onNewTicket} className="w-full">
              Submit Another Ticket
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>
              Need immediate assistance? Contact our emergency line: 0800-1234567
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
