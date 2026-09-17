/**
 * ATOSfit Scientific Metabolism Engine
 * Implements the Mifflin-St Jeor formula for BMR, TDEE calculation,
 * goal-adjusted daily calorie targets, macronutrient splits, and hydration goals.
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { factor: 1.2, labelEn: 'Sedentary', labelAr: 'خامل / مكتبي', descEn: 'Little to no exercise, desk work', descAr: 'قليل الحركة أو عمل مكتبي بدون تمرين' },
  light: { factor: 1.375, labelEn: 'Lightly Active', labelAr: 'نشاط خفيف', descEn: 'Light exercise / sports 1-3 days/week', descAr: 'تمارين خفيفة أو مشي 1-3 أيام أسبوعياً' },
  moderate: { factor: 1.55, labelEn: 'Moderately Active', labelAr: 'نشاط متوسط', descEn: 'Moderate exercise 3-5 days/week', descAr: 'تمارين معتدلة 3-5 أيام أسبوعياً' },
  very_active: { factor: 1.725, labelEn: 'Very Active', labelAr: 'نشاط عالي', descEn: 'Hard exercise 6-7 days/week', descAr: 'تمارين قوية وشاقة 6-7 أيام أسبوعياً' },
  extra_active: { factor: 1.9, labelEn: 'Extremely Active', labelAr: 'نشاط رياضي شاق', descEn: 'Physical job or training 2x/day', descAr: 'مجهود بدني مستمر أو رياضي محترف' },
};

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * @param {string} gender - 'male' | 'female' | other
 * @param {number} weightKg - weight in kg
 * @param {number} heightCm - height in cm
 * @param {number} age - age in years
 * @returns {number} BMR in kcal/day
 */
export function calculateBMR(gender = 'male', weightKg = 70, heightCm = 175, age = 25) {
  const w = Number(weightKg) || 70;
  const h = Number(heightCm) || 175;
  const a = Number(age) || 25;

  const base = 10 * w + 6.25 * h - 5 * a;

  if (gender === 'male') {
    return Math.round(base + 5);
  }
  if (gender === 'female') {
    return Math.round(base - 161);
  }
  // Midpoint fallback for unspecified gender
  return Math.round(base - 78);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE).
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - key of ACTIVITY_MULTIPLIERS
 * @returns {number} TDEE in kcal/day
 */
export function calculateTDEE(bmr, activityLevel = 'moderate') {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate Body Mass Index (BMI).
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ bmi: number, category: string, labelAr: string, labelEn: string, color: string }}
 */
export function calculateBMI(weightKg = 70, heightCm = 175) {
  const w = Number(weightKg) || 70;
  const h = (Number(heightCm) || 175) / 100;
  if (h <= 0) return { bmi: 22, category: 'normal', labelAr: 'وزن مثالي', labelEn: 'Normal', color: '#10B981' };

  const bmi = Number((w / (h * h)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, category: 'underweight', labelAr: 'نقص في الوزن', labelEn: 'Underweight', color: '#F59E0B' };
  }
  if (bmi < 25) {
    return { bmi, category: 'normal', labelAr: 'وزن مثالي', labelEn: 'Normal Weight', color: '#10B981' };
  }
  if (bmi < 30) {
    return { bmi, category: 'overweight', labelAr: 'زيادة في الوزن', labelEn: 'Overweight', color: '#F59E0B' };
  }
  return { bmi, category: 'obese', labelAr: 'سمنة', labelEn: 'Obese', color: '#EF4444' };
}

/**
 * Calculate full metabolic profile and targets from user onboarding/profile data.
 * @param {object} user - user object containing weight, bodyWeight, height, age, gender, activityLevel, physique, etc.
 * @returns {object} complete metabolic targets
 */
