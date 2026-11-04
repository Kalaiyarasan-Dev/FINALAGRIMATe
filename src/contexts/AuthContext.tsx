import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, UserProfile } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signUpWithPhone: (phone: string, name: string, district: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert phone number into a consistent internal identity
const phoneToEmail = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `farmer_${cleanPhone}@farmergenz.internal`;
};

// Deterministic internal secret for demo phone authentication
const phoneToPassword = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `fgz_farmer_${cleanPhone}_pwd`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from Supabase profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        // Sync to localStorage so existing UI reading vivasayi_profile stays consistent
        localStorage.setItem(
          'vivasayi_profile',
          JSON.stringify({
            name: data.name,
            district: data.district || 'Thanjavur',
            landSize: String(data.land_size || '5'),
          })
        );
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithPhone = async (phone: string, name: string, district: string) => {
    try {
      const email = phoneToEmail(phone);
      const password = phoneToPassword(phone);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            district,
          },
        },
      });

      if (error) {
        // If already exists, try signing in
        if (error.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) return { error: signInError };
        } else {
          return { error };
        }
      }

      const activeUser = data?.user ?? (await supabase.auth.getUser()).data.user;
      if (activeUser) {
        // Upsert profile record in public.profiles
        const profilePayload = {
          id: activeUser.id,
          phone,
          name,
          district,
          state: 'Tamil Nadu',
          land_size: 5,
          preferred_language: 'ta',
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profilePayload);

        if (!profileError) {
          await fetchProfile(activeUser.id);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithPhone = async (phone: string, _otp: string) => {
    try {
      const email = phoneToEmail(phone);
      const password = phoneToPassword(phone);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist yet, create account transparently
        if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('user not found')) {
          return await signUpWithPhone(phone, 'Farmer', 'Thanjavur');
        }
        return { error };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchProfile(user.id);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const payload = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) return { error };

      await fetchProfile(user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signUpWithPhone,
        signInWithPhone,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
