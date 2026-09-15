import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { updateUserProfile } from '../../utils/db';
import { calculateMetabolicTargets, calculateBMI, calculateBMR, calculateTDEE } from '../../utils/metabolism';
import { generateMonthlyMesocycle, saveUserTrainingPlan, determineSplitStrategy } from '../../utils/trainingPlanEngine';
import { saveCloudUserProfile } from '../../utils/cloudSync';
import fullBodyImg from './full body.png';
import shouldersImg from './shoulders.png';
import bicepsImg from './biceps.png';
import backImg from './back.png';
import chestImg from './chest.png';
import coreImg from './core.png';
import glutesImg from './glutes.png';
import legsImg from './legs.png';
import veryThinImg from './رفيع.webp';
import slightlyThinImg from './زياده بسيطه.webp';
import normalImg from './معتدل.webp';
import overweightImg from './وزن زائد.webp';
import fatImg from './سمين.webp';
import highObesityImg from './سمنه عاليه.webp';
import extremeObesityImg from './سمنه مفرطه.webp';

const totalSteps = 11;

const stepMeta = [
  { label: 'Profile', labelAr: 'الملف الشخصي', eyebrow: 'Identity', eyebrowAr: 'الهوية', title: 'Build your training profile', titleAr: 'أنشئ ملفك التدريبي', description: 'Start with the basics so ATOS-fit can shape a plan around you.', descriptionAr: 'ابدأ بالبيانات الأساسية ليقوم النظام الذكي بتخصيص خطتك.', icon: 'Sparkles' },
  { label: 'Identity', labelAr: 'النوع', eyebrow: 'Personalization', eyebrowAr: 'التخصيص', title: 'Choose the profile that fits you', titleAr: 'اختر ملفك الشخصي', description: 'This helps tune visuals, language, and recommendations during setup.', descriptionAr: 'يساعدنا في ضبط التوصيات والمعايير المناسبة لك.', icon: 'Users' },
  { label: 'Weight', labelAr: 'الوزن الحالي', eyebrow: 'Baseline', eyebrowAr: 'القياس الأولي', title: 'Set your current body weight', titleAr: 'حدد وزنك الحالي', description: 'We use this as the first marker in your transformation dashboard.', descriptionAr: 'نقطة الانطلاق الأولى لحساب كتلة الجسم ومعدل الحرق.', icon: 'Scale' },
  { label: 'Physique', labelAr: 'الهدف الجسدي', eyebrow: 'Goal shape', eyebrowAr: 'الشكل المستهدف', title: 'Pick the physique direction', titleAr: 'اختر شكل الجسم المطلوب', description: 'Choose the destination that best matches how you want to train.', descriptionAr: 'حدد الهدف الذي ترغب في الوصول إليه (رشيق، عضلي، مقسم).', icon: 'Target' },
  { label: 'Focus', labelAr: 'التركيز العضلي', eyebrow: 'Training emphasis', eyebrowAr: 'أولويات التمرين', title: 'Select your priority areas', titleAr: 'اختر العضلات المستهدفة', description: 'Choose one or more areas so your workouts feel immediately relevant.', descriptionAr: 'اختر منطقة أو أكثر للتركيز عليها في التمارين.', icon: 'ScanLine' },
  { label: 'Metrics', labelAr: 'القياسات الحيوية', eyebrow: 'Measurements', eyebrowAr: 'القياسات', title: 'Calibrate your body metrics', titleAr: 'اضبط قياساتك الحيوية', description: 'These details help balance intensity, volume, and progression.', descriptionAr: 'الطول والسن والوزن المستهدف لتحديد السعرات بدقة علمية.', icon: 'Ruler' },
  { label: 'Schedule', labelAr: 'المواعيد', eyebrow: 'Routine design', eyebrowAr: 'الجدول الزمني', title: 'Choose your training window', titleAr: 'اختر وقت التمرين المفضل', description: 'The best plan is the one that fits your real day.', descriptionAr: 'أفضل تمرين هو ما يتناسب مع روتين يومك الحقيقي.', icon: 'Clock3' },
  { label: 'Level & Activity', labelAr: 'النشاط والمستوى', eyebrow: 'Metabolic Calibration', eyebrowAr: 'المعايرة الأيضية', title: 'Set your fitness & daily movement level', titleAr: 'حدد مستواك البدني ومعدل حركتك', description: 'We calculate your exact metabolic burn (TDEE) and match workout complexity to your lifestyle.', descriptionAr: 'لحساب استهلاكك الدقيق من الطاقة ومطابقة صعوبة التمارين.', icon: 'Gauge' },
  { label: 'Coaching', labelAr: 'أسلوب التدريب', eyebrow: 'Guidance style', eyebrowAr: 'التوجيه', title: 'Tell us how much direction you want', titleAr: 'ما مدى تفصيل الإرشادات المطلوبة؟', description: 'This tunes how prescriptive your workouts and recommendations should be.', descriptionAr: 'يحدد دقة التوجيه والملاحظات التدريبية الموجهة لك.', icon: 'Quote' },
  { label: 'Success', labelAr: 'معايير النجاح', eyebrow: 'Motivation', eyebrowAr: 'التحفيز', title: 'Define what progress means', titleAr: 'ماذا يعني النجاح بالنسبة لك؟', description: 'Select the wins that will keep you coming back.', descriptionAr: 'حدد الإنجازات التي ستشعرك بالتقدم المستمر.', icon: 'Trophy' },
  { label: 'Blueprint', labelAr: 'المخطط العلمي', eyebrow: 'Scientific Blueprint', eyebrowAr: 'المخطط الشامل', title: 'Your scientific transformation blueprint is ready', titleAr: 'مخطط تحولك العلمي جاهز الآن', description: 'Calculated with precision using Mifflin-St Jeor formula based on your real weight, height, age, and activity.', descriptionAr: 'تم حسابه بدقة بناءً على وزنك وطولك وسنك ونشاطك الفعلي.', icon: 'Rocket' },
];

