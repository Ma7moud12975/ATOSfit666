import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import InternetIdentityRegister from './components/InternetIdentityRegister';
import WelcomeAnimation from './components/WelcomeAnimation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import GoogleAuthModal from '../../components/auth/GoogleAuthModal';

const RegisterScreen = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Trigger fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);


  const handleRegistrationSuccess = () => {
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    navigate('/onboarding');
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Helmet>
        <title>Create Account - ATOS fit</title>
        <meta name="description" content="Join ATOS fit and start your personalized fitness journey with AI-powered coaching, exercise tracking, and nutrition guidance." />
        <meta name="keywords" content="fitness registration, AI fitness coach, workout tracker, health app signup" />
      </Helmet>

      <AuthenticationLayout
        title="Create Your Account"
        subtitle="Join thousands of users achieving their fitness goals with AI-powered coaching"
        showLogo={true}
      >
        <div className="mb-6 space-y-4">
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full h-12 flex items-center justify-center space-x-3 rounded-xl border border-border bg-white text-gray-800 hover:bg-gray-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 hover:border-primary shadow-sm font-semibold text-sm transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-card text-muted-foreground uppercase tracking-wider">
                Or with Internet Identity
              </span>
            </div>
          </div>
        </div>

        <InternetIdentityRegister onSuccess={handleRegistrationSuccess} />
      </AuthenticationLayout>

      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />

      <WelcomeAnimation 
        isVisible={showWelcome}
        onComplete={handleWelcomeComplete}
      />
    </div>
  );
};

export default RegisterScreen;
