/**
 * VideoCheckNode Component
 * 
 * Renders video_check nodes with two outcomes (yes/no).
 * Based on spec section 2.1 - video_check node type.
 */

import { VideoCheckNode as VideoCheckNodeType } from '@/types/decision-tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, CheckCircle, XCircle } from 'lucide-react';

interface VideoCheckNodeProps {
  node: VideoCheckNodeType;
  onOutcome: (outcome: 'yes' | 'no') => void;
}

export const VideoCheckNode = ({ node, onOutcome }: VideoCheckNodeProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {typeof node.title === 'string' ? node.title : node.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Video: {node.video_url}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                TODO: Implement video player
              </p>
            </div>
          </div>

          {/* Outcome Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => onOutcome('yes')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="h-4 w-4" />
              Yes, this solved my problem
            </Button>
            
            <Button
              onClick={() => onOutcome('no')}
              variant="outline"
              className="flex items-center gap-2"
              size="lg"
            >
              <XCircle className="h-4 w-4" />
              No, I still need help
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
