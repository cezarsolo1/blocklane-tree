/**
 * Wizard Ticket Flow Component
 * 
 * Handles the ticket creation workflow for start_ticket leaves
 * Steps: 1. Leaf reached → 2. Describe & Media → 3. Contact Questions → 4. Review → 5. Submit
 */

import { useState } from 'react';
import { LeafNode } from '@/types/decision-tree';
import { DescribeMedia } from './DescribeMedia';
import { UploadedPhoto } from './PhotoDropzone';
import { createTicketService } from '@/modules/tickets/TicketServiceFactory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { ContactFormData } from '@/pages/ContactDetails';

interface WizardTicketFlowProps {
  leafNode: LeafNode;
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  onBack: () => void;
  onComplete: () => void;
  onStepChange?: (step: number) => void;
  className?: string;
}

type FlowStep = 'describe_media' | 'review' | 'submitted';

interface FlowData {
  description: string;
  photos: UploadedPhoto[];
  contactData?: ContactFormData;
  customAnswers?: Record<string, any>;
  ticketId?: string;
}

export const WizardTicketFlow = ({
  leafNode,
  breadcrumbs,
  onBack,
  onComplete,
  onStepChange,
  className
}: WizardTicketFlowProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('describe_media');
  const [flowData, setFlowData] = useState<FlowData>({
    description: '',
    photos: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const ticketService = createTicketService();

  const handleDescribeMediaSubmit = async (data: { description: string; photos: UploadedPhoto[]; customAnswers?: Record<string, any> }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Log the complete navigation path including video check outcomes
      console.log('Creating ticket with navigation path:', {
        leafNode: {
          node_id: leafNode.node_id,
          leaf_type: leafNode.leaf_type,
          leaf_reason: leafNode.leaf_reason,
          title: leafNode.title
        },
        breadcrumbs,
        isVideoCheckOutcome: leafNode.node_id.includes('_outcome_'),
        videoResolved: leafNode.node_id.includes('_resolved'),
        timestamp: new Date().toISOString()
      });

      // Create draft ticket with better error handling
      let result;
      try {
        result = await ticketService.createDraft({
          sessionId: `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tree: {
            id: 'maintenance-v1',
            version: 1,
            node_id: leafNode.node_id,
            leaf_type: leafNode.leaf_type,
            leaf_reason: leafNode.leaf_reason,
          }
        });
      } catch (serviceError) {
        console.error('Ticket service error:', serviceError);
        throw new Error(`Failed to create ticket: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`);
      }

      if (!result || !result.ticket_id) {
        throw new Error('Invalid response from ticket service - no ticket ID returned');
      }

      const ticketId = result.ticket_id;
      console.log('Ticket created successfully:', ticketId);

      // Upload photos if any
      if (data.photos.length > 0) {
        try {
          const files = data.photos.map(photo => photo.file);
          await ticketService.uploadMedia(ticketId, files);
          console.log('Photos uploaded successfully');
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Don't fail the entire flow for photo upload issues
          console.warn('Continuing without photos due to upload error');
        }
      }

      setFlowData({
        description: data.description,
        photos: data.photos,
        customAnswers: data.customAnswers
      });
      
      setCurrentStep('review');
      onStepChange?.(2); // Move to Step 3 (0-indexed)
    } catch (err) {
      console.error('Full error in handleDescribeMediaSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };


  const handleReviewSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (flowData.ticketId) {
        await ticketService.finalize(flowData.ticketId);
      }
      
      setCurrentStep('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep = (step: FlowStep) => {
    setCurrentStep(step);
    setError(null);
    
    // Update progress bar based on step
    if (step === 'describe_media') {
      onStepChange?.(1); // Step 2
    } else if (step === 'review') {
      onStepChange?.(2); // Step 3
    }
  };

  if (currentStep === 'describe_media') {
    return (
      <div className={className}>
        <DescribeMedia
          leafNode={leafNode}
          breadcrumbs={breadcrumbs}
          onNext={handleDescribeMediaSubmit}
          onBack={onBack}
        />
        
        {isLoading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Creating ticket...
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }


  if (currentStep === 'review') {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review Your Request</CardTitle>
            <p className="text-sm text-muted-foreground">
              Please review your maintenance request before submitting.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Issue Type</h4>
              <p className="text-sm text-muted-foreground">
                {typeof leafNode.title === 'string' ? leafNode.title : leafNode.title.en}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{flowData.description}</p>
            </div>
            
            {flowData.photos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Photos</h4>
                <p className="text-sm text-muted-foreground">
                  {flowData.photos.length} photo(s) attached
                </p>
              </div>
            )}

            {flowData.customAnswers && Object.keys(flowData.customAnswers).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Additional Details</h4>
                <div className="space-y-2">
                  {Object.entries(flowData.customAnswers).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                      <span className="text-muted-foreground">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => handleBackToStep('describe_media')}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleReviewSubmit}
                disabled={isLoading}
                className="bg-[#0052FF] hover:bg-blue-600 text-white"
              >
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'submitted') {
    return (
      <div className={className}>
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request Submitted Successfully</h2>
            <p className="text-muted-foreground mb-6">
              Your maintenance request has been submitted. You will receive updates via email.
            </p>
            {flowData.ticketId && (
              <p className="text-sm text-muted-foreground mb-6">
                Reference number: {flowData.ticketId}
              </p>
            )}
            <Button onClick={onComplete} className="bg-[#0052FF] hover:bg-blue-600 text-white">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
