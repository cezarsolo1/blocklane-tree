/**
 * Login Form Component
 * 
 * Simple email OTP login form for authentication
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/modules/auth/AuthProvider';
import { Mail, CheckCircle, Zap } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestOtp, bypassAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await requestOtp(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in. You can close this window.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
            className="w-full"
          >
            Try different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Sign in to Blocklane</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or for development
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
          
          <p className="text-xs text-muted-foreground text-center">
            We'll send you a secure link to sign in without a password.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
