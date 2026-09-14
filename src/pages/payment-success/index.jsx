import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { paymentService } from '../../utils/paymentService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        // Initialize payment service
        await paymentService.initialize();
        
        // Verify the subscription
        const result = await paymentService.verifySubscription(sessionId);
        
        if (result.success) {
          setVerificationStatus('success');
          setSubscriptionDetails(result.subscription);
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] text-[#1A202C] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white border border-[#E6EFF3] rounded-[32px] shadow-[0px_10px_35px_rgba(250, 168, 2,0.08)] max-w-md w-full">
          <div className="w-16 h-16 border-4 border-[#FAA802] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#1A202C] mb-2">Verifying Payment</h2>
          <p className="text-[#64748B]">Please wait while we confirm your subscription...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#F4F8FA] text-[#1A202C] flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center p-8 bg-white border border-[#E6EFF3] rounded-[32px] shadow-[0px_10px_35px_rgba(250, 168, 2,0.08)]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1A202C] mb-4">Payment Verification Failed</h1>
          <p className="text-[#64748B] mb-8 leading-relaxed">
            We couldn't verify your payment. Please contact support if you believe this is an error.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-3 bg-[#FAA802] hover:bg-[#FBB502] text-white font-bold rounded-xl transition-all duration-300 shadow-[0px_4px_18px_rgba(250, 168, 2,0.3)]"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-transparent border border-[#9DA8FF] text-[#FAA802] hover:bg-[#FAA802] hover:text-white font-bold rounded-xl transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#1A202C] flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto text-center p-8 bg-white border border-[#E6EFF3] rounded-[32px] shadow-[0px_10px_35px_rgba(250, 168, 2,0.08)]">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#E6EFF3] rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle" className="w-12 h-12 text-[#FAA802]" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-[#1A202C] mb-4">Payment Successful!</h1>
        <p className="text-[#64748B] mb-8 leading-relaxed">
          Welcome to ATOS fit {subscriptionDetails?.plan || 'Premium'}! Your subscription is now active.
        </p>

        {/* Subscription Details */}
        {subscriptionDetails && (
          <div className="bg-[#F4F8FA] border border-[#E6EFF3] rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-[#1A202C] mb-4">Subscription Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Plan:</span>
                <span className="text-[#1A202C] font-semibold">{subscriptionDetails.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Status:</span>
                <span className="text-[#FAA802] font-semibold capitalize">{subscriptionDetails.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Started:</span>
                <span className="text-[#1A202C] font-semibold">
                  {new Date(Number(subscriptionDetails.createdAt) / 1000000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-[#FAA802] hover:bg-[#FBB502] text-white font-bold rounded-xl transition-all duration-300 shadow-[0px_4px_18px_rgba(250, 168, 2,0.3)]"
          >
            Continue to Dashboard
          </button>
          <button
            onClick={() => navigate('/user-profile')}
            className="w-full py-3 bg-transparent border border-[#9DA8FF] text-[#FAA802] hover:bg-[#FAA802] hover:text-white font-bold rounded-xl transition-all duration-300"
          >
            View Profile
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-[#E6EFF3] border border-[#9DA8FF]/40 rounded-xl">
          <p className="text-sm text-[#FAA802] font-medium">
            🎉 You now have access to all premium features including unlimited tracking, 
            advanced analytics, and personalized workout plans!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;