import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { hasValidSession } from '../../utils/nativeAuth';
import InteractiveImage from '../../components/InteractiveImage';
import { useLanguage } from '../../contexts/LanguageContext';
import { applyTheme, getSavedTheme } from '../../utils/theme';
import '../../styles/bento-dashboard.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, supabaseUser, loading: authLoading, logout } = useAuth();
  const hasSession = isAuthenticated || hasValidSession();
  const { language, toggleLanguage } = useLanguage();
  const [theme, setTheme] = useState(getSavedTheme);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const current = getSavedTheme();
    applyTheme(current);
    setTheme(current);
    const syncTheme = (e) => {
      setTheme(e.detail || getSavedTheme());
    };
    window.addEventListener('atos-theme-change', syncTheme);
    return () => window.removeEventListener('atos-theme-change', syncTheme);
  }, []);

  const isAr = language === 'ar';

    const landingCopy = isAr ? {
    home: 'الرئيسية',
    programNav: 'البرامج التدريبية',
    nutritionNav: 'التغذية والوجبات',
    communityNav: 'المجتمع الرياضي',
    howItWorksNav: 'طريقة العمل',
    exercisesNav: 'التمارين',
    pricing: 'الأسعار',
    privacy: 'الخصوصية',
    about: 'من نحن',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    signOut: 'تسجيل الخروج',
    continueToDashboard: 'الانتقال إلى لوحة التحكم',
    signingIn: 'جارٍ التحميل...',
    start: 'ابدأ تمرينك الآن',
    starting: 'جارٍ التحميل...',
    badge: 'تتبع حركي متقدم بالرؤية الحاسوبية',
    form: 'تدرّب بدقة احترافية.',
    results: 'أتقن كل حركة.',
    intro: 'يحوّل كاميرا هاتفك إلى أداة تحليل حركي فورية ترصد زوايا المفاصل واستقامة الظهر لحظة بلحظة، وتنبهك للأخطاء لتفادي الإصابات مع عد تلقائي للتكرارات وبخصوصية تامة داخل جهازك.',
    howItWorks: 'طريقة العمل',
    categories: [
      { iconName: 'Dumbbell', label: 'تمارين الحديد والقوة' },
      { iconName: 'Activity', label: 'كاليسثينكس ووزن الجسم' },
      { iconName: 'Flame', label: 'تمارين الكارديو وHIIT' },
      { iconName: 'Shield', label: 'تصحيح القوام والمرونة' },
    ],
    accuracyStat: 'دقة القياس البيوميكانيكي',
    latencyStat: 'زمن التوجيه الصوتي',
    privacyStat: 'معالجة داخل الهاتف 100%',
    stepsTag: 'طريقة الاستخدام',
    stepsTitle: 'ابدأ تمرينك في ثوانٍ معدودة',
    stepsSubtitle: 'بدون ساعات ذكية أو حساسات خارجية. هاتفك فقط كافٍ لبدء تدريب احترافي متكامل.',
    steps: [
      {
        num: '01',
        icon: 'Smartphone',
        title: 'وجّه هاتفك أمامك',
        desc: 'ضع هاتفك أمام مساحة التمرين مع وضوح كامل لجسمك دون الحاجة لأي حساسات أو معدات تثبيت معقدة.',
      },
      {
        num: '02',
        icon: 'Activity',
        title: 'تدرّب بحرية وثقة',
        desc: 'ترصد الكاميرا 33 نقطة مفصلية لتقييم عمق الحركة واستقامة العمود الفقري بدقة 60 إطاراً في الثانية.',
      },
      {
        num: '03',
        icon: 'Volume2',
        title: 'توجيه صوتي وعدّ تلقائي',
        desc: 'استمع لتنبيهات فورية أثناء التمرين لتصحيح وضعك، مع تسجيل تلقائي لعدد التكرارات ومعدل الإيقاع.',
      }
    ],
    featuresTag: 'القدرات والتقنيات',
    featuresTitle: 'أدوات احترافية مصممة للرياضيين',
    featuresSubtitle: 'حلول متطورة لمراقبة الهيئة الحركية، ومنع الإصابات، وضمان إتمام المدى الحركي الكامل لكل تمرين.',
    supportedTag: 'التمارين المدعومة',
    supportedTitle: 'أكثر من 50 تمريناً تُتبع بدقة متناهية',
    supportedSubtitle: 'خوارزميات متقدمة تتحقق من عمق النزول واستقامة المفاصل لضمان أعلى فائدة عضلية.',
    exercises: [
      { name: 'سكوات', target: 'الأرجل والجلوتس', badge: 'عمق كامل' },
      { name: 'ضغط (Push-Ups)', target: 'الصدر والترايسبس', badge: 'استقامة الجذع' },
      { name: 'عقلة (Pull-Ups)', target: 'الظهر والبايسبس', badge: 'مدى حركي كامل' },
      { name: 'طعنات (Lunges)', target: 'الفخذين والتوازن', badge: 'زاوية 90°' },
      { name: 'بلانك (Plank)', target: 'عضلات الكور', badge: 'استقامة الحوض' },
      { name: 'ضغط أكتاف', target: 'الأكتاف والتراي', badge: 'قفل علوي' },
      { name: 'ديدليفت', target: 'السلسلة الخلفية', badge: 'حماية الظهر' },
      { name: 'تسلق الجبال', target: 'كارديو وحرق', badge: 'سرعة وإيقاع' },
    ],
    privacyTag: 'أمان وخصوصية البيانات',
    privacyTitle: 'بيانات حركتك وفيديوهاتك لا تغادر جهازك',
    privacySubtitle: 'تتم معالجة حركة جسمك لحظياً داخل معالج هاتفك، دون تسجيل أو رفع أي لقطات لسيرفرات خارجية.',
    readPrivacy: 'وثيقة الخصوصية والأمان',
    copyright: '© 2026 ATOS fit. جميع الحقوق محفوظة.',
  } : {
    home: 'Home',
    programNav: 'Program',
    nutritionNav: 'Nutrition',
    communityNav: 'Community',
    howItWorksNav: 'How It Works',
    exercisesNav: 'Exercises',
    pricing: 'Pricing',
    privacy: 'Privacy',
    about: 'About Us',
    signIn: 'Sign In',
    signUp: 'Get Started',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
    continueToDashboard: 'Continue to Dashboard',
    signingIn: 'Signing in...',
    start: 'Start Workout',
    starting: 'Starting...',
    badge: 'INTELLIGENT MOTION TRACKING',
    form: 'Train with Precision',
    results: 'Master Every Rep',
    intro: 'turns your smartphone camera into a real-time biomechanics coach. Monitor joint angles, fix posture breakdowns before strain occurs, and count reps automatically — with 100% on-device privacy.',
    howItWorks: 'How It Works',
    categories: [
      { iconName: 'Dumbbell', label: 'Strength & Lifting' },
      { iconName: 'Activity', label: 'Bodyweight & Calisthenics' },
      { iconName: 'Flame', label: 'High-Intensity Cardio' },
      { iconName: 'Shield', label: 'Mobility & Posture' },
    ],
    accuracyStat: 'Biomechanical Precision',
    latencyStat: 'Voice Cue Latency',
    privacyStat: 'On-Device Processing',
    stepsTag: 'WORKOUT WORKFLOW',
    stepsTitle: 'Start Training in Seconds',
    stepsSubtitle: 'No wearables, no fitness bands, no gym appointments. Just you and your smartphone.',
    steps: [
      {
        num: '01',
        icon: 'Smartphone',
        title: 'Position Your Phone',
        desc: 'Place your phone facing your workout space with your full body visible. No sensors or smart hardware required.',
      },
      {
        num: '02',
        icon: 'Activity',
        title: 'Execute Your Set',
        desc: 'On-device vision tracks 33 skeletal points at 60 FPS, evaluating joint flexion, lumbar neutral, and bar path.',
      },
      {
        num: '03',
        icon: 'Volume2',
        title: 'Instant Audio Feedback',
        desc: 'Hear actionable voice coaching during reps while sets, cadence, and rest intervals log automatically.',
      }
    ],
    featuresTag: 'PLATFORM CAPABILITIES',
    featuresTitle: 'Engineered for Lifters & Athletes',
    featuresSubtitle: 'From injury prevention to cadence tracking, experience high-accuracy motion analysis built for performance.',
    supportedTag: 'MOVEMENT LIBRARY',
    supportedTitle: '50+ Exercises Tracked in Real Time',
    supportedSubtitle: 'Verified range of motion checks that eliminate shallow reps and enforce disciplined mechanics.',
    exercises: [
      { name: 'Squats', target: 'Quads & Glutes', badge: 'Full Depth' },
      { name: 'Push-Ups', target: 'Chest & Triceps', badge: 'Plank Form' },
      { name: 'Pull-Ups', target: 'Lats & Biceps', badge: 'Full ROM' },
      { name: 'Lunges', target: 'Quads & Balance', badge: '90° Angle' },
      { name: 'Planks', target: 'Core Stability', badge: 'Spine Neutral' },
      { name: 'Shoulder Press', target: 'Deltoids', badge: 'Lockout' },
      { name: 'Deadlifts', target: 'Posterior Chain', badge: 'Spine Safe' },
      { name: 'Mountain Climbers', target: 'Cardio & Core', badge: 'Pace & Rhythm' },
    ],
    privacyTag: 'LOCAL ARCHITECTURE',
    privacyTitle: 'Your Video Feed Never Leaves Your Device',
    privacySubtitle: 'Kinematic models compute your skeleton on-device. Zero video frames are ever recorded or transmitted.',
    readPrivacy: 'Read Security & Privacy Document',
    copyright: '© 2026 ATOS fit. All rights reserved.',
  };

  const privacyCards = [
    {
      icon: "ShieldCheck",
      tag: isAr ? 'معالجة على الجهاز' : 'ON-DEVICE PROCESSING',
      title: isAr ? 'معالجة محلية داخل هاتفك' : 'Local Computer Vision',
      desc: isAr
        ? 'تُحلل حركات التمارين بالكامل داخل معالج هاتفك العصبي دون رفع أو حفظ أي لقطات مرئية خارج الجهاز.'
        : 'Workout frames are analyzed entirely within your device neural engine without saving or transmitting any visual feed.',
      checks: isAr ? [
        'تحليل الهيكل الحركي محلياً 100%',
        'لا يتم نقل أي فيديو للسيرفرات إطلاقاً',
        'يعمل بدون إنترنت وبشكل غير متصل'
      ] : [
        'Real-time pose analysis entirely on-device',
        'Zero video transmission to external servers',
        'Works completely offline without Wi-Fi'
      ]
    },
    {
      icon: "KeyRound",
      tag: isAr ? 'هوية مشفرة' : 'SECURE PASSKEY',
      title: isAr ? 'تسجيل دخول آمن وخاص' : 'Cryptographic Sign-In',
      desc: isAr
        ? 'تسجيل دخول موثق عبر Passkey وInternet Identity دون الحاجة لإدخال كلمات مرور مكررة أو أرقام هواتف.'
        : 'Sign in securely using modern Passkey hardware authentication without sharing passwords or phone numbers.',
      checks: isAr ? [
        'لا حاجة لبريد إلكتروني أو بيانات شخصية',
        'مفاتيح تشفير متقدمة مقاومة للاختراق',
        'أمان بيومتري Passkey فائق الحماية'
      ] : [
        'No email or personal info required to sign up',
        'Cryptographically secure with Passkey hardware',
        'Immune to phishing and credential leaks'
      ]
    },
    {
      icon: "Database",
      tag: isAr ? 'سجلات مشفرة' : 'PRIVATE RECORDS',
      title: isAr ? 'تخزين مشفر لبياناتك' : 'Encrypted Performance Data',
      desc: isAr
        ? 'تُحفظ أرقامك القياسية وسجلات تمرينك بشكل مشفر ومحمي، ولا يمكن لأي طرف ثالث الاطلاع عليها.'
        : 'Your workout history and progress telemetry are encrypted, tamper-proof, and accessible strictly by you.',
      checks: isAr ? [
        'موزع عبر عقد بلوكتشين مشفرة',
        'سجلات غير قابلة للتعديل أو الحذف الخبيث',
        'أنت وحدك المالك والمتحكم ببياناتك'
      ] : [
        'Distributed across decentralized cryptographic nodes',
        'Tamper-proof workout history and metrics',
        'You exclusively own and control your data'
      ]
    }
  ];

  const handleGetStarted = () => {
    navigate('/login-screen?mode=register');
  };

  const handleLogin = () => {
    navigate('/login-screen?mode=login');
  };

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F7F8FA] dark:bg-[#08080A] text-[#08080A] dark:text-[#FFFFFF] font-sans relative overflow-x-hidden selection:bg-[#FAA802]/30 selection:text-white transition-colors duration-300"
      style={{
        background: theme === 'dark' ? '#08080A' : undefined
      }}
    >
      {/* ============================================================ */}
      {/* Subtle Fine Architectural Grid Texture                       */}
      {/* ============================================================ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* ============================================================ */}
      <nav className="relative z-50 px-6 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-[#08080A]/85 backdrop-blur-xl transition-colors">
        <div className="w-full max-w-[1840px] mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center">
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-11 h-11 object-contain drop-shadow-[0_4px_16px_rgba(250,168,2,0.35)] group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5" dir="ltr">
              <span className="text-2xl font-black text-[#0F1015] dark:text-white tracking-tight">ATOS</span>
              <span className="text-2xl font-black bg-gradient-to-r from-[#FAA802] via-[#FFAE00] to-[#E5E7EB] bg-clip-text text-transparent tracking-tight">fit</span>
            </div>
          </div>

          {/* Desktop Navigation Links (Aligned with Elite Reference Mockup) */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a href="#exercises" className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.programNav}</a>
            <button onClick={() => navigate('/ai-assistant-food-scanner')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.nutritionNav}</button>
            <button onClick={() => navigate('/community')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.communityNav}</button>
            <button onClick={() => navigate('/about')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.about}</button>
            <button onClick={() => navigate('/pricing')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.pricing}</button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[#08080A] dark:text-[#FFFFFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="atos-language-toggle"
              title={isAr ? 'English' : 'عربي'}
            >
              <Icon name="Languages" size={16} />
              <span className="font-bold">{isAr ? 'EN' : 'AR'}</span>
            </button>
            {hasSession ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FAA802] text-[#08080A] hover:bg-[#FB9202] transition-all shadow-[0_0_15px_rgba(250,168,2,0.3)]"
                >
                  <Icon name="LayoutDashboard" size={16} />
                  <span>{landingCopy.dashboard}</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#636779] dark:text-[#A8A8A8] hover:text-red-500 border border-black/10 dark:border-white/10 hover:border-red-500/30 transition-all"
                  title={landingCopy.signOut}
                >
                  <Icon name="LogOut" size={15} />
                  <span className="hidden lg:inline">{landingCopy.signOut}</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-semibold transition-colors text-xs sm:text-sm px-3 py-2"
                >
                  {landingCopy.signIn}
                </button>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold shadow-[0_0_20px_rgba(250,168,2,0.35)] hover:shadow-[0_0_25px_rgba(250,168,2,0.5)] transition-all"
                >
                  {landingCopy.signUp}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[#08080A] dark:text-[#FFFFFF]"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="atos-language-toggle"
            >
              <Icon name="Languages" size={15} />
              <span className="font-bold">{isAr ? 'EN' : 'AR'}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#08080A] dark:text-[#FFFFFF] p-2"
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-[#08080A]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.06] shadow-2xl z-50">
            <div className="px-6 py-4 space-y-3">
              <a
                href="#home"
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {landingCopy.home}
              </a>
              <a
                href="#exercises"
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {landingCopy.exercisesNav}
              </a>
              <a
                href="#privacy"
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {landingCopy.privacy}
              </a>
              <button
                onClick={() => {
                  navigate('/pricing');
                  setIsMobileMenuOpen(false);
                }}
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium text-sm py-2 w-full text-start"
              >
                {landingCopy.pricing}
              </button>
              <button
                onClick={() => {
                  navigate('/about');
                  setIsMobileMenuOpen(false);
                }}
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium text-sm py-2 w-full text-start"
              >
                {landingCopy.about}
              </button>
              {hasSession ? (
                <div className="space-y-2 mt-3">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#FAA802] text-[#08080A] py-3 rounded-xl text-sm font-extrabold shadow-[0_0_20px_rgba(250,168,2,0.35)] flex items-center justify-center gap-2"
                  >
                    <Icon name="LayoutDashboard" size={18} />
                    <span>{landingCopy.continueToDashboard}</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border border-red-500/20 text-red-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-500/10"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>{landingCopy.signOut}</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-[#FAA802] text-[#08080A] py-3 rounded-xl text-sm font-extrabold shadow-[0_0_20px_rgba(250, 168, 2,0.35)] mt-3"
                  >
                    {landingCopy.signUp}
                  </button>
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border border-black/10 dark:border-white/10 text-[#08080A] dark:text-white py-3 rounded-xl text-sm font-bold mt-2"
                  >
                    {landingCopy.signIn}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* Hero Section: Distributed, Creative, High-Impact             */}
      {/* ============================================================ */}
      <section id="home" className="relative z-10 min-h-[640px] lg:min-h-[760px] xl:min-h-[820px] flex items-center overflow-hidden bg-[#08080A]">
        {/* Full-Bleed Right-Aligned Cinematic Athlete Backdrop (Zero boxes, seamless organic blend) */}
        <div className={`absolute inset-y-0 ${isAr ? 'left-0' : 'right-0'} w-full lg:w-[68%] xl:w-[62%] pointer-events-none overflow-hidden z-0`}>
          <img 
            src="/assets/images/hero-athlete-elite.jpg" 
            alt="ATOSfit Elite Athlete" 
            className={`w-full h-full object-cover ${isAr ? 'scale-x-[-1] object-left' : 'object-right'}`}
            style={{
              filter: 'contrast(1.04) brightness(1.0)',
            }}
          />
          {/* Seamless Masterful Fade: dissolves left, top, and bottom into pure #08080A */}
          <div 
            className="absolute inset-0"
            style={{
              background: isAr
                ? `linear-gradient(to left, #08080A 0%, rgba(8,8,10,0.98) 12%, rgba(8,8,10,0.6) 42%, transparent 75%),
                   linear-gradient(to bottom, #08080A 0%, transparent 10%, transparent 80%, #08080A 100%),
                   linear-gradient(to top, #08080A 0%, transparent 15%)`
                : `linear-gradient(to right, #08080A 0%, rgba(8,8,10,0.98) 12%, rgba(8,8,10,0.6) 42%, transparent 75%),
                   linear-gradient(to bottom, #08080A 0%, transparent 10%, transparent 80%, #08080A 100%),
                   linear-gradient(to top, #08080A 0%, transparent 15%)`
            }}
          />
        </div>

        {/* Content Container (Positioned Over Seamless Dark Space) */}
        <div className="w-full max-w-[1840px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-xl xl:max-w-2xl space-y-6 sm:space-y-8">
            
            {/* Minimalist Editorial Eyebrow Tag */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.22em] text-[#FAA802] uppercase select-none">
              <span className="text-base font-black leading-none">▸</span>
              <span>{isAr ? "رؤية رياضية متقدمة للأداء البدني" : "TODAY'S MISSION"}</span>
            </div>

            {/* Bold High-Impact Pure White Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] 2xl:text-[76px] font-black tracking-tight leading-[1.08] text-[#0F1015] dark:text-white">
              <span className="block">
                {landingCopy.form}
              </span>
              <span className="block text-[#0F1015] dark:text-white">
                {landingCopy.results}
              </span>
            </h1>

            {/* Refined Muted Editorial Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-[#525866] dark:text-[#9DA4B2] leading-relaxed max-w-xl font-normal">
              {isAr 
                ? 'رصد فوري لزوايا المفاصل واستقامة الجسم وعد تلقائي للتكرارات عبر كاميرا هاتفك، لتجربة تدريب نخبوية تجمع بين أقصى فائدة عضلية والوقاية التامة من الإصابات.'
                : 'Good rhythm. Biomechanical form review, remaining mission to chase peak strength, posture calibration, and longevity.'}
            </p>

            {/* Authentic Pill Buttons (Exact Match to Tablet Reference Mockup) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {hasSession ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center bg-[#FAA802] hover:bg-[#FFAE00] text-[#08080A] font-bold px-8 py-3.5 rounded-full text-base transition-all shadow-[0_4px_20px_rgba(250,168,2,0.3)] hover:scale-105 active:scale-95"
                >
                  <span>{landingCopy.continueToDashboard}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center justify-center bg-[#FAA802] hover:bg-[#FFAE00] text-[#08080A] font-bold px-9 py-3.5 rounded-full text-base transition-all shadow-[0_4px_20px_rgba(250,168,2,0.3)] hover:scale-105 active:scale-95"
                  >
                    <span>{landingCopy.start}</span>
                  </button>

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center border border-black/20 dark:border-white/25 hover:border-[#FAA802] text-[#08080A] dark:text-white font-medium px-8 py-3.5 rounded-full text-base hover:bg-white/[0.05] transition-all"
                  >
                    <span>{isAr ? 'اكتشف المزيد' : 'Learn more'}</span>
                  </a>
                </>
              )}
            </div>

            {/* Live Trust & Telemetry Strip */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] max-w-xl">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl xl:text-3xl font-black text-[#0F1015] dark:text-white" dir="ltr">99.4%</span>
                <span className="text-xs sm:text-sm text-[#636779] dark:text-[#A8A8A8] font-medium">{landingCopy.accuracyStat}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl xl:text-3xl font-black text-[#0F1015] dark:text-white" dir="ltr">&lt; 20ms</span>
                <span className="text-xs sm:text-sm text-[#636779] dark:text-[#A8A8A8] font-medium">{landingCopy.latencyStat}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl xl:text-3xl font-black text-[#0F1015] dark:text-white" dir="ltr">100%</span>
                <span className="text-xs sm:text-sm text-[#636779] dark:text-[#A8A8A8] font-medium">{landingCopy.privacyStat}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* How It Works: 3 Simple Athletic Steps                       */}
      {/* ============================================================ */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-20 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAA802]/10 border border-[#FAA802]/25 text-xs font-bold text-[#FAA802] dark:text-[#FBB502] uppercase tracking-wider mb-4">
              {landingCopy.stepsTag}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F1015] dark:text-white mb-4">
              {landingCopy.stepsTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#636779] dark:text-[#9DA4B2] leading-relaxed">
              {landingCopy.stepsSubtitle}
            </p>
          </div>

          {/* 3 Steps Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {landingCopy.steps.map((step, idx) => (
              <div 
                key={idx}
                className="relative rounded-[28px] p-8 bg-white dark:bg-[#141416]/85 border border-black/10 dark:border-white/10 shadow-lg hover:border-[#FAA802]/40 hover:shadow-[0_0_35px_rgba(250, 168, 2,0.15)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] group-hover:scale-110 transition-transform">
                    <Icon name={step.icon} size={26} />
                  </div>
                  <span className="text-3xl font-black text-black/15 dark:text-white/10 group-hover:text-[#FAA802]/30 transition-colors" dir="ltr">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F1015] dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Supported Exercises & Biomechanics Showcase                 */}
      {/* ============================================================ */}
      <section id="exercises" className="relative z-10 py-16 sm:py-20 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAA802]/10 border border-[#FAA802]/25 text-xs font-bold text-[#FAA802] dark:text-[#FBB502] uppercase tracking-wider mb-4">
              {landingCopy.supportedTag}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F1015] dark:text-white mb-4">
              {landingCopy.supportedTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#636779] dark:text-[#9DA4B2] leading-relaxed">
              {landingCopy.supportedSubtitle}
            </p>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {landingCopy.exercises.map((ex, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#141416]/85 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#FAA802]/50 hover:shadow-[0_0_25px_rgba(250, 168, 2,0.15)] hover:scale-[1.02] transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[11px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    {ex.badge}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#0F1015] dark:text-white group-hover:text-[#FAA802] dark:group-hover:text-[#FAA802] transition-colors">
                    {ex.name}
                  </h4>
                </div>
                <div className="mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#636779] dark:text-[#A8A8A8]">
                  {ex.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Privacy Architecture Section (3 Pillars)                      */}
      {/* ============================================================ */}
      <section id="privacy" className="relative z-10 py-16 sm:py-24 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
        
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAA802]/10 border border-[#FAA802]/25 text-xs font-bold text-[#FAA802] dark:text-[#FBB502] uppercase tracking-wider mb-4">
              {landingCopy.privacyTag}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F1015] dark:text-white mb-4">
              {landingCopy.privacyTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#636779] dark:text-[#9DA4B2] leading-relaxed">
              {landingCopy.privacySubtitle}
            </p>
          </div>

          {/* 3 Privacy Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {privacyCards.map((card, idx) => (
              <div 
                key={idx}
                className="rounded-[28px] p-8 bg-white dark:bg-[#141416]/80 border border-black/10 dark:border-white/10 shadow-lg hover:border-[#FAA802]/50 hover:shadow-[0_0_45px_rgba(250, 168, 2,0.16)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] mb-6 shadow-[0_0_20px_rgba(250, 168, 2,0.2)] group-hover:scale-110 transition-transform">
                    <Icon name={card.icon} size={28} />
                  </div>
                  <span className="text-[11px] font-bold text-[#B8860B] dark:text-[#FAA802] uppercase tracking-wider block mb-2">
                    {card.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F1015] dark:text-white mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed mb-6">
                    {card.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
                  {card.checks.map((check, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Icon name="Check" size={12} strokeWidth={3} />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#525866] dark:text-[#A0A5B1]">
                        {check}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Transparency CTA Banner */}
          <div className="mt-16 sm:mt-20">
            <div className="rounded-[32px] p-8 sm:p-12 bg-gradient-to-r from-[#FAA802]/10 via-[#FAA802]/5 to-transparent border border-[#FAA802]/30 backdrop-blur-xl max-w-4xl mx-auto text-center space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0F1015] dark:text-white">
                {isAr ? 'شفافية وأمان لا مثيل لهما' : 'Complete Privacy Transparency'}
              </h3>
              <p className="text-sm sm:text-base text-[#525866] dark:text-[#A8A8A8] max-w-2xl mx-auto leading-relaxed">
                {isAr 
                  ? 'اطّلع على كيفية معالجة خوارزميات الذكاء الاصطناعي لحركاتك محلياً دون تخزين أو نقل أي بيانات حساسة.'
                  : 'Learn how our on-device MediaPipe models compute your pose kinematics without ever recording or transmitting video.'}
              </p>
              <button
                onClick={() => navigate('/privacy')}
                className="inline-flex items-center justify-center gap-2 bg-[#FAA802] hover:bg-[#FBB502] text-[#08080A] px-8 py-3.5 rounded-full text-sm font-extrabold shadow-[0_0_25px_rgba(250, 168, 2,0.4)] transition-all"
              >
                <span>{landingCopy.readPrivacy}</span>
                <Icon name="ArrowRight" size={16} className={isAr ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>

        </div>
      </section>



      {/* ============================================================ */}
      {/* Footer                                                        */}
      {/* ============================================================ */}
      <footer className="relative z-10 px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24 py-12 border-t border-black/[0.08] dark:border-white/[0.06] bg-white/50 dark:bg-[#030408]/80 text-[#636779] dark:text-[#A8A8A8] backdrop-blur-md">
        <div className="max-w-[1720px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-10 h-10 object-contain drop-shadow-[0_2px_12px_rgba(250,168,2,0.35)]" />
              <div className="flex items-baseline gap-1" dir="ltr">
                <span className="text-xl font-bold text-[#0F1015] dark:text-white">ATOS</span>
                <span className="text-xl font-bold bg-gradient-to-r from-[#FAA802] to-[#FFAE00] bg-clip-text text-transparent">fit</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm">
              <a href="#home" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.home}</a>
              <a href="#how-it-works" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.howItWorksNav}</a>
              <a href="#exercises" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.exercisesNav}</a>
              <a href="#privacy" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.privacy}</a>
              <button onClick={() => navigate('/pricing')} className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.pricing}</button>
              <button onClick={() => navigate('/about')} className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.about}</button>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-[#636779] dark:text-[#A8A8A8]">
              <a
                href="https://www.linkedin.com/company/atos-fit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FAA802] transition-colors p-1"
                aria-label="LinkedIn"
              >
                <Icon name="Linkedin" size={20} />
              </a>
              <a
                href="https://twitter.com/AtosFit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FAA802] transition-colors p-1"
                aria-label="Twitter/X"
              >
                <Icon name="Twitter" size={20} />
              </a>
              <a
                href="https://www.producthunt.com/posts/atos-fit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FAA802] transition-colors p-1"
                aria-label="Product Hunt"
              >
                <Icon name="ExternalLink" size={20} />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-black/[0.05] dark:border-white/[0.04] text-center text-xs text-[#8A8F98]">
            {landingCopy.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
