import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import LoginForm from './components/LoginForm';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loading, supabaseUser } = useAuth();
  const { isAr } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  const explicitMode = searchParams.get('mode');
  const isSwitching = searchParams.get('switch') === 'true';
  const [activeTab, setActiveTab] = useState(() => (explicitMode === 'register' ? 'register' : 'login'));

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (explicitMode === 'register' || explicitMode === 'login') {
      setActiveTab(explicitMode);
    }
  }, [explicitMode]);

  // Redirect if already authenticated ONLY if user didn't explicitly request login/register mode
  useEffect(() => {
    if (isAuthenticated && !loading && !explicitMode && !isSwitching) {
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
  }, [isAuthenticated, loading, supabaseUser, navigate, explicitMode, isSwitching]);

  const handleModeChange = (newMode) => {
    setActiveTab(newMode);
    setSearchParams({ mode: newMode }, { replace: true });
  };

  const pageTitle = activeTab === 'login'
    ? (isAr ? 'تسجيل الدخول - ATOS fit' : 'Sign In - ATOS fit')
    : (isAr ? 'إنشاء حساب جديد - ATOS fit' : 'Create Account - ATOS fit');

  const cardTitle = activeTab === 'login'
    ? (isAr ? 'مرحباً بك مجدداً' : 'Welcome Back')
    : (isAr ? 'إنشاء حساب جديد' : 'Create Your Account');

  const cardSubtitle = activeTab === 'login'
    ? (isAr ? 'سجّل دخولك للوصول إلى خطتك التدريبية وبياناتك المحفوظة' : 'Sign in to access your synchronized workout plan and progress')
    : (isAr ? 'أنشئ حسابك وسجّل قياساتك (الوزن والسن) لتجهيز خطتك الذكية' : 'Create your account to start personalized AI onboarding');

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Sign in or create your ATOS fit account to access personalized workout tracking, AI coaching, and nutrition targets."
        />
      </Helmet>

      <AuthenticationLayout
        title={cardTitle}
        subtitle={cardSubtitle}
        showLogo={true}
      >
        <div className="w-full max-w-md mx-auto">
          <LoginForm initialMode={activeTab} onModeChange={handleModeChange} />
        </div>
      </AuthenticationLayout>
    </div>
  );
};

export default LoginScreen;


