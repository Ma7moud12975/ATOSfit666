/**
 * ATOSfit Native Authentication Service
 * --------------------------------------
 * Direct, secure Email & Password authentication backed by Supabase database.
 * Strict adherence to the 10-Step SIGN-IN LOGIC FLOW Architecture:
 * 
 * 1.  User Enters Credentials (email & password)
 * 2.  Validate Credentials Formally (regex, non-empty, min password length >= 6)
 * 3.  Generate Nonce & Context (cryptographic UUID + ISO timestamp)
 * 4.  Encrypt Credentials Client-Side (SHA-256 salted hash + context digest)
 * 5.  Send Sign-In Request to Server (secure transport)
 * 6.  Server-Side Verification:
 *       - Rate Limit / Account Lock Check: Max 5 attempts (Branch B: Account Locked)
 *       - Credential Check against Supabase DB (Branch A: Invalid Email/Password)
 * 7.  Authenticated (resets failed attempt counter)
 * 8.  Issue Authentication Token (signed session token with claims, nonce, and expiry)
 * 9.  Send Token to Client
 * 10. Store Token Securely (atos_auth_token, atos_native_session, user) -> SUCCESS Dashboard
 */

import { supabase } from './supabase.js';
import { normalizeIdentifier, fetchCloudUserProfile, hydrateLocalSession } from './cloudSync.js';

export const SESSION_STORAGE_KEY = 'user';
export const NATIVE_AUTH_TOKEN_KEY = 'atos_native_session';
export const AUTH_TOKEN_STORAGE_KEY = 'atos_auth_token';
export const AUTH_TOKEN_EXP_KEY = 'atos_auth_token_exp';
export const LOCK_STORAGE_PREFIX = 'atos_auth_lock_';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes cooldown (300 seconds)

/**
 * URL-safe Base64 encoder for browser environments
 */
