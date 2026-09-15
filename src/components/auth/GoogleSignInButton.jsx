import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithGoogle } from '../../utils/googleAuth';

/**
 * GoogleSignInButton
 * -------------------
 * Shows a real Google Sign-In experience:
 *  - If Supabase OAuth is configured → redirect to Google (full OAuth)
 *  - If VITE_GOOGLE_CLIENT_ID is set → GIS rendered button (popup)
 *  - Fallback → custom styled button that triggers GIS One-Tap
 *
 * Props:
 *  - className: extra CSS classes
 *  - text: button label override
 *  - onSuccess: called with googleUser on success (GIS path)
 *  - redirectTo: override redirect URL for Supabase OAuth
 */
const GoogleSignInButton = ({
  className = '',
  text = 'Sign in with Google',
  onSuccess,
  redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : '/onboarding',
  fullWidth = true,
  size = 'lg',
}) => {
  const { handleGisSignIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const gisContainerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Render the official Google button if Client ID is available
  useEffect(() => {
    if (!clientId || !gisContainerRef.current) return;

    const loadAndRender = async () => {
      try {
        // Load GIS script
        await new Promise((resolve, reject) => {
          if (window.google?.accounts?.id) { resolve(); return; }
          const existing = document.getElementById('gsi-script');
          if (existing) { existing.addEventListener('load', resolve); existing.addEventListener('error', reject); return; }
          const s = document.createElement('script');
          s.id = 'gsi-script';
          s.src = 'https://accounts.google.com/gsi/client';
          s.async = true;
          s.defer = true;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) return;
            setIsLoading(true);
            setError('');
            try {
              // Parse JWT
              const base64Url = response.credential.split('.')[1];
              const payload = JSON.parse(
                decodeURIComponent(
                  atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'))
                    .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
                )
              );

              const { formatGoogleUser, saveGoogleSession } = await import('../../utils/googleAuth');
              const user = formatGoogleUser({
                sub: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
              });
              saveGoogleSession(user);

              const result = await handleGisSignIn(user);
              if (onSuccess) onSuccess(user);

              if (result?.isNewUser) {
                navigate('/onboarding', { replace: true });
              } else {
                navigate('/dashboard', { replace: true });
              }
            } catch (err) {
              console.error('[GoogleSignInButton] GIS callback error:', err);
              setError('Sign-in failed. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
          auto_select: false,
          ux_mode: 'popup',
          context: 'signin',
        });

        // Render the official Google button
        if (gisContainerRef.current) {
          window.google.accounts.id.renderButton(gisContainerRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: gisContainerRef.current.offsetWidth || 320,
            text: 'signin_with',
            logo_alignment: 'left',
          });
        }
      } catch (err) {
        console.warn('[GoogleSignInButton] GIS render failed:', err.message);
      }
    };

    loadAndRender();
  }, [clientId]);

  // Handler for the custom fallback button (Supabase OAuth path)
  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle({ redirectTo });
      // If GIS popup path resolved a user
      if (result && result.id) {
        const authResult = await handleGisSignIn(result);
        if (onSuccess) onSuccess(result);
        navigate(authResult?.isNewUser ? '/onboarding' : '/dashboard', { replace: true });
      }
      // If Supabase OAuth → browser already redirecting
    } catch (err) {
      console.error('[GoogleSignInButton] sign-in error:', err);
      setError('Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-11 text-sm',
    lg: 'h-12 text-base',
    xl: 'h-14 text-base',
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {/* Official Google Button (shown when VITE_GOOGLE_CLIENT_ID is set) */}
      {clientId ? (
        <div
          ref={gisContainerRef}
          className={`overflow-hidden rounded-xl ${fullWidth ? 'w-full' : ''} ${className}`}
          style={{ minHeight: 44 }}
        />
      ) : (
        /* Fallback custom button (Supabase OAuth / no Client ID) */
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className={`
            relative flex items-center justify-center gap-3 rounded-xl border
            border-border/80 bg-background font-medium text-foreground
            shadow-sm transition-all
            hover:border-primary/50 hover:bg-muted/40 hover:shadow-md
            disabled:opacity-60 disabled:cursor-not-allowed
            ${sizeClasses[size] || sizeClasses.lg}
            ${fullWidth ? 'w-full' : 'px-6'}
            ${className}
          `}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          <span>{isLoading ? 'Connecting...' : text}</span>
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
