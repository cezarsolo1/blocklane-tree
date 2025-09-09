/**
 * Describe Media Component - Tenant Responsibility
 * 
 * Static Step 2 component specifically for tenant responsibility issues
 * Focuses on video upload functionality only
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeafNode } from '@/types/decision-tree';
import { cn } from '@/lib/utils';
import { CustomQuestionField } from '@/components/ui/CustomQuestionField';

interface DescribeMediaTenantResponsibilityProps {
  leafNode: LeafNode;
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  onNext: (data: { description: string; photos: any[]; customAnswers?: Record<string, any> }) => void;
  onBack: () => void;
  className?: string;
}

export const DescribeMediaTenantResponsibility = ({
  leafNode,
  onNext,
  onBack,
  className
}: DescribeMediaTenantResponsibilityProps) => {
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Static configuration for tenant responsibility
  const tenantResponsibilityConfig = {
    title: '',
    description: 'Upload een video om het probleem beter te laten zien',
    questions: [
      {
        id: 'video_url',
        type: 'text' as const,
        label: '',
        placeholder: 'bijv. https://youtube.com/watch?v=... of https://vimeo.com/...',
        required: true,
        defaultValue: 'https://www.youtube.com/watch?v=dRT3tepdMyI'
      }
    ]
  };

  useEffect(() => {
    // Initialize with default video URL
    const defaultAnswers: Record<string, any> = {};
    tenantResponsibilityConfig.questions.forEach((question) => {
      if (question.defaultValue !== undefined) {
        defaultAnswers[question.id] = question.defaultValue;
      }
    });
    
    if (Object.keys(defaultAnswers).length > 0) {
      setCustomAnswers(defaultAnswers);
    }
  }, []);

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
    const newErrors: Record<string, string> = {};
    tenantResponsibilityConfig.questions.forEach((question) => {
      if (question.required) {
        const answer = customAnswers[question.id];
        if (!answer || (typeof answer === 'string' && !answer.trim())) {
          newErrors[question.id] = `Video URL is verplicht`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCustomQuestions()) {
      return;
    }
    
    onNext({ 
      description: '', 
      photos: [],
      customAnswers
    });
  };

  const areCustomQuestionsValid = tenantResponsibilityConfig.questions.every((q) => 
    !q.required || (customAnswers[q.id] && (typeof customAnswers[q.id] !== 'string' || customAnswers[q.id].trim()))
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Describe the Problem</CardTitle>
          <p className="text-sm text-muted-foreground">
            Issue: {typeof leafNode.title === 'string' ? leafNode.title : leafNode.title.en}
          </p>
          <p className="text-sm text-blue-600 font-medium">
            {tenantResponsibilityConfig.description}
          </p>
        </CardHeader>
      </Card>

      {/* Video Upload Section */}
      <Card>
        <CardContent className="p-6">
          {tenantResponsibilityConfig.questions.map((question) => (
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
          disabled={!areCustomQuestionsValid}
          className="bg-[#0052FF] hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          Next: Review
        </Button>
      </div>
    </div>
  );
};