const focusAreaOptions = [
  { id: 'fullbody', label: 'Full Body', image: fullBodyImg },
  { id: 'shoulders', label: 'Shoulders', image: shouldersImg },
  { id: 'biceps', label: 'Biceps', image: bicepsImg },
  { id: 'back', label: 'Back', image: backImg },
  { id: 'chest', label: 'Chest', image: chestImg },
  { id: 'core', label: 'Core', image: coreImg },
  { id: 'glutes', label: 'Glutes', image: glutesImg },
  { id: 'legs', label: 'Legs', image: legsImg },
];

const physiqueOptions = [
  {
    id: 'lean',
    label: 'Lean',
    description: 'Visible definition, lighter volume, clean conditioning.',
    image: veryThinImg,
    icon: 'Wind',
  },
  {
    id: 'muscular',
    label: 'Muscular',
    description: 'Balanced strength, shape, and progressive overload.',
    image: normalImg,
    icon: 'Dumbbell',
  },
  {
    id: 'ripped',
    label: 'Ripped',
    description: 'High definition, focused intensity, disciplined recovery.',
    image: slightlyThinImg,
    icon: 'Flame',
  },
];

const workoutTimeOptions = [
  { id: 'early_morning', icon: 'Sunrise', label: 'Early morning', time: '5-7 AM', description: 'Quiet start, high focus, fewer distractions.' },
  { id: 'morning', icon: 'Sun', label: 'Morning', time: '7-10 AM', description: 'Build momentum before the day gets crowded.' },
  { id: 'midday', icon: 'CloudSun', label: 'Midday', time: '12-2 PM', description: 'Reset energy and break up long work blocks.' },
  { id: 'afternoon', icon: 'Timer', label: 'Afternoon', time: '3-5 PM', description: 'Use the natural performance lift later in the day.' },
  { id: 'evening', icon: 'Sunset', label: 'Evening', time: '5-7 PM', description: 'Train after work and transition into recovery.' },
  { id: 'night', icon: 'Moon', label: 'Night', time: '7-9 PM', description: 'A calm, focused finish for late schedules.' },
];

const fitnessLevelOptions = [
  { id: 'beginner', color: 'bg-emerald-400', label: 'Beginner', description: "New to fitness or haven't trained consistently.", details: 'Simple movements, slower progressions, more coaching cues.' },
  { id: 'intermediate', color: 'bg-amber-400', label: 'Intermediate', description: 'Some experience and regular training rhythm.', details: 'Balanced volume, structured progression, form refinement.' },
  { id: 'advanced', color: 'bg-rose-500', label: 'Advanced', description: 'Consistent training and complex movement control.', details: 'Higher intensity, more variety, tighter performance targets.' },
];

const activityLevelOptions = [
  { id: 'sedentary', label: 'Sedentary', labelAr: 'خامل / مكتبي', multiplier: '1.20x', desc: 'Little to no exercise, mostly desk work', icon: 'Armchair' },
  { id: 'light', label: 'Lightly Active', labelAr: 'نشاط خفيف', multiplier: '1.38x', desc: 'Light movement, 1-3 workouts per week', icon: 'Footprints' },
  { id: 'moderate', label: 'Moderately Active', labelAr: 'نشاط متوسط', multiplier: '1.55x', desc: 'Active routine, 3-5 workouts per week', icon: 'Zap' },
  { id: 'very_active', label: 'Very Active', labelAr: 'نشاط عالي', multiplier: '1.73x', desc: 'Hard training 6-7 days per week', icon: 'Flame' },
  { id: 'extra_active', label: 'Extremely Active', labelAr: 'نشاط رياضي شاق', multiplier: '1.90x', desc: 'Physical labor or double daily sessions', icon: 'Trophy' },
];

const successMetricOptions = [
  { id: 'clothes_fit', icon: 'Shirt', label: 'Clothes fit comfortably', description: 'Body composition and confidence.' },
  { id: 'two_weeks', icon: 'CalendarCheck', label: 'Complete two weeks of workouts', description: 'Consistency and discipline.' },
  { id: 'stairs', icon: 'Footprints', label: 'Climb stairs without getting winded', description: 'Cardio capacity and stamina.' },
  { id: 'sleep', icon: 'Moon', label: 'Sleep better at night', description: 'Recovery and stress balance.' },
  { id: 'focus', icon: 'Brain', label: 'Feel focused at work', description: 'Energy and mental clarity.' },
  { id: 'noticed_changes', icon: 'MessageCircle', label: 'People notice visible changes', description: 'Transformation feedback.' },
  { id: 'energetic', icon: 'Zap', label: 'More energy all day', description: 'Sustained vitality.' },
];

const weightProfiles = [
  { max: 50, label: 'Very light frame', image: veryThinImg, note: 'We will prioritize careful progression.' },
  { max: 65, label: 'Light frame', image: slightlyThinImg, note: 'A good base for lean muscle building.' },
  { max: 80, label: 'Balanced baseline', image: normalImg, note: 'Great range for balanced recomposition.' },
  { max: 95, label: 'Strength baseline', image: overweightImg, note: 'We will balance conditioning with strength.' },
  { max: 110, label: 'Higher mass', image: fatImg, note: 'Low-impact consistency will matter most.' },
  { max: 130, label: 'High mass', image: highObesityImg, note: 'We will protect joints while building capacity.' },
  { max: Infinity, label: 'Very high mass', image: extremeObesityImg, note: 'Small sustainable wins will drive progress.' },
];

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const getWeightProfile = (weight) => weightProfiles.find((profile) => weight < profile.max) || weightProfiles[2];

const getLabelById = (options, id) => options.find((option) => option.id === id)?.label || 'Not selected';

const getSelectedLabels = (options, selectedIds) => {
  if (!selectedIds?.length) return 'None yet';
  return options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.label)
    .join(', ');
};

