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
import { InfoBox } from '@/components/ui/InfoBox';

interface DescribeMediaProps {
  leafNode: LeafNode;
  breadcrumbs: Array<{ nodeId: string; title: string }>;
  onNext: (data: { description: string; photos: UploadedPhoto[]; customAnswers?: Record<string, any> }) => void;
  onBack: () => void;
  onVideoFallback?: () => void; // New prop for handling "Niet gelukt?" button
  className?: string;
}

export const DescribeMedia = ({
  leafNode,
  onNext,
  onBack,
  onVideoFallback,
  className
}: DescribeMediaProps) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRegularForm, setShowRegularForm] = useState(false);

  // Get custom questions for this issue type
  const issueId = leafNode.node_id;
  const customQuestionsConfig = STEP2_QUESTIONS_CONFIG[issueId];
  const hasCustomQuestions = customQuestionsConfig && customQuestionsConfig.questions.length > 0;
  
  // Debug logging
  console.log('DescribeMedia - Issue ID:', issueId);
  console.log('DescribeMedia - Available Config Keys:', Object.keys(STEP2_QUESTIONS_CONFIG));
  console.log('DescribeMedia - Custom Questions Config:', customQuestionsConfig);
  console.log('DescribeMedia - Has Custom Questions:', hasCustomQuestions);
  const isVideoOnly = issueId === 'issue.video' && !showRegularForm;
  const isTenantResponsibility = issueId === 'issue.uw_responsability';
  const isEmergency = issueId === 'issue.emergency';

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
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCustomQuestions = () => {
    if (!hasCustomQuestions || !customQuestionsConfig) return true;
    
    const newErrors: Record<string, string> = {};
    customQuestionsConfig.questions.forEach((question: CustomQuestion) => {
      if (question.required) {
        const value = customAnswers[question.id];
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[question.id] = `${question.label} is verplicht`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // For video fallback cases, we need proper validation
    if (needsDescription && description.trim().length < 10) {
      return; // Basic validation
    }
    
    if (!validateCustomQuestions()) {
      return; // Custom questions validation failed
    }
    
    onNext({ 
      description: (isVideoOnly && !showRegularForm) || isTenantResponsibility || isEmergency ? '' : description.trim(), 
      photos: (isVideoOnly && !showRegularForm) || isTenantResponsibility || isEmergency ? [] : photos,
      customAnswers: hasCustomQuestions ? customAnswers : undefined
    });
  };

  const handleVideoFallback = () => {
    setShowRegularForm(true);
    // Clear any existing video-related custom answers
    setCustomAnswers({});
    if (onVideoFallback) {
      onVideoFallback();
    }
  };

  const isDescriptionValid = description.trim().length >= 10;
  const areCustomQuestionsValid = !hasCustomQuestions || customQuestionsConfig.questions.every((q: CustomQuestion) => 
    !q.required || (customAnswers[q.id] && (typeof customAnswers[q.id] !== 'string' || customAnswers[q.id].trim()))
  );
  
  // For video fallback cases, we need description validation
  const needsDescription = showRegularForm || (!isVideoOnly && !isTenantResponsibility && !isEmergency);
  const needsCustomQuestions = hasCustomQuestions && !showRegularForm && !isTenantResponsibility && !isEmergency;
  const canProceed = isVideoOnly || isTenantResponsibility || isEmergency || 
                    (needsDescription ? isDescriptionValid : true) && 
                    (needsCustomQuestions ? areCustomQuestionsValid : true);

  return (
    <div className={cn("space-y-6", className)}>

      {/* Emergency info box */}
      {isEmergency && (
        <InfoBox
          title="Dit is een noodgeval"
          body="Dit probleem vormt een direct gevaar voor de veiligheid.\n\nBel 112 en verlaat onmiddellijk de woning.\n\nWacht niet en onderneem direct actie."
          actions={[
            "Bel onmiddellijk 112",
            "Verlaat de woning direct"
          ]}
          footerNote="⚠️ Dit is een noodsituatie - handel onmiddellijk!"
          variant="error"
        />
      )}

      {/* Tenant responsibility info box */}
      {isTenantResponsibility && (
        <InfoBox
          title="Deze reparatie valt onder uw eigen verantwoordelijkheid"
          body="Helaas kan uw beheerder niet alle meldingen voor u oplossen. Voor dagelijks onderhoud, kleine herstellingen en situaties die door eigen gebruik zijn ontstaan, bent u als huurder zelf verantwoordelijk. Dat geldt ook voor dit geval.\n\nWilt u meer weten over welke gevallen onder uw verantwoordelijkheid vallen en welke bij de verhuurder? Lees dan de uitleg van de Rijksoverheid"
          actions={[
            "U kunt de reparatie zelf uitvoeren",
            "U kunt een vakman inschakelen op eigen kosten"
          ]}
          footerNote="Wilt u precies weten welke reparaties onder uw verantwoordelijkheid vallen? Raadpleeg dan het complete overzicht via de Rijksoverheid website."
          variant="warning"
        />
      )}

      {/* Custom questions description info box */}
      {customQuestionsConfig?.description && !isVideoOnly && !isTenantResponsibility && !isEmergency && (
        <InfoBox
          title={customQuestionsConfig.title || "Let op"}
          body={customQuestionsConfig.description}
          variant="info"
        />
      )}

      {/* Description - Show for regular cases and video fallback */}
      {(showRegularForm || (!isVideoOnly && !isTenantResponsibility && !isEmergency)) && (
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
                  needsDescription && !isDescriptionValid && description.length > 0 && "border-red-300"
                )}
              />
              {needsDescription && !isDescriptionValid && description.length > 0 && (
                <p className="text-sm text-red-600">
                  Please provide at least 10 characters for a meaningful description.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Provide as much detail as possible to help us resolve your issue quickly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Questions - Hide for video fallback cases */}
      {hasCustomQuestions && !isTenantResponsibility && !isEmergency && !showRegularForm && (
        <Card>
          {!isVideoOnly && !isTenantResponsibility && !isEmergency && (
            <CardHeader>
              <CardTitle className="text-lg">{customQuestionsConfig.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Beantwoord de vragen hieronder voor snellere afhandeling
              </p>
            </CardHeader>
          )}
          <CardContent className={isVideoOnly || isTenantResponsibility || isEmergency ? "p-6" : "space-y-4"}>
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

      {/* Photos - Show for regular cases and video fallback */}
      {(showRegularForm || (!isVideoOnly && !isTenantResponsibility && !isEmergency)) && (
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
              onChange={setPhotos}
              value={photos}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        
        {!isTenantResponsibility && !isEmergency && (
          <div className="flex gap-2">
            {isVideoOnly && (
              <Button
                onClick={handleVideoFallback}
                variant="outline"
                className="border-[#0052FF] text-[#0052FF] hover:bg-[#0052FF] hover:text-white"
              >
                Niet gelukt?
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-[#0052FF] hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isVideoOnly ? "Gelukt!" : "Next: Review"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
