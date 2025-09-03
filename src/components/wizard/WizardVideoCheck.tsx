/**
 * Wizard Video Check Component
 * 
 * Renders video check nodes with embedded video and Yes/No outcomes
 */

import { VideoCheckNode } from '@/types/decision-tree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardVideoCheckProps {
  node: VideoCheckNode;
  onOutcome: (didVideoResolve: boolean) => void;
  className?: string;
}

export const WizardVideoCheck = ({ 
  node, 
  onOutcome, 
  className 
}: WizardVideoCheckProps) => {
  const getYouTubeEmbedUrl = (url: string): string => {
    // Convert YouTube watch URLs to embed URLs
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(node.video_url);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {typeof node.title === 'string' ? node.title : node.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {node.description && (
            <p className="text-muted-foreground">
              {typeof node.description === 'string' ? node.description : node.description.en}
            </p>
          )}
          
          {/* Video Embed */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src={embedUrl}
              title="Instructional Video"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>

      {/* Outcome Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Did this video help resolve your issue?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Yes Button */}
            <Button
              onClick={() => onOutcome(true)}
              className="h-auto p-6 flex flex-col items-center gap-3 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Yes, it's resolved</div>
                <div className="text-sm opacity-90">
                  The video helped me fix the issue
                </div>
              </div>
            </Button>

            {/* No Button */}
            <Button
              onClick={() => onOutcome(false)}
              className="h-auto p-6 flex flex-col items-center gap-3 bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">No, I need help</div>
                <div className="text-sm opacity-90">
                  I still need assistance with this issue
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
