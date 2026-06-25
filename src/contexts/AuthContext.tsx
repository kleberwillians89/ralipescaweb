import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Profile, UserRole } from '../types/database';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

type SignUpProfileData = {
  full_name?: string;
  role?: UserRole;
};

type AuthContextValue = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData?: SignUpProfileData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  enterDemo: () => void;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
};

const demoProfile: Profile = {
  id: 'demo-profile',
  user_id: 'demo-user',
  full_name: 'Participante Demo',
  avatar_url: null,
  role: 'participant',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoAuthenticated, setDemoAuthenticated] = useState(false);

  const loadProfile = async (userId: string) => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) {
      throw error;
    }

    return data;
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setProfile(data.session?.user ? await loadProfile(data.session.user.id) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user) {
        setProfile(null);
        return;
      }

      loadProfile(nextSession.user.id)
        .then(setProfile)
        .catch((error) => console.error('[Rali Noronha] Erro ao carregar perfil:', error));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      signIn: async (email, password) => {
        if (!supabase) {
          setDemoAuthenticated(true);
          setProfile(demoProfile);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }

        setSession(data.session);
        setUser(data.user);
        setProfile(data.user ? await loadProfile(data.user.id) : null);
      },
      signUp: async (email, password, profileData) => {
        if (!supabase) {
          setDemoAuthenticated(true);
          setProfile({ ...demoProfile, full_name: profileData?.full_name ?? demoProfile.full_name });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: profileData?.full_name ?? '',
              role: profileData?.role ?? 'participant',
            },
          },
        });
        if (error) {
          throw error;
        }

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            full_name: profileData?.full_name ?? email.split('@')[0],
            role: profileData?.role ?? 'participant',
          });
          if (profileError) {
            throw profileError;
          }
        }
      },
      signOut: async () => {
        if (supabase) {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
        }
        setDemoAuthenticated(false);
        setSession(null);
        setUser(null);
        setProfile(null);
      },
      resetPassword: async (email) => {
        if (!supabase) {
          console.info('[Rali Noronha] Reset de senha ignorado no modo demonstração para:', email);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          throw error;
        }
      },
      getCurrentUser: async () => {
        if (!supabase) {
          return null;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }

        return data.user;
      },
      enterDemo: () => {
        setDemoAuthenticated(true);
        setProfile(demoProfile);
      },
      session,
      user,
      profile: demoAuthenticated ? profile ?? demoProfile : profile,
      loading,
      isDemoMode: !isSupabaseConfigured,
    }),
    [demoAuthenticated, loading, profile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
