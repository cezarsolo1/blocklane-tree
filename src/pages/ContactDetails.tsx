import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CustomQuestionField } from '@/components/ui/CustomQuestionField';
import { CUSTOM_QUESTIONS_CONFIG, CustomQuestion } from '@/types/custom-questions';

interface ContactDetailsProps {
  onBack: () => void;
  onNext: (data: ContactFormData) => void;
  initialData?: Partial<ContactFormData>;
  leafReason?: string;
}

export interface ContactFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  // Additional fields that may be used based on leaf_reason
  notes?: string;
  emergencyContact?: string;
  accessInstructions?: string;
  // Custom questions answers
  customAnswers?: Record<string, any>;
}

export default function ContactDetails({ 
  onBack, 
  onNext, 
  initialData = {},
  leafReason = 'standard_wizard'
}: ContactDetailsProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    contactName: initialData.contactName || '',
    contactEmail: initialData.contactEmail || '',
    contactPhone: initialData.contactPhone || '',
    streetAddress: initialData.streetAddress || '',
    postalCode: initialData.postalCode || '',
    city: initialData.city || '',
    notes: initialData.notes || '',
    emergencyContact: initialData.emergencyContact || '',
    accessInstructions: initialData.accessInstructions || '',
    customAnswers: initialData.customAnswers || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get custom questions configuration for this leaf_reason
  const customQuestionsConfig = CUSTOM_QUESTIONS_CONFIG[leafReason];
  const hasCustomQuestions = customQuestionsConfig && customQuestionsConfig.questions.length > 0;

  // Log the leaf_reason for backend analytics
  useEffect(() => {
    console.log('ContactDetails: Rendering for leaf_reason:', leafReason);
    
    // Send analytics event to backend
    if (typeof window !== 'undefined') {
      fetch('/supabase/functions/v1/log_step_event', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          step: 'contact_details',
          leaf_reason: leafReason,
          has_custom_questions: hasCustomQuestions,
          custom_questions_count: customQuestionsConfig?.questions.length || 0,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.warn('Analytics logging failed:', err));
    }
  }, [leafReason, hasCustomQuestions, customQuestionsConfig?.questions.length]);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: value
      }
    }));

    // Clear error when user provides answer
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Name is required';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (formData.contactPhone.trim().length < 6) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }
    
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // Validate custom questions
    if (hasCustomQuestions) {
      customQuestionsConfig.questions.forEach((question: CustomQuestion) => {
        if (question.required) {
          const answer = formData.customAnswers?.[question.id];
          if (!answer || (typeof answer === 'string' && !answer.trim())) {
            newErrors[question.id] = `${question.label} is required`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Log successful form completion
      console.log('ContactDetails: Form completed for leaf_reason:', leafReason);
      
      // Send completion event to backend
      if (typeof window !== 'undefined') {
        fetch('/supabase/functions/v1/log_step_event', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          },
          body: JSON.stringify({
            step: 'contact_details_completed',
            leaf_reason: leafReason,
            timestamp: new Date().toISOString(),
            form_data: {
              has_name: !!formData.contactName,
              has_email: !!formData.contactEmail,
              has_phone: !!formData.contactPhone,
              has_address: !!formData.streetAddress,
              has_notes: !!formData.notes,
              custom_answers_count: Object.keys(formData.customAnswers || {}).length
            }
          })
        }).catch(err => console.warn('Analytics logging failed:', err));
      }
      
      onNext(formData);
    }
  };

  // Determine if we should show additional fields based on leaf_reason
  const showAdditionalFields = leafReason === 'video_not_resolved' || leafReason === 'standard_wizard';
  const showEmergencyFields = leafReason === 'emergency';

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step 3: Contact Details
            {hasCustomQuestions && customQuestionsConfig.title && (
              <span className="text-sm font-normal text-muted-foreground">
                & {customQuestionsConfig.title}
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {hasCustomQuestions && customQuestionsConfig.description ? 
              customQuestionsConfig.description : 
              'Please provide your contact information so we can reach you about your ticket.'
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              
              <div>
                <Label htmlFor="contactName">Full Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Your full name"
                  className={errors.contactName ? 'border-red-500' : ''}
                />
                {errors.contactName && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your@email.com"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="06-12345678"
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactPhone}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  We'll use this to contact you about your maintenance request.
                </p>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Address Information</h3>
              
              <div>
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  placeholder="e.g., Main Street 123"
                  className={errors.streetAddress ? 'border-red-500' : ''}
                />
                {errors.streetAddress && (
                  <p className="text-sm text-red-500 mt-1">{errors.streetAddress}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="1234 AB"
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Amsterdam"
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Questions Section */}
            {hasCustomQuestions && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {customQuestionsConfig.title || 'Additional Questions'}
                </h3>
                
                {customQuestionsConfig.questions.map((question: CustomQuestion) => (
                  <CustomQuestionField
                    key={question.id}
                    question={question}
                    value={formData.customAnswers?.[question.id]}
                    onChange={(value) => handleCustomAnswerChange(question.id, value)}
                    error={errors[question.id]}
                  />
                ))}
              </div>
            )}

            {/* Additional Fields for specific leaf reasons */}
            {showAdditionalFields && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Additional Information</h3>
                
                <div>
                  <Label htmlFor="accessInstructions">Access Instructions (Optional)</Label>
                  <Textarea
                    id="accessInstructions"
                    value={formData.accessInstructions}
                    onChange={(e) => handleInputChange('accessInstructions', e.target.value)}
                    placeholder="e.g., Ring doorbell, keys under mat, building code 1234..."
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Help our maintenance team access the property if needed.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information that might be helpful..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Emergency Contact for emergency leaf_reason */}
            {showEmergencyFields && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Emergency Contact</h3>
                
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Name and phone number of emergency contact"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Alternative contact person in case we cannot reach you.
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <Button
                type="submit"
                className="flex items-center gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
