/**
 * Describe Media Component
 * 
 * Step 2 of ticket creation flow - Description and photo upload
 * Based on legacy implementation, translated to English
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhotoDropzone, UploadedPhoto } from './PhotoDropzone';
import { LeafNode } from '@/types/decision-tree';
import { cn } from '@/lib/utils';
import { CustomQuestionField } from '@/components/ui/CustomQuestionField';
import { STEP2_QUESTIONS_CONFIG, CustomQuestion } from '@/types/custom-questions';

interface DescribeMediaProps {
  leafNode: LeafNode;
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  onNext: (data: { description: string; photos: UploadedPhoto[]; customAnswers?: Record<string, any> }) => void;
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
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get custom questions for this issue type
  const issueId = leafNode.node_id;
  const customQuestionsConfig = STEP2_QUESTIONS_CONFIG[issueId];
  const hasCustomQuestions = customQuestionsConfig && customQuestionsConfig.questions.length > 0;

  useEffect(() => {
    if (hasCustomQuestions && customQuestionsConfig) {
      const defaultAnswers: Record<string, any> = {};
      customQuestionsConfig.questions.forEach((question: CustomQuestion) => {
        if (question.defaultValue !== undefined) {
          defaultAnswers[question.id] = question.defaultValue;
          console.log('Setting default value:', question.id, question.defaultValue);
        }
      });
      
      if (Object.keys(defaultAnswers).length > 0) {
        console.log('Initializing custom answers with defaults:', defaultAnswers);
        setCustomAnswers(defaultAnswers);
      }
    }
  }, [hasCustomQuestions, issueId]);

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error when user provides answer
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const validateCustomQuestions = (): boolean => {
    if (!hasCustomQuestions) return true;

    const newErrors: Record<string, string> = {};
    customQuestionsConfig.questions.forEach((question: CustomQuestion) => {
      if (question.required) {
        const answer = customAnswers[question.id];
        if (!answer || (typeof answer === 'string' && !answer.trim())) {
          newErrors[question.id] = `${question.label} is verplicht`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (description.trim().length < 10) {
      return; // Basic validation
    }
    
    if (!validateCustomQuestions()) {
      return; // Custom questions validation failed
    }
    
    onNext({ 
      description: description.trim(), 
      photos,
      customAnswers: hasCustomQuestions ? customAnswers : undefined
    });
  };

  const isDescriptionValid = description.trim().length >= 10;
  const areCustomQuestionsValid = !hasCustomQuestions || customQuestionsConfig.questions.every((q: CustomQuestion) => 
    !q.required || (customAnswers[q.id] && (typeof customAnswers[q.id] !== 'string' || customAnswers[q.id].trim()))
  );
  const canProceed = isDescriptionValid && areCustomQuestionsValid;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Describe the Problem</CardTitle>
          <p className="text-sm text-muted-foreground">
            Issue: {typeof leafNode.title === 'string' ? leafNode.title : leafNode.title.en}
          </p>
          {hasCustomQuestions && (
            <p className="text-sm text-blue-600 font-medium">
              {customQuestionsConfig.description}
            </p>
          )}
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

      {/* Custom Questions */}
      {hasCustomQuestions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{customQuestionsConfig.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Beantwoord de vragen hieronder voor snellere afhandeling
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {customQuestionsConfig.questions.map((question: CustomQuestion) => (
              <CustomQuestionField
                key={question.id}
                question={question}
                value={customAnswers[question.id]}
                onChange={(value) => handleCustomAnswerChange(question.id, value)}
                error={errors[question.id]}
              />
            ))}
          </CardContent>
        </Card>
      )}

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
          Next: Review
        </Button>
      </div>
    </div>
  );
};
