import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Mail, Zap } from 'lucide-react';

interface RequestOtpProps {
  onOtpSent: (email: string) => void;
  onRequestOtp: (email: string) => Promise<{ error?: any }>;
  loading: boolean;
}

export const RequestOtp = ({ onOtpSent, onRequestOtp, loading }: RequestOtpProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { bypassAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Requesting OTP for:', email);
      const { error } = await onRequestOtp(email);

      if (error) {
        console.log('OTP request failed:', error);
        setError(error.message || 'Failed to send verification code');
        setIsSubmitting(false);
      } else {
        console.log('OTP request successful, moving to verification step');
        onOtpSent(email);
      }
    } catch (err) {
      console.error('OTP request exception:', err);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Maintenance Access Request</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address to receive a verification code
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          {/*  <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading || isSubmitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isSubmitting || !email.trim()}
            >
              {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
            */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  For Testing
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={bypassAuth}
            >
              <Zap className="w-4 h-4" />
              Skip Authentication
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Only authorized email addresses can access this system.</p>
              <p>If you need access, contact <strong>contact@blocklane.nl</strong></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
