import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import GoogleSignInButton from '../../../components/auth/GoogleSignInButton';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  validateCredentialsFormally,
  getAccountSecurityState,
} from '../../../utils/nativeAuth';

const LoginForm = ({ initialMode = 'login', onModeChange, onSubmit, isLoading: externalLoading = false }) => {
  const navigate = useNavigate();
  const { signIn, signUp } = useSupabaseAuth();
  const { isAr } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
      setError('');
    }
  }, [initialMode]);

  // Live check account security state when email changes
  useEffect(() => {
    if (mode === 'login' && formData.email && formData.email.includes('@')) {
      const secState = getAccountSecurityState(formData.email);
      if (secState.isLocked && secState.remainingSeconds > 0) {
        setLockCountdown(secState.remainingSeconds);
      } else {
        setLockCountdown(0);
      }
    }
  }, [formData.email, mode]);

  // Lockout Countdown Timer (Branch B)
  useEffect(() => {
    if (lockCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockCountdown]);

  const isLoading = externalLoading || isSubmitting;
  const isAccountLocked = lockCountdown > 0;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    if (onModeChange) onModeChange(newMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error && !isAccountLocked) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If account currently locked, prevent submission
    if (isAccountLocked) {
      setError(
        isAr
          ? `الحساب مقفل مؤقتًا لحمايتك. يرجى الانتظار ${lockCountdown} ثانية.`
          : `Account is temporarily locked. Please wait ${lockCountdown}s.`
      );
      return;
    }

    // Stage 2: Validate Credentials Formally
    try {
      validateCredentialsFormally(
        formData.email,
        formData.password,
        mode === 'register',
        formData.fullName
      );
    } catch (valErr) {
      if (valErr.field === 'email') {
        setError(isAr ? 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)' : 'Please enter a valid email address');
      } else if (valErr.field === 'password') {
        setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      } else if (valErr.field === 'fullName') {
        setError(isAr ? 'يرجى إدخال اسمك الكامل' : 'Please enter your full name');
      } else {
        setError(valErr.message);
      }
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const cleanName = formData.fullName.trim();
        const res = await signUp(cleanEmail, formData.password, cleanName);
        if (res?.user) {
          if (onSubmit) await onSubmit({ ...formData, email: cleanEmail, fullName: cleanName, mode });
          navigate('/onboarding', { replace: true });
        }
      } else {
        // Stage 3 to 10: Run full sign-in pipeline
        const data = await signIn(cleanEmail, formData.password);
        if (data?.user) {
          if (onSubmit) await onSubmit({ ...formData, email: cleanEmail, mode });
          if (data.isNewUser || !data.user.onboardingCompleted) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    } catch (err) {
      console.error('Sign-in pipeline error:', err);
      const isLocked = err?.code === 'ACCOUNT_LOCKED' || err?.message?.includes('temporarily locked');
      const isInvalidCreds = err?.code === 'INVALID_CREDENTIALS' || err?.message?.includes('Invalid email or password');

      if (isLocked) {
        // Branch B: Account Locked
        const seconds = err.remainingSeconds || 300;
        setLockCountdown(seconds);
        setError(
          isAr
            ? `تم قفل الحساب مؤقتًا لحمايتك بعد 5 محاولات خاطئة متتالية.`
            : `Account locked for 5 minutes after 5 failed attempts.`
        );
      } else if (isInvalidCreds) {
        // Branch A: Invalid Email/Password
        const left = typeof err.attemptsLeft === 'number' ? err.attemptsLeft : null;
        setAttemptsRemaining(left);
        if (left !== null) {
          setError(
            isAr
              ? `كلمة المرور أو البريد الإلكتروني غير صحيح. (المحاولات المتبقية: ${left} من 5)`
              : `Invalid email or password. (${left} attempt${left === 1 ? '' : 's'} remaining)`
          );
        } else {
          setError(isAr ? 'كلمة المرور أو البريد الإلكتروني غير صحيح' : 'Invalid email or password');
        }
      } else if (err?.code === 'EMAIL_EXISTS' || err?.message?.includes('already registered')) {
        setError(isAr ? 'هذا البريد مسجل بالفعل، يرجى تسجيل الدخول' : 'This email is already registered. Please sign in.');
      } else if (err?.message?.includes('No account found')) {
        setError(
          isAr
            ? 'لا يوجد حساب مسجل بهذا البريد. يمكنك الضغط على "إنشاء حساب جديد"'
            : 'No account found with this email. You can create a new account.'
        );
      } else {
        setError(err?.message || (isAr ? 'فشلت العملية، يرجى المحاولة ثانية' : 'Authentication failed. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Segmented Mode Selector Tabs */}
      <div className="flex rounded-xl p-1 bg-white/[0.05] border border-white/10 mb-2">
        <button
          type="button"
          onClick={() => handleModeSwitch('login')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all ${
            mode === 'login'
              ? 'bg-[#FAA802] text-[#08080A] shadow-[0_0_20px_rgba(250,168,2,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
          disabled={isLoading}
        >
          <Icon name="LogIn" size={16} />
          <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('register')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all ${
            mode === 'register'
              ? 'bg-[#FAA802] text-[#08080A] shadow-[0_0_20px_rgba(250,168,2,0.4)]'
              : 'text-gray-400 hover:text-white'
          }`}
          disabled={isLoading}
        >
          <Icon name="UserPlus" size={16} />
          <span>{isAr ? 'إنشاء حساب جديد' : 'Create Account'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Branch B: Account Locked Warning with Real-Time Countdown */}
        {isAccountLocked ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 space-y-2.5">
            <div className="flex items-center gap-2.5 font-bold text-sm text-red-400">
              <Icon name="ShieldAlert" size={20} className="text-red-400 animate-pulse flex-shrink-0" />
              <span>{isAr ? 'الحساب مقفل مؤقتًا (حماية أمنية)' : 'Account Locked (Security Shield)'}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isAr
                ? 'تم تجاوز الحد الأقصى للمحاولات (5 محاولات متتالية). تم تفعيل بروتوكول قفل الحساب مؤقتًا لحمايتك.'
                : 'Maximum attempts exceeded (5 failed attempts). Security lockout is actively enforced.'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-red-500/20 text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Icon name="Clock" size={14} className="text-amber-400" />
                {isAr ? 'الوقت المتبقي لفتح الحساب:' : 'Time until unlock:'}
              </span>
              <span className="font-mono font-black text-amber-400 bg-black/50 px-2.5 py-1 rounded-lg border border-amber-500/30 text-sm tracking-wider">
                {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        ) : (
          /* Error Alert (e.g. Branch A: Invalid Credentials with Attempts Left) */
          error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs font-semibold">
              <Icon name="AlertCircle" size={17} className="flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )
        )}

        {/* Full Name Field (Register Mode Only) */}
        {mode === 'register' && (
          <Input
            label={isAr ? 'الاسم بالكامل' : 'Full Name'}
            type="text"
            name="fullName"
            placeholder={isAr ? 'أحمد محمد' : 'John Doe'}
            value={formData.fullName}
            onChange={handleInputChange}
            required
            autoFocus
            disabled={isLoading || isAccountLocked}
            prefix={<Icon name="User" size={17} className="text-[#FAA802]" />}
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-500"
          />
        )}

        {/* Email Field */}
        <Input
          label={isAr ? 'البريد الإلكتروني' : 'Email Address'}
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleInputChange}
          required
          autoFocus={mode === 'login'}
          disabled={isLoading || isAccountLocked}
          prefix={<Icon name="Mail" size={17} className="text-[#FAA802]" />}
          className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-500"
        />

        {/* Password Field */}
        <Input
          label={isAr ? 'كلمة المرور' : 'Password'}
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={isLoading || isAccountLocked}
          prefix={<Icon name="Lock" size={17} className="text-[#FAA802]" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="my-auto text-gray-400 hover:text-white"
              tabIndex={-1}
              disabled={isAccountLocked}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={17} />
            </button>
          }
          className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-500"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          disabled={isLoading || isAccountLocked}
          className={`h-12 font-black text-sm rounded-xl transition-all mt-2 ${
            isAccountLocked
              ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] shadow-[0_0_25px_rgba(250,168,2,0.35)]'
          }`}
        >
          <Icon
            name={isAccountLocked ? 'ShieldAlert' : mode === 'login' ? 'LogIn' : 'ArrowRight'}
            size={18}
            className={isAr && mode !== 'login' && !isAccountLocked ? 'rotate-180' : ''}
          />
          <span>
            {isAccountLocked
              ? isAr
                ? `الحساب مقفل (${lockCountdown} ثانية)`
                : `Locked (${lockCountdown}s remaining)`
              : isLoading
              ? isAr
                ? mode === 'login'
                  ? 'جارٍ التحقق وتأكيد الجلسة...'
                  : 'جارٍ إنشاء الحساب...'
                : mode === 'login'
                ? 'Verifying & Authenticating...'
                : 'Creating Account...'
              : isAr
              ? mode === 'login'
                ? 'تسجيل الدخول'
                : 'إنشاء حساب والبدء في الخطة'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account & Begin'}
          </span>
        </Button>

        {/* Social Login Option */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0D0E12] text-gray-400 font-medium">
              {isAr ? 'أو المتابعة عبر' : 'Or continue with'}
            </span>
          </div>
        </div>

        <GoogleSignInButton
          text={
            mode === 'login'
              ? isAr
                ? 'تسجيل الدخول عبر Google'
                : 'Sign in with Google'
              : isAr
              ? 'إنشاء حساب عبر Google'
              : 'Sign up with Google'
          }
        />

        {/* Mode Switcher Link at Bottom */}
        <div className="text-center pt-4 border-t border-white/10">
          {mode === 'login' ? (
            <p className="text-xs text-gray-400">
              {isAr ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className="text-[#FAA802] hover:underline font-bold transition-colors"
                disabled={isLoading}
              >
                {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-[#FAA802] hover:underline font-bold transition-colors"
                disabled={isLoading}
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
