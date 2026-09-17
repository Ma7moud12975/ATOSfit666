import React from 'react';
import { Flame, Calendar, Play } from 'lucide-react';

export default function TodayWorkoutCard({
  todayWorkout,
  displayedExercises = [],
  onOpenPlanModal,
  onStartWorkout,
  language,
  t,
}) {
  const isAr = language === 'ar';

  return (
    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-3 min-h-[200px]">
      <div
        className="trail trail-coral"
        style={{ width: 280, height: 280, top: '-40%', right: '-5%', opacity: 0.12 }}
      />
      <div className="p-5 sm:p-7 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 bg-[#FAA802]/12 border border-[#FAA802]/25 rounded-full px-3 py-1">
                <Flame size={13} className="text-[#FAA802]" strokeWidth={2.4} />
                <span className="text-[0.7rem] text-[#FAA802] font-bold tracking-wider uppercase">
                  {t('dashboard.todaysWorkout')}
                </span>
              </div>

              {todayWorkout?.plan?.phase && (
                <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 dark:border-white/12 rounded-full px-3 py-1">
                  <span className="text-[0.68rem] text-[var(--bento-text)] font-semibold">
                    {isAr
                      ? `الأسبوع ${todayWorkout.plan.weekNumber || 1}: ${todayWorkout.plan.phaseAr || todayWorkout.plan.phase}`
                      : `Week ${todayWorkout.plan.weekNumber || 1}: ${todayWorkout.plan.phase}`}
                  </span>
                </div>
              )}

              {todayWorkout?.isRestDay && (
                <div className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 rounded-full px-3 py-1">
                  <span className="text-[0.68rem] text-blue-400 font-bold">
                    {isAr ? 'استشفاء نشط' : 'Rest & Recovery'}
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--bento-text)] m-0 leading-tight tracking-tight">
              {isAr
                ? (todayWorkout?.plan?.titleAr || todayWorkout?.plan?.name || (todayWorkout?.isCompleted ? 'اكتمل تمرين اليوم' : t('dashboard.fullBodyStrength')))
                : (todayWorkout?.plan?.name || (todayWorkout?.isCompleted ? 'Workout completed today' : t('dashboard.fullBodyStrength')))}
            </h2>

            <p className="text-[var(--bento-muted)] mt-1.5 text-sm font-medium">
              {todayWorkout?.isRestDay
                ? (isAr ? 'يوم استشفاء مخصص لترميم الألياف العضلية وترطيب الجسم.' : 'Active recovery day. Prioritize hydration and joint mobility.')
                : todayWorkout?.totalPlanCount
                ? `${todayWorkout.completedPlanCount}/${todayWorkout.totalPlanCount} ${isAr ? 'تمارين موجهة' : 'exercises'} • ${Math.round(todayWorkout.totalWorkoutTime / 60 || todayWorkout.plan?.estimatedDurationMin || 25)} ${isAr ? 'دقيقة' : 'min'}`
                : todayWorkout?.isCompleted
                ? `${Math.round(todayWorkout.caloriesBurned)} kcal • ${Math.round(todayWorkout.totalWorkoutTime / 60)} min`
                : (isAr ? 'جلسة تدريبية مخصصة تنتظرك اليوم' : 'No workout completed yet today')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenPlanModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/15 text-[var(--bento-text)] hover:border-[#FAA802]/60 hover:bg-[#FAA802]/10 transition-all duration-200"
            >
              <Calendar size={16} className="text-[#FAA802]" strokeWidth={2} />
              <span>{isAr ? 'خطة الـ 4 أسابيع' : '4-Week Plan'}</span>
            </button>

            <button className="btn-coral justify-center" onClick={() => onStartWorkout()}>
              <Play size={15} fill="#08080A" stroke="#08080A" strokeWidth={2} />
              <span>
                {todayWorkout?.isCompleted
                  ? (isAr ? 'مراجعة التمرين' : 'Review workout')
                  : todayWorkout?.isRestDay
                  ? (isAr ? 'جلسة استشفاء' : 'Mobility session')
                  : t('dashboard.startWorkout')}
              </span>
            </button>
          </div>
        </div>

        {/* Exercise chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {displayedExercises.map((ex, i) => (
            <div
              key={i}
              onClick={onOpenPlanModal}
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 bg-[var(--bento-chip)] border border-[var(--bento-border)] text-[var(--bento-soft-text)] hover:border-[#FAA802]/50 hover:text-[#FAA802]"
            >
              {ex}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}