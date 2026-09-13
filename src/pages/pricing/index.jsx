import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { paymentService } from '../../utils/paymentService';
import { useLanguage } from '../../contexts/LanguageContext';
import { applyTheme, getSavedTheme } from '../../utils/theme';

const PricingPage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [theme, setTheme] = useState(getSavedTheme);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize payment service and check user authentication
  useEffect(() => {
    const initializePayments = async () => {
      await paymentService.initialize();
      
      // Check if user is logged in (you might want to get this from your auth context)
      const userData = localStorage.getItem('userData');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    };

    initializePayments();
  }, []);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started with ATOS fit',
      features: {
        tracking: '10 hours/month',
        chatbot: '100 messages/month',
        foodScanning: '50 scans/month',
        formCorrection: true,
        repCounting: true,
        basicWorkouts: true,
        dataPrivacy: true,
        personalizedPlans: false,
        prioritySupport: false,
        unlimitedTracking: false,
        unlimitedChatbot: false,
        unlimitedFoodScanning: false
      },
      popular: false,
      betaNote: 'Currently free during beta',
      planType: 'Basic'
    },
    {
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Enhanced features for serious fitness enthusiasts',
      features: {
        tracking: '100 hours/month',
        chatbot: '1,000 messages/month',
        foodScanning: '500 scans/month',
        formCorrection: true,
        repCounting: true,
        basicWorkouts: true,
        dataPrivacy: true,
        personalizedPlans: true,
        prioritySupport: false,
        unlimitedTracking: false,
        unlimitedChatbot: false,
        unlimitedFoodScanning: false
      },
      popular: true,
      betaNote: 'Free during beta - $9.99/month after launch',
      planType: 'Premium'
    },
    {
      name: 'Premium Plus',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'Unlimited access to all ATOS fit features',
      features: {
        tracking: 'Unlimited',
        chatbot: 'Unlimited',
        foodScanning: 'Unlimited',
        formCorrection: true,
        repCounting: true,
        basicWorkouts: true,
        dataPrivacy: true,
        personalizedPlans: true,
        prioritySupport: true,
        unlimitedTracking: true,
        unlimitedChatbot: true,
        unlimitedFoodScanning: true
      },
      popular: false,
      betaNote: 'Free during beta - $19.99/month after launch',
      planType: 'PremiumPlus'
    }
  ];

  const featuresList = [
    { key: 'tracking', label: 'Workout Tracking', icon: 'Clock' },
    { key: 'chatbot', label: 'AI Chatbot Messages', icon: 'MessageCircle' },
    { key: 'foodScanning', label: 'Food Scanning', icon: 'Scan' },
    { key: 'formCorrection', label: 'Real-time Form Correction', icon: 'Target' },
    { key: 'repCounting', label: 'Automatic Rep Counting', icon: 'BarChart3' },
    { key: 'basicWorkouts', label: 'Basic Workout Library', icon: 'Dumbbell' },
    { key: 'dataPrivacy', label: 'Complete Data Privacy', icon: 'Shield' },
    { key: 'personalizedPlans', label: 'Personalized Workout Plans', icon: 'User' },
    { key: 'prioritySupport', label: '24/7 Priority Support', icon: 'Headphones' }
  ];

  const handleGetStarted = async (plan) => {
    // For Free plan, just navigate to login
    if (plan.planType === 'Basic') {
      navigate('/login-screen');
      return;
    }

    // Check if user is authenticated
    if (!currentUser) {
      // Store the selected plan and redirect to login
      localStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/login-screen');
      return;
    }

    // Process payment for Premium/Premium Plus plans
    setIsProcessing(true);
    
    try {
      // Create checkout session
      const result = await paymentService.createCheckoutSession(currentUser.id, plan.planType);
      
      if (result.success) {
        // Redirect to Stripe Checkout
        const redirectResult = await paymentService.redirectToCheckout(result.sessionId);
        
        if (!redirectResult.success) {
          alert('Failed to redirect to checkout: ' + redirectResult.error);
        }
      } else {
        alert('Failed to create checkout session: ' + result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred while processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#020203] text-[#0F1015] dark:text-[#EDEDEF] font-sans relative overflow-x-hidden selection:bg-[#4353FF]/30 selection:text-white">
      {/* Background accent glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[rgba(67, 83, 245,0.12)] dark:bg-[rgba(67, 83, 245,0.15)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-[rgba(67, 83, 245,0.08)] dark:bg-[rgba(67, 83, 245,0.1)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[700px] bg-[rgba(67, 83, 245,0.06)] dark:bg-[rgba(67, 83, 245,0.08)] rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.06] bg-white/80 dark:bg-[#050506]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-[#0F1015] dark:text-[#EDEDEF] tracking-tight">ATOS fit</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm">Home</button>
            <a href="#pricing" className="text-[#4353FF] font-semibold text-sm">Pricing</a>
            <button onClick={() => navigate('/privacy')} className="text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm">Privacy</button>
            <button onClick={() => navigate('/about')} className="text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm">About Us</button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[#0F1015] dark:text-[#EDEDEF] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={17} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="atos-language-toggle"
              title={language === 'ar' ? 'English' : 'عربي'}
            >
              <Icon name="Languages" size={16} />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button
              onClick={() => navigate('/login-screen')}
              className="inline-flex items-center justify-center linear-btn-primary px-5 py-2 rounded-full text-sm font-medium"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[#0F1015] dark:text-[#EDEDEF]"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="atos-language-toggle"
            >
              <Icon name="Languages" size={15} />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#0F1015] dark:text-[#EDEDEF] p-2"
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.06] shadow-2xl">
            <div className="px-6 py-4 space-y-4">
              <button 
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }} 
                className="block text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm py-2 w-full text-left"
              >
                Home
              </button>
              <a 
                href="#pricing" 
                className="block text-sm text-[#4353FF] font-semibold py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <button 
                onClick={() => {
                  navigate('/privacy');
                  setIsMobileMenuOpen(false);
                }} 
                className="block text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm py-2 w-full text-left"
              >
                Privacy
              </button>
              <button 
                onClick={() => {
                  navigate('/about');
                  setIsMobileMenuOpen(false);
                }} 
                className="block text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] font-medium transition-colors text-sm py-2 w-full text-left"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  navigate('/login-screen');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full linear-btn-primary py-2.5 rounded-full text-sm font-medium mt-4"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold linear-gradient-text mb-4 tracking-tight">
              Choose Your <span className="text-[#4353FF]">Fitness Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-[#8A8F98] max-w-3xl mx-auto mb-8">
              All plans are currently free during our beta phase. Experience the full power of AI-driven fitness 
              with complete privacy and blockchain security.
            </p>
            
            {/* Beta Notice */}
            <div className="bg-[rgba(67, 83, 245,0.08)] border border-[rgba(67, 83, 245,0.25)] rounded-2xl p-6 max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Icon name="Info" size={24} className="text-[#4353FF]" />
                <h3 className="text-lg font-semibold text-[#0F1015] dark:text-[#EDEDEF]">Free Beta Access</h3>
              </div>
              <p className="text-[#525866] dark:text-[#8A8F98] text-sm">
                We're currently in beta! All premium features are completely free while we perfect the experience. 
                Your feedback helps us build the ultimate AI fitness companion.
              </p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-base font-semibold ${billingCycle === 'monthly' ? 'text-[#0F1015] dark:text-white' : 'text-[#8A8F98]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-[#E2E4E9] dark:bg-[#1A1A1A] rounded-full border border-black/[0.08] dark:border-white/[0.06] transition-all duration-300"
            >
              <div className={`absolute top-1 w-6 h-6 bg-[#4353FF] rounded-full transition-all duration-300 ${
                billingCycle === 'yearly' ? 'left-9' : 'left-1'
              }`} />
            </button>
            <span className={`text-base font-semibold ${billingCycle === 'yearly' ? 'text-[#0F1015] dark:text-white' : 'text-[#8A8F98]'}`}>
              Yearly
            </span>
            <span className="linear-pill-badge text-xs font-semibold px-3 py-1 rounded-full">
              Save 17%
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-[#0a0a0c]/80 border rounded-[32px] p-8 shadow-sm transition-all duration-300 hover:border-[rgba(67, 83, 245,0.4)] hover:shadow-[0px_0px_40px_rgba(67, 83, 245,0.15)] ${
                  plan.popular 
                    ? 'border-[#4353FF] shadow-[0px_0px_30px_rgba(67, 83, 245,0.18)]' 
                    : 'border-black/[0.08] dark:border-white/[0.08]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#4353FF] text-white font-semibold px-6 py-2 rounded-full text-sm shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-[#0F1015] dark:text-[#EDEDEF] mb-1">{plan.name}</h3>
                  <p className="text-[#636779] dark:text-[rgba(255,255,255,0.4)] mb-6">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-[#0F1015] dark:text-[#EDEDEF]">
                      ${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-[#636779] dark:text-[rgba(255,255,255,0.4)] ml-2">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  
                  <div className="bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-2.5 mb-6">
                    <p className="text-xs text-[#4353FF] dark:text-[#828FFF] font-semibold">{plan.betaNote}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#636779] dark:text-[#8A8F98]">Workout Tracking</span>
                      <span className="text-[#0F1015] dark:text-white font-medium">{plan.features.tracking}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#636779] dark:text-[#8A8F98]">AI Chatbot</span>
                      <span className="text-[#0F1015] dark:text-white font-medium">{plan.features.chatbot}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#636779] dark:text-[#8A8F98]">Food Scanning</span>
                      <span className="text-[#0F1015] dark:text-white font-medium">{plan.features.foodScanning}</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full py-4 rounded-2xl font-semibold bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                >
                  {plan.planType === 'Basic' ? (
                    'Start Free Beta'
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold linear-gradient-text mb-2">
              Compare All Features
            </h2>
            <p className="text-xl text-sm text-[#8A8F98]">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="linear-card rounded-3xl overflow-hidden border border-white/[0.06] hover:border-[rgba(67, 83, 245,0.3)] hover:shadow-[0px_0px_40px_rgba(67, 83, 245,0.1)] transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.08] dark:border-[rgba(255,255,255,0.1)]">
                    <th className="text-left p-6 text-sm text-[#0F1015] dark:text-[#EDEDEF] font-medium">Features</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="text-center p-6">
                        <div className="text-[#0F1015] dark:text-[#EDEDEF] font-bold text-lg">{plan.name}</div>
                        <div className="text-[#525866] dark:text-[rgba(255,255,255,0.4)] text-sm mt-1">
                          ${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featuresList.map((feature, index) => (
                    <tr key={feature.key} className="border-b border-black/[0.05] dark:border-[rgba(255,255,255,0.05)]">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <Icon name={feature.icon} size={20} className="text-[#4353FF]" />
                          <span className="text-sm text-[#525866] dark:text-[#8A8F98]">{feature.label}</span>
                        </div>
                      </td>
                      {plans.map((plan) => (
                        <td key={`${plan.name}-${feature.key}`} className="text-center p-6">
                          {feature.key === 'tracking' || feature.key === 'chatbot' || feature.key === 'foodScanning' ? (
                            <span className="text-[#0F1015] dark:text-white font-medium">{plan.features[feature.key]}</span>
                          ) : plan.features[feature.key] ? (
                            <Icon name="Check" size={24} className="text-[#4353FF] mx-auto" />
                          ) : (
                            <Icon name="X" size={24} className="text-[#94A3B8] dark:text-[rgba(255,255,255,0.3)] mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-[#0F1015] dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0a0a0c]/80 border border-[#E2E4E9] dark:border-[rgba(255,255,255,0.1)] rounded-2xl p-6 hover:border-[rgba(67, 83, 245,0.3)] hover:shadow-[0px_0px_40px_rgba(67, 83, 245,0.1)] transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F1015] dark:text-[#EDEDEF] mb-2">
                Why is everything free during beta?
              </h3>
              <p className="text-[#525866] dark:text-[#8A8F98] leading-relaxed text-sm">
                We're perfecting ATOS fit based on real user feedback. During beta, all features are free so you can
                experience the full platform and help us build the best AI fitness companion possible.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0a0a0c]/80 border border-[#E2E4E9] dark:border-[rgba(255,255,255,0.1)] rounded-2xl p-6 hover:border-[rgba(67, 83, 245,0.3)] hover:shadow-[0px_0px_40px_rgba(67, 83, 245,0.1)] transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F1015] dark:text-[#EDEDEF] mb-2">
                When will paid plans become active?
              </h3>
              <p className="text-[#525866] dark:text-[#8A8F98] leading-relaxed text-sm">
                Paid plans will activate after our beta phase ends. We'll give all beta users advance notice and 
                special early-bird pricing as a thank you for your feedback and support.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0a0a0c]/80 border border-[#E2E4E9] dark:border-[rgba(255,255,255,0.1)] rounded-2xl p-6 hover:border-[rgba(67, 83, 245,0.3)] hover:shadow-[0px_0px_40px_rgba(67, 83, 245,0.1)] transition-all duration-300">
              <h3 className="text-lg font-semibold text-[#0F1015] dark:text-[#EDEDEF] mb-2">
                Is my data really private?
              </h3>
              <p className="text-[#525866] dark:text-[#8A8F98] leading-relaxed text-sm">
                Absolutely. Your workout videos are processed locally on your device using MediaPipe. Your identity 
                is secured by Internet Identity, and your data is protected by ICP blockchain technology. We never 
                see your personal workout data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-black/[0.08] dark:border-white/[0.06] bg-[#ECEFF3] dark:bg-[#020203] text-[#636779] dark:text-[#8A8F98]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-[#0F1015] dark:text-white">ATOS fit</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] transition-colors text-sm">Home</button>
              <a href="#pricing" className="text-[#4353FF] font-semibold">Pricing</a>
              <button onClick={() => navigate('/privacy')} className="text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] transition-colors text-sm">Privacy</button>
              <button onClick={() => navigate('/about')} className="text-[#636779] dark:text-[#8A8F98] hover:text-[#0F1015] dark:hover:text-[#EDEDEF] transition-colors text-sm">About Us</button>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.linkedin.com/company/atos-fit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.4)] hover:text-[#4353FF] transition-colors"
                aria-label="LinkedIn"
              >
                <Icon name="Linkedin" size={24} />
              </a>
              <a 
                href="https://twitter.com/AtosFit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.4)] hover:text-[#4353FF] transition-colors"
                aria-label="Twitter/X"
              >
                <Icon name="Twitter" size={24} />
              </a>
              <a 
                href="https://www.producthunt.com/posts/atos-fit?utm_source=other&utm_medium=social" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.4)] hover:text-[#4353FF] transition-colors"
                aria-label="Product Hunt"
              >
                <Icon name="ExternalLink" size={24} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