export function calculateMetabolicTargets(user = {}) {
  const currentWeight = Number(user.bodyWeight || user.weight || 70);
  const targetWeight = Number(user.weight || user.targetWeight || currentWeight);
  const height = Number(user.height || 175);
  const age = Number(user.age || 25);
  const gender = user.gender || 'male';
  const activityLevel = user.activityLevel || (
    user.fitnessLevel === 'expert' ? 'extra_active' :
    user.fitnessLevel === 'advanced' ? 'very_active' :
    user.fitnessLevel === 'intermediate' ? 'moderate' : 'light'
  );
  const physique = user.physique || 'muscular'; // 'lean' | 'muscular' | 'ripped'

  // 1. Calculate BMR & TDEE
  const bmr = calculateBMR(gender, currentWeight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);

  // 2. Determine Goal Type and Calorie Adjustment
  const weightDiff = targetWeight - currentWeight;
  const explicitGoal = user.primaryGoal || user.primary_goal || user.goal || (Array.isArray(user.goals) ? user.goals[0] : null);

  let goalType = 'maintenance';
  let calorieAdjustment = 0;
  let goalNoteAr = 'الحفاظ على الوزن وإعادة تشكيل البناء العضلي';
  let goalNoteEn = 'Weight maintenance & body recomposition';
  let weeklyChangeKg = 0;

  if (explicitGoal === 'weight_loss' || explicitGoal === 'fat_loss' || (!explicitGoal && (weightDiff < -0.5 || physique === 'lean'))) {
    // Fat Loss / Weight Loss
    goalType = 'weight_loss';
    calorieAdjustment = -500;
    weeklyChangeKg = -0.45;
    goalNoteAr = 'عجز 500 سعرة حرارية يومياً لخسارة الدهون بنسبة صحية';
    goalNoteEn = '500 kcal daily deficit for healthy sustainable fat loss';
  } else if (explicitGoal === 'muscle_gain' || explicitGoal === 'hypertrophy' || (!explicitGoal && (weightDiff > 0.5 || physique === 'ripped'))) {
    // Muscle Gain / Hypertrophy
    goalType = 'muscle_gain';
    calorieAdjustment = 350;
    weeklyChangeKg = 0.3;
    goalNoteAr = 'فائض 350 سعرة حرارية يومياً للبناء العضلي الصافي';
    goalNoteEn = '350 kcal daily surplus for lean muscle hypertrophy';
  } else if (explicitGoal === 'endurance') {
    // Endurance
    goalType = 'endurance';
    calorieAdjustment = 150;
    weeklyChangeKg = 0;
    goalNoteAr = 'تغذية متوازنة ومعززة بالكاربوهيدرات لطاقة وتحمل أعلى';
    goalNoteEn = 'Balanced carbohydrate-rich fueling for high endurance';
  } else if (explicitGoal === 'strength') {
    // Strength
    goalType = 'strength';
    calorieAdjustment = 200;
    weeklyChangeKg = 0.15;
    goalNoteAr = 'فائض محسوب لتغذية الجهاز العصبي وزيادة القوة العضلية';
    goalNoteEn = 'Targeted surplus for peak neuromuscular strength';
  } else {
    // General Fitness / Maintenance
    goalType = 'general_fitness';
    calorieAdjustment = 0;
    weeklyChangeKg = 0;
    goalNoteAr = 'الحفاظ على الوزن وتعزيز الصحة واللياقة العامة';
    goalNoteEn = 'Maintenance calories for general wellness and mobility';
  }

  // Safe minimum calorie floor: Men >= 1500 kcal, Women >= 1200 kcal
  const safeFloor = gender === 'female' ? 1200 : 1500;
  const targetCalories = Math.max(safeFloor, tdee + calorieAdjustment);

  // 3. Macronutrient Breakdown
  // Protein: ~2.0g per kg of body weight (adjusted between 20% and 35% of total calories)
  let proteinGrams = Math.round(currentWeight * 2.0);
  const minProteinG = Math.round((targetCalories * 0.20) / 4);
  const maxProteinG = Math.round((targetCalories * 0.35) / 4);
  proteinGrams = Math.max(minProteinG, Math.min(maxProteinG, proteinGrams));

  // Fat: ~25% of total calories
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbohydrates: remaining calories
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - (proteinGrams * 4) - (fatGrams * 9));
  const carbsGrams = Math.round(remainingCaloriesForCarbs / 4);

  // 4. Hydration Goal (ml)
  // ~35ml per kg of body weight + extra for activity
  const baseWater = currentWeight * 35;
  const activityWaterBonus = (activityLevel === 'very_active' || activityLevel === 'extra_active') ? 600 : 350;
  const waterGoal = Math.round(baseWater + activityWaterBonus);

  // 5. Timeline Estimation
  let estimatedWeeksToGoal = 0;
  if (Math.abs(weightDiff) >= 0.5) {
    const rate = Math.abs(weeklyChangeKg) || 0.45;
    estimatedWeeksToGoal = Math.max(1, Math.round(Math.abs(weightDiff) / rate));
  }

  const bmiInfo = calculateBMI(currentWeight, height);

  return {
    bmr,
    tdee,
    dailyCalorieGoal: targetCalories,
    targetCalories,
    calorieGoal: targetCalories,
    proteinGoal: proteinGrams,
    carbsGoal: carbsGrams,
    fatGoal: fatGrams,
    waterGoal,
    waterGoalLiters: (waterGoal / 1000).toFixed(1),
    goalType,
    calorieAdjustment,
    weeklyChangeKg,
    estimatedWeeksToGoal,
    goalNoteAr,
    goalNoteEn,
    activityLevel,
    bmi: bmiInfo.bmi,
    bmiCategory: bmiInfo.category,
    bmiInfo,
  };
}
