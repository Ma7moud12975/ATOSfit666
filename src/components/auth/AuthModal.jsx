import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateEmail } from '../../utils/emailVerificationService';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { signIn, signUp, loading: authLoading } = useSupabaseAuth();
  const { isAr } = useLanguage();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateEmail(formData.email, isAr);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const cleanEmail = validation.cleanEmail;

    if (!formData.password || formData.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const fullName = formData.name.trim() || cleanEmail.split('@')[0];
        const res = await signUp(cleanEmail, formData.password, fullName);
        if (res?.user) {
          onClose();
          navigate('/onboarding', { replace: true });
        }
      } else {
        const res = await signIn(cleanEmail, formData.password);
        if (res?.user) {
          onClose();
          if (res.isNewUser || !res.user.onboardingCompleted) {
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
      } else if (msg.includes('Incorrect password') || msg.includes('Invalid login credentials')) {
        setError(isAr ? 'كلمة المرور غير صحيحة، يرجى المحاولة ثانية' : 'Incorrect password. Please try again.');
      } else if (msg.includes('No account found')) {
        setError(isAr ? 'لا يوجد حساب بهذا البريد. يمكنك إنشاء حساب جديد الآن.' : 'No account found with this email. Create one below.');
      } else {
        setError(msg || (isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'Authentication failed. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-[#0D0E12] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white animate-spring"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 50px rgba(250, 168, 2, 0.15)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <Icon name="X" size={20} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FAA802]/15 border border-[#FAA802]/30 mb-3 shadow-[0_0_20px_rgba(250,168,2,0.25)]">
            <img src="/assets/images/atosfit.png" alt="ATOS" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {mode === 'login'
              ? (isAr ? 'تسجيل الدخول' : 'Sign In')
              : (isAr ? 'إنشاء حساب جديد' : 'Create Account')}
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {mode === 'login'
              ? (isAr ? 'أدخل بريدك وكلمة المرور لمتابعة خطتك التدريبية' : 'Enter your credentials to access your synchronized plan')
              : (isAr ? 'أنشئ حسابك وسجّل قياساتك (الوزن والسن) لتجهيز خطتك الذكية' : 'Create your account to start personalized AI onboarding')}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl p-1 bg-white/[0.05] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#FAA802] text-[#08080A] shadow-[0_0_15px_rgba(250,168,2,0.35)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#FAA802] text-[#08080A] shadow-[0_0_15px_rgba(250,168,2,0.35)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Create Account'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-semibold">
            <Icon name="AlertCircle" size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label={isAr ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional)'}
              type="text"
              name="name"
              placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              prefix={<Icon name="User" size={17} className="text-[#FAA802]" />}
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-500"
            />
          )}

          <Input
            label={isAr ? 'البريد الإلكتروني' : 'Email Address'}
            type="email"
            name="email"
            placeholder={isAr ? 'name@example.com' : 'name@example.com'}
            value={formData.email}
            onChange={handleInputChange}
            required
            autoFocus
            disabled={isLoading}
            prefix={<Icon name="Mail" size={17} className="text-[#FAA802]" />}
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-500"
          />

          <Input
            label={isAr ? 'كلمة المرور' : 'Password'}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder={isAr ? '••••••••' : '••••••••'}
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

          <Button
            type="submit"
            variant="default"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            className="h-12 bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] font-black text-sm rounded-xl shadow-[0_0_25px_rgba(250,168,2,0.35)] mt-2"
          >
            <Icon name={mode === 'login' ? 'LogIn' : 'ArrowRight'} size={18} className={isAr && mode !== 'login' ? 'rotate-180' : ''} />
            <span>
              {isLoading
                ? (isAr ? 'جارٍ التحميل...' : 'Loading...')
                : mode === 'login'
                ? (isAr ? 'تسجيل الدخول' : 'Sign In')
                : (isAr ? 'إنشاء حساب والبدء في الخطة' : 'Create Account & Begin')}
            </span>
          </Button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
          {mode === 'login' ? (
            <p>
              {isAr ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-[#FAA802] hover:underline font-bold"
              >
                {isAr ? 'أنشئ حسابك الآن' : 'Create one now'}
              </button>
            </p>
          ) : (
            <p>
              {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[#FAA802] hover:underline font-bold"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;