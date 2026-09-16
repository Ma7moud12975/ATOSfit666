import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import * as userApi from '../utils/api/userApi';
import syncService from '../utils/syncService';
import { registerUser, loginUser, logoutUser, getCurrentUser, hasValidSession } from '../utils/nativeAuth';

const SupabaseAuthContext = createContext(null);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [profile, setProfile] = useState(() => getCurrentUser());
  const [stats, setStats] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasValidSession());
  const [loading, setLoading] = useState(() => !hasValidSession());
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initAuth();

    // Cross-tab and in-app event listeners for seamless state synchronization
    const handleProfileHydrated = (e) => {
      if (e.detail) {
        setUser(e.detail);
        setProfile(e.detail);
        setIsAuthenticated(true);
        setLoading(false);
      }
    };

    const handleLoggedOut = () => {
      setUser(null);
      setProfile(null);
      setStats(null);
      setSession(null);
      setIsAuthenticated(false);
      setLoading(false);
    };

    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'atos_auth_token') {
        if (hasValidSession()) {
          const u = getCurrentUser();
          setUser(u);
          setProfile(u);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('atos_user_profile_hydrated', handleProfileHydrated);
    window.addEventListener('atos_user_logged_out', handleLoggedOut);
    window.addEventListener('storage', handleStorageChange);

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
          await loadUserData(session.user.id);
          syncService.setupSyncListeners(session.user.id, (result) => {
            console.log('Sync completed:', result);
          });
        } else if (!hasValidSession()) {
          setProfile(null);
          setStats(null);
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      window.removeEventListener('atos_user_profile_hydrated', handleProfileHydrated);
      window.removeEventListener('atos_user_logged_out', handleLoggedOut);
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
  }, []);

  const initAuth = async () => {
    try {
      const valid = hasValidSession();
      const localUser = getCurrentUser();
      if (valid && localUser) {
        setUser(localUser);
        setProfile(localUser);
        setIsAuthenticated(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserData(session.user.id);
      } else if (!valid) {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const [userProfile, userStats] = await Promise.all([
        userApi.getUserProfile(userId),
        userApi.getUserStats(userId)
      ]);
      setProfile(userProfile);
      setStats(userStats);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const signUp = async (email, password, fullName, extra = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({ fullName, email, password, ...extra });
      setUser(res.user);
      setProfile(res.user);
      setIsAuthenticated(true);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ email, password });
      setUser(res.user);
      setProfile(res.user);
      setIsAuthenticated(true);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
      setStats(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const updated = await userApi.updateUser(user.id, updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshStats = async () => {
    if (!user) return;
    
    try {
      const userStats = await userApi.getUserStats(user.id);
      setStats(userStats);
      return userStats;
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const value = {
    // State
    user,
    profile,
    stats,
    session,
    isAuthenticated,
    loading,
    error,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    
    // Profile methods
    updateProfile,
    refreshStats,
    
    // Utility
    userId: user?.id,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthProvider;
