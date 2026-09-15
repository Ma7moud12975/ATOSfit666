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
  const [isVisible, setIsVisible] = useState(false);

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
  }, [isAuthenticated, loading, supabaseUser, navigate]);

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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

