import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './AuthProvider';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Watch for successful authentication
  useEffect(() => {
    console.log('LoginForm useEffect - user:', user?.email, 'authLoading:', authLoading, 'loading:', loading);
    if (user && !authLoading) {
      console.log('User authenticated, navigating to address-check');
      setLoading(false);
      navigate('/address-check');
      onSuccess?.();
    }
  }, [user, authLoading, navigate, onSuccess, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Don't navigate here - let the useEffect handle it when auth state changes
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline text-sm"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
