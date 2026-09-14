import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { MESOCYCLE_WEEKS, getTodayScheduledWorkout } from '../utils/trainingPlanEngine';

const MonthlyPlanOverviewModal = ({
  isOpen,
  onClose,
  plan,
  userProfile = {},
  onSelectWorkout = null,
  onResetPlan = null
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Determine current active week based on today
  const defaultWeek = useMemo(() => {
    if (!plan || !plan.days) return 1;
    const todayDay = plan.days.find(d => d.date === todayDateStr);
    return todayDay ? todayDay.weekNumber : 1;
  }, [plan, todayDateStr]);

  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [expandedDayIndex, setExpandedDayIndex] = useState(null);

  if (!isOpen || !plan || !Array.isArray(plan.days)) return null;

  // Filter days for the selected week
  const weekDays = plan.days.filter(d => d.weekNumber === selectedWeek);
  const currentWeekMeta = MESOCYCLE_WEEKS.find(w => w.weekNumber === selectedWeek) || MESOCYCLE_WEEKS[0];

  // Global Plan Statistics
  const totalTrainingDays = plan.days.filter(d => !d.isRestDay).length;
  const completedTrainingDays = plan.days.filter(d => !d.isRestDay && d.completed).length;
  const totalBurnEstimated = plan.days.reduce((acc, d) => acc + (d.estimatedCalories || 0), 0);
  const progressPct = totalTrainingDays > 0 ? Math.round((completedTrainingDays / totalTrainingDays) * 100) : 0;

  const handleStartWorkout = (day) => {
    if (onSelectWorkout) {
      onSelectWorkout(day);
    } else {
      navigate('/exercise-workout-screen', {
        state: {
          todayPlan: {
            name: ar ? day.titleAr : day.title,
            phase: ar ? day.phaseAr : day.phase,
            isRestDay: day.isRestDay,
            dayIndex: day.dayIndex,
            exercises: (day.exercises || []).map(ex => ({
              name: ex.name,
              category: ex.category,
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.durationSec ? `${Math.round(ex.durationSec / 60)} min` : `${ex.sets} sets`,
              completed: Boolean(ex.completed)
            }))
          }
        }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[20px] border border-primary/30 bg-[#121214] text-foreground shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(250,168,2,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-15 blur-3xl"
          style={{ background: '#FAA802' }}
        />
        <div
          className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full opacity-10 blur-3xl"
          style={{ background: '#7082FF' }}
        />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between border-b border-border/80 px-5 py-4 sm:px-7 sm:py-5 bg-card/60 backdrop-blur-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2 uppercase tracking-wider">
              <Icon name="Calendar" size={13} />
              <span>{ar ? 'دورة تدريبية شهرية (4 أسابيع)' : '4-Week Periodized Mesocycle'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight m-0">
              {ar ? 'خريطة تمرينك الشهرية المخصصة' : 'Your Personalized Monthly Training Roadmap'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {ar
                ? `مبنية علمياً وفق مبدأ الزيادة التدريجية (Renaissance Periodization) ومصممة لمستوى ${userProfile.fitnessLevel || 'intermediate'}`
                : `Engineered with progressive overload principles & adapted for your ${userProfile.fitnessLevel || 'intermediate'} fitness level`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onResetPlan && (
              <button
                type="button"
                onClick={onResetPlan}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
                title={ar ? 'إعادة توليد الخطة' : 'Regenerate Plan'}
              >
                <Icon name="RotateCcw" size={13} />
                <span>{ar ? 'تجديد الخطة' : 'Regenerate'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground transition"
              aria-label="Close"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Plan Overview Metrics Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/80 bg-background/50 px-5 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon name="Dumbbell" size={16} />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
                {ar ? 'التمارين المنجزة' : 'Workouts Done'}
              </span>
              <span className="text-sm sm:text-base font-black text-foreground">
                {completedTrainingDays} / {totalTrainingDays}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="Flame" size={16} />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
                {ar ? 'سعة الحرق المتوقعة' : 'Caloric Capacity'}
              </span>
              <span className="text-sm sm:text-base font-black text-foreground">
                ~{totalBurnEstimated} <small className="text-xs font-normal text-muted-foreground">kcal</small>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Icon name="TrendingUp" size={16} />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
                {ar ? 'نسبة الالتزام' : 'Adherence'}
              </span>
              <span className="text-sm sm:text-base font-black text-foreground">
                {progressPct}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icon name="Activity" size={16} />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
                {ar ? 'نظام التقسيم' : 'Split Rhythm'}
              </span>
              <span className="text-sm sm:text-base font-black text-foreground capitalize">
                {userProfile.fitnessLevel || 'intermediate'}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Week Tab Navigation */}
        <div className="relative z-10 flex border-b border-border/80 bg-card/40 px-5 pt-3 sm:px-7 gap-2 overflow-x-auto no-scrollbar">
          {MESOCYCLE_WEEKS.map(w => {
            const isSelected = selectedWeek === w.weekNumber;
            const weekHasToday = plan.days.some(d => d.weekNumber === w.weekNumber && d.date === todayDateStr);
            const weekWorkouts = plan.days.filter(d => d.weekNumber === w.weekNumber && !d.isRestDay);
            const weekCompleted = weekWorkouts.filter(d => d.completed).length;

            return (
              <button
                key={w.weekNumber}
                type="button"
                onClick={() => setSelectedWeek(w.weekNumber)}
                className={`flex-1 min-w-[140px] pb-3 px-3 text-left transition relative border-b-2 ${
                  isSelected
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {ar ? `الأسبوع ${w.weekNumber}` : `Week ${w.weekNumber}`}
                  </span>
                  {weekHasToday && (
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" title="Contains today" />
                  )}
                </div>
                <div className="text-xs font-medium truncate">
                  {ar ? w.phaseAr : w.phase}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {weekCompleted}/{weekWorkouts.length} {ar ? 'مكتمل' : 'done'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area: Week Strategy Banner + Day Cards */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
          {/* Week Strategy Coach Banner */}
          <div className="rounded-[12px] border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
                <Icon name="Compass" size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground m-0">
                    {ar ? currentWeekMeta.phaseAr : currentWeekMeta.phase}
                  </h3>
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {currentWeekMeta.rpe}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {ar ? currentWeekMeta.descriptionAr : currentWeekMeta.description}
                </p>
                <p className="text-xs text-primary/90 font-medium mt-1">
                  💡 {ar ? currentWeekMeta.coachFocusAr : currentWeekMeta.coachFocus}
                </p>
              </div>
            </div>
          </div>

          {/* Days List for Selected Week */}
          <div className="space-y-3">
            {weekDays.map(day => {
              const isToday = day.date === todayDateStr;
              const isExpanded = expandedDayIndex === day.dayIndex;
              const exercises = day.exercises || [];

              return (
                <div
                  key={day.dayIndex}
                  className={`rounded-[14px] border transition-all duration-200 overflow-hidden ${
                    day.completed
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : isToday
                      ? 'border-primary shadow-[0_0_24px_rgba(250,168,2,0.18)] bg-card/90'
                      : day.isRestDay
                      ? 'border-border/50 bg-background/40 opacity-90'
                      : 'border-border/80 bg-card/70 hover:border-border'
                  }`}
                >
                  {/* Day Summary Row */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedDayIndex(isExpanded ? null : day.dayIndex)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Day Number Badge */}
                      <div
                        className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl font-bold border ${
                          day.completed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isToday
                            ? 'bg-primary text-black border-primary'
                            : day.isRestDay
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-white/[0.04] text-foreground border-border/80'
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase leading-none">
                          {ar ? 'يوم' : 'Day'}
                        </span>
                        <span className="text-base font-black leading-none mt-0.5">
                          {day.dayIndex}
                        </span>
                      </div>

                      {/* Day Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-foreground m-0">
                            {ar ? day.titleAr : day.title}
                          </h4>
                          {isToday && (
                            <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-extrabold text-primary uppercase">
                              {ar ? 'اليوم' : 'Today'}
                            </span>
                          )}
                          {day.completed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              <Icon name="Check" size={10} />
                              {ar ? 'مكتمل' : 'Completed'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          {day.isRestDay ? (
                            <span className="text-blue-400 font-medium">
                              💤 {ar ? 'استشفاء نشط وهيدريشن' : 'Active Recovery & Hydration'}
                            </span>
                          ) : (
                            <>
                              <span>⏱️ {day.estimatedDurationMin} {ar ? 'دقيقة' : 'min'}</span>
                              <span>🔥 ~{day.estimatedCalories} {ar ? 'سعرة' : 'kcal'}</span>
                              <span>⚡ {exercises.length} {ar ? 'تمارين موجهة' : 'exercises'}</span>
                              <span className="text-muted-foreground/80 font-mono">({day.date})</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Row */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!day.isRestDay && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWorkout(day);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                            isToday
                              ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(250,168,2,0.3)]'
                              : day.completed
                              ? 'bg-white/[0.06] text-foreground hover:bg-white/[0.1]'
                              : 'bg-white/[0.08] text-foreground hover:bg-primary hover:text-black'
                          }`}
                        >
                          <Icon name="Play" size={12} />
                          <span>
                            {day.completed
                              ? (ar ? 'إعادة التمرين' : 'Replay')
                              : isToday
                              ? (ar ? 'ابدأ تمرين اليوم' : 'Start Today')
                              : (ar ? 'بدء التمرين' : 'Start Session')}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="p-1 text-muted-foreground hover:text-foreground transition"
                        aria-label="Toggle details"
                      >
                        <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Exercise Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-border/70 bg-background/50 p-4 sm:p-5 space-y-3">
                      <p className="text-xs text-muted-foreground italic">
                        💬 {ar ? day.coachTipAr : day.coachTip}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {exercises.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-2.5 text-xs"
                          >
                            <div>
                              <div className="font-bold text-foreground">
                                {ar ? ex.nameAr : ex.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {ar ? ex.targetMusclesAr?.join(' • ') : ex.targetMuscles?.join(' • ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-primary">
                                {ex.isTimeBased
                                  ? `${ex.sets} × ${ex.durationSec || ex.reps}s`
                                  : `${ex.sets} × ${ex.reps} reps`}
                              </span>
                              <div className="text-[10px] text-muted-foreground">
                                {ex.restSec}s rest • ~{ex.estimatedCalories} kcal
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-border/80 px-5 py-3 sm:px-7 bg-card/60 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground">
            {ar
              ? 'التمارين المنجزة تنعكس فورياً على جاهزيتك اليومية وسعراتك المحروقة'
              : 'Completed workouts immediately calibrate your readiness & energy budget.'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/80 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-white/[0.08]"
          >
            {ar ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPlanOverviewModal;
