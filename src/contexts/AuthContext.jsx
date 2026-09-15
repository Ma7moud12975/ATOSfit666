import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { supabase } from '../utils/supabase';
import {
  getSavedGoogleUser,
  saveGoogleSession,
  clearGoogleSession,
  formatGoogleUser,
  signInWithGoogle as initiateGoogleSignIn,
} from '../utils/googleAuth';
import {
  fetchCloudUserProfile,
  hydrateLocalSession,
  saveCloudUserProfile,
} from '../utils/cloudSync';
import {
  registerUser as nativeRegister,
  loginUser as nativeLogin,
  logoutUser as nativeLogout,
  getCurrentUser as getNativeUser,
} from '../utils/nativeAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient]       = useState(null);
  const [identity, setIdentity]           = useState(null);
  const [principal, setPrincipal]         = useState(null);
  const [googleUser, setGoogleUser]       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [supabaseUser, setSupabaseUser]   = useState(null);
  const [userStats, setUserStats]         = useState(null);
  const [isNewUser, setIsNewUser]         = useState(false);

  const isProduction =
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      (window.location.hostname.includes('vercel.app') ||
       window.location.hostname.includes('ic0.app') ||
       window.location.hostname.includes('icp0.io')));

  // ─────────────────────────────────────────────────────────────────────────
  // Handle Supabase OAuth callback (fires after Google redirect)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let authSub = null;
    try {
      if (supabase && typeof supabase.auth?.onAuthStateChange === 'function') {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthContext] Supabase Auth event:', event);

          if (session?.user) {
            const rawUser = session.user;
            const googleProfile = formatGoogleUser({
              id: rawUser.id,
              sub: rawUser.id,
              email: rawUser.email,
              name:
                rawUser.user_metadata?.full_name ||
                rawUser.user_metadata?.name ||
                rawUser.email?.split('@')[0],
              picture:
                rawUser.user_metadata?.avatar_url ||
                rawUser.user_metadata?.picture,
            });

            saveGoogleSession(googleProfile);
            setGoogleUser(googleProfile);
            setIsAuthenticated(true);

            // Fetch existing cloud profile
            const cloudData = await fetchCloudUserProfile(rawUser.email);
            if (cloudData?.user?.onboardingCompleted) {
              hydrateLocalSession(cloudData);
              setSupabaseUser(cloudData.user);
              setIsNewUser(false);

              // Navigate to dashboard
              if (window.location.pathname !== '/dashboard') {
                window.location.replace('/dashboard');
              }
            } else {
              // New user → pre-fill minimal profile and send to onboarding
              const minimalUser = {
                id: googleProfile.id,
                name: googleProfile.name,
                email: googleProfile.email,
                picture: googleProfile.picture,
                provider: 'google',
                onboardingCompleted: false,
              };
              localStorage.setItem('user', JSON.stringify(minimalUser));
              setSupabaseUser(minimalUser);
              setIsNewUser(true);

              if (window.location.pathname !== '/onboarding') {
                window.location.replace('/onboarding');
              }
            }

            setLoading(false);
          }
        });
        authSub = data?.subscription;
      }
    } catch (e) {
      console.warn('[AuthContext] Supabase listener notice:', e);
    }

    return () => {
      if (authSub && typeof authSub.unsubscribe === 'function') {
        authSub.unsubscribe();
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Initial auth check on mount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    initializeMasterAuth();
  }, []);

  const initializeMasterAuth = async () => {
    try {
      // 1. Instant check: local user in localStorage (0ms)
      const localUserRaw = localStorage.getItem('user');
      const savedGoogle = getSavedGoogleUser();

      if (localUserRaw) {
        try {
          const parsed = JSON.parse(localUserRaw);
          if (parsed && (parsed.id || parsed.email)) {
            setIsAuthenticated(true);
            setSupabaseUser(parsed);
            setIsNewUser(!parsed.onboardingCompleted);
            if (savedGoogle) setGoogleUser(savedGoogle);
            setLoading(false);

            // Background refresh to pull newest cloud profile & picture from other devices
            fetchCloudUserProfile(parsed.email || parsed.id)
              .then((latest) => {
                if (latest?.user) {
                  hydrateLocalSession(latest);
                  setSupabaseUser(latest.user);
                }
              })
              .catch(() => {});

            return;
          }
        } catch {}
      }

      if (savedGoogle) {
        setGoogleUser(savedGoogle);
        setIsAuthenticated(true);
        setIsNewUser(true);
        setLoading(false);
        return;
      }

      // 2. Check for active Supabase session with safety timeout (max 1500ms)
      if (supabase && typeof supabase.auth?.getSession === 'function') {
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
          const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
          if (session?.user) {
            setIsAuthenticated(true);
            const userObj = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Athlete',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Athlete',
              onboardingCompleted: true,
            };
            setSupabaseUser(userObj);
            setLoading(false);
            return;
          }
        } catch {}
      }

      // 3. Dev fake auth fallback
      const envFake    = import.meta.env.VITE_FAKE_AUTH === 'true';
      const envDisable = import.meta.env.VITE_DISABLE_FAKE_AUTH === 'true';
      const shouldFakeDev = !isProduction && !envDisable && envFake;

      if (shouldFakeDev) {
        const fakePrincipal = Principal.fromText(
          import.meta.env.VITE_FAKE_PRINCIPAL || '2vxsx-fae'
        );
        setIdentity({ getPrincipal: () => fakePrincipal });
        setPrincipal(fakePrincipal);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Not authenticated
      setIsAuthenticated(false);
      setLoading(false);
    } catch (err) {
      console.error('[AuthContext] Auth initialization error:', err);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Called by GIS path (when user signed in via popup, not redirect)
  // ─────────────────────────────────────────────────────────────────────────
  const handleGisSignIn = useCallback(async (googleProfile) => {
    setLoading(true);
    try {
      saveGoogleSession(googleProfile);
      setGoogleUser(googleProfile);
      setIsAuthenticated(true);

      // Check if existing profile with completed onboarding in cloud
      const cloudData = await fetchCloudUserProfile(googleProfile.email);
      if (cloudData?.user?.onboardingCompleted) {
        hydrateLocalSession(cloudData);
        setSupabaseUser(cloudData.user);
        setIsNewUser(false);
        return { isNewUser: false, user: cloudData.user };
      } else {
        const minimalUser = {
          ...googleProfile,
          onboardingCompleted: false,
        };
        localStorage.setItem('user', JSON.stringify(minimalUser));
        setSupabaseUser(minimalUser);
        setIsNewUser(true);
        // Only save initial minimal record to Supabase if brand new
        await saveCloudUserProfile(minimalUser);
        return { isNewUser: true, user: minimalUser };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithCredentials = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await nativeLogin({ email, password });
      setSupabaseUser(res.user);
      setIsAuthenticated(true);
      setIsNewUser(res.isNewUser);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithCredentials = useCallback(async ({ fullName, email, password, fitnessLevel, goals }) => {
    setLoading(true);
    try {
      const res = await nativeRegister({ fullName, email, password, fitnessLevel, goals });
      setSupabaseUser(res.user);
      setIsAuthenticated(true);
      setIsNewUser(true);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await nativeLogout();
      clearGoogleSession();
      setGoogleUser(null);
      setIdentity(null);
      setPrincipal(null);
      setIsAuthenticated(false);
      setSupabaseUser(null);
      setUserStats(null);
      setIsNewUser(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to native auth hydration events
  useEffect(() => {
    const handleHydrated = (e) => {
      if (e.detail) {
        setSupabaseUser(e.detail);
        setIsAuthenticated(true);
        setIsNewUser(!e.detail.onboardingCompleted);
      }
    };
    const handleLoggedOut = () => {
      setSupabaseUser(null);
      setIsAuthenticated(false);
      setIsNewUser(false);
    };

    window.addEventListener('atos_user_profile_hydrated', handleHydrated);
    window.addEventListener('atos_user_logged_out', handleLoggedOut);
    return () => {
      window.removeEventListener('atos_user_profile_hydrated', handleHydrated);
      window.removeEventListener('atos_user_logged_out', handleLoggedOut);
    };
  }, []);

  // Legacy fallback
  const login = useCallback(async (email, password) => {
    if (email && password) {
      return await signInWithCredentials(email, password);
    }
  }, [signInWithCredentials]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        identity,
        principal,
        googleUser,
        authClient,
        login,
        signInWithCredentials,
        signUpWithCredentials,
        signIn: signInWithCredentials,
        signUp: signUpWithCredentials,
        loginWithGoogle: () => Promise.resolve(),
        logout,
        loading,
        user: supabaseUser,
        supabaseUser,
        userStats,
        isNewUser,
        setSupabaseUser,
        setIsNewUser,
        handleGisSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
