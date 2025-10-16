import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomQuestion } from '@/types/custom-questions';

interface CustomQuestionFieldProps {
  question: CustomQuestion;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return null;
};

const VideoPreview = ({ url }: { url: string }) => {
  const embedUrl = getVideoEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          Video preview niet beschikbaar. Ondersteunde platforms: YouTube, Vimeo
        </p>
      </div>
    );
  }
  
  return (
    <div className="mt-2">
      <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 aspect ratio */}
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-md"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video Preview"
        />
      </div>
    </div>
  );
};

export const CustomQuestionField: React.FC<CustomQuestionFieldProps> = ({
  question,
  value,
  onChange,
  error
}) => {
  const { id, type, label, placeholder, required, options, defaultValue } = question;

  // Use defaultValue if value is not set
  const currentValue = value !== undefined ? value : (defaultValue || '');

  const renderField = () => {
    switch (type) {
      case 'text': {
        const isVideoUrl = id === 'video_url';
        return (
          <div className="space-y-2">
            {!isVideoUrl && label && (
              <Label htmlFor={id}>
                {label}
                {required && !isVideoUrl && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            {!isVideoUrl && (
              <Input
                id={id}
                type="text"
                value={currentValue}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={error ? 'border-red-500' : ''}
              />
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {isVideoUrl && currentValue && <VideoPreview url={currentValue} />}
          </div>
        );
      }

      case 'textarea':
        return (
          <Textarea
            id={id}
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select value={currentValue} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={currentValue} onValueChange={onChange}>
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={currentValue === 'true' || currentValue === true}
              onCheckedChange={(checked) => onChange(checked.toString())}
            />
            <Label htmlFor={id}>{label}</Label>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && id !== 'video_url' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={id}
              type="number"
              value={currentValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={error ? 'border-red-500' : ''}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && id !== 'video_url' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={id}
              type="date"
              value={currentValue}
              onChange={(e) => onChange(e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-sm text-muted-foreground">{question.description}</p>
            )}
            <Input
              id={id}
              type="file"
              accept={question.accept || 'image/*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(file || null);
              }}
              className={error ? 'border-red-500' : ''}
            />
            {currentValue && (
              <p className="text-sm text-green-600">
                Bestand geselecteerd: {currentValue.name || 'Bestand'}
              </p>
            )}
          </div>
        );

      case 'info':
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-800 whitespace-pre-line">
              {label}
            </div>
            {question.description && (
              <p className="text-sm text-blue-600 mt-2">{question.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {type !== 'checkbox' && type !== 'text' && type !== 'info' && (
        <Label htmlFor={id}>
          {label} {required && id !== 'video_url' && <span className="text-red-500">*</span>}
        </Label>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
