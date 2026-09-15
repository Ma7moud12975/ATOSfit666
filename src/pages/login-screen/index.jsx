import React from 'react';
import { Helmet } from 'react-helmet';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import LoginForm from './components/LoginForm';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginScreen = () => {
  const { isAr } = useLanguage();



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

