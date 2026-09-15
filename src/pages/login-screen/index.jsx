import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import LoginForm from './components/LoginForm';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, supabaseUser } = useAuth();
  const { isAr } = useLanguage();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && supabaseUser?.id) {
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
  }, [isAuthenticated, loading, supabaseUser, navigate]);

  if (loading || (isAuthenticated && supabaseUser?.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080A]">
        <div className="w-8 h-8 rounded-full border-2 border-[#FAA802] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{isAr ? 'تسجيل الدخول - ATOS fit' : 'Sign In - ATOS fit'}</title>
        <meta name="description" content="Sign in to your ATOS fit account to access personalized workout tracking and nutrition targets." />
      </Helmet>

      <AuthenticationLayout
        title={isAr ? 'مرحباً بك مجدداً' : 'Welcome Back'}
        subtitle={isAr ? 'سجّل دخولك للوصول إلى خطتك التدريبية وبياناتك المحفوظة' : 'Sign in to access your synchronized workout plan and progress'}
        showLogo={true}
      >
        <div className="w-full max-w-md mx-auto">
          <LoginForm />
        </div>
      </AuthenticationLayout>
    </div>
  );
};

export default LoginScreen;

