import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasValidSession, getCurrentUser } from '../../utils/nativeAuth';
import { mobileAppFlowService } from '../../services/mobileAppFlowService';
import { isMobileDevice } from '../../utils/platform';
import MobileSplash from './MobileSplash';
import MobileWelcome from './MobileWelcome';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * MobileAppRouter manages the startup sequence for the native app and mobile viewports.
 */
const MobileAppRouter = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const isMobile = isMobileDevice();

  const [showSplash, setShowSplash] = useState(() => {
    if (!isMobile) return false;
    try {
      return !sessionStorage.getItem('atos_mobile_splash_viewed');
    } catch {
      return true;
    }
  });

  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!showSplash) return;

    // Show splash for ~1.8 seconds on initial mobile launch
    const timer = setTimeout(() => {
      handleFinishSplash();
    }, 1800);

    return () => clearTimeout(timer);
  }, [showSplash, loading]);

  const handleFinishSplash = () => {
    try {
      sessionStorage.setItem('atos_mobile_splash_viewed', 'true');
    } catch {}

    const hasSeenIntro = mobileAppFlowService.getHasSeenIntro();
    const valid = isAuthenticated || hasValidSession();

    if (!hasSeenIntro && !valid) {
      setShowWelcome(true);
    }

    setShowSplash(false);
    mobileAppFlowService.updateLastOpenedDate();
  };

  if (showSplash) {
    return <MobileSplash onFinish={handleFinishSplash} />;
  }

  if (showWelcome && location.pathname === '/') {
    return <MobileWelcome onComplete={() => setShowWelcome(false)} />;
  }

  // Handle automatic routing on root '/'
  if (location.pathname === '/') {
    const valid = isAuthenticated || hasValidSession();
    if (valid) {
      const user = getCurrentUser();
      const onboardingCompleted = user?.onboardingCompleted ?? mobileAppFlowService.getOnboardingCompleted();
      if (!onboardingCompleted) {
        return <Navigate to="/onboarding" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    } else if (!showWelcome) {
      return <Navigate to="/landing" replace />;
    }
  }

  return <>{children}</>;
};

export default MobileAppRouter;
