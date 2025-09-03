/**
 * VideoCheck Component
 * 
 * Renders video with yes/no outcome buttons.
 * Based on spec section 2.1 - video_check node type.
 */

import { VideoCheckNode } from '@/types/decision-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface VideoCheckProps {
  node: VideoCheckNode;
  onOutcome: (outcome: 'yes' | 'no') => void;
}

export const VideoCheck = ({ node, onOutcome }: VideoCheckProps) => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {node.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {!videoError ? (
              <video
                src={node.video_url}
                controls
                className="w-full h-full"
                onError={() => setVideoError(true)}
                role="video"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Video not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Outcome Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => onOutcome('yes')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="h-4 w-4" />
              Yes, resolved
            </Button>
            
            <Button
              onClick={() => onOutcome('no')}
              variant="outline"
              className="flex items-center gap-2"
              size="lg"
            >
              <XCircle className="h-4 w-4" />
              No, not resolved
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 text-center">
            <p>
              Watch the video above and let us know if it helped resolve your issue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
