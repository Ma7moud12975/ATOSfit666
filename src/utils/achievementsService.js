import { supabase } from './supabase';
import { resolveDbUserId } from './api/chatApi';
import { getAccountId } from './localAccountStorage';
import { emitDashboardDataUpdated } from './dashboardStatsService';

export const ACHIEVEMENTS_UPDATED_EVENT = 'atos_achievements_updated';

/**
 * Exercise & Milestone Achievement Definitions
 * Biomechanically scaled targets with 5 levels each (Bronze -> Diamond)
 */
export const EXERCISE_ACHIEVEMENT_CATALOG = {
  // --- UPPER BODY ---
  'push-ups': {
    code: 'push-ups_achievement',
    exerciseName: 'push-ups',
    category: 'upper_body',
    title: { en: 'Push-Up Master', ar: 'سيد تمرين الضغط' },
    description: { en: 'Build chest, shoulders & core strength with push-ups.', ar: 'ابنِ قوة الصدر والكتفين والجذع عبر تمرين الضغط.' },
    icon: 'Dumbbell',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 50, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Initiate', ar: 'مبتدئ برونزي' } },
      { level: 2, goal: 100, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Warrior', ar: 'محارب فضي' } },
      { level: 3, goal: 250, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Striker', ar: 'مهاجم ذهبي' } },
      { level: 4, goal: 500, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Titan', ar: 'تيتان بلاتيني' } },
      { level: 5, goal: 1000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Diamond Legend', ar: 'أسطورة ألماسي' } }
    ]
  },
  'wide push ups': {
    code: 'wide_push_ups_achievement',
    exerciseName: 'wide push ups',
    category: 'upper_body',
    title: { en: 'Wide Push-Up Power', ar: 'قوة الضغط العريض' },
    description: { en: 'Target outer pectorals with wider hand positioning.', ar: 'استهدف زوايا الصدر الخارجية بتباعد يدين عريض.' },
    icon: 'Flame',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 50, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Wings', ar: 'أجنحة برونزية' } },
      { level: 2, goal: 100, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Wings', ar: 'أجنحة فضية' } },
      { level: 3, goal: 250, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Spread', ar: 'امتداد ذهبي' } },
      { level: 4, goal: 500, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Broad', ar: 'عريض بلاتيني' } },
      { level: 5, goal: 1000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Diamond Chest', ar: 'صدر ألماسي' } }
    ]
  },
  'narrow push ups': {
    code: 'narrow_push_ups_achievement',
    exerciseName: 'narrow push ups',
    category: 'upper_body',
    title: { en: 'Triceps Crusher', ar: 'مدمر الترايسبس' },
    description: { en: 'Heavy triceps and inner chest overload.', ar: 'تركيز فائق على الترايسبس وزوايا الصدر الداخلية.' },
    icon: 'Zap',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 50, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Press', ar: 'ضغط برونزي' } },
      { level: 2, goal: 100, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Press', ar: 'ضغط فضي' } },
      { level: 3, goal: 250, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Precision', ar: 'دقة ذهبية' } },
      { level: 4, goal: 500, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Focus', ar: 'تركيز بلاتيني' } },
      { level: 5, goal: 1000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Diamond Arm', ar: 'ذراع ألماسي' } }
    ]
  },
  'diamond push ups': {
    code: 'diamond_push_ups_achievement',
    exerciseName: 'diamond push ups',
    category: 'upper_body',
    title: { en: 'Diamond Stance', ar: 'وضعية الألماس' },
    description: { en: 'The elite calisthenics test for arms and upper body.', ar: 'اختبار الكاليسثنيكس الفولاذي للذراعين وأعلى الجسم.' },
    icon: 'Award',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 38, tier: 'bronze', tokens: 15, xp: 60, title: { en: 'Bronze Gem', ar: 'جوهرة برونزية' } },
      { level: 2, goal: 75, tier: 'silver', tokens: 35, xp: 120, title: { en: 'Silver Gem', ar: 'جوهرة فضية' } },
      { level: 3, goal: 188, tier: 'gold', tokens: 70, xp: 300, title: { en: 'Golden Diamond', ar: 'ألماس ذهبي' } },
      { level: 4, goal: 375, tier: 'platinum', tokens: 140, xp: 600, title: { en: 'Platinum Diamond', ar: 'ألماس بلاتيني' } },
      { level: 5, goal: 750, tier: 'diamond', tokens: 300, xp: 1200, title: { en: 'True Diamond', ar: 'ألماسة حقيقية' } }
    ]
  },
  'knee push ups': {
    code: 'knee_push_ups_achievement',
    exerciseName: 'knee push ups',
    category: 'upper_body',
    title: { en: 'Volume Builder', ar: 'بناء الحجم والأساس' },
    description: { en: 'High volume push-up variations on knees.', ar: 'تكرارات حجم عالية لتثبيت الأساس وتقوية المفاصل.' },
    icon: 'Shield',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 100, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Solid Base', ar: 'أساس صلب' } },
      { level: 2, goal: 200, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Iron Knees', ar: 'ركبتان حديديتان' } },
      { level: 3, goal: 500, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Endurance Gold', ar: 'تحمل ذهبي' } },
      { level: 4, goal: 1000, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Centurion Knee', ar: 'مئة بلاتينية' } },
      { level: 5, goal: 2000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Unbroken Form', ar: 'فورم لا ينكسر' } }
    ]
  },

  // --- LOWER BODY ---
  'squats': {
    code: 'squats_achievement',
    exerciseName: 'squats',
    category: 'lower_body',
    title: { en: 'Legs of Steel', ar: 'أرجل من فولاذ' },
    description: { en: 'Explosive quadriceps, hamstrings and glutes activation.', ar: 'تفعيل كامل للفخذين والأوتار والأرداف بقوة انفجارية.' },
    icon: 'Activity',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 100, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Foundation', ar: 'أساس برونزي' } },
      { level: 2, goal: 200, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Pillar', ar: 'عمود فضي' } },
      { level: 3, goal: 500, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Quad', ar: 'عضلات ذهبية' } },
      { level: 4, goal: 1000, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Piston', ar: 'مكبس بلاتيني' } },
      { level: 5, goal: 2000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Titan Legs', ar: 'أرجل التيتان' } }
    ]
  },
  'lunges': {
    code: 'lunges_achievement',
    exerciseName: 'lunges',
    category: 'lower_body',
    title: { en: 'Stride Champion', ar: 'بطل الخطوات الواسعة' },
    description: { en: 'Unilateral leg balance, hip mobility, and single-leg strength.', ar: 'توازن أحادي، مرونة حركية، وقوة فردية لكل ساق.' },
    icon: 'TrendingUp',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 200, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Stride', ar: 'خطوة برونزية' } },
      { level: 2, goal: 400, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Stride', ar: 'خطوة فضية' } },
      { level: 3, goal: 1000, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Lunger', ar: 'طعنات ذهبية' } },
      { level: 4, goal: 2000, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Glide', ar: 'انسياب بلاتيني' } },
      { level: 5, goal: 4000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Apex Stride', ar: 'خطوة القمة' } }
    ]
  },
  'wall sit': {
    code: 'wall_sit_achievement',
    exerciseName: 'wall sit',
    category: 'lower_body',
    title: { en: 'The Fortress', ar: 'الحصن المنيع' },
    description: { en: 'Pure isometric quad endurance against the wall.', ar: 'تحمل عضلي أيزومتري نقي للفخذين أمام الحائط.' },
    icon: 'Shield',
    unit: { en: 'mins', ar: 'دقيقة' },
    isTimeBased: true,
    levels: [
      { level: 1, goal: 20, tier: 'bronze', tokens: 15, xp: 60, title: { en: 'Wall Guard', ar: 'حارس الحائط' } },
      { level: 2, goal: 50, tier: 'silver', tokens: 30, xp: 120, title: { en: 'Iron Wall', ar: 'جدار حديدي' } },
      { level: 3, goal: 90, tier: 'gold', tokens: 60, xp: 250, title: { en: 'Granite Stand', ar: 'وقفة الجرانيت' } },
      { level: 4, goal: 120, tier: 'platinum', tokens: 120, xp: 500, title: { en: 'Unmovable', ar: 'ثابت لا يتحرك' } },
      { level: 5, goal: 180, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'The Bastion', ar: 'الحصن الأعظم' } }
    ]
  },

  // --- CORE & ABS ---
  'plank': {
    code: 'plank_achievement',
    exerciseName: 'plank',
    category: 'core',
    title: { en: 'Core of Iron', ar: 'جذع فولاذي' },
    description: { en: 'Total isometric core stability and spinal rigidity.', ar: 'ثبات أيزومتري كامل للجذع والعمود الفقري.' },
    icon: 'Target',
    unit: { en: 'mins', ar: 'دقيقة' },
    isTimeBased: true,
    levels: [
      { level: 1, goal: 10, tier: 'bronze', tokens: 15, xp: 60, title: { en: 'Bronze Plank', ar: 'بلانك برونزي' } },
      { level: 2, goal: 25, tier: 'silver', tokens: 30, xp: 120, title: { en: 'Silver Anchor', ar: 'مرساة فضية' } },
      { level: 3, goal: 45, tier: 'gold', tokens: 60, xp: 250, title: { en: 'Golden Bridge', ar: 'جسر ذهبي' } },
      { level: 4, goal: 60, tier: 'platinum', tokens: 120, xp: 500, title: { en: 'Hour of Steel', ar: 'ساعة الفولاذ' } },
      { level: 5, goal: 90, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Diamond Core', ar: 'جذع ألماسي' } }
    ]
  },
  'side plank': {
    code: 'side_plank_achievement',
    exerciseName: 'side plank',
    category: 'core',
    title: { en: 'Oblique Armour', ar: 'درع العضلات الجانبية' },
    description: { en: 'Lateral stability, obliques, and quadratus lumborum.', ar: 'ثبات جانبي وتقوية متفوقة للجوانب وأسفل الظهر.' },
    icon: 'Shield',
    unit: { en: 'mins', ar: 'دقيقة' },
    isTimeBased: true,
    levels: [
      { level: 1, goal: 10, tier: 'bronze', tokens: 15, xp: 60, title: { en: 'Side Guard', ar: 'حارس الجوانب' } },
      { level: 2, goal: 25, tier: 'silver', tokens: 30, xp: 120, title: { en: 'Lateral Silver', ar: 'جانبي فضي' } },
      { level: 3, goal: 45, tier: 'gold', tokens: 60, xp: 250, title: { en: 'Golden Flank', ar: 'خاصرة ذهبية' } },
      { level: 4, goal: 60, tier: 'platinum', tokens: 120, xp: 500, title: { en: 'Platinum Shield', ar: 'درع بلاتيني' } },
      { level: 5, goal: 90, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Apex Oblique', ar: 'قمة الأوبليك' } }
    ]
  },
  'sit-ups': {
    code: 'sit_ups_achievement',
    exerciseName: 'sit-ups',
    category: 'core',
    title: { en: 'Six-Pack Sculptor', ar: 'نحات عضلات البطن' },
    description: { en: 'Dynamic abdominal crunching and hip flexion power.', ar: 'انقباض بطني ديناميكي وقوة عضلات الجذع.' },
    icon: 'Sparkles',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 25, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Abs Awakened', ar: 'استيقاظ البطن' } },
      { level: 2, goal: 50, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Defined Silver', ar: 'تحديد فضي' } },
      { level: 3, goal: 125, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Washboard', ar: 'بطن فولاذي ذهبي' } },
      { level: 4, goal: 250, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Sixpack', ar: 'سداسي بلاتيني' } },
      { level: 5, goal: 500, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Diamond Midsection', ar: 'جذع ألماسي متكامل' } }
    ]
  },
  'knee plank': {
    code: 'knee_plank_achievement',
    exerciseName: 'knee plank',
    category: 'core',
    title: { en: 'Knee Plank Foundation', ar: 'أساس بلانك الركبتين' },
    description: { en: 'Low-impact core endurance.', ar: 'تحمل الجذع الأساسي لحماية الفقرات القطنية.' },
    icon: 'Shield',
    unit: { en: 'mins', ar: 'دقيقة' },
    isTimeBased: true,
    levels: [
      { level: 1, goal: 20, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Rooted Bronze', ar: 'جذور برونزية' } },
      { level: 2, goal: 50, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Steadfast Silver', ar: 'ثبات فضي' } },
      { level: 3, goal: 90, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Patience', ar: 'صبر ذهبي' } },
      { level: 4, goal: 120, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Core', ar: 'جذع بلاتيني' } },
      { level: 5, goal: 180, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Diamond Hold', ar: 'ثبات ألماسي' } }
    ]
  },

  // --- CARDIO & HIIT ---
  'jumping jacks': {
    code: 'jumping_jacks_achievement',
    exerciseName: 'jumping jacks',
    category: 'cardio',
    title: { en: 'Cardio Dynamo', ar: 'دينامو الكارديو' },
    description: { en: 'Full-body cardiovascular aerobic conditioning.', ar: 'لياقة هوائية لكامل الجسم وتسريع حرق الدهون.' },
    icon: 'Zap',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 1000, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Jump', ar: 'قفز برونزي' } },
      { level: 2, goal: 2500, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Rhythm', ar: 'إيقاع فضي' } },
      { level: 3, goal: 6000, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Jack', ar: 'جاك ذهبي' } },
      { level: 4, goal: 8500, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Pulse', ar: 'نبض بلاتيني' } },
      { level: 5, goal: 12000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Infinite Aerobic', ar: 'لياقة لا نهائية' } }
    ]
  },
  'high knees': {
    code: 'high_knees_achievement',
    exerciseName: 'high knees',
    category: 'cardio',
    title: { en: 'Velocity Sprinter', ar: 'عدّاء السرعة القصوى' },
    description: { en: 'Hip flexor drive and rapid foot cadence.', ar: 'رفع الركبتين بقوة وسرعة حركية فائقة.' },
    icon: 'TrendingUp',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 2000, tier: 'bronze', tokens: 10, xp: 50, title: { en: 'Bronze Pace', ar: 'سرعة برونزية' } },
      { level: 2, goal: 5000, tier: 'silver', tokens: 25, xp: 100, title: { en: 'Silver Engine', ar: 'محرك فضي' } },
      { level: 3, goal: 12000, tier: 'gold', tokens: 50, xp: 250, title: { en: 'Golden Drive', ar: 'انطلاقة ذهبية' } },
      { level: 4, goal: 17000, tier: 'platinum', tokens: 100, xp: 500, title: { en: 'Platinum Velocity', ar: 'سرعة بلاتينية' } },
      { level: 5, goal: 24000, tier: 'diamond', tokens: 250, xp: 1000, title: { en: 'Sonic Athlete', ar: 'رياضي صوتي' } }
    ]
  },
  'burpees': {
    code: 'burpees_achievement',
    exerciseName: 'burpees',
    category: 'cardio',
    title: { en: 'The Iron Burpee', ar: 'البيربي الحديدي' },
    description: { en: 'The ultimate athletic full-body grit test.', ar: 'أقوى اختبار متكامل لعزيمة وقوة ولياقة الجسم كله.' },
    icon: 'Trophy',
    unit: { en: 'reps', ar: 'تكرار' },
    isTimeBased: false,
    levels: [
      { level: 1, goal: 38, tier: 'bronze', tokens: 20, xp: 80, title: { en: 'Bronze Grit', ar: 'عزيمة برونزية' } },
      { level: 2, goal: 75, tier: 'silver', tokens: 40, xp: 160, title: { en: 'Silver Grit', ar: 'عزيمة فضية' } },
      { level: 3, goal: 188, tier: 'gold', tokens: 80, xp: 350, title: { en: 'Golden Beast', ar: 'وحش ذهبي' } },
      { level: 4, goal: 375, tier: 'platinum', tokens: 150, xp: 700, title: { en: 'Platinum Titan', ar: 'تيتان بلاتيني' } },
      { level: 5, goal: 750, tier: 'diamond', tokens: 350, xp: 1500, title: { en: 'Burpee God', ar: 'أسطورة البيربي' } }
    ]
  }
};

/**
 * Milestone & Streak Achievement Catalog
 * Automatically calculated from user_stats and workout logs
 */
export const MILESTONE_ACHIEVEMENT_CATALOG = [
  {
    code: 'first_workout',
    category: 'milestones',
    title: { en: 'First Spark', ar: 'الشرارة الأولى' },
    description: { en: 'Complete your very first AI-guided workout.', ar: 'أكمل تمرينك الأول بتوجيه الذكاء الاصطناعي.' },
    icon: 'Sparkles',
    tier: 'bronze',
    target: 1,
    tokens: 20,
    xp: 50,
    check: (stats) => (stats?.total_workouts || stats?.totalWorkouts || 0) >= 1
  },
  {
    code: 'streak_3',
    category: 'milestones',
    title: { en: 'Momentum Ignited', ar: 'انطلاقة العزيمة' },
    description: { en: 'Maintain a 3-day consecutive workout streak.', ar: 'حافظ على سلسلة تمارين متتالية لمدة 3 أيام.' },
    icon: 'Flame',
    tier: 'bronze',
    target: 3,
    tokens: 30,
    xp: 100,
    check: (stats) => Math.max(stats?.current_streak || 0, stats?.longest_streak || 0, stats?.currentStreak || 0) >= 3
  },
  {
    code: 'streak_7',
    category: 'milestones',
    title: { en: 'Iron Habit (7 Days)', ar: 'عادة حديدية (7 أيام)' },
    description: { en: 'Work out 7 days in a row without breaking the chain.', ar: 'تدرّب 7 أيام متتالية دون انقطاع السلسلة.' },
    icon: 'Flame',
    tier: 'silver',
    target: 7,
    tokens: 75,
    xp: 250,
    check: (stats) => Math.max(stats?.current_streak || 0, stats?.longest_streak || 0, stats?.currentStreak || 0) >= 7
  },
  {
    code: 'streak_30',
    category: 'milestones',
    title: { en: 'Unstoppable Legend (30 Days)', ar: 'أسطورة لا تتوقف (30 يوماً)' },
    description: { en: '30 consecutive days of athletic dedication.', ar: '30 يوماً متتالياً من الانضباط الرياضي الكامل.' },
    icon: 'Trophy',
    tier: 'diamond',
    target: 30,
    tokens: 300,
    xp: 1000,
    check: (stats) => Math.max(stats?.current_streak || 0, stats?.longest_streak || 0, stats?.currentStreak || 0) >= 30
  },
  {
    code: 'calories_1000',
    category: 'milestones',
    title: { en: '1,000 Calorie Torch', ar: 'شعلة الـ 1000 سعرة' },
    description: { en: 'Burn a cumulative 1,000 active calories.', ar: 'احرق 1000 سعرة حرارية رياضية تراكمية.' },
    icon: 'Flame',
    tier: 'bronze',
    target: 1000,
    tokens: 25,
    xp: 100,
    check: (stats) => (stats?.total_calories_burned || stats?.totalCaloriesBurned || 0) >= 1000
  },
  {
    code: 'calories_5000',
    category: 'milestones',
    title: { en: '5,000 Calorie Inferno', ar: 'لهيب الـ 5000 سعرة' },
    description: { en: 'Burn a cumulative 5,000 active calories in workouts.', ar: 'احرق 5000 سعرة حرارية تراكمية في تمارينك.' },
    icon: 'Zap',
    tier: 'gold',
    target: 5000,
    tokens: 100,
    xp: 400,
    check: (stats) => (stats?.total_calories_burned || stats?.totalCaloriesBurned || 0) >= 5000
  },
  {
    code: 'calories_10000',
    category: 'milestones',
    title: { en: '10,000 Calorie Titan', ar: 'عملاق الـ 10000 سعرة' },
    description: { en: 'Burn a massive 10,000 active calories.', ar: 'احرق 10,000 سعرة حرارية تراكمية مع ATOS.' },
    icon: 'Award',
    tier: 'diamond',
    target: 10000,
    tokens: 250,
    xp: 1000,
    check: (stats) => (stats?.total_calories_burned || stats?.totalCaloriesBurned || 0) >= 10000
  },
  {
    code: 'workouts_10',
    category: 'milestones',
    title: { en: 'Ten Down', ar: 'عشرة تمارين مكتملة' },
    description: { en: 'Complete 10 full AI workout sessions.', ar: 'أكمل 10 جلسات تدريبية كاملة بنجاح.' },
    icon: 'CheckCircle2',
    tier: 'bronze',
    target: 10,
    tokens: 30,
    xp: 150,
    check: (stats) => (stats?.total_workouts || stats?.totalWorkouts || 0) >= 10
  },
  {
    code: 'workouts_50',
    category: 'milestones',
    title: { en: 'Fifty Strong', ar: 'نادي الخمسين تمريناً' },
    description: { en: 'Log 50 completed workout sessions.', ar: 'سجل 50 جلسة تمرين متكاملة.' },
    icon: 'Medal',
    tier: 'gold',
    target: 50,
    tokens: 150,
    xp: 600,
    check: (stats) => (stats?.total_workouts || stats?.totalWorkouts || 0) >= 50
  },
  {
    code: 'workouts_100',
    category: 'milestones',
    title: { en: 'Century Club (100 Workouts)', ar: 'نادي المئة (100 تمرين)' },
    description: { en: 'Join the legendary Century Club with 100 workouts.', ar: 'انضم لنادي المئة الأسطوري بـ 100 تمرين مكتمل.' },
    icon: 'Trophy',
    tier: 'diamond',
    target: 100,
    tokens: 300,
    xp: 1500,
    check: (stats) => (stats?.total_workouts || stats?.totalWorkouts || 0) >= 100
  }
];

/**
 * Normalizes exercise names to match our catalog keys
 */
export function normalizeExerciseKey(rawName) {
  if (!rawName) return '';
  const s = String(rawName).toLowerCase().trim();
  if (s.includes('wide')) return 'wide push ups';
  if (s.includes('narrow') || s.includes('close')) return 'narrow push ups';
  if (s.includes('diamond')) return 'diamond push ups';
  if (s.includes('knee push') || s.includes('kneepush')) return 'knee push ups';
  if (s.includes('knee plank') || s.includes('kneeplank')) return 'knee plank';
  if (s.includes('side plank') || s.includes('sideplank')) return 'side plank';
  if (s.includes('reverse plank')) return 'reverse plank';
  if (s.includes('straight arm')) return 'straight arm plank';
  if (s.includes('wall sit') || s.includes('wallsit')) return 'wall sit';
  if (s.includes('sit up') || s.includes('situp') || s.includes('sit-up')) return 'sit-ups';
  if (s.includes('jump') || s.includes('jack')) return 'jumping jacks';
  if (s.includes('high knee') || s.includes('highknee')) return 'high knees';
  if (s.includes('burpee')) return 'burpees';
  if (s.includes('squat')) return 'squats';
  if (s.includes('lunge')) return 'lunges';
  if (s.includes('plank')) return 'plank';
  if (s.includes('push')) return 'push-ups';
  return s;
}

/**
 * Calculates current level and target from progress
 */
export function computeLevelAndTarget(levels, progress) {
  let level = 0;
  for (let i = 0; i < levels.length; i++) {
    if (progress >= levels[i].goal) {
      level = levels[i].level;
    } else {
      break;
    }
  }
  const nextTarget = level < levels.length ? levels[level].goal : levels[levels.length - 1].goal;
  const currentGoal = level > 0 ? levels[level - 1].goal : 0;
  return { level, nextTarget, currentGoal };
}

/**
 * Athlete Rank Calculation based on Total XP
 */
export function calculateAthleteRank(totalXp) {
  const XP_PER_LEVEL = 200;
  const currentLevel = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
  const currentLevelXp = (currentLevel - 1) * XP_PER_LEVEL;
  const nextLevelXp = currentLevel * XP_PER_LEVEL;
  const progressInLevel = Math.max(0, totalXp - currentLevelXp);
  const progressPct = Math.min(100, Math.round((progressInLevel / XP_PER_LEVEL) * 100));

  let rankTitle = { en: 'Rookie Mover', ar: 'مبتدئ طموح' };
  let rankTier = 'bronze';

  if (currentLevel >= 18) {
    rankTitle = { en: 'Apex Legend', ar: 'أسطورة القمة' };
    rankTier = 'diamond';
  } else if (currentLevel >= 13) {
    rankTitle = { en: 'Titan Champion', ar: 'بطل التيتان' };
    rankTier = 'platinum';
  } else if (currentLevel >= 8) {
    rankTitle = { en: 'Iron Warrior', ar: 'محارب الحديد' };
    rankTier = 'gold';
  } else if (currentLevel >= 4) {
    rankTitle = { en: 'Dedicated Athlete', ar: 'رياضي مخلص' };
    rankTier = 'silver';
  }

  return {
    level: currentLevel,
    rankTitle,
    rankTier,
    totalXp,
    progressInLevel,
    xpToNextLevel: Math.max(0, nextLevelXp - totalXp),
    progressPct
  };
}

/**
 * Tier Color & Styling helper
 */
export const TIER_THEMES = {
  bronze: {
    name: 'Bronze',
    border: 'border-amber-700/40',
    bg: 'from-amber-950/30 to-amber-900/10',
    text: 'text-amber-500',
    badgeBg: 'bg-amber-500/15',
    glow: 'rgba(217, 119, 6, 0.25)',
    barGradient: 'from-amber-600 to-amber-500'
  },
  silver: {
    name: 'Silver',
    border: 'border-slate-400/40',
    bg: 'from-slate-800/30 to-slate-900/10',
    text: 'text-slate-300',
    badgeBg: 'bg-slate-300/15',
    glow: 'rgba(203, 213, 225, 0.25)',
    barGradient: 'from-slate-400 to-slate-300'
  },
  gold: {
    name: 'Gold',
    border: 'border-amber-400/50',
    bg: 'from-amber-500/15 to-yellow-500/5',
    text: 'text-amber-400',
    badgeBg: 'bg-[#FAA802]/20',
    glow: 'rgba(250, 168, 2, 0.35)',
    barGradient: 'from-[#FAA802] to-[#FBB502]'
  },
  platinum: {
    name: 'Platinum',
    border: 'border-cyan-400/50',
    bg: 'from-cyan-500/15 to-blue-500/5',
    text: 'text-cyan-300',
    badgeBg: 'bg-cyan-400/20',
    glow: 'rgba(56, 189, 248, 0.35)',
    barGradient: 'from-cyan-400 to-blue-500'
  },
  diamond: {
    name: 'Diamond',
    border: 'border-purple-400/50',
    bg: 'from-purple-500/20 to-pink-500/5',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-500/20',
    glow: 'rgba(168, 85, 247, 0.4)',
    barGradient: 'from-purple-400 to-pink-500'
  }
};

/**
 * Reconciles achievements from:
 * 1. Supabase `achievements` table
 * 2. Supabase `exercises` table (historical cumulative sum)
 * 3. Supabase `user_stats` (workouts, streaks, calories)
 * 4. Local storage fallback
 */
export async function loadFullAchievementsData(explicitUserId = null) {
  const sessionUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = explicitUserId || sessionUser?.id || sessionUser?.email || getAccountId();
  const resolvedUid = (await resolveDbUserId(userId).catch(() => null)) || userId;

  console.log('🏆 [achievementsService] Loading achievements for:', { userId, resolvedUid });

  // 1. Fetch Supabase achievements
  let remoteAchievements = [];
  try {
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .or(`user_id.eq.${resolvedUid},user_id.eq.${userId}`);
    remoteAchievements = data || [];
  } catch (e) {
    console.warn('Could not fetch Supabase achievements:', e);
  }

  // 2. Fetch Supabase exercises (historical sums)
  const exerciseSums = {};
  try {
    const { data: exercises } = await supabase
      .from('exercises')
      .select('exercise_name, repetitions, sets, duration_sec')
      .or(`user_id.eq.${resolvedUid},user_id.eq.${userId}`);

    if (Array.isArray(exercises)) {
      for (const ex of exercises) {
        const key = normalizeExerciseKey(ex.exercise_name);
        if (!key) continue;
        const config = EXERCISE_ACHIEVEMENT_CATALOG[key];
        const isTime = config?.isTimeBased ?? false;
        const amount = isTime
          ? Math.round((ex.duration_sec || 0) / 60)
          : (ex.repetitions || 0) * (ex.sets || 1);

        exerciseSums[key] = (exerciseSums[key] || 0) + amount;
      }
    }
  } catch (e) {
    console.warn('Could not aggregate historical exercises:', e);
  }

  // 3. Fetch user_stats (for streaks, calories, workouts)
  let userStats = null;
  try {
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .or(`user_id.eq.${resolvedUid},user_id.eq.${userId}`)
      .maybeSingle();
    userStats = stats;
  } catch (e) {
    console.warn('Could not fetch user_stats:', e);
  }

  // Fallback to localStorage user / fitcoach stats if remote is missing
  if (!userStats) {
    const localStats = JSON.parse(localStorage.getItem('fitcoach_workout_stats') || '{}');
    userStats = {
      total_workouts: localStats.totalWorkouts || sessionUser.totalWorkouts || 0,
      total_calories_burned: localStats.totalCalories || sessionUser.totalCaloriesBurned || 0,
      current_streak: localStats.currentStreak || sessionUser.currentStreak || 0,
      longest_streak: localStats.longestStreak || sessionUser.longestStreak || 0
    };
  }

  // Build the unified list of all Exercise Achievements
  const remoteMap = new Map();
  remoteAchievements.forEach(a => {
    if (a.achievement_code) remoteMap.set(a.achievement_code, a);
  });

  const achievementsList = [];
  let totalXpEarned = 0;
  let totalTokensEarned = 0;
  let unlockedBadgeCount = 0;
  const updatesToSync = [];

  // --- Process Exercises ---
  for (const [key, config] of Object.entries(EXERCISE_ACHIEVEMENT_CATALOG)) {
    const remote = remoteMap.get(config.code);
    const dbSum = exerciseSums[key] || 0;
    const recordedProgress = remote?.progress || 0;
    // Reconcile: use whichever is higher
    const trueProgress = Math.max(dbSum, recordedProgress);

    const { level, nextTarget, currentGoal } = computeLevelAndTarget(config.levels, trueProgress);
    const isMax = level >= config.levels.length;
    const isUnlocked = level > 0;

    if (isUnlocked) unlockedBadgeCount += 1;

    // Accumulate XP and Tokens from achieved levels
    let itemXp = 0;
    let itemTokens = 0;
    for (let i = 0; i < level; i++) {
      itemXp += config.levels[i].xp;
      itemTokens += config.levels[i].tokens;
    }
    totalXpEarned += itemXp;
    totalTokensEarned += itemTokens;

    // Calculate progress percentage for current level
    let percent = 0;
    if (isMax) {
      percent = 100;
    } else {
      const prevGoal = currentGoal;
      const targetSpan = nextTarget - prevGoal;
      const progressInSpan = Math.max(0, trueProgress - prevGoal);
      percent = targetSpan > 0 ? Math.min(100, Math.round((progressInSpan / targetSpan) * 100)) : 0;
    }

    const currentTier = level > 0 ? config.levels[level - 1].tier : 'bronze';
    const nextTier = !isMax ? config.levels[level].tier : 'diamond';

    const item = {
      id: config.code,
      code: config.code,
      exerciseKey: key,
      category: config.category,
      title: config.title,
      description: config.description,
      icon: config.icon,
      unit: config.unit,
      isTimeBased: config.isTimeBased,
      progress: trueProgress,
      level,
      maxLevel: config.levels.length,
      nextTarget,
      currentGoal,
      percent,
      isUnlocked,
      isMax,
      currentTier,
      nextTier,
      tokensEarned: itemTokens,
      xpEarned: itemXp,
      levels: config.levels,
      dateEarned: remote?.date_earned || null
    };

    achievementsList.push(item);

    // If local/exercise log is ahead of the achievements table, prepare sync update
    if (trueProgress > recordedProgress || level !== remote?.level) {
      updatesToSync.push({
        user_id: resolvedUid,
        achievement_code: config.code,
        achievement_name: config.title.en,
        description: config.description.en,
        progress: trueProgress,
        level,
        target: nextTarget,
        tokens_earned: itemTokens,
        date_earned: new Date().toISOString()
      });
    }
  }

  // --- Process Milestones ---
  for (const m of MILESTONE_ACHIEVEMENT_CATALOG) {
    const remote = remoteMap.get(m.code);
    const achieved = m.check(userStats);
    const isUnlocked = Boolean(achieved || remote?.progress >= m.target);
    const currentProgress = achieved ? m.target : (remote?.progress || 0);

    if (isUnlocked) {
      unlockedBadgeCount += 1;
      totalXpEarned += m.xp;
      totalTokensEarned += m.tokens;
    }

    const percent = Math.min(100, Math.round((currentProgress / m.target) * 100));

    achievementsList.push({
      id: m.code,
      code: m.code,
      category: m.category,
      title: m.title,
      description: m.description,
      icon: m.icon,
      unit: { en: 'pts', ar: 'نقطة' },
      isTimeBased: false,
      progress: currentProgress,
      level: isUnlocked ? 1 : 0,
      maxLevel: 1,
      nextTarget: m.target,
      currentGoal: 0,
      percent,
      isUnlocked,
      isMax: isUnlocked,
      currentTier: m.tier,
      nextTier: m.tier,
      tokensEarned: isUnlocked ? m.tokens : 0,
      xpEarned: isUnlocked ? m.xp : 0,
      levels: [{ level: 1, goal: m.target, tier: m.tier, tokens: m.tokens, xp: m.xp, title: m.title }],
      dateEarned: remote?.date_earned || (isUnlocked ? new Date().toISOString() : null)
    });

    if (achieved && (!remote || remote.progress < m.target)) {
      updatesToSync.push({
        user_id: resolvedUid,
        achievement_code: m.code,
        achievement_name: m.title.en,
        description: m.description.en,
        progress: m.target,
        level: 1,
        target: m.target,
        tokens_earned: m.tokens,
        date_earned: new Date().toISOString()
      });
    }
  }

  // 4. Background auto-heal sync to Supabase
  if (updatesToSync.length > 0 && resolvedUid) {
    (async () => {
      try {
        console.log(`⚡ [achievementsService] Auto-syncing ${updatesToSync.length} achievements to Supabase...`);
        for (const item of updatesToSync) {
          await supabase.from('achievements').upsert(item, { onConflict: 'user_id,achievement_code' });
        }
      } catch (err) {
        console.warn('Non-blocking achievement auto-sync failed:', err);
      }
    })();
  }

  // 5. Athlete Stats & Rank
  const athleteStats = calculateAthleteRank(totalXpEarned);
  const overallProgressPct = Math.min(100, Math.round((unlockedBadgeCount / achievementsList.length) * 100));

  const result = {
    userId: resolvedUid,
    achievements: achievementsList,
    stats: {
      ...athleteStats,
      unlockedCount: unlockedBadgeCount,
      totalBadges: achievementsList.length,
      overallProgressPct,
      totalTokens: totalTokensEarned,
      totalWorkouts: userStats?.total_workouts || 0,
      currentStreak: userStats?.current_streak || 0,
      longestStreak: userStats?.longest_streak || 0,
      totalCalories: userStats?.total_calories_burned || 0
    }
  };

  // Cache locally
  try {
    localStorage.setItem(`atos_account:${getAccountId(resolvedUid)}:achievements_cache`, JSON.stringify(result));
  } catch {}

  return result;
}

/**
 * Subscribes to achievement updates (e.g. after workouts or food log updates)
 */
export function subscribeToAchievements(callback) {
  const handler = () => callback();
  window.addEventListener(ACHIEVEMENTS_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(ACHIEVEMENTS_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * Emits an event indicating achievements have updated
 */
export function emitAchievementsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACHIEVEMENTS_UPDATED_EVENT));
  }
}

