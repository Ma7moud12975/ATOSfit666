import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import RegistrationForm from './components/RegistrationForm';
import WelcomeAnimation from './components/WelcomeAnimation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';

const RegisterScreen = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, supabaseUser } = useAuth();
  const { isAr } = useLanguage();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && supabaseUser?.id) {
      const userData = localStorage.getItem('user');
      let isCompleted = supabaseUser?.onboardingCompleted;
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.onboardingCompleted !== undefined) {
            isCompleted = user.onboardingCompleted;
          }
        } catch {}
      }
      if (isCompleted) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, supabaseUser, navigate]);

  const handleRegistrationSuccess = () => {
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    navigate('/onboarding', { replace: true });
  };

  // Show loading while auth is initializing or user is already authenticated
  if (authLoading || (isAuthenticated && supabaseUser?.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080A]">
        <div className="w-8 h-8 rounded-full border-2 border-[#FAA802] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{isAr ? 'إنشاء حساب جديد - ATOS fit' : 'Create Account - ATOS fit'}</title>
        <meta name="description" content="Join ATOS fit and start your personalized fitness journey with AI-powered coaching, exercise tracking, and nutrition guidance." />
        <meta name="keywords" content="fitness registration, AI fitness coach, workout tracker, health app signup" />
      </Helmet>

      <AuthenticationLayout
        title={isAr ? 'إنشاء حساب جديد' : 'Create Your Account'}
        subtitle={isAr ? 'انضم إلى منصة ATOS fit وابدأ رحلتك التدريبية المتكاملة' : 'Join thousands of users achieving their fitness goals with AI-powered coaching'}
        showLogo={true}
      >
        <div className="w-full max-w-md mx-auto">
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        </div>
      </AuthenticationLayout>

      <WelcomeAnimation 
        isVisible={showWelcome}
        onComplete={handleWelcomeComplete}
      />
    </div>
  );
};

export default RegisterScreen;
