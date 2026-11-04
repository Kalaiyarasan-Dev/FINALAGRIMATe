import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserProfile,
  AuthSession,
  SignUpParams,
  getActiveSession,
  authenticateFarmer,
  registerFarmer,
  resetFarmerPassword,
  updateFarmerProfile,
  destroySession,
  getStoredUsers,
} from '@/services/authService';
import { useLanguage } from './LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  register: (params: SignUpParams) => Promise<{ error: Error | null }>;
  resetPassword: (identifier: string, newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  // Legacy backward compatibility
  signUpWithPhone: (phone: string, name: string, district: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string, otp: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setLanguage } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Ensure initial demo data is ready
        await getStoredUsers();

        const activeSession = getActiveSession();
        if (activeSession && activeSession.user) {
          setSession(activeSession);
          setProfile(activeSession.user);
          setUser({
            id: activeSession.user.id,
            email: activeSession.user.email,
            phone: activeSession.user.phone,
            name: activeSession.user.name,
          });

          // Sync saved preferred language if available
          if (activeSession.user.preferred_language) {
            setLanguage(activeSession.user.preferred_language);
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setLanguage]);

  const login = useCallback(
    async (identifier: string, password: string, rememberMe: boolean = true) => {
      try {
        const { user: userProfile, session: authSession } = await authenticateFarmer(
          identifier,
          password,
          rememberMe
        );

        setSession(authSession);
        setProfile(userProfile);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          phone: userProfile.phone,
          name: userProfile.name,
        });

        if (userProfile.preferred_language) {
          setLanguage(userProfile.preferred_language);
        }

        return { error: null };
      } catch (err: any) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
    [setLanguage]
  );

  const register = useCallback(
    async (params: SignUpParams) => {
      try {
        const { user: userProfile, session: authSession } = await registerFarmer(params);

        setSession(authSession);
        setProfile(userProfile);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          phone: userProfile.phone,
          name: userProfile.name,
        });

        if (params.preferredLanguage) {
          setLanguage(params.preferredLanguage);
        }

        return { error: null };
      } catch (err: any) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
    [setLanguage]
  );

  const resetPassword = useCallback(async (identifier: string, newPassword: string) => {
    try {
      await resetFarmerPassword(identifier, newPassword);
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, []);

  const signOut = useCallback(async () => {
    destroySession();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!profile) return { error: new Error('User not authenticated') };

      try {
        const updated = await updateFarmerProfile(profile.id, data);
        setProfile(updated);
        setUser((prev) => (prev ? { ...prev, name: updated.name } : null));

        if (data.preferred_language) {
          setLanguage(data.preferred_language);
        }

        return { error: null };
      } catch (err: any) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
    [profile, setLanguage]
  );

  const refreshProfile = useCallback(async () => {
    const active = getActiveSession();
    if (active?.user) {
      setProfile(active.user);
      setUser({
        id: active.user.id,
        email: active.user.email,
        phone: active.user.phone,
        name: active.user.name,
      });
    }
  }, []);

  // Legacy helper methods
  const signUpWithPhone = useCallback(
    async (phone: string, name: string, district: string) => {
      return register({
        phone,
        name,
        district,
        password: `Farmer_${phone.slice(-4)}@123`,
        preferredLanguage: 'ta',
      });
    },
    [register]
  );

  const signInWithPhone = useCallback(
    async (phone: string, _otp: string) => {
      // Find user or login with demo
      return login(phone, 'Farmer@123', true);
    },
    [login]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        login,
        register,
        resetPassword,
        signOut,
        updateProfile,
        refreshProfile,
        signUpWithPhone,
        signInWithPhone,
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
