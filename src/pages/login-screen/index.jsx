import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import InternetIdentityLogin from './components/InternetIdentityLogin';
import GoogleAuthModal from '../../components/auth/GoogleAuthModal';
import { signInWithGoogle } from '../../utils/googleAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, supabaseUser, googleUser } = useAuth();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [activeTab, setActiveTab] = useState('google'); // 'google' | 'icp'

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated and profile is complete
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.onboardingCompleted) {
            navigate('/dashboard', { replace: true });
            return;
          } else {
            navigate('/onboarding', { replace: true });
            return;
          }
        } catch {
          // ignore error
        }
      }

      if (supabaseUser?.full_name && supabaseUser.full_name !== 'ICP User') {
        navigate('/dashboard', { replace: true });
      } else if (googleUser) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, loading, supabaseUser, googleUser, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      const res = await signInWithGoogle();
      if (res?.needsModal) {
        setShowGoogleModal(true);
      }
    } catch (err) {
      console.warn('Google sign-in error, using account picker:', err);
      setShowGoogleModal(true);
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  return (
    <AuthenticationLayout>
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />

      <div
        className={`w-full max-w-md mx-auto p-6 sm:p-8 bg-card rounded-2xl border border-border shadow-xl transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Brand & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
            <Icon name="Zap" size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            {t('auth.signInTitle') || 'Welcome to ATOSfit'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to sync your personalized workouts and nutrition targets
          </p>
        </div>

        {/* Primary Action: Continue with Google */}
        <div className="space-y-4 mb-6">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isSigningInGoogle}
            loading={isSigningInGoogle}
            className="w-full h-13 flex items-center justify-center space-x-3 rounded-xl border border-border bg-white text-gray-800 hover:bg-gray-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 hover:border-primary/50 shadow-md transition-all font-semibold text-sm"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
            <Icon name="ShieldCheck" size={14} className="text-green-500" />
            <span>Multi-device cloud synchronization enabled</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-card text-muted-foreground uppercase tracking-wider">
              Or alternate login
            </span>
          </div>
        </div>

        {/* Alternate login toggle */}
        <div className="flex rounded-lg border border-border/70 p-1 bg-muted/40 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'google'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Google Cloud
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('icp')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'icp'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Internet Identity (ICP)
          </button>
        </div>

        {activeTab === 'google' ? (
          <div className="text-center space-y-3 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in with your Google account to automatically preserve your 4-week training plan, daily calorie goals, and body stats across Vercel and all your devices.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGoogleModal(true)}
              className="text-xs text-primary hover:text-primary/80"
            >
              Choose Google account manually
            </Button>
          </div>
        ) : (
          <InternetIdentityLogin />
        )}
      </div>
    </AuthenticationLayout>
  );
};

export default LoginScreen;
