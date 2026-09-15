import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import LoginForm from './components/LoginForm';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginScreen = ({ defaultMode = 'login' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAr } = useLanguage();
  const queryMode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState(() => (queryMode === 'register' || defaultMode === 'register' ? 'register' : 'login'));

  useEffect(() => {
    if (queryMode === 'register' || queryMode === 'login') {
      setActiveTab(queryMode);
    }
  }, [queryMode]);

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
    : (isAr ? 'أنشئ حسابك وسجّل بياناتك لتجهيز خطتك الذكية' : 'Create your account to start personalized AI onboarding');

  return (
    <div>
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

