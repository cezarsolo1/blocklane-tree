import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield } from 'lucide-react';

interface VerifyOtpProps {
  email: string;
  onVerifyOtp: (email: string, token: string) => Promise<{ error?: any }>;
  onBack: () => void;
  onRequestOtp: (email: string) => Promise<{ error?: any }>;
  loading: boolean;
}

export const VerifyOtp = ({ email, onVerifyOtp, onBack, onRequestOtp, loading }: VerifyOtpProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      console.log('Verifying OTP for:', email, 'Code:', otpCode);
      const { error } = await onVerifyOtp(email, otpCode);

      if (error) {
        console.log('OTP verification failed:', error);
        setError(error.message || 'Invalid verification code');
        setIsSubmitting(false);
        // Clear the OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        console.log('OTP verification successful');
        // Success will be handled by the auth state change in AuthProvider
      }
    } catch (err) {
      console.error('OTP verification exception:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const { error } = await onRequestOtp(email);
      if (error) {
        setError(error.message || 'Failed to resend code');
      } else {
        // Clear current OTP
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const otpCode = otp.join('');
  const isComplete = otpCode.length === 6;

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Enter Verification Code</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  disabled={loading || isSubmitting}
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isSubmitting || !isComplete}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={loading || isResending}
                className="text-sm"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={loading || isSubmitting}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
