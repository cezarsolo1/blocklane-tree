import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const next = searchParams.get('next') || '/wizard';

        // Handle PKCE flow (modern approach with code exchange)
        const code = url.searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            toast({
              title: "Authenticatie mislukt",
              description: error.message,
              variant: "destructive",
            });
            navigate('/auth');
            return;
          }

          toast({
            title: "Succesvol ingelogd",
            description: "Uw account is bevestigd en u bent ingelogd.",
          });

          navigate(next);
          return;
        }

        // Handle legacy hash-based token flow (fallback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Authenticatie mislukt",
              description: error.message,
              variant: "destructive",
            });
            navigate('/auth');
            return;
          }

          toast({
            title: "Succesvol ingelogd",
            description: "Uw account is bevestigd en u bent ingelogd.",
          });

          navigate(next);
        } else {
          // No code or tokens found, redirect to auth
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Er is iets misgegaan",
          description: "Probeer opnieuw in te loggen.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Bevestigen van uw account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;