import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatGoogleUser, saveGoogleSession } from '../../utils/googleAuth';
import { fetchCloudUserProfile, hydrateLocalSession } from '../../utils/cloudSync';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';

const GoogleAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Preset demo/quick accounts for instant 1-click testing
  const quickAccounts = [
    {
      name: 'Mahmoud Ayman',
      email: 'mahmoudayman@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces'
    },
    {
      name: 'Coach Alex',
      email: 'alex.fitness@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces'
    }
  ];

  const handleSelectAccount = async (account) => {
    setIsLoading(true);
    setStatusMessage('Connecting to Google...');

    try {
      const googleUser = formatGoogleUser({
        email: account.email,
        name: account.name,
        picture: account.avatar
      });

      saveGoogleSession(googleUser);

      setStatusMessage('Checking cloud profile & workout history...');
      const cloudData = await fetchCloudUserProfile(googleUser.email);

      if (cloudData && cloudData.user && cloudData.user.onboardingCompleted) {
        setStatusMessage('Welcome back! Restoring your fitness profile...');
        hydrateLocalSession(cloudData);

        setTimeout(() => {
          setIsLoading(false);
          onClose();
          if (onSuccess) onSuccess(cloudData.user);
          navigate('/dashboard', { replace: true });
        }, 600);
      } else {
        setStatusMessage('New Google account! Directing to onboarding...');
        const initialUserData = {
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
          provider: 'google',
          onboardingCompleted: false
        };
        localStorage.setItem('user', JSON.stringify(initialUserData));

        setTimeout(() => {
          setIsLoading(false);
          onClose();
          if (onSuccess) onSuccess(initialUserData);
          navigate('/onboarding', { replace: true });
        }, 600);
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleCustomSubmit = (e) => {
    e?.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid Google email address');
      return;
    }
    const derivedName = nameInput.trim() || emailInput.split('@')[0];
    handleSelectAccount({
      email: emailInput.trim(),
      name: derivedName,
      avatar: null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-3 border border-border">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground">Sign in with Google</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Choose an account to synchronize your profile and workouts with ATOSfit
          </p>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-foreground">{statusMessage}</p>
          </div>
        )}

        {/* Account List */}
        {!isLoading && !isCustomMode && (
          <div className="space-y-3">
            {quickAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleSelectAccount(acc)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-background/50 hover:bg-muted/80 hover:border-primary/50 transition-all text-left"
              >
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground truncate">{acc.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{acc.email}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </button>
            ))}

            <button
              onClick={() => setIsCustomMode(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-muted/50 transition-all text-left text-muted-foreground hover:text-foreground"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Icon name="UserPlus" size={18} />
              </div>
              <div className="text-sm font-medium">Use another Google account</div>
            </button>
          </div>
        )}

        {/* Custom Email Entry */}
        {!isLoading && isCustomMode && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <Input
              label="Google Email"
              type="email"
              placeholder="example@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              autoFocus
              prefix={<Icon name="Mail" size={16} className="text-muted-foreground" />}
            />
            <Input
              label="Your Name (Optional)"
              placeholder="Mahmoud Ayman"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              prefix={<Icon name="User" size={16} className="text-muted-foreground" />}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCustomMode(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Cloud Sync guarantees your onboarding data, macros, and workout mesocycles are automatically restored when logging in on Vercel or any new device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
