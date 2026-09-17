import { useState, useEffect } from 'react';
import { isMobileDevice } from '../utils/platform';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isMobileDevice() || window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice() || window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
