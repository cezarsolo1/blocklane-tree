/**
 * Contact & Other Questions Page (Step 3)
 * 
 * Renders questions based on question_groups configuration.
 * Based on spec section 3.1 - Step 3: Contact & Other Questions.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactQuestionsProps {
  ticketId: string;
  questionGroups?: string[];
  onNext: (data: { contact: any; answers: any }) => void;
  onBack: () => void;
}

export const ContactQuestions = ({ questionGroups = [], onNext, onBack }: ContactQuestionsProps) => {
  const [contact, setContact] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [answers, setAnswers] = useState({
    contact_at_home: false,
    entry_permission: false,
    pets_present: false,
    availability: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null;

    // Remove all non-digit characters for validation
    const digits = phone.replace(/\D/g, '');
    
    // NL local format: 10 digits starting with 0
    if (digits.length === 10 && digits.startsWith('0')) {
      return null;
    }
    
    // E.164 format: +31 followed by 9 digits
    if (phone.startsWith('+31') && digits.length === 12) {
      return null;
    }
    
    // Formatted with spaces/dashes
    const formatted = phone.replace(/[\s\-\(\)]/g, '');
    if (formatted.startsWith('+31') && formatted.length === 12) {
      return null;
    }
    
    return 'Please enter a valid Dutch phone number (e.g., 0612345678 or +31 6 12345678)';
  };

  const handlePhoneChange = (value: string) => {
    setContact(prev => ({ ...prev, phone: value }));
    
    const error = validatePhone(value);
    setErrors(prev => ({
      ...prev,
      phone: error || ''
    }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!contact.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!contact.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneError = validatePhone(contact.phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext({ contact, answers });
  };

  const renderContactAtHome = () => {
    if (!questionGroups.includes('contact_at_home')) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={contact.name}
            onChange={(e) => setContact(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={contact.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="0612345678 or +31 6 12345678"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          <p className="text-sm text-gray-500 mt-1">
            We'll call you to schedule the repair
          </p>
        </div>

        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={contact.email}
            onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
          />
        </div>
      </div>
    );
  };

  const renderEntryPermission = () => {
    if (!questionGroups.includes('entry_permission')) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Access Information</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="entry_permission"
            checked={answers.entry_permission}
                        onCheckedChange={(checked: boolean) =>
              setAnswers(prev => ({ ...prev, entry_permission: checked }))
            }
          />
          <Label htmlFor="entry_permission">
            I grant permission for contractors to enter my home when I'm not present
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pets_present"
            checked={answers.pets_present}
                        onCheckedChange={(checked: boolean) =>
              setAnswers(prev => ({ ...prev, pets_present: checked }))
            }
          />
          <Label htmlFor="pets_present">
            There are pets in the home
          </Label>
        </div>

        <div>
          <Label htmlFor="availability">Preferred Availability</Label>
          <Input
            id="availability"
            value={answers.availability}
            onChange={(e) => setAnswers(prev => ({ ...prev, availability: e.target.value }))}
            placeholder="e.g., Weekdays 9 AM - 5 PM"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact & Access Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContactAtHome()}
          {renderEntryPermission()}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={handleSubmit}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
