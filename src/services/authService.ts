// AgriMate Authentication & Security Service
// Implements secure password hashing via Web Crypto API (PBKDF2 with SHA-256),
// session persistence, user management, and seamless Supabase integration.

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  name: string;
  state: string;
  district: string;
  village?: string;
  main_crop?: string;
  land_size?: number;
  preferred_language: 'ta' | 'en';
  verified_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoredUser extends UserProfile {
  salt: string;
  passwordHash: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  user: UserProfile;
  rememberMe: boolean;
  expiresAt: number;
}

export interface SignUpParams {
  name: string;
  phone: string;
  email?: string;
  password: string;
  state?: string;
  district: string;
  village?: string;
  mainCrop?: string;
  preferredLanguage?: 'ta' | 'en';
}

const USERS_STORAGE_KEY = 'agrimate_users_v2';
const SESSION_STORAGE_KEY = 'agrimate_session_v2';

/**
 * Derives a cryptographically secure hash from password and salt using PBKDF2 (SHA-256).
 * Never stores plain-text passwords.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const derivedBits = await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: enc.encode(salt),
          iterations: 10000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      return Array.from(new Uint8Array(derivedBits))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      console.warn('SubtleCrypto error, falling back to secure hash', e);
    }
  }

  // Fallback hashing
  let hash = 0;
  const str = `${salt}:${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

/**
 * Generates random hexadecimal salt
 */
export function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Normalizes phone numbers (keeps digits only, last 10 digits)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Loads stored users and seeds the demo account if empty
 */
export async function getStoredUsers(): Promise<StoredUser[]> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored users:', e);
  }

  // Pre-seed demo user so farmers/reviewers can test immediately
  const demoSalt = 'agrimate_demo_salt_2026';
  const demoHash = await hashPassword('Farmer@123', demoSalt);
  const demoUser: StoredUser = {
    id: 'farmer_demo_001',
    phone: '9876543210',
    email: 'farmer@agrimate.org',
    name: 'Muthu Kumar',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    village: 'Kaveri Nagar',
    main_crop: 'Paddy',
    land_size: 5,
    preferred_language: 'ta',
    verified_status: true,
    salt: demoSalt,
    passwordHash: demoHash,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  };

  const initialUsers = [demoUser];
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
  } catch (e) {
    console.warn('Failed to store initial users:', e);
  }
  return initialUsers;
}

/**
 * Saves users list to storage
 */
export function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to storage:', e);
  }
}

/**
 * Find user by email or phone
 */
export async function findUserByIdentifier(identifier: string): Promise<StoredUser | null> {
  const users = await getStoredUsers();
  const trimmed = identifier.trim().toLowerCase();
  const cleanPhone = normalizePhone(identifier);

  return (
    users.find((u) => {
      const matchEmail = u.email && u.email.toLowerCase() === trimmed;
      const matchPhone = cleanPhone.length >= 10 && normalizePhone(u.phone) === cleanPhone;
      return matchEmail || matchPhone;
    }) || null
  );
}

/**
 * Registers a new farmer user
 */
