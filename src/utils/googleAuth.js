/**
 * Google Authentication Service — Real OAuth via Google Identity Services (GIS)
 * Shows the actual Google account picker when user clicks "Sign in with Google"
 */

import { supabase } from './supabase.js';
import { normalizeIdentifier } from './cloudSync.js';

const GOOGLE_SESSION_KEY = 'atos_google_session';

// Holds the resolve/reject for the active sign-in Promise
let _pendingResolve = null;
let _pendingReject = null;

/**
 * Creates a deterministic stable user ID from email
 */
export function generateUserIdFromEmail(email) {
  const clean = normalizeIdentifier(email);
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `google_${Math.abs(hash).toString(36)}`;
}

/**
 * Parses a Google JWT credential token
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
  } catch {
    return null;
  }
}

/**
 * Formats raw Google user data into standardized ATOSfit profile
 */
export function formatGoogleUser({ email, name, picture, sub, id }) {
  const cleanEmail = normalizeIdentifier(email);
  const userId = (sub ? `google_${sub}` : null) || id || generateUserIdFromEmail(cleanEmail);
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
  } catch {}
}

/**
 * Clears Google session
 */
export function clearGoogleSession() {
  localStorage.removeItem(GOOGLE_SESSION_KEY);
}

/**
 * Dynamically loads the Google Identity Services script
 */
function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.getElementById('gsi-script');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
}

/**
 * GIS callback — called by Google when user selects an account
 */
function handleGisCredentialResponse(response) {
  if (!response?.credential) {
    if (_pendingReject) _pendingReject(new Error('No credential returned from Google'));
    return;
  }

  const payload = parseJwt(response.credential);
  if (!payload) {
    if (_pendingReject) _pendingReject(new Error('Failed to parse Google credential'));
    return;
  }

  const user = formatGoogleUser({
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  });

  saveGoogleSession(user);

  if (_pendingResolve) {
    _pendingResolve(user);
    _pendingResolve = null;
    _pendingReject = null;
  }
}

/**
 * Main sign-in function — shows the real Google account picker
 *
 * Priority:
 * 1. Supabase Google OAuth (if configured) → full redirect flow
 * 2. Google Identity Services (GIS) One-Tap / Popup → client-side flow
 */
export async function signInWithGoogle({ redirectTo } = {}) {
  // ── Path 1: Supabase Google OAuth ──────────────────────────────────────────
  // This shows the real Google account picker via a redirect
  try {
    if (supabase && typeof supabase.auth?.signInWithOAuth === 'function') {
      const target = redirectTo || `${window.location.origin}/onboarding`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: target,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });

      if (!error && data?.url) {
        // Supabase will redirect to Google — browser takes over
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }

      if (error) {
        console.warn('[GoogleAuth] Supabase OAuth notice:', error.message);
      }
    }
  } catch (err) {
    console.warn('[GoogleAuth] Supabase OAuth unavailable:', err.message);
  }

  // ── Path 2: Google Identity Services (GIS) ─────────────────────────────────
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('[GoogleAuth] VITE_GOOGLE_CLIENT_ID not set — GIS unavailable');
    return { success: false, needsModal: true };
  }

  return new Promise(async (resolve, reject) => {
    _pendingResolve = resolve;
    _pendingReject = reject;

    try {
      await loadGisScript();

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGisCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
      });

      // Try One-Tap first; fall back to explicit popup button
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One-tap blocked → trigger hidden button click
          const btn = document.getElementById('__atos_google_hidden_btn__');
          if (btn) btn.click();
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (_pendingReject) {
          _pendingReject = null;
          _pendingResolve = null;
          reject(new Error('Google sign-in timed out'));
        }
      }, 5 * 60 * 1000);

    } catch (err) {
      _pendingResolve = null;
      _pendingReject = null;
      reject(err);
    }
  });
}

/**
 * Renders the official Google Sign-In button into a container element
 */
export function renderGoogleButton(containerId, options = {}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return;

  loadGisScript().then(() => {
    window.google?.accounts?.id?.initialize({
      client_id: clientId,
      callback: (response) => {
        const payload = parseJwt(response?.credential);
        if (payload && options.onSuccess) {
          const user = formatGoogleUser({
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          });
          saveGoogleSession(user);
          options.onSuccess(user);
        }
      },
      auto_select: false,
      ux_mode: 'popup',
    });

    const container = document.getElementById(containerId);
    if (container) {
      window.google.accounts.id.renderButton(container, {
        theme: options.theme || 'outline',
        size: options.size || 'large',
        shape: options.shape || 'rectangular',
        width: options.width || '100%',
        text: options.text || 'signin_with',
        logo_alignment: 'left',
      });
    }
  });
}

export default {
  signInWithGoogle,
  renderGoogleButton,
  formatGoogleUser,
  getSavedGoogleUser,
  saveGoogleSession,
  clearGoogleSession,
  generateUserIdFromEmail,
  parseJwt,
};
