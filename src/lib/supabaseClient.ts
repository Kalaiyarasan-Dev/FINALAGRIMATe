import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Checks whether valid, non-placeholder Supabase configuration is present in the environment.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('your-supabase-anon-key') &&
  !supabaseAnonKey.includes('placeholder')
);

// Fallback placeholder credentials to prevent Vite runtime crash before environment variables are set
const targetUrl = isSupabaseConfigured ? supabaseUrl : 'https://zxkzmmgfyffuxpgnkbgn.supabase.co';
const targetKey = isSupabaseConfigured ? supabaseAnonKey : 'sb_publishable_gSmbzgD9E4OoQTRiU4NCXw_zOW2Sltd';

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase Configuration Warning] The application is missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(targetUrl, targetKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface UserProfile {
  id: string;
  phone: string | null;
  name: string;
  district: string | null;
  state: string;
  land_size: number | null;
  preferred_language: 'ta' | 'en';
  verified_status: boolean;
  created_at: string;
  updated_at: string;
}
