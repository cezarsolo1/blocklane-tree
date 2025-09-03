import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  resendSignUp: (email: string) => Promise<{ error: any, data?: any }>;
  signIn: (email: string, password: string, redirectTo?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const SITE_URL =
    (import.meta.env.VITE_SITE_URL?.replace(/\/$/, "")) ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const signUp = async (email: string, password: string, fullName?: string) => {
    const emailRedirectTo = `${SITE_URL}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo, data: { full_name: fullName || "" } }
    });
    console.log("[signUp]", { data, error, emailRedirectTo });

    if (error) {
      // You will see "redirect_to is not allowed", "User already registered", etc.
      toast({ title: "Registratie mislukt", description: error.message, variant: "destructive" });
      return { error };
    }

    const msg = data.user?.confirmed_at
      ? "Account bestaat al en is bevestigd. U kunt inloggen."
      : "Registratie gelukt. Controleer uw inbox of spam voor de bevestiging.";
    toast({ title: "Status", description: msg });
    return { error: null };
  };

  const resendSignUp = async (email: string) => {
    const emailRedirectTo = `${SITE_URL}/auth/callback`;
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo }
    });
    console.log("[resend]", { data, error, emailRedirectTo });

    if (error) {
      toast({ title: "Kon e-mail niet verzenden", description: error.message, variant: "destructive" });
      return { error };
    }
    toast({ title: "E-mail opnieuw verzonden", description: "Controleer inbox/spam." });
    return { error: null };
  };

  const signIn = async (email: string, password: string, redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Inloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    } else if (redirectTo) {
      // Redirect after successful login
      window.location.href = redirectTo;
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${SITE_URL}/auth/callback?next=/auth%3Ftab%3Dreset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Reset mislukt",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Reset link verstuurd",
      description: "Controleer uw email voor de reset link.",
    });
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Uitloggen mislukt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      resendSignUp,
      signIn,
      signOut,
      resetPassword,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};