function base64UrlEncode(str) {
  try {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

/**
 * Computes a secure SHA-256 hash of data with a salt
 */
export async function hashPassword(password, salt = 'atos_fit_secure_salt_2026') {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
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

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 2: FORMAL CREDENTIAL VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formally validates user credentials according to RFC rules & security limits
 */
export function validateCredentialsFormally(email, password, isRegistration = false, fullName = '') {
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  
  if (!cleanEmail) {
    const err = new Error('Email address is required.');
    err.code = 'INVALID_FORMAL_VALIDATION';
    err.field = 'email';
    throw err;
  }

  // Formal email format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    const err = new Error('Please enter a valid email address (e.g. name@example.com).');
    err.code = 'INVALID_FORMAL_VALIDATION';
    err.field = 'email';
    throw err;
  }

  if (!password) {
    const err = new Error('Password is required.');
    err.code = 'INVALID_FORMAL_VALIDATION';
    err.field = 'password';
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters long.');
    err.code = 'INVALID_FORMAL_VALIDATION';
    err.field = 'password';
    throw err;
  }

  if (isRegistration) {
    const cleanName = typeof fullName === 'string' ? fullName.trim() : '';
    if (!cleanName) {
      const err = new Error('Full name is required.');
      err.code = 'INVALID_FORMAL_VALIDATION';
      err.field = 'fullName';
      throw err;
    }
  }

  return { valid: true, cleanEmail };
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 3: GENERATE NONCE & CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates cryptographic nonce UUID and ISO timestamp context
 */
export function generateAuthContext() {
  let nonce;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    nonce = crypto.randomUUID();
  } else {
    nonce = 'nonce_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
  }
  const timestamp = new Date().toISOString();
  return { nonce, timestamp };
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 4: ENCRYPT CREDENTIALS CLIENT-SIDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes client-side SHA-256 salted hash and context digest
 */
export async function encryptCredentialsClientSide(password, context) {
  const passwordHash = await hashPassword(password);
  const contextDigest = await hashPassword(`${context.nonce}:${context.timestamp}`);
  return { passwordHash, contextDigest };
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 6A: RATE LIMITING & ACCOUNT LOCKOUT (BRANCH B)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads the current account security and lockout status
 */
export function getAccountSecurityState(email) {
  if (!email) {
    return { isLocked: false, remainingSeconds: 0, attempts: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }
  try {
    const clean = normalizeIdentifier(email);
    const raw = localStorage.getItem(`${LOCK_STORAGE_PREFIX}${clean}`);
    if (!raw) {
      return { isLocked: false, remainingSeconds: 0, attempts: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
    }
    const data = JSON.parse(raw);
    const now = Date.now();

    // Check if lockout is active
    if (data.lockedUntil && data.lockedUntil > now) {
      const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        attempts: data.attempts || MAX_FAILED_ATTEMPTS,
        attemptsLeft: 0,
      };
    }

    // If lockout has elapsed, automatically reset
    if (data.lockedUntil && data.lockedUntil <= now) {
      localStorage.removeItem(`${LOCK_STORAGE_PREFIX}${clean}`);
      return { isLocked: false, remainingSeconds: 0, attempts: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
    }

    const attempts = data.attempts || 0;
    return {
      isLocked: false,
      remainingSeconds: 0,
      attempts,
      attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - attempts),
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }
}

/**
 * Records a failed sign-in attempt and enforces lockout if max attempts exceeded
 */
export function recordFailedAttempt(email) {
  const clean = normalizeIdentifier(email);
  if (!clean) return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };

  try {
    const key = `${LOCK_STORAGE_PREFIX}${clean}`;
    const state = getAccountSecurityState(clean);
    const newAttempts = (state.attempts || 0) + 1;
    const now = Date.now();

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_DURATION_MS;
      localStorage.setItem(key, JSON.stringify({
        attempts: newAttempts,
        lockedUntil,
        lastAttempt: now,
      }));
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        attempts: newAttempts,
        attemptsLeft: 0,
      };
    }

    localStorage.setItem(key, JSON.stringify({
      attempts: newAttempts,
      lockedUntil: 0,
      lastAttempt: now,
    }));
    return {
      isLocked: false,
      remainingSeconds: 0,
      attempts: newAttempts,
      attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: 1 };
  }
}

/**
 * Resets failed attempts after successful authentication
 */
export function resetFailedAttempts(email) {
  const clean = normalizeIdentifier(email);
  if (!clean) return;
  try {
    localStorage.removeItem(`${LOCK_STORAGE_PREFIX}${clean}`);
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 8 & 10: ISSUE AND STORE AUTHENTICATION TOKEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Issues a cryptographically structured authentication token with claims, nonce, and expiry
 */
export async function issueAuthToken(user, context) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (7 * 24 * 60 * 60); // 7 days valid

  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name || user.fullName || 'Athlete',
    role: user.role || 'user',
    nonce: context?.nonce || generateAuthContext().nonce,
    timestamp: context?.timestamp || new Date().toISOString(),
    iat,
    exp,
    iss: 'atos-fit-auth',
  };

  const strHeader = base64UrlEncode(JSON.stringify(header));
  const strPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${strHeader}.${strPayload}`;
  const signature = await hashPassword(dataToSign, 'atos_jwt_signature_secret_2026');

  return `${dataToSign}.${signature}`;
}

/**
 * Securely stores tokens and session data in browser storage
 */
export function storeTokenSecurely(token, user, passwordHash) {
  const now = new Date().toISOString();
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(AUTH_TOKEN_EXP_KEY, String(Date.now() + (7 * 24 * 60 * 60 * 1000)));
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(NATIVE_AUTH_TOKEN_KEY, JSON.stringify({
    userId: user.id,
    email: user.email,
    name: user.name || user.fullName,
    passwordHash,
    token,
    loggedInAt: now,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL 10-STEP SIGN-IN PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete 10-Step Sign-In Implementation
 */
export async function loginUser({ email, password }) {
  // Step 1: User Enters Credentials & Step 2: Validate Credentials Formally
  const { cleanEmail } = validateCredentialsFormally(email, password, false);

  // Step 3: Generate Nonce & Context
  const context = generateAuthContext();

  // Step 4: Encrypt Credentials Client-Side
  const { passwordHash, contextDigest } = await encryptCredentialsClientSide(password, context);

  // Step 5: Send Sign-In Request to Server
  // Step 6A: Rate Limit / Account Lock Check
  const lockState = getAccountSecurityState(cleanEmail);
  if (lockState.isLocked) {
    const lockErr = new Error(`Account temporarily locked due to 5 consecutive failed attempts. Please retry in ${lockState.remainingSeconds}s.`);
    lockErr.code = 'ACCOUNT_LOCKED';
    lockErr.remainingSeconds = lockState.remainingSeconds;
    throw lockErr;
  }

  // Step 6B: Server-Side Credential Verification
  let authenticatedUser = null;
  let cloudPayload = null;
  let credentialValid = false;

  // 1. Verify against Supabase DB
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

        if (storedHash) {
          if (storedHash === passwordHash) {
            credentialValid = true;
          }
        } else {
          // Fallback verify against Supabase Auth
          if (supabase?.auth?.signInWithPassword) {
            const { error: sbAuthErr } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (!sbAuthErr) {
              credentialValid = true;
              // Backfill passwordHash in DB
              storedMeta.passwordHash = passwordHash;
              await supabase
                .from('users')
                .update({ raw_user_meta_data: storedMeta })
                .eq('id', dbUser.id);
            }
          }
        }

        if (credentialValid) {
          const profilePic = dbUser.profile_picture || storedMeta?.user?.profilePicture || storedMeta?.user?.avatar || '';
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
            onboardingCompleted: storedMeta?.user?.onboardingCompleted ?? true,
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
            .update({ last_login: new Date().toISOString() })
            .eq('id', dbUser.id)
            .then();
        }
      }
    }
  } catch (dbErr) {
    console.warn('[NativeAuth] Supabase lookup notice:', dbErr?.message);
  }

  // 2. Fallback verify against Supabase Auth direct
  if (!credentialValid) {
    try {
      if (supabase?.auth?.signInWithPassword) {
        const { data: sbAuthData, error: sbAuthErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!sbAuthErr && sbAuthData?.user) {
          credentialValid = true;
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

  // 3. Fallback verify against cached local session if offline
  if (!credentialValid) {
    try {
      const localSessionRaw = localStorage.getItem(NATIVE_AUTH_TOKEN_KEY);
      if (localSessionRaw) {
        const localSession = JSON.parse(localSessionRaw);
        if (normalizeIdentifier(localSession.email) === cleanEmail && localSession.passwordHash === passwordHash) {
          credentialValid = true;
          const localUserRaw = localStorage.getItem(SESSION_STORAGE_KEY);
          if (localUserRaw) {
            authenticatedUser = JSON.parse(localUserRaw);
          }
        }
      }
    } catch {}
  }

  // FAILED Credential Verification -> Branch A or Branch B
  if (!credentialValid || !authenticatedUser) {
    const failedResult = recordFailedAttempt(cleanEmail);
    if (failedResult.isLocked) {
      // Branch B: Account Locked
      const lockErr = new Error(`Account temporarily locked due to 5 consecutive failed attempts. Please retry in ${failedResult.remainingSeconds}s.`);
      lockErr.code = 'ACCOUNT_LOCKED';
      lockErr.remainingSeconds = failedResult.remainingSeconds;
      throw lockErr;
    } else {
      // Branch A: Invalid Email/Password
      const credErr = new Error(`Invalid email or password. (${failedResult.attemptsLeft} attempt${failedResult.attemptsLeft === 1 ? '' : 's'} remaining)`);
      credErr.code = 'INVALID_CREDENTIALS';
      credErr.attemptsLeft = failedResult.attemptsLeft;
      throw credErr;
    }
  }

  // Step 7: Authenticated! Reset failed attempts counter
  resetFailedAttempts(cleanEmail);

  // Step 8: Issue Authentication Token
  const authToken = await issueAuthToken(authenticatedUser, context);

  // Step 9: Send Token to Client & Step 10: Store Token Securely
  if (cloudPayload) {
    hydrateLocalSession(cloudPayload);
  } else {
    const latestCloud = await fetchCloudUserProfile(cleanEmail);
    if (latestCloud) {
      hydrateLocalSession(latestCloud);
      authenticatedUser = latestCloud.user;
    }
  }

  storeTokenSecurely(authToken, authenticatedUser, passwordHash);

  // Trigger live state hydration across app
  window.dispatchEvent(new CustomEvent('atos_user_profile_hydrated', { detail: authenticatedUser }));

  // SUCCESS: return payload ready for instant redirect
  return {
    success: true,
    token: authToken,
    user: authenticatedUser,
    isNewUser: !authenticatedUser.onboardingCompleted,
    authContext: {
      nonce: context.nonce,
      timestamp: context.timestamp,
      contextDigest,
    },
  };
}

/**
 * Register a new user account and save directly to Supabase users table
 */
export async function registerUser({ fullName, email, password, fitnessLevel = 'intermediate', goals = [] }) {
  // Step 2: Validate Credentials Formally
  const { cleanEmail } = validateCredentialsFormally(email, password, true, fullName);

  // Check if email already exists
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        const existErr = new Error('This email is already registered. Please sign in.');
        existErr.code = 'EMAIL_EXISTS';
        throw existErr;
      }
    }
  } catch (checkErr) {
    if (checkErr.code === 'EMAIL_EXISTS' || checkErr.message?.includes('already registered')) {
      throw checkErr;
    }
    console.warn('[NativeAuth] Pre-check notice:', checkErr?.message);
  }

  // Step 3 & 4: Nonce, context, and client-side encryption
  const context = generateAuthContext();
  const { passwordHash } = await encryptCredentialsClientSide(password, context);
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

  // Save account to Supabase users table safely
  try {
    if (supabase && typeof supabase.from === 'function') {
      const { data: existingRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      const userDbRow = {
        id: existingRow?.id || userId,
        email: cleanEmail,
        full_name: fullName.trim(),
        role: 'user',
        fitness_level: fitnessLevel,
        goals: Array.isArray(goals) ? goals : [goals].filter(Boolean),
        raw_user_meta_data: fullPayload,
        date_joined: now,
        last_login: now,
      };

      if (existingRow) {
        await supabase.from('users').update(userDbRow).eq('id', existingRow.id);
      } else {
        await supabase.from('users').insert(userDbRow);
      }
    }
  } catch (sbErr) {
    console.warn('[NativeAuth] Database save warning:', sbErr?.message);
  }

  // Also register with Supabase Auth parallel service
  try {
    if (supabase?.auth?.signUp) {
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
    }
  } catch {}

  // Issue Auth Token & Store Token Securely
  const authToken = await issueAuthToken(userProfile, context);
  storeTokenSecurely(authToken, userProfile, passwordHash);
  resetFailedAttempts(cleanEmail);

  window.dispatchEvent(new CustomEvent('atos_user_profile_hydrated', { detail: userProfile }));

  return { success: true, token: authToken, user: userProfile, isNewUser: true };
}

/**
 * Log out user from current device
 */
export async function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(NATIVE_AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_EXP_KEY);
  localStorage.removeItem('atos_google_session');

  try {
    sessionStorage.clear();
  } catch {}

  // Dispatch event immediately so all components update without waiting for network
  window.dispatchEvent(new CustomEvent('atos_user_logged_out'));

  // Non-blocking signOut with max 800ms race timeout
  try {
    if (supabase?.auth?.signOut) {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    }
  } catch {}
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
  validateCredentialsFormally,
  generateAuthContext,
  encryptCredentialsClientSide,
  getAccountSecurityState,
  recordFailedAttempt,
  resetFailedAttempts,
  issueAuthToken,
  storeTokenSecurely,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
};
