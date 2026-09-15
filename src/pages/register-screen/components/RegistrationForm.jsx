import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const RegistrationForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useSupabaseAuth();
  const { isAr } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = authLoading || isSubmitting;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const nameToSave = formData.fullName.trim() || cleanEmail.split('@')[0];
      const res = await signUp(cleanEmail, formData.password, nameToSave);
      if (res?.user) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/onboarding', { replace: true });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err?.message || '';
      if (msg.includes('already registered')) {
        setError(isAr ? 'هذا البريد مسجل بالفعل، يرجى تسجيل الدخول' : 'This email is already registered. Please sign in.');
      } else {
        setError(msg || (isAr ? 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً' : 'Registration failed. Please try again.'));
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

      {/* Full Name */}
      <Input
        label={isAr ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional)'}
        type="text"
        name="fullName"
        placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'}
        value={formData.fullName}
        onChange={(e) => handleInputChange('fullName', e.target.value)}
        disabled={isLoading}
        prefix={<Icon name="User" size={17} className="text-[#FAA802]" />}
        className="bg-white/[0.04] border-white/10 text-white placeholder:text-gray-500"
      />

      {/* Email Field */}
      <Input
        label={isAr ? 'البريد الإلكتروني' : 'Email Address'}
        type="email"
        name="email"
        placeholder={isAr ? 'name@example.com' : 'name@example.com'}
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
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
        onChange={(e) => handleInputChange('password', e.target.value)}
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
        <Icon name="ArrowRight" size={18} className={isAr ? 'rotate-180' : ''} />
        <span>
          {isLoading
            ? (isAr ? 'جارٍ إنشاء الحساب...' : 'Creating Account...')
            : (isAr ? 'إنشاء حساب والبدء في الخطة' : 'Create Account & Begin')}
        </span>
      </Button>

      {/* Sign In Link */}
      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400">
          {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
          <button
            type="button"
            onClick={() => navigate('/login-screen')}
            className="text-[#FAA802] hover:underline font-bold transition-colors"
            disabled={isLoading}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;
