import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthenticationLayout from '../../components/ui/AuthenticationLayout';
import RegistrationForm from './components/RegistrationForm';
import WelcomeAnimation from './components/WelcomeAnimation';
import { useLanguage } from '../../contexts/LanguageContext';

const RegisterScreen = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const { isAr } = useLanguage();

  const handleRegistrationSuccess = () => {
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    navigate('/onboarding', { replace: true });
  };

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
