import { getAccountId } from './localAccountStorage.js';
import { exerciseData } from './exerciseData.js';
import { DASHBOARD_DATA_UPDATED, emitDashboardDataUpdated } from './dashboardStatsService.js';

export const TRAINING_MESOCYCLE_PREFIX = 'atos_training_mesocycle:';
export const LEGACY_TODAY_PLAN_KEY = 'fitcoach_today_plan';

// ─────────────────────────────────────────────────────────────────────────────
// EXERCISE CATALOG with scientific metadata
// ─────────────────────────────────────────────────────────────────────────────
export const EXERCISE_CATALOG = [
  {
    id: 'pushups',
    name: 'Push-ups',
    nameAr: 'تمرين الضغط',
    category: 'Chest',
    categoryAr: 'صدر وذراعين',
    targetMuscles: ['Chest', 'Arms', 'Core'],
    targetMusclesAr: ['الصدر', 'الذراعين', 'الكور'],
    difficulty: 'beginner',
    isTimeBased: false,
    defaultReps: 10,
    defaultSets: 3,
    restSec: 60,
    caloriesPerRep: 0.65,
    focusTags: ['chest', 'biceps', 'shoulders', 'fullbody'],
    coachTip: 'Keep your elbows tucked at a 45-degree angle to protect your shoulders.',
    coachTipAr: 'حافظ على زاوية كوعك عند 45 درجة لحماية مفاصل الكتف وضمان عزل عضلة الصدر.'
  },
  {
    id: 'wide_pushups',
    name: 'Wide Push Ups',
    nameAr: 'ضغط واسع',
    category: 'Chest',
    categoryAr: 'عزل الصدر الخارجي',
    targetMuscles: ['Chest', 'Shoulders'],
    targetMusclesAr: ['الصدر الخارجي', 'الكتف الأمامي'],
    difficulty: 'intermediate',
    isTimeBased: false,
    defaultReps: 10,
    defaultSets: 3,
    restSec: 60,
    caloriesPerRep: 0.7,
    focusTags: ['chest', 'shoulders'],
    coachTip: 'Place hands 1.5x shoulder width. Feel the stretch at the bottom.',
    coachTipAr: 'ضع يديك أوسع من مستوى الكتفين بمرة ونصف واشعر بالتمدد الكامل في نهاية الحركة.'
  },
  {
    id: 'knee_pushups',
    name: 'Knee Push Ups',
    nameAr: 'ضغط على الركبتين',
    category: 'Chest',
    categoryAr: 'صدر تأسيسي',
    targetMuscles: ['Chest', 'Core'],
    targetMusclesAr: ['الصدر', 'الكور'],
    difficulty: 'beginner',
    isTimeBased: false,
    defaultReps: 12,
    defaultSets: 3,
    restSec: 45,
    caloriesPerRep: 0.45,
    focusTags: ['chest', 'fullbody'],
    coachTip: 'Lock your core and maintain a straight line from knees to head.',
    coachTipAr: 'ثبّت عضلات بطنك وحافظ على استقامة ظهرك من الركبة إلى الرأس.'
  },
  {
    id: 'squats',
    name: 'Squats',
    nameAr: 'تمرين القرفصاء (سكوات)',
    category: 'Legs',
    categoryAr: 'أرجل وأرداف',
    targetMuscles: ['Legs', 'Glutes', 'Core'],
    targetMusclesAr: ['الأرجل', 'الأرداف', 'الكور'],
    difficulty: 'beginner',
    isTimeBased: false,
    defaultReps: 12,
    defaultSets: 3,
    restSec: 60,
    caloriesPerRep: 0.8,
    focusTags: ['legs', 'glutes', 'fullbody'],
    coachTip: 'Drive through your mid-foot and heels; push knees slightly outward.',
    coachTipAr: 'ادفع من منتصف وباطن القدم ووجّه ركبتيك للخارج قليلاً في اتجاه أطراف الأصابع.'
  },
  {
    id: 'jump_squats',
    name: 'Jump Squats',
    nameAr: 'سكوات مع القفز',
    category: 'Legs',
    categoryAr: 'قوة انفجارية للأرجل',
    targetMuscles: ['Legs', 'Glutes', 'Core'],
    targetMusclesAr: ['الأرجل', 'الأرداف', 'الكور'],
    difficulty: 'intermediate',
    isTimeBased: false,
    defaultReps: 10,
    defaultSets: 3,
    restSec: 60,
    caloriesPerRep: 1.2,
    focusTags: ['legs', 'glutes', 'fullbody'],
    coachTip: 'Land softly on the balls of your feet and transition smoothly into the next squat.',
    coachTipAr: 'اهبط بنعومة على مشط القدم لامتصاص الصدمة وحماية الركبتين قبل الانطلاق مجدداً.'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    nameAr: 'تمرين الاندفاع (لونجز)',
    category: 'Legs',
    categoryAr: 'أرجل وتوازن',
    targetMuscles: ['Legs', 'Glutes'],
    targetMusclesAr: ['الأرجل الأمامية والخلفية', 'الأرداف'],
    difficulty: 'intermediate',
    isTimeBased: false,
    defaultReps: 10,
    defaultSets: 3,
    restSec: 60,
    caloriesPerRep: 0.75,
    focusTags: ['legs', 'glutes'],
    coachTip: 'Keep your torso upright and ensure your front knee does not collapse inward.',
    coachTipAr: 'حافظ على استقامة جذعك وتأكد من أن الركبة الأمامية لا تميل للداخل أثناء النزول.'
  },
  {
    id: 'wall_sit',
    name: 'Wall Sit',
    nameAr: 'تثبيت الحائط (وول سيت)',
    category: 'Legs',
    categoryAr: 'تحمل عضلات الأرجل',
    targetMuscles: ['Legs', 'Core'],
    targetMusclesAr: ['الفخذ الرباعي', 'الكور'],
    difficulty: 'beginner',
    isTimeBased: true,
    defaultReps: 30, // seconds
    defaultSets: 3,
    restSec: 45,
    caloriesPerSecond: 0.12,
    focusTags: ['legs', 'core'],
    coachTip: 'Maintain thighs parallel to the ground with back flat against the wall.',
    coachTipAr: 'ثبّت فخذيك بزاوية 90 درجة موازية للأرض مع إسناد ظهرك بالكامل على الحائط.'
  },
  {
    id: 'plank',
    name: 'Plank',
    nameAr: 'تمرين البلانك الثابت',
    category: 'Core',
    categoryAr: 'استقرار الكور',
    targetMuscles: ['Core', 'Shoulders'],
    targetMusclesAr: ['عضلات البطن العميقة', 'الأكتاف'],
    difficulty: 'beginner',
    isTimeBased: true,
    defaultReps: 35, // seconds
    defaultSets: 3,
    restSec: 45,
    caloriesPerSecond: 0.10,
    focusTags: ['core', 'back', 'fullbody'],
    coachTip: 'Squeeze your glutes and pull your navel inward to brace your spine.',
    coachTipAr: 'اقبض عضلات الأرداف واسحب سرتك للداخل لتثبيت العمود الفقري ومنع تقوس أسفل الظهر.'
  },
  {
    id: 'side_plank',
    name: 'Side Plank',
    nameAr: 'بلانك جانبي',
    category: 'Core',
    categoryAr: 'عضلات الخواصر (Obliques)',
    targetMuscles: ['Core', 'Obliques'],
    targetMusclesAr: ['الخواصر', 'الكور الجانبي'],
    difficulty: 'intermediate',
    isTimeBased: true,
    defaultReps: 25, // seconds
    defaultSets: 3,
    restSec: 45,
    caloriesPerSecond: 0.11,
    focusTags: ['core'],
    coachTip: 'Lift your hips high so your body forms a clean straight diagonal line.',
    coachTipAr: 'ارفع حوضك لأعلى لتشكيل خط مستقيم مائل وثابت وتنشيط الخواصر.'
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    nameAr: 'متسلق الجبال',
    category: 'Cardio & Core',
    categoryAr: 'كارديو وكور مكثف',
    targetMuscles: ['Core', 'Shoulders', 'Cardio'],
    targetMusclesAr: ['عضلات البطن', 'الكتفين', 'اللياقة الهوائية'],
    difficulty: 'beginner',
    isTimeBased: false,
    defaultReps: 20,
    defaultSets: 3,
    restSec: 45,
    caloriesPerRep: 0.5,
    focusTags: ['core', 'fullbody'],
    coachTip: 'Maintain steady hips without bouncing high; drive knees toward your chest.',
    coachTipAr: 'حافظ على ثبات الحوض دون رفعه عالياً، واسحب الركبتين بسرعة وثبات نحو الصدر.'
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    nameAr: 'القفز بالذراعين (جامبينج جاكس)',
    category: 'Cardio',
    categoryAr: 'كارديو وحرق دهون',
    targetMuscles: ['Full Body', 'Cardio'],
    targetMusclesAr: ['كامل الجسم', 'اللياقة القلبية'],
    difficulty: 'beginner',
    isTimeBased: false,
    defaultReps: 30,
    defaultSets: 3,
    restSec: 30,
    caloriesPerRep: 0.35,
    focusTags: ['fullbody'],
    coachTip: 'Keep rhythm light on your toes and coordinate arm and leg extensions.',
    coachTipAr: 'تحرك بخفة على مشط القدم وتزامن في فتح وإغلاق الذراعين والساقين.'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    nameAr: 'تمرين البيربي الشامل',
    category: 'Full Body',
    categoryAr: 'قوة وتحمل فائق',
    targetMuscles: ['Full Body', 'Cardio', 'Chest'],
    targetMusclesAr: ['كامل الجسم', 'الصدر', 'القلب والرئتين'],
    difficulty: 'advanced',
    isTimeBased: false,
    defaultReps: 8,
    defaultSets: 3,
    restSec: 60,
    caloriesPerRep: 1.5,
    focusTags: ['fullbody', 'chest', 'legs'],
    coachTip: 'Pace yourself consistently; kick back into a tight plank before jumping up.',
    coachTipAr: 'وزّع جهدك بذكاء؛ اثبت في وضعية بلانك محكمة قبل القفز للأعلى بكل طاقتك.'
  },
  {
    id: 'high_knees',
    name: 'High Knees',
    nameAr: 'الجري الموضعي بركبتين عاليتين',
    category: 'Cardio',
    categoryAr: 'كارديو وحرق سعرات',
    targetMuscles: ['Legs', 'Cardio', 'Core'],
    targetMusclesAr: ['الأرجل', 'القلب والأوعية', 'أسفل البطن'],
    difficulty: 'beginner',
    isTimeBased: false,
    defaultReps: 25,
    defaultSets: 3,
    restSec: 30,
    caloriesPerRep: 0.4,
    focusTags: ['fullbody', 'legs'],
    coachTip: 'Drive knees up to hip height while pumping your arms with rapid cadence.',
    coachTipAr: 'ارفع ركبتيك لمستوى الحوض مع تحريك الذراعين بإيقاع سريع لرفع معدل الحرق.'
  }
];

