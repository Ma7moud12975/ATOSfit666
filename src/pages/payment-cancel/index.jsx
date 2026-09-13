import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/pricing');
  };

  const handleContinueWithFree = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#1A202C] flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto text-center p-8 bg-white border border-[#E6EFF3] rounded-[32px] shadow-[0px_10px_35px_rgba(67, 83, 245,0.08)]">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-[#E6EFF3] rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="XCircle" className="w-12 h-12 text-[#4353FF]" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-[#1A202C] mb-4">Payment Cancelled</h1>
        <p className="text-[#64748B] mb-8 leading-relaxed">
          No worries! Your payment was cancelled and you haven't been charged. 
          You can still enjoy ATOS fit with our free plan or try upgrading again later.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRetryPayment}
            className="w-full py-4 bg-[#4353FF] hover:bg-[#5668FF] text-white font-bold rounded-xl transition-all duration-300 shadow-[0px_4px_18px_rgba(67, 83, 245,0.3)]"
          >
            Try Again
          </button>
          <button
            onClick={handleContinueWithFree}
            className="w-full py-3 bg-transparent border border-[#9DA8FF] text-[#4353FF] hover:bg-[#4353FF] hover:text-white font-bold rounded-xl transition-all duration-300"
          >
            Continue with Free Plan
          </button>
        </div>

        {/* Free Plan Benefits */}
        <div className="mt-8 p-6 bg-[#F4F8FA] border border-[#E6EFF3] rounded-2xl text-left">
          <h3 className="text-lg font-semibold text-[#1A202C] mb-4">Free Plan Includes:</h3>
          <ul className="space-y-2 text-sm text-[#4A5568]">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#4353FF] rounded-full mr-3"></div>
              10 hours of workout tracking per month
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#4353FF] rounded-full mr-3"></div>
              100 AI chatbot messages per month
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#4353FF] rounded-full mr-3"></div>
              50 food scans per month
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#4353FF] rounded-full mr-3"></div>
              Form correction and rep counting
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#4353FF] rounded-full mr-3"></div>
              Basic workout library access
            </li>
          </ul>
        </div>

        {/* Upgrade Later Info */}
        <div className="mt-6 p-4 bg-[#E6EFF3] border border-[#9DA8FF]/40 rounded-xl">
          <p className="text-sm text-[#4353FF] font-medium">
            💡 You can upgrade to Premium anytime from your profile settings to unlock unlimited features!
          </p>
        </div>

        {/* Support Link */}
        <div className="mt-6">
          <p className="text-xs text-[#A1ADB5]">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;