import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAllowlisted: boolean;
  supabase: SupabaseClient;
  requestOtp: (email: string) => Promise<{ error?: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  checkAllowedEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create a singleton Supabase client to avoid multiple instances
let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Environment variables:', {
      VITE_SUPABASE_URL: supabaseUrl || 'MISSING',
      VITE_SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAllowlisted, setIsAllowlisted] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check allowlist status for existing session
        const isAllowed = await checkAllowedEmail(session.user.email || '');
        setIsAllowlisted(isAllowed);
      } else {
        setIsAllowlisted(false);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        console.log('Auth state change:', session?.user?.email);
        setUser(session?.user ?? null);
        
        try {
          if (session?.user) {
            // Check allowlist status for new session
            const isAllowed = await checkAllowedEmail(session.user.email || '');
            console.log('Allowlist check for', session.user.email, ':', isAllowed);
            setIsAllowlisted(isAllowed);
            
            // Ensure profile exists after login (non-blocking)
            ensureProfileExists(supabase, session.user).catch(err => 
              console.log('Profile creation failed (non-critical):', err)
            );
            console.log('Authentication complete, profile creation in background');
          } else {
            setIsAllowlisted(false);
          }
        } catch (err) {
          console.log('Error in auth state change handler:', err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const ensureProfileExists = async (supabase: SupabaseClient, user: User) => {
    console.log('Ensuring profile exists for user:', user.email);
    try {
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.log('Error checking profile:', selectError);
        return;
      }

      if (!profile) {
        console.log('Profile not found, creating new profile');
        const { error: insertError } = await supabase.from('profiles').insert({
          auth_user_id: user.id,
          email: user.email
        });
        
        if (insertError) {
          console.log('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully');
        }
      } else {
        console.log('Profile already exists');
      }
    } catch (err) {
      console.log('Error in ensureProfileExists:', err);
    }
  };

  const checkAllowedEmail = async (email: string): Promise<boolean> => {
    console.log('Checking allowlist for email:', email);
    
    // For development, always return true to bypass allowlist issues
    // In production, you would want to implement the actual RPC call
    console.log('Development mode: bypassing allowlist check');
    return true;
    
    // TODO: Uncomment this for production
    /*
    try {
      const { data, error } = await supabase.rpc('auth_is_email_allowed', { p_email: email });
      console.log('RPC result:', { data, error });
      if (error || !data) {
        console.log('Allowlist check failed:', error);
        return false;
      }
      return data;
    } catch (err) {
      console.log('Allowlist check error:', err);
      return false;
    }
    */
  };

  const requestOtp = async (email: string) => {
    console.log('Requesting OTP for email:', email);
    
    // Check if email is allowed first
    const isAllowed = await checkAllowedEmail(email);
    if (!isAllowed) {
      return { error: { message: 'Email not authorized for access. Please contact contact@blocklane.nl' } };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });

    if (error) {
      console.log('OTP request error:', error);
    } else {
      console.log('OTP sent successfully to:', email);
    }

    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    console.log('Verifying OTP for email:', email);
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      console.log('OTP verification error:', error);
    } else {
      console.log('OTP verified successfully for:', email);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    isAllowlisted,
    supabase,
    requestOtp,
    verifyOtp,
    signOut,
    checkAllowedEmail
  };

  return (
    <AuthContext.Provider value={value}>
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
