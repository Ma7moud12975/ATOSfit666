import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import GoogleSignInButton from '../../../components/auth/GoogleSignInButton';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

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

  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
      setError('');
    }
  }, [initialMode]);

  const isLoading = externalLoading || isSubmitting;

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
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (mode === 'register') {
      const cleanName = formData.fullName.trim();
      if (!cleanName) {
        setError(isAr ? 'يرجى إدخال اسمك الكامل' : 'Please enter your full name');
        return;
      }
    }

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
      console.error('Auth error:', err);
      const msg = err?.message || '';
      if (msg.includes('already registered')) {
        setError(isAr ? 'هذا البريد مسجل بالفعل، يرجى تسجيل الدخول' : 'This email is already registered. Please sign in.');
      } else if (msg.includes('Invalid login credentials') || msg.includes('Incorrect password')) {
        setError(isAr ? 'كلمة المرور أو البريد الإلكتروني غير صحيح' : 'Invalid email or password');
      } else if (msg.includes('No account found')) {
        setError(isAr ? 'لا يوجد حساب مسجل بهذا البريد. يمكنك الضغط على "إنشاء حساب جديد"' : 'No account found with this email. You can create a new account.');
      } else {
        setError(msg || (isAr ? 'فشلت العملية، يرجى المحاولة ثانية' : 'Authentication failed. Please try again.'));
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
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-semibold">
            <Icon name="AlertCircle" size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
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
            disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
          prefix={<Icon name="Lock" size={17} className="text-[#FAA802]" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="my-auto text-gray-400 hover:text-white"
              tabIndex={-1}
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
          disabled={isLoading}
          className="h-12 bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] font-black text-sm rounded-xl shadow-[0_0_25px_rgba(250,168,2,0.35)] mt-2"
        >
          <Icon
            name={mode === 'login' ? 'LogIn' : 'ArrowRight'}
            size={18}
            className={isAr && mode !== 'login' ? 'rotate-180' : ''}
          />
          <span>
            {isLoading
              ? isAr
                ? mode === 'login'
                  ? 'جارٍ تسجيل الدخول...'
                  : 'جارٍ إنشاء الحساب...'
                : mode === 'login'
                ? 'Signing In...'
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
