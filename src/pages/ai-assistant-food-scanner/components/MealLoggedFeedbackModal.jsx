import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../contexts/LanguageContext';

const MealLoggedFeedbackModal = ({
  isOpen,
  onClose,
  meal,
  dailyStats,
  onNavigateDashboard,
}) => {
  const { language } = useLanguage();
  const ar = language === 'ar';

  if (!isOpen || !meal) return null;

  const mealName = meal.foodName || meal.name || meal.food_name || (ar ? 'وجبة غذائية' : 'Logged Meal');
  const mealCalories = Math.round(Number(meal.calories) || 0);
  const mealProtein = Math.round(Number(meal.protein) || 0);
  const mealCarbs = Math.round(Number(meal.carbs ?? meal.carbohydrates) || 0);
  const mealFat = Math.round(Number(meal.fat ?? meal.fats) || 0);

  const targets = dailyStats?.targets || { calories: 2200, protein: 150, carbs: 250, fat: 70 };
  const totals = dailyStats?.totals || { calories: mealCalories, protein: mealProtein, carbs: mealCarbs, fat: mealFat };
  const targetCalories = targets.calories || 2200;
  const consumedCalories = Math.round(totals.calories || 0);
  const remainingCalories = Math.round(targetCalories - consumedCalories);
  const isOverBudget = remainingCalories < 0;
  const percentage = Math.min(100, Math.max(0, Math.round((consumedCalories / targetCalories) * 100)));

  // Intelligent coach note based on budget
  let coachTip = '';
  if (isOverBudget) {
    coachTip = ar
      ? `لقد تجاوزت ميزانيتك اليومية بـ ${Math.abs(remainingCalories)} سعرة. لا تقلق، ركّز على شرب الماء وممارسة نشاط خفيف كالمشي.`
      : `You have exceeded your daily budget by ${Math.abs(remainingCalories)} kcal. Focus on hydration and light walking to aid digestion.`;
  } else if (remainingCalories <= 300) {
    coachTip = ar
      ? `اقتربت من إنهاء سعراتك لليوم! متبقي لك ${remainingCalories} سعرة فقط. احرص على تناول سناك خفيف وغني بالبروتين.`
      : `You're close to your daily target! Only ${remainingCalories} kcal left. Keep your next snack light and protein-focused.`;
  } else if (remainingCalories <= 700) {
    coachTip = ar
      ? `توازن ممتاز! متبقي لك ${remainingCalories} سعرة حرارية، وهي مساحة ممتازة لوجبة عشاء صحية ومتوازنة.`
      : `Great balance! You have ${remainingCalories} kcal remaining—ideal for a nutritious dinner or post-workout meal.`;
  } else {
    coachTip = ar
      ? `بداية قوية لليوم! متبقي لديك ${remainingCalories} سعرة حرارية لتحقيق هدفك الغذائي بنجاح.`
      : `Strong start! You still have ${remainingCalories} kcal remaining to power your day and workouts.`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[16px] border border-primary/35 bg-[#141416] p-6 text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(250,168,2,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl"
          style={{ background: '#FAA802' }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <Icon name="X" size={16} />
        </button>

        {/* Header with success badge */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary shadow-[0_0_20px_rgba(250,168,2,0.3)]">
            <Icon name="CheckCircle2" size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {ar ? 'تم خصم السعرات بنجاح' : 'Calorie Deduction Logged'}
            </span>
            <h3 className="text-lg font-black text-white">
              {ar ? 'تم تسجيل الوجبة بنجاح!' : 'Meal Logged Successfully!'}
            </h3>
          </div>
        </div>

        {/* Meal Info Card */}
        <div className="mb-4 rounded-[12px] border border-border/80 bg-white/[0.03] p-3.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{mealName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ar ? 'أضيفت لسجل اليوم' : 'Added to today’s intake'}
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-black text-primary">+{mealCalories}</span>
              <span className="ml-1 text-xs text-muted-foreground">kcal</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-3 border-t border-white/5 pt-2 text-xs text-muted-foreground">
            <span><strong className="text-emerald-400 font-mono">+{mealProtein}g</strong> {ar ? 'بروتين' : 'Protein'}</span>
            <span><strong className="text-amber-400 font-mono">+{mealCarbs}g</strong> {ar ? 'كارب' : 'Carbs'}</span>
            <span><strong className="text-rose-400 font-mono">+{mealFat}g</strong> {ar ? 'دهون' : 'Fat'}</span>
          </div>
        </div>

        {/* Daily Calorie Deduction Summary Hero */}
        <div className="mb-4 rounded-[12px] border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {ar ? 'المتبقي من احتياجك اليومي:' : 'Remaining Daily Budget:'}
            </span>
            <span className={isOverBudget ? 'font-mono text-2xl font-black text-rose-400' : 'font-mono text-2xl font-black text-primary'}>
              {isOverBudget ? `+${Math.abs(remainingCalories)}` : remainingCalories.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground ml-1">kcal</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{consumedCalories} {ar ? 'سعرة مستهلكة' : 'consumed'}</span>
              <span>{targetCalories} {ar ? 'سعرة الهدف' : 'goal'} ({percentage}%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 p-0.5 border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: isOverBudget
                    ? 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)'
                    : 'linear-gradient(90deg, #FAA802 0%, #FBB502 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Coach Feedback Note */}
        <div className="mb-5 rounded-[10px] border border-primary/15 bg-primary/5 p-3 flex items-start gap-2.5">
          <Icon name="Sparkles" size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{coachTip}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-border/80 bg-white/[0.04] py-2.5 px-4 text-xs font-bold text-foreground transition hover:bg-white/[0.08]"
          >
            <Icon name="Camera" size={14} />
            {ar ? 'مسح وجبة أخرى' : 'Scan Another'}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateDashboard) onNavigateDashboard();
            }}
            className="flex items-center justify-center gap-2 rounded-[8px] bg-primary py-2.5 px-4 text-xs font-bold text-black shadow-[0_4px_16px_rgba(250,168,2,0.35)] transition hover:brightness-110"
          >
            <Icon name="LayoutDashboard" size={14} />
            {ar ? 'الداشبورد' : 'View Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealLoggedFeedbackModal;
