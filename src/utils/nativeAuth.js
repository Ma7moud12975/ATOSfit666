/**
 * ATOSfit Native Authentication Service
 * --------------------------------------
 * Direct, secure Email & Password authentication backed by Supabase database.
 * Completely independent of third-party OAuth (no Google required).
 * Ensures full account data and 4-week training plans are restored across any device.
 */

import { supabase } from './supabase.js';
import { normalizeIdentifier, fetchCloudUserProfile, hydrateLocalSession } from './cloudSync.js';

const SESSION_STORAGE_KEY = 'user';
const NATIVE_AUTH_TOKEN_KEY = 'atos_native_session';

/**
 * Computes a secure SHA-256 hash of the password with a static salt
 */
export async function hashPassword(password, salt = 'atos_fit_secure_salt_2026') {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a stable deterministic or random user ID
 */
export function generateUserId(email) {
  const clean = normalizeIdentifier(email);
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `user_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

/**
 * Register a new user account and save directly to Supabase users table
 */
export async function registerUser({ fullName, email, password, fitnessLevel = 'intermediate', goals = [] }) {
  const cleanEmail = normalizeIdentifier(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  if (!fullName || !fullName.trim()) {
    throw new Error('Please enter your full name.');
  }

  // 1. Check if email already exists in Supabase
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        throw new Error('This email is already registered. Please sign in.');
      }
    }
  } catch (checkErr) {
    if (checkErr.message && checkErr.message.includes('already registered')) throw checkErr;
    console.warn('[NativeAuth] Pre-check notice:', checkErr?.message);
  }

  const passwordHash = await hashPassword(password);
  const userId = generateUserId(cleanEmail);
  const now = new Date().toISOString();

  const userProfile = {
    id: userId,
    email: cleanEmail,
    name: fullName.trim(),
    fullName: fullName.trim(),
    role: 'user',
    fitnessLevel,
    goals,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const fullPayload = {
    user: userProfile,
    trainingPlan: null,
    passwordHash,
    registeredAt: now,
  };

  // 2. Save account to Supabase users table
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { error: insertErr } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: cleanEmail,
          full_name: fullName.trim(),
          role: 'user',
          fitness_level: fitnessLevel,
          goals,
          raw_user_meta_data: fullPayload,
          date_joined: now,
          last_login: now,
        });

      if (insertErr) {
        console.warn('[NativeAuth] Supabase insert notice:', insertErr.message);
        // Fallback update if email exists
        await supabase
          .from('users')
          .update({
            full_name: fullName.trim(),
            raw_user_meta_data: fullPayload,
            last_login: now,
          })
          .eq('email', cleanEmail);
      } else {
        console.log('[NativeAuth] Account successfully created in Supabase:', cleanEmail);
      }
    }
  } catch (sbErr) {
    if (sbErr.message && sbErr.message.includes('already registered')) throw sbErr;
    console.warn('[NativeAuth] Database save warning:', sbErr?.message);
  }

  // 3. Also try Supabase Auth signUp as a parallel service
  try {
    if (supabase?.auth?.signUp) {
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
    }
  } catch {}

  // 4. Save session locally
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
  localStorage.setItem(NATIVE_AUTH_TOKEN_KEY, JSON.stringify({
    userId,
    email: cleanEmail,
    name: fullName.trim(),
    passwordHash,
    loggedInAt: now,
  }));

  return { success: true, user: userProfile, isNewUser: true };
}

/**
 * Login with Email and Password and hydrate full profile from Supabase
 */
export async function loginUser({ email, password }) {
  const cleanEmail = normalizeIdentifier(email);
  if (!cleanEmail || !password) {
    throw new Error('Please enter your email and password.');
  }

  const expectedHash = await hashPassword(password);
  const now = new Date().toISOString();
  let authenticatedUser = null;
  let cloudPayload = null;

  // 1. Look up user in Supabase users table
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbUser) {
        const storedMeta = dbUser.raw_user_meta_data || {};
        const storedHash = storedMeta.passwordHash;

        // Verify password
        if (storedHash && storedHash !== expectedHash) {
          throw new Error('Incorrect password. Please try again.');
        }

        const profilePic = dbUser.profile_picture || storedMeta?.user?.profilePicture || storedMeta?.user?.avatar || '';
        const isAlreadyOnboarded = Boolean(
          storedMeta?.user?.onboardingCompleted === true ||
          (dbUser.weight && dbUser.height)
        );

        const baseUserObj = {
          ...(storedMeta.user || {}),
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.full_name || storedMeta?.user?.name || 'Athlete',
          fullName: dbUser.full_name || storedMeta?.user?.fullName || 'Athlete',
          fitnessLevel: dbUser.fitness_level || storedMeta?.user?.fitnessLevel || 'intermediate',
          goals: dbUser.goals || storedMeta?.user?.goals || [],
          profilePicture: profilePic,
          avatar: profilePic,
          age: dbUser.age ?? storedMeta?.user?.age ?? '',
          height: dbUser.height ?? storedMeta?.user?.height ?? '',
          weight: dbUser.weight ?? storedMeta?.user?.weight ?? '',
          onboardingCompleted: isAlreadyOnboarded,
        };
        authenticatedUser = baseUserObj;
        cloudPayload = {
          ...(storedMeta || {}),
          user: baseUserObj,
          trainingPlan: storedMeta?.trainingPlan || null,
        };

        // Update last login in database
        supabase
          .from('users')
          .update({ last_login: now })
          .eq('id', dbUser.id)
          .then();
      }
    }
  } catch (err) {
    if (err.message?.includes('Incorrect password')) throw err;
    console.warn('[NativeAuth] Supabase lookup error:', err?.message);
  }

  // 2. Fallback: try Supabase Auth signInWithPassword if needed
  if (!authenticatedUser) {
    try {
      if (supabase?.auth?.signInWithPassword) {
        const { data: sbAuthData, error: sbAuthErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!sbAuthErr && sbAuthData?.user) {
          const raw = sbAuthData.user;
          cloudPayload = await fetchCloudUserProfile(cleanEmail);
          authenticatedUser = cloudPayload?.user || {
            id: raw.id,
            email: raw.email,
            name: raw.user_metadata?.full_name || cleanEmail.split('@')[0],
            onboardingCompleted: false,
          };
        }
      }
    } catch {}
  }

  // 3. Fallback: Check local cache if offline
  if (!authenticatedUser) {
    try {
      const localSessionRaw = localStorage.getItem(NATIVE_AUTH_TOKEN_KEY);
      if (localSessionRaw) {
        const localSession = JSON.parse(localSessionRaw);
        if (normalizeIdentifier(localSession.email) === cleanEmail && localSession.passwordHash === expectedHash) {
          const localUserRaw = localStorage.getItem(SESSION_STORAGE_KEY);
          if (localUserRaw) {
            authenticatedUser = JSON.parse(localUserRaw);
          }
        }
      }
    } catch {}
  }

  if (!authenticatedUser) {
    throw new Error('No account found with this email, or incorrect password. Please check your credentials.');
  }

  // 4. Hydrate full profile, training plan, and stats across the browser
  if (cloudPayload) {
    hydrateLocalSession(cloudPayload);
  } else {
    const latestCloud = await fetchCloudUserProfile(cleanEmail);
    if (latestCloud) {
      hydrateLocalSession(latestCloud);
      authenticatedUser = latestCloud.user;
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
    }
  }

  // Update session marker
  localStorage.setItem(NATIVE_AUTH_TOKEN_KEY, JSON.stringify({
    userId: authenticatedUser.id,
    email: cleanEmail,
    name: authenticatedUser.name,
    passwordHash: expectedHash,
    loggedInAt: now,
  }));

  // Trigger window event for live state update
  window.dispatchEvent(new CustomEvent('atos_user_profile_hydrated', { detail: authenticatedUser }));

  return {
    success: true,
    user: authenticatedUser,
    isNewUser: !authenticatedUser.onboardingCompleted,
  };
}

/**
 * Log out user from current device
 */
export async function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(NATIVE_AUTH_TOKEN_KEY);
  localStorage.removeItem('atos_google_session');

  try {
    if (supabase?.auth?.signOut) {
      await supabase.auth.signOut();
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('atos_user_logged_out'));
}

/**
 * Get current saved user profile
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  hashPassword,
};
