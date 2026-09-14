/**
 * Google Authentication Service
 * Supports:
 * 1. Supabase Google OAuth (Production / configured credentials)
 * 2. Google Identity Services (GSI client library)
 * 3. Instant Google Account Selector (Resilient Dev / Demo Mode)
 */

import { supabase } from './supabase.js';
import { normalizeIdentifier } from './cloudSync.js';

const GOOGLE_SESSION_KEY = 'atos_google_session';

/**
 * Creates a deterministic, stable user ID from an email address
 */
export function generateUserIdFromEmail(email) {
  const clean = normalizeIdentifier(email);
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const positiveHash = Math.abs(hash).toString(36);
  return `google_${positiveHash}`;
}

/**
 * Parses a JWT ID token from Google Identity Services without third-party library
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing Google JWT:', e);
    return null;
  }
}

/**
 * Formats user info into standardized ATOS Google profile
 */
export function formatGoogleUser({ email, name, picture, sub, id }) {
  const cleanEmail = normalizeIdentifier(email);
  const userId = id || (sub ? `google_${sub}` : generateUserIdFromEmail(cleanEmail));
  const displayName = name || cleanEmail.split('@')[0] || 'Athlete';
  const avatar = picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=edad45&color=000&bold=true`;

  return {
    id: userId,
    googleId: sub || userId,
    email: cleanEmail,
    name: displayName,
    picture: avatar,
    provider: 'google',
    authProvider: 'google',
    authenticatedAt: new Date().toISOString(),
  };
}

/**
 * Returns current saved Google session from localStorage
 */
export function getSavedGoogleUser() {
  try {
    const raw = localStorage.getItem(GOOGLE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves Google session to localStorage
 */
export function saveGoogleSession(user) {
  try {
    localStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to save Google session:', e);
  }
}

/**
 * Clears Google session
 */
export function clearGoogleSession() {
  localStorage.removeItem(GOOGLE_SESSION_KEY);
}

/**
 * Initiates Google OAuth Sign In
 */
export async function signInWithGoogle({ redirectTo } = {}) {
  const targetRedirect = redirectTo || `${window.location.origin}/login-screen`;

  // 1. If Supabase is active and has OAuth credentials configured
  try {
    if (supabase && typeof supabase.auth?.signInWithOAuth === 'function') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (!error && data?.url) {
        console.log('[GoogleAuth] Redirecting to Supabase Google OAuth:', data.url);
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }
      if (error) {
        console.warn('[GoogleAuth] Supabase OAuth returned notice:', error.message);
      }
    }
  } catch (err) {
    console.warn('[GoogleAuth] Supabase OAuth error, falling back:', err.message);
  }

  // 2. Return fallback flag so the UI can open the Google Account Picker modal
  return { success: false, needsModal: true };
}

export default {
  signInWithGoogle,
  formatGoogleUser,
  getSavedGoogleUser,
  saveGoogleSession,
  clearGoogleSession,
  generateUserIdFromEmail,
  parseJwt,
};
