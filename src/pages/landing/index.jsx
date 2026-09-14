import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import InteractiveImage from '../../components/InteractiveImage';
import { useLanguage } from '../../contexts/LanguageContext';
import { applyTheme, getSavedTheme } from '../../utils/theme';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
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
    howItWorksNav: 'كيف يعمل',
    features: 'المميزات',
    pricing: 'الأسعار',
    privacy: 'الخصوصية',
    about: 'من نحن',
    signIn: 'تسجيل الدخول',
    signingIn: 'جار تسجيل الدخول...',
    start: 'ابدأ تمرينك المجاني',
    starting: 'جار البدء...',
    badge: '⚡ الجيل القادم للياقة والرؤية الحاسوبية',
    form: 'أداء حركي متقن.',
    results: 'نتائج رياضية غير مسبوقة.',
    intro: 'يحوّل كاميرا هاتفك إلى مدرب شخصي فائق الدقة. خوارزميات الرؤية الحاسوبية تحلل زوايا مفاصلك واستقامة عمودك الفقري لحظياً وتعد تكراراتك بدقة متناهية — بخصوصية كاملة 100% دون خروج أي فيديو من هاتفك.',
    howItWorks: 'كيف يعمل التطبيق',
    categories: [
      { icon: '🏋️', label: 'تمارين الحديد والقوة' },
      { icon: '🤸', label: 'كاليسثينكس ووزن الجسم' },
      { icon: '🔥', label: 'حرق الدهون وHIIT' },
      { icon: '🧘', label: 'المرونة وتصحيح القوام' },
    ],
    accuracyStat: 'دقة التحليل الحركي',
    latencyStat: 'زمن التوجيه الصوتي',
    privacyStat: 'معالجة محلية بالكامل',
    stepsTag: '⚡ ٣ خطوات للبدء',
    stepsTitle: 'كيف تبدأ تمرينك مع ATOS fit؟',
    stepsSubtitle: 'بدون أي ساعات ذكية، حساسات معقدة، أو تكاليف تدريب باهظة. هاتفك فقط يكفي لبدء التمرين الذكي.',
    steps: [
      {
        num: '01',
        icon: 'Smartphone',
        title: 'اسند هاتفك أمامك',
        desc: 'ضع هاتفك على الأرض أو مسنوداً على زجاجة ماء أمام مساحة تمرينك، وتأكد من ظهور جسمك في الكاميرا.',
      },
      {
        num: '02',
        icon: 'Activity',
        title: 'تدرّب بتوجيه ذكي لحظي',
        desc: 'تتبع 33 نقطة مفصلية بسرعة 60 إطاراً بالثانية لمراقبة عمق السكوات، استقامة الظهر، وتفادي الإصابات الشائعة.',
      },
      {
        num: '03',
        icon: 'Trophy',
        title: 'إرشادات صوتية وعدّ آلي',
        desc: 'استمع لتوجيهات فورية ("ارفع صدرك"، "ادفع بكعبيك") مع تسجيل آلي كامل لعدد التكرارات، الجولات، والسعرات.',
      }
    ],
    featuresTag: '⚡ ترسانة الرياضي المتكاملة',
    featuresTitle: 'تكنولوجيا متطورة لأداء رياضي احترافي',
    featuresSubtitle: 'صُممت خوارزمياتنا لمساعدتك على كسر أرقامك القياسية وبناء عضلاتك بأمان تام وحركة بيوميكانيكية صحيحة.',
    supportedTag: '💪 تمارين مدعومة لحظياً',
    supportedTitle: 'أكثر من 50 تمريناً تُتبع بدقة متناهية',
    supportedSubtitle: 'يقوم الذكاء الاصطناعي بالتحقق من اكتمال المدى الحركي (Full ROM) لضمان تحقيق أقصى فائدة عضلية.',
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
    privacyTag: '🔒 بنية الخصوصية والأمان',
    privacyTitle: 'جسمك وبياناتك ملكك وحدك دون أي تسريب',
    privacySubtitle: 'تتم معالجة الفيديو بالكامل داخل معالج هاتفك العصبي. لا يتم تسجيل أو رفع أي لقطة تمرين للسيرفرات إطلاقاً.',
    ctaTag: '🚀 ارتقِ بمستوى لياقتك',
    ctaTitle: 'جاهز لتجاوز أرقامك القياسية؟',
    ctaSubtitle: 'ابدأ تمرينك اليوم مجاناً بدون أي بطاقة بنكية. طوّر أداءك الحركي وتدرب بأحدث تقنيات الرياضة العالمية.',
    ctaButton: 'ابدأ تمرينك المجاني الآن',
    readPrivacy: 'اقرأ وثيقة الخصوصية بالكامل',
    copyright: '© 2026 ATOS fit. جميع الحقوق محفوظة.',
  } : {
    home: 'Home',
    howItWorksNav: 'How It Works',
    features: 'Features',
    pricing: 'Pricing',
    privacy: 'Privacy',
    about: 'About Us',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    start: 'Start Free Workout',
    starting: 'Starting...',
    badge: '⚡ NEXT-GEN COMPUTER VISION FITNESS',
    form: 'PERFECT FORM.',
    results: 'MAX RESULTS.',
    intro: 'transforms your smartphone into an elite biomechanics personal trainer. Neural vision tracks your joint angles at 60 FPS, prevents injuries before they happen, and counts reps automatically — with 100% on-device privacy.',
    howItWorks: 'How It Works',
    categories: [
      { icon: '🏋️', label: 'Strength & Gym' },
      { icon: '🤸', label: 'Calisthenics' },
      { icon: '🔥', label: 'HIIT & Burn' },
      { icon: '🧘', label: 'Mobility & Posture' },
    ],
    accuracyStat: 'Biomechanical Accuracy',
    latencyStat: 'Real-Time Audio Guidance',
    privacyStat: 'Zero Video Uploads',
    stepsTag: '⚡ 3 SIMPLE STEPS',
    stepsTitle: 'How ATOS fit Powers Your Workout',
    stepsSubtitle: 'No wearables, no smart watches, no gym appointments. Just you and your smartphone.',
    steps: [
      {
        num: '01',
        icon: 'Smartphone',
        title: 'Prop Your Phone',
        desc: 'Place your phone against a water bottle or wall facing your workout space. Make sure your full body is visible.',
      },
      {
        num: '02',
        icon: 'Activity',
        title: 'Move with Real-Time AI',
        desc: 'Our neural vision tracks 33 3D skeletal landmarks at 60 FPS, checking joint flexion, lumbar neutral, and movement path.',
      },
      {
        num: '03',
        icon: 'Trophy',
        title: 'Instant Audio Cues & Gains',
        desc: 'Hear instant voice coaching ("Drive through heels", "Chest up") while reps, sets, tempo, and calories log automatically.',
      }
    ],
    featuresTag: '⚡ THE ATHLETE\'S ARSENAL',
    featuresTitle: 'Engineered for Serious Lifters & Athletes',
    featuresSubtitle: 'From injury prevention to automated cadence analysis, experience the world\'s most advanced fitness computer vision.',
    supportedTag: '💪 REAL-TIME MOVEMENTS',
    supportedTitle: '50+ Supported Exercises Tracked Live',
    supportedSubtitle: 'Our neural engine verifies full range of motion (ROM) and prevents shallow or cheated repetitions.',
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
    privacyTag: '🔒 PRIVACY-FIRST ARCHITECTURE',
    privacyTitle: 'Your Body & Workout Data Stay Yours',
    privacySubtitle: 'Your camera feed is processed strictly inside your device neural processor. Zero video frames are ever recorded or uploaded.',
    ctaTag: '🚀 ELEVATE YOUR PERFORMANCE',
    ctaTitle: 'Ready to Crush Your Personal Best?',
    ctaSubtitle: 'Start training with real-time AI biomechanics today. Completely free, no credit card required.',
    ctaButton: 'Start Your Free Workout Now',
    readPrivacy: 'Read Our Privacy Policy',
    copyright: '© 2026 ATOS fit. All rights reserved.',
  };

  const featureWidgets = [
    {
      id: "real_time_feedback",
      tag: isAr ? 'رؤية بيوميكانيكية فائقة' : 'BIOMECHANICS VISION',
      heading: isAr ? 'تصحيح لحظي للهيئة ومنع الإصابات' : 'Real-Time Form Correction & Injury Prevention',
      body: isAr 
        ? 'تحليل مباشر لـ 33 نقطة مفصلية وإرشادات صوتية ومرئية فورية تدفعك للأداء المثالي وتمنع إصابات المفاصل والعمود الفقري.'
        : 'Live 33-point skeletal landmark tracking with millisecond audio cues that correct your posture before bad form causes injury.',
      video: "/schools-header-vp9-chrome-1.webm",
      className: "lg:col-span-12 xl:col-span-6 row-span-2 min-h-[420px]",
      badgeText: isAr ? 'تحليل 33 نقطة حركية • 60 إطار/ث' : '33 Skeletal Keypoints • 60 FPS',
    },
    {
      id: "ai_coach",
      tag: isAr ? 'مدرب اللياقة الذكي' : 'CONVERSATIONAL COACH',
      heading: isAr ? 'مدرب القوة والتغذية المخصص' : 'Personal AI Strength & Nutrition Coach',
      body: isAr
        ? 'اسأل مدربك الذكي عن خطط التمارين، التغذية، فترات الاستشفاء، وتطبيق الحمل الدوري (Progressive Overload).'
        : 'Ask anything fitness-related: personalized training splits, progressive overload, recovery scores, and meal timing.',
      iconName: "Bot",
      accent: "indigo",
      className: "lg:col-span-6 xl:col-span-6",
      interactivePreview: isAr
        ? '💡 "حافظ على استقامة العمود الفقري وادفع بكعبيك أثناء الصعود من السكوات"'
        : '💡 "Maintain lumbar neutral and drive through heels on squat ascent"',
    },
    {
      id: "food_scanner",
      tag: isAr ? 'تحليل ذكي للوجبات' : 'SMART NUTRITION VISION',
      heading: isAr ? 'الماسح الضوئي الذكي للماكروز' : 'Smart Food & Macro Scanner',
      body: isAr
        ? 'وجّه كاميرا هاتفك للوجبة وتعرّف فوراً على السعرات والماكروز (بروتين، كارب، دهون) لضمان تحقيق هدفك البدني.'
        : 'Snap your plate to instantly log calories, protein, carbs, and fats to hit your muscle-building or fat-loss targets.',
      iconName: "Scan",
      accent: "amber",
      className: "lg:col-span-6 xl:col-span-6",
      interactivePreview: isAr
        ? '🥗 صدر دجاج مشوي مع أرز • 38g بروتين • 340 سعرة'
        : '🥗 Grilled Chicken & Rice • 38g Protein • 340 kcal',
    },
    {
      id: "rep_counting",
      tag: isAr ? 'خوارزمية العد الآلي' : 'PRECISION CADENCE',
      heading: isAr ? 'العد الآلي الذكي للتكرارات والإيقاع' : 'Automated Rep Counting & Cadence Engine',
      body: isAr
        ? 'ركّز كامل طاقتك على الأداء العضلي؛ الذكاء الاصطناعي يحسب كل تكرار، سرعة النزول والصعود، ويضمن عمق الحركة الكامل.'
        : 'Focus 100% on the mind-muscle burn. Our neural engine tracks every rep, tempo, and validates full range of motion.',
      image: "/Gemini_Generated_Image_5ysnl85ysnl85ysn.png",
      className: "lg:col-span-12 xl:col-span-12 row-span-1 min-h-[320px]",
      badgeText: isAr ? 'تحليل المدى الحركي والإيقاع' : 'Full Range of Motion & Tempo',
    }
  ];

  const privacyCards = [
    {
      icon: "Cpu",
      tag: isAr ? 'أمان طرفي كامل' : 'EDGE COMPUTING',
      title: isAr ? 'المعالجة المحلية بالذكاء الاصطناعي' : 'Local AI Processing',
      desc: isAr
        ? 'تُعالج فيديوهات تمارينك بالكامل داخل معالج هاتفك باستخدام MediaPipe دون إرسال أي صورة أو فيديو للسيرفرات.'
        : 'Your workout camera feed is processed entirely on your device using MediaPipe neural models. No video ever leaves your phone.',
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
      tag: isAr ? 'هوية مشفرة' : 'CRYPTOGRAPHIC IDENTITY',
      title: isAr ? 'تسجيل دخول مجهول وآمن' : 'Anonymous Authentication',
      desc: isAr
        ? 'سجّل دخولك دون إيميل أو أرقام هواتف عبر تقنية Internet Identity المشفرة للحفاظ على سرية هويتك التامة.'
        : 'Internet Identity provides cryptographically secure, anonymous login without emails or personal phone numbers.',
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
      tag: isAr ? 'لامركزية تامة' : 'DECENTRALIZED',
      title: isAr ? 'تخزين مشفر لا مركزي' : 'Decentralized Storage',
      desc: isAr
        ? 'تُحفظ سجلاتك الرياضية على بلوكتشين Internet Computer، مما يجعلها مقاومة للتلاعب وتحت سيطرتك فقط.'
        : 'Your progress history is stored on the Internet Computer blockchain, making it tamper-proof and accessible only by you.',
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

  const handleGetStarted = async () => {
    try {
      await login();
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.name && user.email) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (e) {
      navigate('/login-screen');
    }
  };

  const handleLogin = async () => {
    try {
      await login();
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.name && user.email) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (e) {
      navigate('/login-screen');
    }
  };

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F7F8FA] dark:bg-[#08080A] text-[#08080A] dark:text-[#FFFFFF] font-sans relative overflow-x-hidden selection:bg-[#FAA802]/30 selection:text-white transition-colors duration-300"
    >
      {/* ============================================================ */}
      {/* Atmospheric Violet/Electric Indigo Background Glows System   */}
      {/* ============================================================ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary Top-Center Atmospheric Violet Light Pool (Dashboard Theme) */}
        <div 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] sm:w-[1300px] h-[650px] dark:opacity-100 opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 75% 60% at 50% 0%, rgba(250, 168, 2, 0.22) 0%, rgba(192, 192, 192, 0.08) 45%, rgba(250, 168, 2, 0.02) 70%, transparent 90%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Secondary Right Ambient Glow */}
        <div 
          className="absolute top-[20%] -right-[10%] w-[750px] h-[750px] dark:opacity-75 opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(250, 168, 2, 0.12) 0%, rgba(192, 192, 192, 0.05) 50%, transparent 75%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Subtle Solar Amber Accent Glow from Dashboard palette */}
        <div 
          className="absolute top-[18%] right-[12%] w-[400px] h-[400px] dark:opacity-70 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(250, 168, 2, 0.08) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Mid-page Features Violet Glow */}
        <div 
          className="absolute top-[52%] -left-[10%] w-[750px] h-[750px] dark:opacity-70 opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(250, 168, 2, 0.10) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Bottom CTA Glow */}
        <div 
          className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] dark:opacity-85 opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(250, 168, 2, 0.18) 0%, rgba(192, 192, 192, 0.06) 60%, transparent 80%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Subtle Tech Precision Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(250, 168, 2, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(250, 168, 2, 0.15) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 85%)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* Navigation Header                                            */}
      {/* ============================================================ */}
      <nav className="relative z-50 px-6 sm:px-8 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-[#08080A]/85 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center">
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-11 h-11 object-contain drop-shadow-[0_4px_16px_rgba(79,70,229,0.35)] group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex items-baseline gap-1.5" dir="ltr">
              <span className="text-2xl font-black text-[#0F1015] dark:text-white tracking-tight">ATOS</span>
              <span className="text-2xl font-black bg-gradient-to-r from-[#FAA802] via-[#FFAE00] to-[#E5E7EB] bg-clip-text text-transparent tracking-tight">fit</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a href="#home" className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.home}</a>
            <a href="#how-it-works" className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.howItWorksNav}</a>
            <a href="#features" className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.features}</a>
            <a href="#privacy" className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.privacy}</a>
            <button onClick={() => navigate('/pricing')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.pricing}</button>
            <button onClick={() => navigate('/about')} className="text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium transition-colors text-sm">{landingCopy.about}</button>
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
            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#FAA802] to-[#FB9202] hover:from-[#FBB502] hover:to-[#FAA802] text-[#08080A] px-6 py-2.5 rounded-full text-sm font-extrabold shadow-[0_0_20px_rgba(250, 168, 2,0.35)] hover:shadow-[0_0_25px_rgba(250, 168, 2,0.5)] transition-all"
            >
              {authLoading ? landingCopy.signingIn : landingCopy.signIn}
            </button>
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
                href="#features"
                className="block text-[#636779] dark:text-[#A8A8A8] hover:text-[#0F1015] dark:hover:text-white font-medium text-sm py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {landingCopy.features}
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
              <button
                onClick={() => {
                  handleLogin();
                  setIsMobileMenuOpen(false);
                }}
                disabled={authLoading}
                className="w-full bg-[#FAA802] text-[#08080A] py-3 rounded-xl text-sm font-extrabold shadow-[0_0_20px_rgba(250, 168, 2,0.35)] mt-4"
              >
                {authLoading ? landingCopy.signingIn : landingCopy.signIn}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* Hero Section: Distributed, Creative, High-Impact             */}
      {/* ============================================================ */}
      <section id="home" className="relative z-10 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-20">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-14 items-center">
            {/* Left Column: Vision, Headline, Actions (Spans 6 cols, no center cramp) */}
            <div className={`lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              
              {/* Pulsing Athletic Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FAA802]/10 dark:bg-[#FAA802]/15 border border-[#FAA802]/25 dark:border-[#FAA802]/30 backdrop-blur-md shadow-[0_0_20px_rgba(250, 168, 2,0.15)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FAA802] animate-pulse shadow-[0_0_10px_#FAA802]"></span>
                <span className="text-xs sm:text-sm font-bold text-[#B8860B] dark:text-[#FAA802] tracking-wider uppercase">
                  {landingCopy.badge}
                </span>
              </div>

              {/* Bold Futuristic Typographic Headline with Athletic Accent */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08]">
                <span className="block text-[#0F1015] dark:text-white">
                  {landingCopy.form}
                </span>
                <span className="block bg-gradient-to-r from-[#FAA802] via-[#FFAE00] to-[#E5E7EB] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(250, 168, 2,0.3)]">
                  {landingCopy.results}
                </span>
              </h1>

              {/* Rich Value Proposition Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-[#525866] dark:text-[#9DA4B2] leading-relaxed max-w-xl">
                <span className="text-[#0F1015] dark:text-white font-bold">ATOS fit</span> {landingCopy.intro}
              </p>

              {/* Athletic Training Disciplines Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                {landingCopy.categories.map((cat, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#525866] dark:text-[#A0A5B5] hover:border-[#FAA802]/40 transition-colors"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                ))}
              </div>

              {/* Action Buttons Cluster */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  disabled={authLoading}
                  className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#FAA802] via-[#FB9202] to-[#E6B800] hover:from-[#E6B800] hover:to-[#FAA802] text-[#08080A] font-black px-8 py-4 rounded-2xl text-base sm:text-lg transition-all duration-300 shadow-[0_0_35px_rgba(250, 168, 2,0.45)] hover:shadow-[0_0_50px_rgba(250, 168, 2,0.65)] hover:scale-[1.02] active:scale-[0.98] border border-[#FAA802]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{authLoading ? landingCopy.starting : landingCopy.start}</span>
                  <Icon 
                    name="ArrowRight" 
                    size={20} 
                    className={isAr ? 'rotate-180 group-hover:-translate-x-1 transition-transform' : 'group-hover:translate-x-1 transition-transform'} 
                  />
                </button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-semibold border border-black/10 dark:border-white/10 hover:border-[#FAA802]/50 text-[#08080A] dark:text-[#FFFFFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all"
                >
                  <Icon name="Compass" size={18} className="text-[#FAA802]" />
                  <span>{landingCopy.howItWorks}</span>
                </a>
              </div>

              {/* Live Trust & Telemetry Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] max-w-xl">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-[#0F1015] dark:text-white" dir="ltr">99.4%</span>
                  <span className="text-xs text-[#636779] dark:text-[#A8A8A8] font-medium">{landingCopy.accuracyStat}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-[#0F1015] dark:text-white" dir="ltr">&lt; 20ms</span>
                  <span className="text-xs text-[#636779] dark:text-[#A8A8A8] font-medium">{landingCopy.latencyStat}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-[#0F1015] dark:text-white" dir="ltr">100%</span>
                  <span className="text-xs text-[#636779] dark:text-[#A8A8A8] font-medium">{landingCopy.privacyStat}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Phone Mockup with Floating Micro-Widgets (Spans 6 cols) */}
            <div className="lg:col-span-6 xl:col-span-6 relative w-full flex items-center justify-center">
              <InteractiveImage />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* How It Works: 3 Simple Athletic Steps                       */}
      {/* ============================================================ */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-20 border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-xs font-bold text-[#FF7A00] uppercase tracking-wider mb-4">
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
      {/* Features Bento Grid Section                                   */}
      {/* ============================================================ */}
      <section id="features" className="relative z-10 py-16 sm:py-24">
        {/* Ambient Violet Atmospheric Glow behind Bento Grid (Dashboard Style) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[650px] dark:opacity-80 opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(250, 168, 2, 0.22) 0%, rgba(94, 75, 255, 0.08) 50%, transparent 75%)',
            filter: 'blur(75px)',
          }}
        />
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAA802]/10 dark:bg-[#FAA802]/15 border border-[#FAA802]/25 text-xs font-bold text-[#FAA802] dark:text-[#FBB502] uppercase tracking-wider mb-4">
              {landingCopy.featuresTag}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F1015] dark:text-white mb-4">
              {landingCopy.featuresTitle}
            </h2>
            <p className="text-base sm:text-lg text-[#636779] dark:text-[#9DA4B2] leading-relaxed">
              {landingCopy.featuresSubtitle}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Widget 1: Real-Time Feedback Video Card (Large 6 cols / 2 rows) */}
            <div className="lg:col-span-12 xl:col-span-6 relative rounded-[28px] overflow-hidden bg-[#0C0E17] border border-black/10 dark:border-white/10 shadow-lg hover:border-[#FAA802]/50 hover:shadow-[0_0_45px_rgba(250, 168, 2,0.2)] transition-all duration-300 min-h-[440px] flex flex-col justify-end group">
              <video
                src={featureWidgets[0].video}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060D] via-[#05060D]/60 to-transparent" />
              
              <div className="relative z-10 p-6 sm:p-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAA802]/20 border border-[#FAA802]/40 text-xs font-bold text-[#FAA802]">
                  <Icon name="Activity" size={14} />
                  <span>{featureWidgets[0].tag}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {featureWidgets[0].heading}
                </h3>
                <p className="text-sm sm:text-base text-[#C2C7D0] leading-relaxed max-w-xl">
                  {featureWidgets[0].body}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{featureWidgets[0].badgeText}</span>
                </div>
              </div>
            </div>

            {/* Right Column Stack (AI Coach + Food Scanner) */}
            <div className="lg:col-span-12 xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Widget 2: AI Coach Card */}
              <div className="rounded-[28px] p-6 sm:p-8 bg-white dark:bg-[#0C0E17]/85 border border-black/10 dark:border-white/10 shadow-lg hover:border-[#FAA802]/50 hover:shadow-[0_0_40px_rgba(250, 168, 2,0.18)] transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] shadow-[0_0_20px_rgba(250, 168, 2,0.25)] group-hover:scale-110 transition-transform">
                      <Icon name="Bot" size={24} />
                    </div>
                    <span className="text-[11px] font-bold text-[#FAA802] dark:text-[#FBB502] uppercase tracking-wider bg-[#FAA802]/10 px-2.5 py-1 rounded-full">
                      {featureWidgets[1].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F1015] dark:text-white">
                    {featureWidgets[1].heading}
                  </h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
                    {featureWidgets[1].body}
                  </p>
                </div>

                <div className="mt-6 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#FAA802] dark:text-[#A5B4FC]">
                  {featureWidgets[1].interactivePreview}
                </div>
              </div>

              {/* Widget 3: Food Scanner Card */}
              <div className="rounded-[28px] p-6 sm:p-8 bg-white dark:bg-[#0C0E17]/85 border border-black/10 dark:border-white/10 shadow-lg hover:border-[#FFAE00]/50 hover:shadow-[0_0_40px_rgba(255,174,0,0.18)] transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFAE00]/15 border border-[#FFAE00]/30 flex items-center justify-center text-[#FFAE00] shadow-[0_0_20px_rgba(255,174,0,0.25)] group-hover:scale-110 transition-transform">
                      <Icon name="Scan" size={24} />
                    </div>
                    <span className="text-[11px] font-bold text-[#FFAE00] uppercase tracking-wider bg-[#FFAE00]/10 px-2.5 py-1 rounded-full">
                      {featureWidgets[2].tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0F1015] dark:text-white">
                    {featureWidgets[2].heading}
                  </h3>
                  <p className="text-sm text-[#525866] dark:text-[#A8A8A8] leading-relaxed">
                    {featureWidgets[2].body}
                  </p>
                </div>

                <div className="mt-6 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-xs font-medium text-[#FFAE00]">
                  {featureWidgets[2].interactivePreview}
                </div>
              </div>
            </div>

            {/* Widget 4: Rep Counting Card (Full-width spanning banner with precision mockup image) */}
            <div className="lg:col-span-12 relative rounded-[28px] overflow-hidden bg-[#0C0E17] border border-black/10 dark:border-white/10 shadow-lg hover:border-[#FAA802]/50 transition-all duration-300 flex flex-col md:flex-row items-center justify-between group min-h-[300px]">
              <div className="relative z-10 p-6 sm:p-10 md:max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAA802]/20 border border-[#FAA802]/40 text-xs font-bold text-[#FAA802]">
                  <Icon name="Target" size={14} />
                  <span>{featureWidgets[3].tag}</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                  {featureWidgets[3].heading}
                </h3>
                <p className="text-sm sm:text-base text-[#C2C7D0] leading-relaxed">
                  {featureWidgets[3].body}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{featureWidgets[3].badgeText}</span>
                  </div>
                </div>
              </div>

              {/* Visual image preview with dark gradient blend */}
              <div className="relative w-full md:w-1/2 h-[260px] md:h-full flex items-center justify-center p-4">
                <img 
                  src={featureWidgets[3].image} 
                  alt={featureWidgets[3].heading} 
                  className="max-h-[260px] w-auto object-contain rounded-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#0C0E17] via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Supported Exercises & Biomechanics Showcase                 */}
      {/* ============================================================ */}
      <section className="relative z-10 py-16 sm:py-20 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-4">
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
        {/* Ambient Violet Atmospheric Glow behind Privacy Section */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[950px] h-[500px] dark:opacity-70 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(79, 70, 229, 0.18) 0%, rgba(255, 122, 0, 0.05) 45%, transparent 70%)',
            filter: 'blur(75px)',
          }}
        />
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-4">
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
      <footer className="relative z-10 px-6 sm:px-8 py-12 border-t border-black/[0.08] dark:border-white/[0.06] bg-white/50 dark:bg-[#030408]/80 text-[#636779] dark:text-[#A8A8A8] backdrop-blur-md">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-10 h-10 object-contain drop-shadow-[0_2px_12px_rgba(79,70,229,0.35)]" />
              <div className="flex items-baseline gap-1" dir="ltr">
                <span className="text-xl font-bold text-[#0F1015] dark:text-white">ATOS</span>
                <span className="text-xl font-bold bg-gradient-to-r from-[#FAA802] to-[#FFAE00] bg-clip-text text-transparent">fit</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm">
              <a href="#home" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.home}</a>
              <a href="#how-it-works" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.howItWorksNav}</a>
              <a href="#features" className="hover:text-[#0F1015] dark:hover:text-white transition-colors">{landingCopy.features}</a>
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
