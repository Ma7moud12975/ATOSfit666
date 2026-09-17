import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const getPlatform = () => {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
};

export const isStandalonePWA = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // 1. Native Capacitor App (Android APK / iOS IPA)
  if (isNative()) return true;

  // 2. Mobile User Agent check
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  if (isMobileUA) return true;

  // 3. Standalone installed PWA
  if (isStandalonePWA()) return true;

  // 4. Viewport + Touch characteristics
  const isSmallScreen = window.innerWidth <= 768;
  const hasTouchScreen = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    window.matchMedia('(pointer: coarse)').matches;

  return isSmallScreen && hasTouchScreen;
};

// Backwards compatibility
export const isMobile = isMobileDevice;