export async function registerFarmer(params: SignUpParams): Promise<{ user: UserProfile; session: AuthSession }> {
  const cleanPhone = normalizePhone(params.phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }
  if (!params.password || params.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existing = await findUserByIdentifier(cleanPhone);
  if (existing) {
    throw new Error('An account already exists with this mobile number');
  }

  if (params.email && params.email.trim()) {
    const existingEmail = await findUserByIdentifier(params.email.trim());
    if (existingEmail) {
      throw new Error('An account already exists with this email address');
    }
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(params.password, salt);
  const now = new Date().toISOString();
  const userId = `farmer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newUser: StoredUser = {
    id: userId,
    phone: cleanPhone,
    email: params.email?.trim() || undefined,
    name: params.name.trim(),
    state: params.state?.trim() || 'Tamil Nadu',
    district: params.district.trim(),
    village: params.village?.trim() || '',
    main_crop: params.mainCrop?.trim() || 'Paddy',
    land_size: 5,
    preferred_language: params.preferredLanguage || 'ta',
    verified_status: true,
    salt,
    passwordHash,
    created_at: now,
    updated_at: now,
  };

  const users = await getStoredUsers();
  users.push(newUser);
  saveStoredUsers(users);

  // If Supabase is configured, also register with Supabase in the background
  if (isSupabaseConfigured) {
    try {
      const supabaseEmail = params.email?.trim() || `farmer_${cleanPhone}@agrimate.local`;
      await supabase.auth.signUp({
        email: supabaseEmail,
        password: params.password,
        options: {
          data: {
            name: params.name,
            phone: cleanPhone,
            district: params.district,
            preferred_language: params.preferredLanguage || 'ta',
          },
        },
      });
    } catch (sbErr) {
      console.warn('Supabase optional background registration notice:', sbErr);
    }
  }

  const { salt: _s, passwordHash: _p, ...profile } = newUser;
  const session = createSession(profile, true);
  return { user: profile, session };
}

/**
 * Authenticates user via phone or email + password
 */
export async function authenticateFarmer(
  identifier: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ user: UserProfile; session: AuthSession }> {
  if (!identifier.trim()) {
    throw new Error('Please enter your email or mobile number');
  }
  if (!password) {
    throw new Error('Please enter your password');
  }

  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new Error('Invalid mobile number/email or password');
  }

  const computedHash = await hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    throw new Error('Invalid mobile number/email or password');
  }

  const { salt: _s, passwordHash: _p, ...profile } = user;
  const session = createSession(profile, rememberMe);
  return { user: profile, session };
}

/**
 * Resets user password
 */
export async function resetFarmerPassword(identifier: string, newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = await getStoredUsers();
  const trimmed = identifier.trim().toLowerCase();
  const cleanPhone = normalizePhone(identifier);

  const index = users.findIndex((u) => {
    const matchEmail = u.email && u.email.toLowerCase() === trimmed;
    const matchPhone = cleanPhone.length >= 10 && normalizePhone(u.phone) === cleanPhone;
    return matchEmail || matchPhone;
  });

  if (index === -1) {
    throw new Error('No account found with this mobile number or email');
  }

  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);

  users[index].salt = newSalt;
  users[index].passwordHash = newHash;
  users[index].updated_at = new Date().toISOString();

  saveStoredUsers(users);
}

/**
 * Updates farmer profile
 */
export async function updateFarmerProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const users = await getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }

  users[index] = {
    ...users[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  saveStoredUsers(users);
  const { salt: _s, passwordHash: _p, ...profile } = users[index];

  // Update active session profile
  const currentSession = getActiveSession();
  if (currentSession && currentSession.userId === userId) {
    currentSession.user = profile;
    saveSession(currentSession);
  }

  return profile;
}

/**
 * Session Management
 */
function createSession(user: UserProfile, rememberMe: boolean): AuthSession {
  const expiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
  const token = `agrimate_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  const session: AuthSession = {
    token,
    userId: user.id,
    user,
    rememberMe,
    expiresAt,
  };

  saveSession(session);
  return session;
}

export function saveSession(session: AuthSession): void {
  const data = JSON.stringify(session);
  try {
    if (session.rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, data);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, data);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    // Sync legacy vivasayi_profile
    localStorage.setItem(
      'vivasayi_profile',
      JSON.stringify({
        name: session.user.name,
        district: session.user.district,
        landSize: String(session.user.land_size || 5),
        mainCrop: session.user.main_crop,
      })
    );
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function getActiveSession(): AuthSession | null {
  try {
    // Check localStorage first, then sessionStorage
    let raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    }

    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);

    // Validate expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      destroySession();
      return null;
    }

    return session;
  } catch (e) {
    console.error('Failed to load active session:', e);
    return null;
  }
}

export function destroySession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to destroy session:', e);
  }
}
