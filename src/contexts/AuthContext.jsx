import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { getOrCreateSupabaseUser, getSupabaseUserStats } from '../utils/icpSupabaseAuth';
import { supabase } from '../utils/supabase';
import {
  getSavedGoogleUser,
  saveGoogleSession,
  clearGoogleSession,
  formatGoogleUser,
  signInWithGoogle as initiateGoogleSignIn
} from '../utils/googleAuth';
import { fetchCloudUserProfile, hydrateLocalSession } from '../utils/cloudSync';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const isProduction =
    import.meta.env.PROD ||
    (typeof window !== 'undefined' && (
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('ic0.app') ||
      window.location.hostname.includes('icp0.io')
    ));

  useEffect(() => {
    initializeMasterAuth();

    // Listen for Supabase auth state change (e.g. Google OAuth redirect callback)
    let authSub = null;
    try {
      if (supabase && typeof supabase.auth?.onAuthStateChange === 'function') {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthContext] Supabase Auth event:', event);
          if (session?.user) {
            const googleProfile = formatGoogleUser({
              id: session.user.id,
              sub: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
              picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            });

            saveGoogleSession(googleProfile);
            setGoogleUser(googleProfile);
            setIsAuthenticated(true);

            // Fetch and hydrate cloud profile
            const cloudData = await fetchCloudUserProfile(session.user.email);
            if (cloudData && cloudData.user && cloudData.user.onboardingCompleted) {
              hydrateLocalSession(cloudData);
              setIsNewUser(false);
            } else {
              setIsNewUser(true);
            }
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

  const initializeMasterAuth = async () => {
    try {
      // 1. Check for active Google session first (Real user login)
      const savedGoogle = getSavedGoogleUser();
      const localUserRaw = localStorage.getItem('user');

      if (savedGoogle) {
        setGoogleUser(savedGoogle);
        setIsAuthenticated(true);
        if (localUserRaw) {
          try {
            const localUser = JSON.parse(localUserRaw);
            setSupabaseUser(localUser);
            setIsNewUser(!localUser.onboardingCompleted);
          } catch {
            setIsNewUser(true);
          }
        }
        setLoading(false);
        return;
      }

      // 2. Check if a local user exists in localStorage
      if (localUserRaw) {
        try {
          const parsed = JSON.parse(localUserRaw);
          if (parsed && (parsed.id || parsed.email)) {
            setIsAuthenticated(true);
            setSupabaseUser(parsed);
            setIsNewUser(!parsed.onboardingCompleted);
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      // 3. Fallback ICP or Dev mode
      const envFake = import.meta.env.VITE_FAKE_AUTH === 'true';
      const envDisable = import.meta.env.VITE_DISABLE_FAKE_AUTH === 'true';
      const shouldFakeDev = !isProduction && !envDisable && envFake;

      if (shouldFakeDev) {
        const fakePrincipal = Principal.fromText(import.meta.env.VITE_FAKE_PRINCIPAL || '2vxsx-fae');
        const fakeIdentity = { getPrincipal: () => fakePrincipal };
        setIdentity(fakeIdentity);
        setPrincipal(fakePrincipal);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // User not authenticated yet
      setIsAuthenticated(false);
      setLoading(false);
    } catch (err) {
      console.error('[AuthContext] Auth initialization error:', err);
      setLoading(false);
    }
  };

  const loginWithGoogle = async (options = {}) => {
    return await initiateGoogleSignIn(options);
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear Google
      clearGoogleSession();
      setGoogleUser(null);

      // Clear Supabase
      if (supabase && typeof supabase.auth?.signOut === 'function') {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase signout warning:', e);
        }
      }

      // Clear ICP
      if (authClient) {
        try {
          await authClient.logout();
        } catch (e) {
          console.warn('ICP logout warning:', e);
        }
      }

      setIdentity(null);
      setPrincipal(null);
      setIsAuthenticated(false);
      setSupabaseUser(null);
      setUserStats(null);
      setIsNewUser(false);

      // Clear user storage
      localStorage.removeItem('user');
      localStorage.removeItem('atos_google_session');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    // Legacy ICP fallback login
    const fakePrincipal = Principal.fromText('2vxsx-fae');
    const fakeIdentity = { getPrincipal: () => fakePrincipal };
    setIdentity(fakeIdentity);
    setPrincipal(fakePrincipal);
    setIsAuthenticated(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        identity,
        principal,
        googleUser,
        authClient,
        login,
        loginWithGoogle,
        logout,
        loading,
        supabaseUser,
        userStats,
        isNewUser,
        setSupabaseUser,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