// Helper to look up catalog item
export const findCatalogExercise = (nameOrId) => {
  if (!nameOrId) return EXERCISE_CATALOG[0];
  const query = String(nameOrId).toLowerCase().replace(/[^a-z0-9]+/g, '');
  return EXERCISE_CATALOG.find(ex => {
    const idMatch = ex.id.replace(/[^a-z0-9]+/g, '') === query;
    const nameMatch = ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === query;
    return idMatch || nameMatch;
  }) || EXERCISE_CATALOG[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// 4-WEEK MESOCYCLE PERIODIZATION RULES (Renaissance Periodization Principles)
// ─────────────────────────────────────────────────────────────────────────────
export const MESOCYCLE_WEEKS = [
  {
    weekNumber: 1,
    phase: 'MEV Baseline',
    phaseAr: 'التأسيس والتكنيك (MEV)',
    rpe: 'RPE 7 (3 RIR)',
    description: 'Establish movement baseline and joint adaptation. Minimum Effective Volume.',
    descriptionAr: 'بناء التكنيك الصحيح وتهيئة الأوتار والمفاصل بالحد الأدنى الفعال.',
    setMultiplier: 1.0,
    repMultiplier: 1.0,
    restMultiplier: 1.0,
    coachFocus: 'Master pristine movement form and controlled cadence. Do not train to failure.',
    coachFocusAr: 'ركز على ثبات التكنيك والتحكم في النزول والصعود، دون الوصول للإجهاد التام.'
  },
  {
    weekNumber: 2,
    phase: 'Progressive Overload I',
    phaseAr: 'الزيادة التدريجية الأولى',
    rpe: 'RPE 8 (2 RIR)',
    description: 'Add volume and metabolic tension (+10-15% reps/duration).',
    descriptionAr: 'زيادة تدريجية في العدات والوقت لكسر ثبات الجسم وزيادة كفاءة الحرق.',
    setMultiplier: 1.0,
    repMultiplier: 1.15,
    restMultiplier: 0.95,
    coachFocus: 'Push 1-2 reps closer to the fatigue threshold while maintaining identical form.',
    coachFocusAr: 'اقترب من عتبة التعب بزيادة تكرار إلى تكرارين مع الحفاظ على نفس جودة الأداء.'
  },
  {
    weekNumber: 3,
    phase: 'Peak Volume (MAV)',
    phaseAr: 'ذروة الحجم التدريبي (MAV)',
    rpe: 'RPE 9 (1 RIR)',
    description: 'Maximum Adaptive Volume. Peak caloric burn and hypertrophic stimulus.',
    descriptionAr: 'أعلى كثافة تدريبية وأقصى معدل لحرق السعرات وتحفيز التكيف العضلي.',
    setMultiplier: 1.25,
    repMultiplier: 1.25,
    restMultiplier: 0.85,
    coachFocus: 'Peak training week. High metabolic density with shorter rest intervals.',
    coachFocusAr: 'أقوى أسبوع في الدورة؛ كثافة عالية وفترات راحة محسوبة لاختبار تحملك.'
  },
  {
    weekNumber: 4,
    phase: 'Deload & Recovery',
    phaseAr: 'الاستشفاء النشط (Deload)',
    rpe: 'RPE 6 (4+ RIR)',
    description: '50% volume reduction. Neural recovery, joint consolidation, and supercompensation.',
    descriptionAr: 'خفض الحمل التدريبي بنسبة 50% لتعافي الجهاز العصبي والأربطة وتثبيت النتائج.',
    setMultiplier: 0.65,
    repMultiplier: 0.75,
    restMultiplier: 1.2,
    coachFocus: 'Active recovery and mobility. Allows muscles to rebuild stronger for the next cycle.',
    coachFocusAr: 'استشفاء نشط وحركة مفاصل. يمنح عضلاتك فرصة البناء والنمو تمهيداً للدورة التالية.'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT GENERATOR BASED ON FITNESS LEVEL & GOALS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns training frequency and day templates based on user level and physique goal.
 */
export const determineSplitStrategy = (userProfile = {}) => {
  const level = String(userProfile.fitnessLevel || 'intermediate').toLowerCase();
  const physique = String(userProfile.physique || userProfile.primaryGoal || 'muscular').toLowerCase();
  const focusAreas = Array.isArray(userProfile.focusAreas) ? userProfile.focusAreas.map(f => String(f).toLowerCase()) : [];

  // Determine training days per week
  let trainingDaysPerWeek = 4;
  if (level === 'beginner') trainingDaysPerWeek = 3;
  else if (level === 'advanced') trainingDaysPerWeek = 5;

  const daySchedules = {
    3: [true, false, true, false, true, false, false],
    4: [true, true, false, true, true, false, false],
    5: [true, true, true, false, true, true, false]
  };

  const scheduleMask = daySchedules[trainingDaysPerWeek] || daySchedules[4];

  // Define workout themes based on goal
  let themes = [];
  if (physique.includes('lean') || physique.includes('loss') || physique.includes('fat')) {
    // Metabolic Density & Fat Burn
    themes = [
      {
        title: 'Full Body Metabolic Primer',
        titleAr: 'تنشيط الأيض وحرق دهون لكامل الجسم',
        categories: ['Full Body', 'Cardio & Core', 'Legs'],
        preferredTags: ['fullbody', 'legs', 'core']
      },
      {
        title: 'Upper Sculpt & High-Cadence Core',
        titleAr: 'نحت الجزء العلوي وكور عالي الشدة',
        categories: ['Chest', 'Core', 'Cardio'],
        preferredTags: ['chest', 'core', 'biceps', 'shoulders']
      },
      {
        title: 'Lower Body Burn & Cardio Finisher',
        titleAr: 'حرق دهون الأرجل وكارديو نهائي',
        categories: ['Legs', 'Cardio', 'Core & Stability'],
        preferredTags: ['legs', 'glutes', 'fullbody']
      },
      {
        title: 'HIIT Conditioning & Caloric Density',
        titleAr: 'تحمل هوائي مكثف وحرق سعرات مضاعف',
        categories: ['Cardio', 'Full Body', 'Core'],
        preferredTags: ['fullbody', 'core']
      },
      {
        title: 'Core Stability & Athletic Flow',
        titleAr: 'ثبات الجذع ورشاقة حركية شاملة',
        categories: ['Core', 'Legs', 'Full Body'],
        preferredTags: ['core', 'legs']
      }
    ];
  } else {
    // Muscle Hypertrophy & Strength (Default / Muscular / Ripped)
    const upperTitle = focusAreas.includes('chest') ? 'Chest Hypertrophy & Arms Focus' : 'Upper Body Power & Push Mechanics';
    const upperTitleAr = focusAreas.includes('chest') ? 'تضخيم عضلة الصدر والذراعين' : 'قوة الجزء العلوي والضغط الحركي';

    themes = [
      {
        title: upperTitle,
        titleAr: upperTitleAr,
        categories: ['Chest', 'Core', 'Arms'],
        preferredTags: ['chest', 'shoulders', 'biceps', 'core']
      },
      {
        title: 'Quad & Glute Strength Foundation',
        titleAr: 'قوة وتحديد عضلات الفخذ والأرداف',
        categories: ['Legs', 'Legs Endurance', 'Core'],
        preferredTags: ['legs', 'glutes']
      },
      {
        title: 'Torso Armor & Deep Core Stability',
        titleAr: 'استقرار الكور وعضلات البطن العميقة',
        categories: ['Core', 'Cardio & Core', 'Chest'],
        preferredTags: ['core', 'back', 'fullbody']
      },
      {
        title: 'Compound Full Body Supercompensation',
        titleAr: 'تمرين مركب لكامل الجسم وبناء القوة',
        categories: ['Full Body', 'Legs', 'Chest'],
        preferredTags: ['fullbody', 'legs', 'chest']
      },
      {
        title: 'Hypertrophy Density & Metabolic Finisher',
        titleAr: 'كثافة عضلية عالية وتمرين ختامي',
        categories: ['Chest', 'Legs', 'Core'],
        preferredTags: ['chest', 'legs', 'core']
      }
    ];
  }

  return {
    trainingDaysPerWeek,
    scheduleMask,
    themes,
    physique,
    level,
    focusAreas
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT BUILDER FOR A SPECIFIC DAY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Selects 3-4 complementary exercises for a given session based on theme, user level, and week progression.
 */
export const buildSessionExercises = ({ theme, weekMeta, userProfile }) => {
  const level = String(userProfile.fitnessLevel || 'intermediate').toLowerCase();
  const preferredTags = theme.preferredTags || ['fullbody'];

  // Filter out exercises that exceed user difficulty
  const eligible = EXERCISE_CATALOG.filter(ex => {
    if (level === 'beginner' && ex.difficulty === 'advanced') return false;
    return true;
  });

  // Score exercises based on tag overlap
  const scored = eligible.map(ex => {
    let score = 0;
    ex.focusTags.forEach(tag => {
      if (preferredTags.includes(tag)) score += 3;
    });
    const userFocus = Array.isArray(userProfile.focusAreas) ? userProfile.focusAreas : [];
    userFocus.forEach(f => {
      if (ex.focusTags.includes(String(f).toLowerCase())) score += 2;
    });
    return { exercise: ex, score };
  }).sort((a, b) => b.score - a.score);

  const selected = [];
  const chosenCategories = new Set();
  const targetCount = level === 'beginner' ? 3 : 4;

  for (const item of scored) {
    if (selected.length >= targetCount) break;
    if (!chosenCategories.has(item.exercise.category) || selected.length < 2) {
      selected.push(item.exercise);
      chosenCategories.add(item.exercise.category);
    }
  }

  for (const item of scored) {
    if (selected.length >= targetCount) break;
    if (!selected.includes(item.exercise)) {
      selected.push(item.exercise);
    }
  }

  return selected.map((ex, idx) => {
    let sets = Math.max(1, Math.round(ex.defaultSets * weekMeta.setMultiplier));
    let reps = ex.defaultReps;
    let durationSec = null;

    if (ex.isTimeBased) {
      durationSec = Math.max(15, Math.round(ex.defaultReps * weekMeta.repMultiplier));
      reps = durationSec;
    } else {
      reps = Math.max(5, Math.round(ex.defaultReps * weekMeta.repMultiplier));
    }

    const restSec = Math.max(20, Math.round(ex.restSec * weekMeta.restMultiplier));

    const singleSetKcal = ex.isTimeBased
      ? (durationSec * (ex.caloriesPerSecond || 0.1))
      : (reps * (ex.caloriesPerRep || 0.7));
    const totalExerciseKcal = Math.round(singleSetKcal * sets);

    return {
      order: idx + 1,
      id: ex.id,
      name: ex.name,
      nameAr: ex.nameAr,
      category: ex.category,
      categoryAr: ex.categoryAr,
      targetMuscles: ex.targetMuscles,
      targetMusclesAr: ex.targetMusclesAr,
      isTimeBased: ex.isTimeBased,
      sets,
      reps,
      durationSec,
      restSec,
      estimatedCalories: totalExerciseKcal,
      coachTip: ex.coachTip,
      coachTipAr: ex.coachTipAr,
      completed: false
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE 28-DAY MESOCYCLE PLAN
// ─────────────────────────────────────────────────────────────────────────────

export const generateMonthlyMesocycle = (userProfile = {}, startDateInput = null) => {
  const startDate = startDateInput ? new Date(startDateInput) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const strategy = determineSplitStrategy(userProfile);
  const days = [];
  let trainingDayCounter = 0;

  for (let dayIdx = 0; dayIdx < 28; dayIdx++) {
    const currentDayDate = new Date(startDate.getTime() + dayIdx * 24 * 60 * 60 * 1000);
    const dateKey = currentDayDate.toISOString().slice(0, 10);
    const weekIdx = Math.floor(dayIdx / 7); // 0, 1, 2, 3
    const weekMeta = MESOCYCLE_WEEKS[weekIdx];
    const dayOfWeek = dayIdx % 7; // 0 to 6
    const isTrainingDay = strategy.scheduleMask[dayOfWeek];

    if (isTrainingDay) {
      const themeIdx = trainingDayCounter % strategy.themes.length;
      const theme = strategy.themes[themeIdx];
      trainingDayCounter++;

      const exercises = buildSessionExercises({ theme, weekMeta, userProfile });
      const totalCalories = exercises.reduce((acc, ex) => acc + ex.estimatedCalories, 0);
      const estimatedDurationMin = Math.round(
        exercises.reduce((acc, ex) => acc + (ex.sets * ((ex.durationSec || (ex.reps * 3)) + ex.restSec)), 0) / 60
      );

      days.push({
        dayIndex: dayIdx + 1,
        weekNumber: weekIdx + 1,
        dayOfWeek: dayOfWeek + 1,
        date: dateKey,
        isRestDay: false,
        phase: weekMeta.phase,
        phaseAr: weekMeta.phaseAr,
        rpe: weekMeta.rpe,
        title: `${theme.title} (${weekMeta.phase})`,
        titleAr: `${theme.titleAr} (${weekMeta.phaseAr})`,
        coachTip: weekMeta.coachFocus,
        coachTipAr: weekMeta.coachFocusAr,
        targetMuscles: Array.from(new Set(exercises.flatMap(e => e.targetMuscles))),
        targetMusclesAr: Array.from(new Set(exercises.flatMap(e => e.targetMusclesAr))),
        estimatedDurationMin: Math.max(15, estimatedDurationMin),
        estimatedCalories: totalCalories,
        exercises,
        completed: false,
        completedAt: null
      });
    } else {
      // Rest / Active Recovery Day
      days.push({
        dayIndex: dayIdx + 1,
        weekNumber: weekIdx + 1,
        dayOfWeek: dayOfWeek + 1,
        date: dateKey,
        isRestDay: true,
        phase: weekMeta.phase,
        phaseAr: weekMeta.phaseAr,
        rpe: 'Rest & Mobility',
        title: 'Active Recovery & Joint Restoration',
        titleAr: 'استشفاء نشط وحركة مفاصل',
        coachTip: 'Drink at least 2.5L water today and prioritize 8 hours of sleep to support protein synthesis.',
        coachTipAr: 'اشرب ما لا يقل عن 2.5 لتر ماء واحرص على النوم الكافي لتسريع الاستشفاء العضلي وتجديد الجاهزية.',
        targetMuscles: ['Full Body Recovery'],
        targetMusclesAr: ['استشفاء كامل الجسم'],
        estimatedDurationMin: 15,
        estimatedCalories: 45,
        exercises: [
          {
            order: 1,
            id: 'mobility_stretch',
            name: 'Light Mobility & Deep Breathing',
            nameAr: 'إطالات خفيفة وتنفس عميق',
            category: 'Recovery',
            categoryAr: 'استشفاء',
            targetMuscles: ['Full Body'],
            targetMusclesAr: ['كامل الجسم'],
            isTimeBased: true,
            sets: 1,
            reps: 600,
            durationSec: 600,
            restSec: 0,
            estimatedCalories: 45,
            coachTip: 'Gentle stretching to release tension in hamstrings and thoracic spine.',
            coachTipAr: 'إطالات هادئة لفك التصلب العضلي وتوسيع مدى حركة الحوض والعمود الفقري.',
            completed: false
          }
        ],
        completed: false,
        completedAt: null
      });
    }
  }

  const planId = `mesocycle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const totalTrainingSessions = days.filter(d => !d.isRestDay).length;
  const totalEstimatedCalories = days.reduce((acc, d) => acc + d.estimatedCalories, 0);

  return {
    id: planId,
    createdAt: new Date().toISOString(),
    startDate: startDate.toISOString().slice(0, 10),
    userMetrics: {
      fitnessLevel: strategy.level,
      physique: strategy.physique,
      trainingDaysPerWeek: strategy.trainingDaysPerWeek,
      focusAreas: strategy.focusAreas
    },
    summary: {
      totalWeeks: 4,
      totalDays: 28,
      totalWorkouts: totalTrainingSessions,
      totalRestDays: 28 - totalTrainingSessions,
      totalCalorieCapacity: totalEstimatedCalories
    },
    days
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSISTENCE & STORAGE ACCESS
// ─────────────────────────────────────────────────────────────────────────────

export const getPlanStorageKey = (userId = null) => {
  return `${TRAINING_MESOCYCLE_PREFIX}${getAccountId(userId)}`;
};

/**
 * Loads the user's current 4-week mesocycle plan from localStorage.
 * If none exists, generates a new one automatically based on user profile!
 */
export const getUserTrainingPlan = (userId = null, userProfile = null) => {
  const accountId = getAccountId(userId);
  const storageKey = getPlanStorageKey(accountId);

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 28) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading training plan:', error);
  }

  // No valid plan found -> generate fresh plan based on user profile
  const profile = userProfile || (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const newPlan = generateMonthlyMesocycle(profile);
  saveUserTrainingPlan(accountId, newPlan);
  return newPlan;
};

/**
 * Saves a training plan to localStorage and syncs with today plan key for backward compatibility.
 */
export const saveUserTrainingPlan = (userId, plan) => {
  const accountId = getAccountId(userId);
  const storageKey = getPlanStorageKey(accountId);

  try {
    localStorage.setItem(storageKey, JSON.stringify(plan));
    // Also sync today's scheduled workout to legacy key
    syncLegacyTodayPlan(plan);
    emitDashboardDataUpdated({ type: 'TRAINING_PLAN_SAVED', planId: plan?.id });
    return plan;
  } catch (error) {
    console.error('Error saving training plan:', error);
    return null;
  }
};

/**
 * Finds the scheduled workout for a given date in the 4-week plan.
 */
export const getTodayScheduledWorkout = (plan, targetDate = new Date()) => {
  if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) return null;

  const dateStr = targetDate instanceof Date
    ? targetDate.toISOString().slice(0, 10)
    : String(targetDate).slice(0, 10);

  // 1. Direct match by date string
  const matched = plan.days.find(d => d.date === dateStr);
  if (matched) return matched;

  // 2. Relative offset from startDate
  if (plan.startDate) {
    const start = new Date(plan.startDate);
    const target = new Date(dateStr);
    const diffDays = Math.floor((target.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays >= 0 && diffDays < 28) {
      return plan.days[diffDays];
    }
  }

  // 3. Fallback: first incomplete day or first day
  return plan.days.find(d => !d.completed) || plan.days[0];
};

/**
 * Helper to sync today's scheduled workout to the legacy `fitcoach_today_plan` storage key.
 */
export const syncLegacyTodayPlan = (plan, date = new Date()) => {
  const todayWorkout = getTodayScheduledWorkout(plan, date);
  if (!todayWorkout) return;

  const legacyPlan = {
    id: `plan_${todayWorkout.dayIndex}`,
    name: todayWorkout.title,
    phase: todayWorkout.phase,
    isRestDay: todayWorkout.isRestDay,
    exercises: (todayWorkout.exercises || []).map(ex => ({
      name: ex.name,
      nameAr: ex.nameAr,
      category: ex.category,
      difficulty: todayWorkout.phase,
      duration: ex.durationSec ? `${Math.round(ex.durationSec / 60)} min` : `${ex.sets} sets`,
      sets: ex.sets,
      reps: ex.reps,
      completedSets: ex.completedSets ?? (ex.completed ? ex.sets : 0),
      completedReps: ex.completedReps ?? (ex.completed ? (Number(ex.reps) || 10) * (Number(ex.sets) || 1) : 0),
      completed: Boolean(ex.completed)
    }))
  };

  try {
    localStorage.setItem(LEGACY_TODAY_PLAN_KEY, JSON.stringify(legacyPlan));
  } catch {}
};

/**
 * Marks a scheduled day or individual exercises as completed in the mesocycle plan.
 */
export const completeScheduledWorkout = (userId, dayIndexOrDate, stats = {}) => {
  const plan = getUserTrainingPlan(userId);
  if (!plan || !Array.isArray(plan.days)) return null;

  const day = plan.days.find(d => d.dayIndex === Number(dayIndexOrDate) || d.date === String(dayIndexOrDate));
  if (!day) return null;

  day.completed = true;
  day.completedAt = new Date().toISOString();
  if (stats.caloriesBurned) {
    day.actualCaloriesBurned = Number(stats.caloriesBurned);
  }
  if (stats.durationSec) {
    day.actualDurationSec = Number(stats.durationSec);
  }
  if (Array.isArray(day.exercises)) {
    day.exercises.forEach(ex => {
      ex.completed = true;
      ex.completedSets = ex.sets;
      ex.completedReps = (Number(ex.reps) || 10) * (Number(ex.sets) || 3);
    });
  }

  saveUserTrainingPlan(userId, plan);
  return day;
};

/**
 * Updates set-level progress for an exercise in today's workout.
 * Supports both Live workout auto-progression and Video upload analysis crediting.
 */
export const updateExerciseSetProgress = (userId, exerciseName, options = {}) => {
  const plan = getUserTrainingPlan(userId);
  if (!plan) return null;

  const today = getTodayScheduledWorkout(plan, new Date());
  if (!today || !Array.isArray(today.exercises)) return null;

  const normTarget = String(exerciseName).toLowerCase().replace(/[^a-z0-9]+/g, '');
  let exercise = today.exercises.find(e => e.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === normTarget);

  if (!exercise) {
    exercise = today.exercises.find(e => 
      normTarget.includes(e.name.toLowerCase().replace(/[^a-z0-9]+/g, '')) ||
      e.name.toLowerCase().replace(/[^a-z0-9]+/g, '').includes(normTarget)
    );
  }

  const {
    completedSets = 1,
    completedReps = 0,
    caloriesBurned = 0,
    durationSec = 0,
    markFullExercise = false
  } = options;

  if (exercise) {
    const targetSets = Number(exercise.sets) || 3;
    const currentCompletedSets = Number(exercise.completedSets) || (exercise.completed ? targetSets : 0);
    const newCompletedSets = markFullExercise 
      ? targetSets 
      : Math.min(targetSets, Math.max(currentCompletedSets, Number(completedSets)));

    exercise.completedSets = newCompletedSets;
    exercise.completedReps = (Number(exercise.completedReps) || 0) + Number(completedReps);
    if (newCompletedSets >= targetSets || markFullExercise) {
      exercise.completed = true;
    }

    if (caloriesBurned > 0) {
      today.actualCaloriesBurned = (Number(today.actualCaloriesBurned) || 0) + Number(caloriesBurned);
    }
    if (durationSec > 0) {
      today.actualDurationSec = (Number(today.actualDurationSec) || 0) + Number(durationSec);
    }

    const allCompleted = today.exercises.every(e => e.completed);
    if (allCompleted) {
      today.completed = true;
      today.completedAt = new Date().toISOString();
    }

    saveUserTrainingPlan(userId, plan);
  } else {
    // Bonus exercise not originally in today's plan
    const newEx = {
      id: `bonus_${Date.now()}`,
      name: exerciseName,
      sets: 1,
      reps: completedReps || 10,
      completedSets: 1,
      completedReps: completedReps || 10,
      completed: true
    };
    today.exercises.push(newEx);
    if (caloriesBurned > 0) {
      today.actualCaloriesBurned = (Number(today.actualCaloriesBurned) || 0) + Number(caloriesBurned);
    }
    saveUserTrainingPlan(userId, plan);
  }

  // Also sync to legacy fitcoach_today_plan
  try {
    const stored = JSON.parse(localStorage.getItem(LEGACY_TODAY_PLAN_KEY) || '{}');
    if (stored?.exercises) {
      stored.exercises = stored.exercises.map(e => {
        const eNorm = e.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
        if (eNorm === normTarget || normTarget.includes(eNorm) || eNorm.includes(normTarget)) {
          const targetSets = Number(e.sets) || 3;
          const currentCompletedSets = Number(e.completedSets) || (e.completed ? targetSets : 0);
          const newCompletedSets = markFullExercise 
            ? targetSets 
            : Math.min(targetSets, Math.max(currentCompletedSets, Number(completedSets)));
          return {
            ...e,
            completedSets: newCompletedSets,
            completedReps: (Number(e.completedReps) || 0) + Number(completedReps),
            completed: newCompletedSets >= targetSets || markFullExercise || e.completed
          };
        }
        return e;
      });
      localStorage.setItem(LEGACY_TODAY_PLAN_KEY, JSON.stringify(stored));
    }
  } catch {}

  emitDashboardDataUpdated({
    type: 'EXERCISE_SET_PROGRESS_UPDATED',
    exerciseName,
    completedSets: exercise ? exercise.completedSets : 1,
    completed: exercise ? exercise.completed : true
  });

  return today;
};

/**
 * Marks an individual exercise as completed inside today's scheduled workout.
 */
export const markPlanExerciseCompleted = (userId, exerciseName) => {
  const plan = getUserTrainingPlan(userId);
  if (!plan) return null;

  const today = getTodayScheduledWorkout(plan, new Date());
  if (!today || !Array.isArray(today.exercises)) return null;

  const normTarget = String(exerciseName).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const exercise = today.exercises.find(e => e.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === normTarget);

  if (exercise) {
    exercise.completed = true;
    exercise.completedSets = exercise.sets || 3;
    exercise.completedReps = (Number(exercise.reps) || 10) * (Number(exercise.sets) || 3);
    const allCompleted = today.exercises.every(e => e.completed);
    if (allCompleted) {
      today.completed = true;
      today.completedAt = new Date().toISOString();
    }
    saveUserTrainingPlan(userId, plan);

    try {
      const stored = JSON.parse(localStorage.getItem(LEGACY_TODAY_PLAN_KEY) || '{}');
      if (stored?.exercises) {
        stored.exercises = stored.exercises.map(e => {
          if (e.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === normTarget) {
            return {
              ...e,
              completed: true,
              completedSets: e.sets || 3,
              completedReps: (Number(e.reps) || 10) * (Number(e.sets) || 3)
            };
          }
          return e;
        });
        localStorage.setItem(LEGACY_TODAY_PLAN_KEY, JSON.stringify(stored));
      }
    } catch {}

    emitDashboardDataUpdated({
      type: 'EXERCISE_COMPLETED',
      exerciseName,
      completed: true
    });
  }

  return today;
};

/**
 * Resets or re-generates the user's monthly plan.
 */
export const resetTrainingPlan = (userId = null, userProfile = null) => {
  const accountId = getAccountId(userId);
  const profile = userProfile || (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const newPlan = generateMonthlyMesocycle(profile, new Date());
  saveUserTrainingPlan(accountId, newPlan);
  return newPlan;
};
