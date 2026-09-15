import React from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';

const HIDDEN_NAV_PATHS = [
  '/',
  '/landing',
  '/login-screen',
  '/register-screen',
  '/onboarding',
  '/exercise-workout-screen',
  '/payment-success',
  '/payment-cancel'
];

const MobileLayout = ({ children }) => {
  const location = useLocation();
  const shouldShowBottomNav = !HIDDEN_NAV_PATHS.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 ${shouldShowBottomNav ? 'pb-24 lg:pb-0' : ''}`}>
        {children}
      </div>
      {shouldShowBottomNav && <MobileBottomNav />}
    </div>
  );
};

export default MobileLayout;
