/**
 * Authentication Provider Component
 * 
 * Provides authentication context and session management for the app
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getCurrentProfileId, getActiveTenancy } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profileId: string | null;
  tenancy: {
    unitId: string;
    buildingId: string;
    orgId: string;
  } | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [tenancy, setTenancy] = useState<{
    unitId: string;
    buildingId: string;
    orgId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Load profile and tenancy data
        try {
          const profileId = await getCurrentProfileId();
          setProfileId(profileId);
          
          if (profileId) {
            const tenancyData = await getActiveTenancy();
            setTenancy(tenancyData);
          }
        } catch (error) {
          console.error('Error loading profile/tenancy:', error);
        }
      } else {
        setProfileId(null);
        setTenancy(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    profileId,
    tenancy,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
