/**
 * Describe Media Component
 * 
 * Step 2 of ticket creation flow - Description and photo upload
 * Based on legacy implementation, translated to English
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhotoDropzone, UploadedPhoto } from './PhotoDropzone';
import { LeafNode } from '@/types/decision-tree';
import { cn } from '@/lib/utils';

interface DescribeMediaProps {
  leafNode: LeafNode;
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  onNext: (data: { description: string; photos: UploadedPhoto[] }) => void;
  onBack: () => void;
  className?: string;
}

export const DescribeMedia = ({
  leafNode,
  onNext,
  onBack,
  className
}: DescribeMediaProps) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  const handleNext = () => {
    if (description.trim().length < 10) {
      return; // Basic validation
    }
    onNext({ description: description.trim(), photos });
  };

  const isDescriptionValid = description.trim().length >= 10;
  const canProceed = isDescriptionValid;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Describe the Problem</CardTitle>
          <p className="text-sm text-muted-foreground">
            Issue: {typeof leafNode.title === 'string' ? leafNode.title : leafNode.title.en}
          </p>
        </CardHeader>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Describe the problem in detail <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Where is the problem? When did it start? How often does it happen?"
              rows={4}
              required
              className={cn(
                "min-h-[100px]",
                !isDescriptionValid && description.length > 0 && "border-red-300"
              )}
            />
            {!isDescriptionValid && description.length > 0 && (
              <p className="text-sm text-red-600">
                Please provide at least 10 characters for a meaningful description.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {description.length}/10 minimum characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add photos to help us understand the problem better
          </p>
        </CardHeader>
        <CardContent>
          <PhotoDropzone
            maxFiles={8}
            maxSizeMB={10}
            value={photos}
            onChange={setPhotos}
            showHelpText={true}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-[#0052FF] hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          Next: Contact Details
        </Button>
      </div>
    </div>
  );
};
