import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import InternetIdentityLogin from './components/InternetIdentityLogin';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, supabaseUser, googleUser, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('google'); // 'google' | 'icp'

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
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

      if (supabaseUser?.onboardingCompleted) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, loading, supabaseUser, googleUser, navigate]);

  return (
    <AuthenticationLayout>
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
          <GoogleSignInButton
            text="Continue with Google"
            fullWidth
            size="xl"
          />

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
              onClick={() => loginWithGoogle({ redirectTo: window.location.origin + '/onboarding' })}
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