const StepHeader = ({ meta, isAr }) => (
  <div className="mx-auto max-w-2xl text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] border border-primary/30 bg-primary/10 text-primary shadow-[0_0_28px_rgba(94, 106, 210, 0.25)]">
      <Icon name={meta.icon} size={22} />
    </div>
    <p className="mt-4 text-sm font-semibold text-primary">{isAr ? (meta.eyebrowAr || meta.eyebrow) : meta.eyebrow}</p>
    <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{isAr ? (meta.titleAr || meta.title) : meta.title}</h1>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{isAr ? (meta.descriptionAr || meta.description) : meta.description}</p>
  </div>
);

const SelectionTile = ({ selected, icon, title, subtitle, detail, onClick, children, className = '' }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={classNames(
      'group relative w-full rounded-[8px] border p-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      selected
        ? 'border-primary bg-primary/12 shadow-[0_14px_36px_rgba(94, 106, 210, 0.25)]'
        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]',
      className
    )}
  >
    <div className="flex items-start gap-3">
      <span className={classNames(
        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px] border',
        selected ? 'border-primary/40 bg-primary text-white' : 'border-border bg-muted text-foreground'
      )}>
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">{title}</span>
        {subtitle && <span className="mt-1 block text-sm font-medium text-muted-foreground">{subtitle}</span>}
        {detail && <span className="mt-2 block text-xs leading-5 text-muted-foreground">{detail}</span>}
      </span>
      {selected && (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-black">
          <Icon name="Check" size={16} strokeWidth={3} />
        </span>
      )}
    </div>
    {children}
  </button>
);

const ImageChoice = ({ selected, image, title, subtitle, icon, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={classNames(
      'group relative overflow-hidden rounded-[8px] border p-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
      selected
        ? 'border-primary bg-primary/12 shadow-[0_14px_40px_rgba(94, 106, 210, 0.25)]'
        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]'
    )}
  >
    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[8px] bg-muted sm:mb-4">
      <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/15 bg-black/35 text-primary backdrop-blur">
        <Icon name={icon} size={17} />
      </span>
    </div>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
      {selected && (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-black">
          <Icon name="Check" size={16} strokeWidth={3} />
        </span>
      )}
    </div>
  </button>
);

