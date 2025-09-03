/**
 * Review Page (Step 4)
 * 
 * Shows summary of all collected information before submission.
 * Based on spec section 3.1 - Step 4: Review.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, FileText, Camera } from 'lucide-react';

interface ReviewProps {
  ticketId: string;
  flowData?: {
    description?: string;
    photos?: File[];
    contact?: any;
    answers?: any;
  };
  onNext: () => void;
  onBack: () => void;
}

export const Review = ({ flowData, onNext, onBack }: ReviewProps) => {
  const { description, photos, contact, answers } = flowData || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Review Your Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">


          {/* Description */}
          {description && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{description}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {photo instanceof File && (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs text-gray-500">
                          {photo.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {contact && contact.name && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p className="text-sm"><strong>Name:</strong> {contact.name}</p>
                <p className="text-sm"><strong>Phone:</strong> {contact.phone}</p>
                {contact.email && (
                  <p className="text-sm"><strong>Email:</strong> {contact.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Additional Answers */}
          {answers && Object.keys(answers).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Additional Information</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                {answers.entry_permission && (
                  <p className="text-sm">✓ Entry permission granted</p>
                )}
                {answers.pets_present && (
                  <p className="text-sm">⚠ Pets present in home</p>
                )}
                {answers.availability && (
                  <p className="text-sm"><strong>Availability:</strong> {answers.availability}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={onNext} className="bg-green-600 hover:bg-green-700">
              Submit Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
