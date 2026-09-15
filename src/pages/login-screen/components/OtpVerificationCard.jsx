import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { verifyEmailOtp, sendEmailVerificationOtp } from '../../../utils/emailVerificationService';

const OtpVerificationCard = ({
  email,
  fullName,
  onVerified,
  onBack,
}) => {
  const { isAr } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Setup countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const triggerVerify = async (codeToVerify) => {
    if (!codeToVerify || codeToVerify.length !== 6 || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await verifyEmailOtp(email, codeToVerify, isAr);
      if (res.success) {
        if (onVerified) await onVerified();
      } else {
        setError(res.error || (isAr ? 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة' : 'Invalid verification code. Please try again.'));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.message || (isAr ? 'فشل التحقق من الرمز' : 'Verification failed'));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    if (error) setError('');

    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-verify as soon as all 6 digits are typed
    if (char && index === 5) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6 && newOtp.every((d) => d !== '')) {
        triggerVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      if (error) setError('');
      triggerVerify(pasted);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      await sendEmailVerificationOtp(email, fullName);
      setResendCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || (isAr ? 'فشل إعادة إرسال الرمز' : 'Failed to resend code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError(isAr ? 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)' : 'Please enter all 6 digits of the code');
      return;
    }
    await triggerVerify(fullCode);
  };

  return (
    <div className="space-y-5 animate-fadeIn" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Icon & Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FAA802]/15 border border-[#FAA802]/30 shadow-[0_0_25px_rgba(250,168,2,0.25)] text-[#FAA802] mb-1">
          <Icon name="MailCheck" size={26} />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {isAr ? 'تأكيد البريد الإلكتروني' : 'Verify Your Email'}
        </h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
          {isAr
            ? 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الإلكتروني لتأكيد حسابك والانتقال للخطة:'
            : 'Enter the 6-digit verification code sent to your email to verify your account and start your plan:'}
        </p>

        {/* Email Badge & Edit Link */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-gray-300 font-mono">
          <Icon name="Mail" size={13} className="text-[#FAA802]" />
          <span className="font-semibold">{email}</span>
          <button
            type="button"
            onClick={onBack}
            className="text-[#FAA802] hover:underline text-[11px] font-sans font-bold flex items-center gap-1 ms-1"
            title={isAr ? 'تعديل البريد' : 'Edit email'}
          >
            <Icon name="Edit2" size={11} />
            <span>{isAr ? 'تعديل' : 'Edit'}</span>
          </button>
        </div>

        {/* Security Inbox & Spam folder reminder */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
          <Icon name="ShieldCheck" size={13} className="text-emerald-400 flex-shrink-0" />
          <span>
            {isAr
              ? 'يرجى مراجعة صندوق الوارد ومجلد الرسائل غير المرغوب فيها (Spam)'
              : 'Please check your inbox and Spam / Junk folder'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-semibold">
          <Icon name="AlertCircle" size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Digit Input Boxes */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center gap-2 sm:gap-3" dir="ltr" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border bg-white/[0.04] text-white transition-all outline-none ${
                digit
                  ? 'border-[#FAA802] bg-[#FAA802]/10 shadow-[0_0_15px_rgba(250,168,2,0.3)]'
                  : 'border-white/15 focus:border-[#FAA802] focus:bg-white/[0.07]'
              }`}
            />
          ))}
        </div>

        {/* Submit Verification Button */}
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          disabled={isLoading || otp.join('').length !== 6}
          className="h-12 bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] font-black text-sm rounded-xl shadow-[0_0_25px_rgba(250,168,2,0.35)]"
        >
          <Icon name="CheckCircle" size={18} />
          <span>
            {isLoading
              ? isAr ? 'جارٍ التحقق والانتقال للخطة...' : 'Verifying & Continuing...'
              : isAr ? 'تأكيد الحساب والبدء في الخطة' : 'Verify Account & Continue'}
          </span>
        </Button>

        {/* Resend Timer & Link */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            disabled={isLoading}
          >
            <Icon name="ArrowLeft" size={14} className={isAr ? 'rotate-180' : ''} />
            <span>{isAr ? 'العودة' : 'Back'}</span>
          </button>

          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-[#FAA802] hover:underline font-bold"
              disabled={isLoading}
            >
              {isAr ? 'إعادة إرسال الرمز' : 'Resend Code'}
            </button>
          ) : (
            <span className="font-mono text-gray-500">
              {isAr ? `إعادة الإرسال بعد ${resendCountdown} ثانية` : `Resend in ${resendCountdown}s`}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default OtpVerificationCard;
