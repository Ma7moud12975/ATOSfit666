import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const LoginForm = ({ onSubmit, isLoading: externalLoading = false }) => {
  const navigate = useNavigate();
  const { signIn, loading: authLoading } = useSupabaseAuth();
  const { isAr } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = externalLoading || isSubmitting;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    setIsSubmitting(true);

    try {
      const data = await signIn(cleanEmail, formData.password);
      
      if (data?.user) {
        if (onSubmit) await onSubmit(formData);
        if (data.isNewUser || !data.user.onboardingCompleted) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('Incorrect password')) {
        setError(isAr ? 'كلمة المرور أو البريد الإلكتروني غير صحيح' : 'Invalid email or password');
      } else if (msg.includes('No account found')) {
        setError(isAr ? 'لا يوجد حساب مسجل بهذا البريد' : 'No account found with this email');
      } else {
        setError(msg || (isAr ? 'فشل تسجيل الدخول، يرجى المحاولة ثانية' : 'Login failed. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-semibold">
          <Icon name="AlertCircle" size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Field */}
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

      {/* Password Field */}
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

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="h-12 bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] font-black text-sm rounded-xl shadow-[0_0_25px_rgba(250,168,2,0.35)] mt-2"
      >
        <Icon name="LogIn" size={18} />
        <span>{isLoading ? (isAr ? 'جارٍ تسجيل الدخول...' : 'Signing In...') : (isAr ? 'تسجيل الدخول' : 'Sign In')}</span>
      </Button>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400">
          {isAr ? 'ليس لديك حساب بعد؟ ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => navigate('/register-screen')}
            className="text-[#FAA802] hover:underline font-bold transition-colors"
            disabled={isLoading}
          >
            {isAr ? 'إنشاء حساب جديد' : 'Sign Up'}
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