const RangeControl = ({ label, value, unit, min, max, minLabel, maxLabel, middleLabel, gradient = 'linear-gradient(90deg, #FAA802 0%, #FAA802 100%)', onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <span className="rounded-[8px] border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {value} {unit}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${percentage}%`, background: gradient }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(event) => onChange(parseFloat(event.target.value))}
          className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent accent-primary"
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        {middleLabel && <span>{middleLabel}</span>}
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};

const InsightStrip = ({ icon = 'Info', title, text }) => (
  <div className="flex items-start gap-3 rounded-[8px] border border-primary/15 bg-primary/8 p-4">
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-primary/15 text-primary">
      <Icon name={icon} size={17} />
    </span>
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  </div>
);

const MiniStat = ({ label, value, icon }) => (
  <div className="rounded-[8px] border border-border/80 bg-background/45 p-3">
    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
      <Icon name={icon} size={15} />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { principal, googleUser, supabaseUser } = useAuth();
  const { isAr, toggleLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [formData, setFormData] = useState(() => {
    let localUser = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) localUser = JSON.parse(raw);
    } catch {}

    return {
      name: localUser?.name || localUser?.fullName || '',
      email: localUser?.email || '',
      picture: localUser?.picture || '',
      gender: localUser?.gender || '',
      bodyWeight: Number(localUser?.bodyWeight || localUser?.weight) || 70,
      alignmentScore: 0,
      physique: localUser?.physique || '',
      successMetrics: localUser?.successMetrics || [],
      focusAreas: localUser?.focusAreas || [],
      workoutTime: localUser?.workoutTime || '',
      age: Number(localUser?.age) || 25,
      height: Number(localUser?.height) || 175,
      weight: Number(localUser?.weight || localUser?.bodyWeight) || 70,
      fitnessLevel: localUser?.fitnessLevel || 'intermediate',
      activityLevel: localUser?.activityLevel || 'moderate',
      goals: localUser?.goals || [],
    };
  });

  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const activeMeta = stepMeta[currentStep - 1];
  const weightProfile = useMemo(() => getWeightProfile(formData.bodyWeight), [formData.bodyWeight]);
  const metabolic = useMemo(() => calculateMetabolicTargets(formData), [formData]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    // Pre-fill from existing user session or Supabase
    let localUser = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) localUser = JSON.parse(raw);
    } catch {}

    const emailToSet = localUser?.email || supabaseUser?.email || '';
    const nameToSet = localUser?.name || localUser?.fullName || supabaseUser?.name || supabaseUser?.full_name || '';
    const pictureToSet = localUser?.picture || supabaseUser?.picture || supabaseUser?.avatar_url || '';

    if (localUser) {
      if (localUser.onboardingCompleted && !localUser.skippedOnboarding) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        ...localUser,
        name: localUser.name || localUser.fullName || nameToSet || prev.name,
        email: localUser.email || emailToSet || prev.email,
        picture: localUser.picture || pictureToSet || prev.picture,
      }));
    } else if (emailToSet || nameToSet) {
      setFormData((prev) => ({
        ...prev,
        name: nameToSet || prev.name,
        email: emailToSet || prev.email,
        picture: pictureToSet || prev.picture,
      }));
    }
  }, [supabaseUser, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((step) => step + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  const saveAndExit = (skippedOnboarding = false) => {
    let existingUser = null;
    try {
      const localUserRaw = localStorage.getItem('user');
      if (localUserRaw) existingUser = JSON.parse(localUserRaw);
    } catch {}

    const principalId = existingUser?.id || supabaseUser?.id || principal?.toString() || `user_${Date.now()}`;
    const now = new Date().toISOString();
    const calculatedMetabolic = calculateMetabolicTargets(formData);
    const userProfile = {
      ...existingUser,
      ...formData,
      id: principalId,
      principalId,
      name: formData.name || existingUser?.name || 'ATOS Athlete',
      email: formData.email || existingUser?.email || '',
      picture: formData.picture || existingUser?.picture || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
      onboardingCompleted: !skippedOnboarding,
      skippedOnboarding,
      dailyCalorieGoal: calculatedMetabolic.dailyCalorieGoal,
      calorieGoal: calculatedMetabolic.calorieGoal,
      targetCalories: calculatedMetabolic.targetCalories,
      proteinGoal: calculatedMetabolic.proteinGoal,
      carbsGoal: calculatedMetabolic.carbsGoal,
      fatGoal: calculatedMetabolic.fatGoal,
      waterGoal: calculatedMetabolic.waterGoal,
      bmr: calculatedMetabolic.bmr,
      tdee: calculatedMetabolic.tdee,
      activityLevel: formData.activityLevel || calculatedMetabolic.activityLevel,
      bmi: calculatedMetabolic.bmi,
      estimatedWeeksToGoal: calculatedMetabolic.estimatedWeeksToGoal,
      metabolicProfile: calculatedMetabolic,
    };

    let mesocycle = null;
    try {
      mesocycle = generateMonthlyMesocycle(userProfile);
      saveUserTrainingPlan(principalId, mesocycle);
      userProfile.trainingMesocycleId = mesocycle.id;
    } catch (planError) {
      console.error('Error generating training plan in onboarding:', planError);
    }

    localStorage.setItem('user', JSON.stringify(userProfile));

    // Save to cloud in background
    saveCloudUserProfile(userProfile, mesocycle).catch((cloudErr) => {
      console.warn('Background cloud save notice:', cloudErr);
    });

    return { principalId, userProfile, mesocycle };
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { principalId, userProfile, mesocycle } = saveAndExit(false);
      // Await cloud sync for robust cross-device completion
      await saveCloudUserProfile(userProfile, mesocycle);

      if (principal?.toString()) {
        await updateUserProfile(principalId, userProfile);
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to save user profile:', error);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    saveAndExit(true);
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mx-auto max-w-2xl space-y-5">
            {/* User Account Verification Badge */}
            {formData.email && (
              <div className="flex items-center gap-3.5 p-4 rounded-xl border border-primary/35 bg-primary/10 shadow-[0_4px_20px_rgba(250,168,2,0.12)]">
                {formData.picture ? (
                  <img
                    src={formData.picture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-primary object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/40">
                    <Icon name="UserCheck" size={22} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon name="CheckCircle2" size={15} className="text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {isAr ? 'الحساب المسجل في السحابة' : 'Registered Cloud Account'}
                    </span>
                  </div>
                  <p className="text-sm font-black text-foreground truncate">{formData.email}</p>
                  {formData.name && (
                    <p className="text-xs text-muted-foreground truncate">{formData.name}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={isAr ? "الاسم الكامل" : "Full name"}
                value={formData.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                placeholder={isAr ? "اكتب اسمك الكامل" : "Enter your full name"}
                required
                prefix={<Icon name="User" size={17} className="text-muted-foreground" />}
                className="h-12 rounded-[8px] border-border/80 bg-white/[0.035] text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60"
              />
              <Input
                label={isAr ? "البريد الإلكتروني" : "Email address"}
                type="email"
                value={formData.email}
                onChange={(event) => handleInputChange('email', event.target.value)}
                placeholder={isAr ? "بريدك الإلكتروني" : "name@example.com"}
                required
                prefix={<Icon name="Mail" size={17} className="text-muted-foreground" />}
                className="h-12 rounded-[8px] border-border/80 bg-white/[0.035] text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/60"
              />
            </div>
            <InsightStrip
              icon="ShieldCheck"
              title={isAr ? "بياناتك مشفرة ومحفوظة" : "Editable later"}
              text={isAr
                ? "إجاباتك تحدد نقطة البداية لخطتك التدريبية والغذائية. يمكنك تعديل أي بيانات لاحقاً من ملفك الشخصي."
                : "Your onboarding answers shape the starting plan. You can refine them anytime from your profile."
              }
            />
          </div>
        );

      case 2:
        return (
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { id: 'male', label: 'Male', icon: 'Mars', detail: 'Use male baseline recommendations.' },
              { id: 'female', label: 'Female', icon: 'Venus', detail: 'Use female baseline recommendations.' },
              { id: 'not_specified', label: 'Prefer not to say', icon: 'UserRound', detail: 'Keep recommendations more general.' },
            ].map((option) => (
              <SelectionTile
                key={option.id}
                selected={formData.gender === option.id}
                icon={option.icon}
                title={option.label}
                detail={option.detail}
                onClick={() => handleInputChange('gender', option.id)}
                className="min-h-[150px]"
              />
            ))}
          </div>
        );

      case 3: {
        const liveBmi = calculateBMI(formData.bodyWeight, formData.height || 175);
        const idealMinWeight = Math.round(18.5 * Math.pow((formData.height || 175) / 100, 2));
        const idealMaxWeight = Math.round(24.9 * Math.pow((formData.height || 175) / 100, 2));
        const liveBmr = calculateBMR(formData.gender, formData.bodyWeight, formData.height || 175, formData.age || 25);
        const liveTdee = calculateTDEE(liveBmr, formData.activityLevel || 'moderate');

        return (
          <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[8px] border border-border/80 bg-white/[0.025] p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-muted">
                <img src={weightProfile.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-4xl font-bold text-primary">{Math.round(formData.bodyWeight)} {isAr ? 'كجم' : 'kg'}</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{weightProfile.label}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <RangeControl
                label={isAr ? "الوزن الحالي" : "Current weight"}
                value={Math.round(formData.bodyWeight)}
                unit={isAr ? "كجم" : "kg"}
                min={30}
                max={200}
                minLabel={isAr ? "30 كجم" : "30 kg"}
                middleLabel={isAr ? "115 كجم" : "115 kg"}
                maxLabel={isAr ? "200 كجم" : "200 kg"}
                gradient="linear-gradient(90deg, #FAA802 0%, #FAA802 100%)"
                onChange={(value) => handleInputChange('bodyWeight', value)}
              />

              {/* Smart Dynamic Body Diagnostics Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[8px] border border-border/80 bg-background/50 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Icon name="Activity" size={15} style={{ color: liveBmi.color }} />
                    <span className="font-semibold">{isAr ? 'مؤشر كتلة الجسم (BMI)' : 'BMI Index'}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">{liveBmi.bmi}</span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: `${liveBmi.color}25`, color: liveBmi.color }}
                    >
                      {isAr ? liveBmi.labelAr : liveBmi.labelEn}
                    </span>
                  </div>
                </div>

                <div className="rounded-[8px] border border-border/80 bg-background/50 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Icon name="Target" size={15} className="text-primary" />
                    <span className="font-semibold">{isAr ? 'الوزن المثالي لطولك' : 'Ideal Weight Range'}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-primary">{idealMinWeight} - {idealMaxWeight}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{isAr ? 'كجم' : 'kg'}</span>
                  </div>
                </div>
              </div>

              <InsightStrip
                icon="Sparkles"
                title={isAr ? `تشخيص ذكي: ${liveBmi.labelAr}` : `Smart Analysis: ${liveBmi.labelEn}`}
                text={isAr
                  ? `بناءً على وزنك (${Math.round(formData.bodyWeight)} كجم)، يحرق جسمك بالراحة التامة حوالي ${liveBmr.toLocaleString()} سعرة (BMR) ومع نمط حركتك يستهلك قرابة ${liveTdee.toLocaleString()} سعرة يومياً (TDEE).`
                  : `At ${Math.round(formData.bodyWeight)} kg, your body burns ~${liveBmr.toLocaleString()} kcal at complete rest (BMR) and ~${liveTdee.toLocaleString()} kcal with your daily activity (TDEE).`
                }
              />
            </div>
          </div>
        );
      }

      case 4:
        return (
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {physiqueOptions.map((option) => (
              <ImageChoice
                key={option.id}
                selected={formData.physique === option.id}
                image={option.image}
                icon={option.icon}
                title={option.label}
                subtitle={option.description}
                onClick={() => handleInputChange('physique', option.id)}
              />
            ))}
          </div>
        );

      case 5:
        return (
          <div className="mx-auto max-w-4xl space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {focusAreaOptions.map((area) => {
                const selected = formData.focusAreas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleArrayValue('focusAreas', area.id)}
                    className={classNames(
                      'relative rounded-[8px] border p-3 text-center transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                      selected
                        ? 'border-primary bg-primary/12 shadow-[0_12px_32px_rgba(94, 106, 210, 0.25)]'
                        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]'
                    )}
                  >
                    <div className="mx-auto mb-3 aspect-square max-w-[76px] overflow-hidden rounded-[8px] border border-white/10 bg-muted sm:max-w-[92px]">
                      <img src={area.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="block text-sm font-bold text-foreground">{area.label}</span>
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-black">
                        <Icon name="Check" size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <InsightStrip
              icon="MousePointer2"
              title={`${formData.focusAreas.length} area${formData.focusAreas.length === 1 ? '' : 's'} selected`}
              text="Multi-select lets your plan balance major movement patterns with the areas you care about most."
            />
          </div>
        );

      case 6: {
        const liveBmr = calculateBMR(formData.gender, formData.bodyWeight, formData.height, formData.age);
        const liveTdee = calculateTDEE(liveBmr, formData.activityLevel);
        const idealMinWeight = Math.round(18.5 * Math.pow(formData.height / 100, 2));
        const idealMaxWeight = Math.round(24.9 * Math.pow(formData.height / 100, 2));
        const weightDiff = Math.round(formData.weight - formData.bodyWeight);
        const targetBmi = calculateBMI(formData.weight, formData.height);

        return (
          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <RangeControl
                label={isAr ? "الطول" : "Height"}
                value={Math.round(formData.height)}
                unit={isAr ? "سم" : "cm"}
                min={140}
                max={220}
                minLabel={isAr ? "140 سم" : "140 cm"}
                middleLabel={isAr ? "180 سم" : "180 cm"}
                maxLabel={isAr ? "220 سم" : "220 cm"}
                gradient="linear-gradient(90deg, #FAA802 0%, #FAA802 100%)"
                onChange={(value) => handleInputChange('height', value)}
              />
              <RangeControl
                label={isAr ? "السن" : "Age"}
                value={Math.round(formData.age)}
                unit={isAr ? "سنة" : "years"}
                min={15}
                max={80}
                minLabel={isAr ? "15 سنة" : "15"}
                middleLabel={isAr ? "48 سنة" : "48"}
                maxLabel={isAr ? "80 سنة" : "80"}
                gradient="linear-gradient(90deg, #FAA802 0%, #FAA802 100%)"
                onChange={(value) => handleInputChange('age', value)}
              />
              <RangeControl
                label={isAr ? "الوزن المستهدف" : "Target weight"}
                value={Math.round(formData.weight)}
                unit={isAr ? "كجم" : "kg"}
                min={30}
                max={200}
                minLabel={isAr ? "30 كجم" : "30 kg"}
                middleLabel={isAr ? "115 كجم" : "115 kg"}
                maxLabel={isAr ? "200 كجم" : "200 kg"}
                gradient="linear-gradient(90deg, #FAA802 0%, #FAA802 100%)"
                onChange={(value) => handleInputChange('weight', value)}
              />

              <InsightStrip
                icon="Brain"
                title={isAr ? "التحليل الذكي للهدف" : "Smart Target Analysis"}
                text={isAr
                  ? weightDiff < 0
                    ? `هدفك خسارة ${Math.abs(weightDiff)} كجم للوصول إلى ${Math.round(formData.weight)} كجم (BMI مستهدف: ${targetBmi.bmi} - ${targetBmi.labelAr}). سيعتمد برنامجك على عجز سعرات تدريجي ومستدام.`
                    : weightDiff > 0
                    ? `هدفك اكتساب ${weightDiff} كجم كتلة عضلية للوصول إلى ${Math.round(formData.weight)} كجم (BMI مستهدف: ${targetBmi.bmi} - ${targetBmi.labelAr}). سيعتمد برنامجك على فائض سعرات وتضخيم نظيف.`
                    : `هدفك هو الحفاظ على وزنك الحالي (${Math.round(formData.bodyWeight)} كجم) مع إعادة تشكيل الجسم وتفصيل العضلات.`
                  : weightDiff < 0
                    ? `Your goal is shedding ${Math.abs(weightDiff)} kg fat to reach ${Math.round(formData.weight)} kg (target BMI: ${targetBmi.bmi} - ${targetBmi.labelEn}).`
                    : weightDiff > 0
                    ? `Your goal is building ${weightDiff} kg clean muscle to reach ${Math.round(formData.weight)} kg (target BMI: ${targetBmi.bmi} - ${targetBmi.labelEn}).`
                    : `Your goal is body recomposition and athletic tone at your current weight.`
                }
              />
            </div>

            {/* Smart Real-Time Bio-Calibration Sidebar */}
            <div className="rounded-[8px] border border-primary/25 bg-gradient-to-b from-card/90 via-card/70 to-card/90 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={17} className="text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    {isAr ? 'المعايرة الحيوية الذكية' : 'Smart Bio-Calibration'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/15 border border-primary/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="HeartPulse" size={15} className="text-rose-400" />
                    <span>{isAr ? 'معدل الحرق الأساسي (BMR)' : 'Base Burn (BMR)'}</span>
                  </div>
                  <span className="text-sm font-black text-foreground">
                    {liveBmr.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">kcal</span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Flame" size={15} className="text-amber-400" />
                    <span>{isAr ? 'الاستهلاك اليومي (TDEE)' : 'Daily Burn (TDEE)'}</span>
                  </div>
                  <span className="text-sm font-black text-foreground">
                    {liveTdee.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">kcal</span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Target" size={15} className="text-primary" />
                    <span>{isAr ? 'الوزن المثالي لطولك' : 'Ideal Range'}</span>
                  </div>
                  <span className="text-xs font-black text-primary">
                    {idealMinWeight} - {idealMaxWeight} {isAr ? 'كجم' : 'kg'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/8 p-3.5">
                <div className="text-xs font-bold text-primary mb-1">
                  {isAr ? 'المدة التقديرية للإنجاز' : 'Estimated Timeline'}
                </div>
                <div className="text-xs text-foreground font-semibold leading-relaxed">
                  {Math.abs(weightDiff) >= 1 ? (
                    isAr
                      ? `تحتاج حوالي ${Math.max(2, Math.round(Math.abs(weightDiff) / 0.5))} أسابيع بمعدل نزول/زيادة صحي ~0.5 كجم أسبوعياً.`
                      : `~${Math.max(2, Math.round(Math.abs(weightDiff) / 0.5))} weeks at a healthy ~0.5 kg/week progression.`
                  ) : (
                    isAr ? 'أنت في نطاق وزنك المستهدف تماماً!' : 'You are right at your target weight!'
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 7:
        return (
          <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {workoutTimeOptions.map((timeSlot) => (
              <SelectionTile
                key={timeSlot.id}
                selected={formData.workoutTime === timeSlot.id}
                icon={timeSlot.icon}
                title={timeSlot.label}
                subtitle={timeSlot.time}
                detail={timeSlot.description}
                onClick={() => handleInputChange('workoutTime', timeSlot.id)}
              />
            ))}
          </div>
        );

      case 8:
        return (
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Activity" size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Daily Movement & Activity Level
                </h3>
                <span className="text-[11px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  Determines your TDEE
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                How much do you move on an average day? This directly multiplies your BMR to establish your true daily calorie burn.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {activityLevelOptions.map((opt) => {
                  const isSelected = formData.activityLevel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleInputChange('activityLevel', opt.id)}
                      className={classNames(
                        'flex items-start gap-3 p-3.5 rounded-[8px] border text-left transition duration-200',
                        isSelected
                          ? 'border-primary bg-primary/12 shadow-[0_8px_24px_rgba(250,168,2,0.15)]'
                          : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.04]'
                      )}
                    >
                      <span className={classNames(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border',
                        isSelected ? 'border-primary bg-primary text-black' : 'border-border bg-muted text-foreground'
                      )}>
                        <Icon name={opt.icon} size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">{opt.label}</span>
                          <span className="text-xs font-mono font-bold text-primary">{opt.multiplier}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-4">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Gauge" size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Training Experience Level
                </h3>
              </div>
              <div className="space-y-3">
                {fitnessLevelOptions.map((level, index) => (
                  <button
                    key={level.id}
                    type="button"
                    aria-pressed={formData.fitnessLevel === level.id}
                    onClick={() => handleInputChange('fitnessLevel', level.id)}
                    className={classNames(
                      'w-full rounded-[8px] border p-3.5 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                      formData.fitnessLevel === level.id
                        ? 'border-primary bg-primary/12 shadow-[0_12px_32px_rgba(94, 106, 210, 0.25)]'
                        : 'border-border/80 bg-white/[0.025] hover:border-primary/45 hover:bg-white/[0.045]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <span className={classNames('mt-1 h-3.5 w-3.5 flex-shrink-0 rounded-full', level.color)} />
                        <span>
                          <span className="block text-base font-bold text-foreground">{level.label}</span>
                          <span className="mt-0.5 block text-xs font-semibold text-foreground/85">{level.description}</span>
                          <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{level.details}</span>
                        </span>
                      </div>
                      {formData.fitnessLevel === level.id && <Icon name="Check" size={18} className="text-primary" />}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((barIndex) => (
                        <span
                          key={barIndex}
                          className={classNames(
                            'h-1.5 rounded-full',
                            barIndex <= index ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <InsightStrip
              icon="SlidersHorizontal"
              title="Science-backed Calibration"
              text="Your daily movement level multiplies your BMR to calculate your exact TDEE, ensuring your calorie target is 100% realistic."
            />
          </div>
        );

      case 9: {
        const alignmentMessage = formData.alignmentScore >= 4
          ? 'Guidance mode: precise. Your workouts will emphasize clear sets, reps, and progression cues.'
          : formData.alignmentScore > 0
            ? 'Guidance mode: flexible. Your plan will keep structure while leaving room for preference.'
            : 'Choose a number to tune your coaching style.';

        return (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-5 sm:p-6">
              <Icon name="Quote" size={26} className="mb-4 text-primary" />
              <p className="text-lg font-semibold leading-7 text-foreground sm:text-xl">
                I want clear exercise direction, not another plan that leaves me guessing.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleInputChange('alignmentScore', rating)}
                  className={classNames(
                    'h-14 rounded-[8px] border text-lg font-bold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                    formData.alignmentScore === rating
                      ? 'border-primary bg-primary text-black shadow-[0_10px_28px_rgba(94, 106, 210, 0.35)]'
                      : 'border-border/80 bg-white/[0.025] text-foreground hover:border-primary/45'
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light direction</span>
              <span>Very prescriptive</span>
            </div>
            <InsightStrip icon="Compass" title={alignmentMessage} text="This setting changes the level of detail in your coaching prompts and workout notes." />
          </div>
        );
      }

      case 10:
        return (
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              {successMetricOptions.map((metric) => (
                <SelectionTile
                  key={metric.id}
                  selected={formData.successMetrics.includes(metric.id)}
                  icon={metric.icon}
                  title={metric.label}
                  detail={metric.description}
                  onClick={() => toggleArrayValue('successMetrics', metric.id)}
                />
              ))}
            </div>
            <InsightStrip
              icon="ListChecks"
              title={`${formData.successMetrics.length} success marker${formData.successMetrics.length === 1 ? '' : 's'} selected`}
              text="ATOS-fit can frame progress around performance, health, confidence, energy, or consistency."
            />
          </div>
        );

      case 11:
        return (
          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="space-y-4">
              {/* Scientific Metabolic Hero Card */}
              <div className="rounded-[8px] border border-primary/30 bg-gradient-to-br from-primary/10 via-white/[0.02] to-transparent p-5 sm:p-6 shadow-[0_12px_40px_rgba(250,168,2,0.12)]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                      <Icon name="Sparkles" size={14} />
                      Scientific Metabolic Blueprint
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
                      {metabolic.dailyCalorieGoal.toLocaleString()} <span className="text-lg font-bold text-primary">kcal / day</span>
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                    <Icon name={metabolic.goalType === 'weight_loss' ? 'TrendingDown' : metabolic.goalType === 'muscle_gain' ? 'TrendingUp' : 'Activity'} size={14} />
                    {metabolic.goalType === 'weight_loss' ? 'Deficit: -500 kcal' : metabolic.goalType === 'muscle_gain' ? 'Surplus: +350 kcal' : 'Maintenance'}
                  </span>
                </div>

                <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                  Based on your current weight ({Math.round(formData.bodyWeight)} kg), height ({Math.round(formData.height)} cm), age ({Math.round(formData.age)} yrs), and {activityLevelOptions.find(o => o.id === formData.activityLevel)?.label || 'Moderate'} activity, your daily target is scientifically calibrated for realistic, sustainable progress.
                </p>

                {/* Key Metabolic Markers Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-[8px] border border-border/80 bg-background/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon name="Flame" size={14} className="text-amber-400" />
                      <span>TDEE (Daily Burn)</span>
                    </div>
                    <p className="text-lg font-black text-foreground">{metabolic.tdee.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Burn with activity</p>
                  </div>

                  <div className="rounded-[8px] border border-border/80 bg-background/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon name="HeartPulse" size={14} className="text-rose-400" />
                      <span>BMR (Base Rate)</span>
                    </div>
                    <p className="text-lg font-black text-foreground">{metabolic.bmr.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Mifflin-St Jeor base</p>
                  </div>

                  <div className="rounded-[8px] border border-border/80 bg-background/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon name="Droplets" size={14} className="text-cyan-400" />
                      <span>Water Target</span>
                    </div>
                    <p className="text-lg font-black text-foreground">{metabolic.waterGoalLiters} <span className="text-xs font-normal text-muted-foreground">L</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{metabolic.waterGoal} ml / day</p>
                  </div>

                  <div className="rounded-[8px] border border-border/80 bg-background/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Icon name="Activity" size={14} style={{ color: metabolic.bmiInfo.color }} />
                      <span>BMI Index</span>
                    </div>
                    <p className="text-lg font-black text-foreground">{metabolic.bmi}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: metabolic.bmiInfo.color }}>{metabolic.bmiInfo.labelEn}</p>
                  </div>
                </div>

                {/* Target Timeline Projection */}
                {metabolic.estimatedWeeksToGoal > 0 && (
                  <div className="mt-4 rounded-[8px] border border-primary/20 bg-primary/5 p-3.5 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Icon name="CalendarCheck" size={18} />
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-bold text-foreground">
                        Target Timeline: ~{metabolic.estimatedWeeksToGoal} weeks to reach {Math.round(formData.weight)} kg
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Progressing at a healthy rate of ~{Math.abs(metabolic.weeklyChangeKg)} kg/week ({metabolic.goalType === 'weight_loss' ? 'fat loss' : 'lean muscle growth'}).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Macronutrient Targets Card */}
              <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Target Daily Macronutrients</h3>
                    <p className="text-xs text-muted-foreground">Tailored to fuel performance, recovery, and body composition</p>
                  </div>
                  <Icon name="PieChart" size={20} className="text-primary" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-[8px] border border-border/80 bg-background/40 p-3.5 text-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Protein</span>
                    <p className="mt-1 text-2xl font-black text-foreground">{metabolic.proteinGoal}<span className="text-xs font-normal text-muted-foreground">g</span></p>
                    <span className="text-[11px] text-muted-foreground">{metabolic.proteinGoal * 4} kcal</span>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.round(((metabolic.proteinGoal * 4) / metabolic.dailyCalorieGoal) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-border/80 bg-background/40 p-3.5 text-center">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Carbs</span>
                    <p className="mt-1 text-2xl font-black text-foreground">{metabolic.carbsGoal}<span className="text-xs font-normal text-muted-foreground">g</span></p>
                    <span className="text-[11px] text-muted-foreground">{metabolic.carbsGoal * 4} kcal</span>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round(((metabolic.carbsGoal * 4) / metabolic.dailyCalorieGoal) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-border/80 bg-background/40 p-3.5 text-center">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Healthy Fats</span>
                    <p className="mt-1 text-2xl font-black text-foreground">{metabolic.fatGoal}<span className="text-xs font-normal text-muted-foreground">g</span></p>
                    <span className="text-[11px] text-muted-foreground">{metabolic.fatGoal * 9} kcal</span>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.round(((metabolic.fatGoal * 9) / metabolic.dailyCalorieGoal) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Profile & Training Routine summary */}
            <div className="space-y-3">
              <div className="rounded-[8px] border border-border/80 bg-white/[0.025] p-4 space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Plan Architecture</p>
                <MiniStat icon="Scale" label="Current Weight" value={`${Math.round(formData.bodyWeight)} kg`} />
                <MiniStat icon="Crosshair" label="Target Weight" value={`${Math.round(formData.weight)} kg`} />
                <MiniStat icon="Gauge" label="Activity Factor" value={activityLevelOptions.find(o => o.id === formData.activityLevel)?.multiplier || '1.55x'} />
                <MiniStat icon="Clock3" label="Training Window" value={getLabelById(workoutTimeOptions, formData.workoutTime)} />
                <MiniStat icon="ScanLine" label="Priority Areas" value={getSelectedLabels(focusAreaOptions, formData.focusAreas)} />
              </div>

              {/* 4-Week Periodized Mesocycle Card */}
              {(() => {
                const planStrategy = determineSplitStrategy(formData);
                return (
                  <div className="rounded-[8px] border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">4-Week Mesocycle</p>
                      <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">RP Periodization</span>
                    </div>
                    <div className="text-xs text-foreground font-semibold">
                      {planStrategy.trainingDaysPerWeek} sessions / week • {planStrategy.trainingDaysPerWeek * 4} periodized workouts
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded border border-border/70 bg-background/50 p-2">
                        <span className="text-muted-foreground block text-[10px]">W1: Baseline</span>
                        <strong className="text-foreground">MEV & Technique</strong>
                      </div>
                      <div className="rounded border border-border/70 bg-background/50 p-2">
                        <span className="text-muted-foreground block text-[10px]">W2: Overload</span>
                        <strong className="text-foreground">+15% Volume & Burn</strong>
                      </div>
                      <div className="rounded border border-border/70 bg-background/50 p-2">
                        <span className="text-muted-foreground block text-[10px]">W3: Peak Volume</span>
                        <strong className="text-foreground">MAV & High Density</strong>
                      </div>
                      <div className="rounded border border-border/70 bg-background/50 p-2">
                        <span className="text-muted-foreground block text-[10px]">W4: Deload</span>
                        <strong className="text-foreground">Active Recovery</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <InsightStrip
                icon="ShieldCheck"
                title="100% Real Calculations"
                text="Every calorie, gram of protein, and fluid target is calculated from your body metrics and automatically synced to your dashboard and food scanner."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim();
      case 2:
        return formData.gender;
      case 3:
        return true;
      case 4:
        return formData.physique;
      case 5:
        return formData.focusAreas.length > 0;
      case 6:
        return formData.height > 0 && formData.age > 0 && formData.weight > 0;
      case 7:
        return formData.workoutTime;
      case 8:
        return formData.fitnessLevel;
      case 9:
        return formData.alignmentScore > 0;
      case 10:
        return formData.successMetrics.length > 0;
      case 11:
        return true;
      default:
        return false;
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={classNames(
        'min-h-screen overflow-hidden bg-background text-foreground',
        currentTheme === 'dark' && 'dark'
      )}
    >
      <div className="relative min-h-screen">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(135deg, rgba(250, 168, 2, 0.16) 0%, rgba(112, 130, 255, 0.05) 34%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 42%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px] opacity-25" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-5xl px-4 py-5 lg:px-6">
          <main className="flex min-w-0 flex-1 flex-col justify-center py-2 lg:py-6">
            {/* Top Bar: Brand & Language Switcher */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary shadow-sm">
                  <Icon name="Zap" size={17} />
                </div>
                <span className="text-base font-black tracking-tight text-foreground">
                  ATOS<span className="text-primary">fit</span>
                </span>
              </div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-bold text-foreground transition hover:border-primary/50 shadow-sm"
              >
                <Icon name="Languages" size={14} className="text-primary" />
                <span>{isAr ? 'English' : 'عربي'}</span>
              </button>
            </div>

            <div className="mb-4 rounded-[8px] border border-border/70 bg-card/70 p-3 shadow-[0_12px_34px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-foreground">
                  {isAr ? `الخطوة ${currentStep} من ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
                </span>
                <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <section className="rounded-[8px] border border-border/80 bg-card/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-7 lg:p-8">
              <StepHeader meta={activeMeta} isAr={isAr} />
              <div className="mt-8">{renderStep()}</div>

              <div className="mt-8 flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="h-11 rounded-[8px] border-border/80 bg-white/[0.025] px-4"
                >
                  <Icon name={isAr ? "ChevronRight" : "ChevronLeft"} size={16} />
                  <span className={isAr ? "mr-2" : "ml-2"}>{isAr ? "السابق" : "Previous"}</span>
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleComplete}
                    disabled={!isStepValid() || isLoading}
                    loading={isLoading}
                    className="h-11 rounded-[8px] px-5 font-bold"
                  >
                    <Icon name="Check" size={16} />
                    <span className={isAr ? "mr-2" : "ml-2"}>{isAr ? "إتمام الخطة والبدء" : "Complete setup"}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="h-11 rounded-[8px] px-5 font-bold"
                  >
                    <span>{isAr ? "متابعة" : "Continue"}</span>
                    <Icon name={isAr ? "ChevronLeft" : "ChevronRight"} size={16} className={isAr ? "mr-2" : "ml-2"} />
                  </Button>
                )}
              </div>
            </section>

            <button
              type="button"
              onClick={handleSkip}
              className="mx-auto mt-4 rounded-[8px] px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              {isAr ? "تخطي الآن والبدء لاحقاً" : "Skip for now"}
            </button>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
