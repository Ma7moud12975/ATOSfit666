import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { MESOCYCLE_WEEKS } from '../utils/trainingPlanEngine';

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

  // Sync selectedWeek when modal opens or plan changes
  useEffect(() => {
    if (isOpen) {
      setSelectedWeek(defaultWeek);
      // Auto-expand today's workout if in selected week
      const todayInWeek = plan?.days?.find(d => d.weekNumber === defaultWeek && d.date === todayDateStr);
      if (todayInWeek) {
        setExpandedDayIndex(todayInWeek.dayIndex);
      }
    }
  }, [isOpen, defaultWeek, todayDateStr, plan]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !plan || !Array.isArray(plan.days)) return null;

  // Filter days for the selected week
  const weekDays = plan.days.filter(d => d.weekNumber === selectedWeek);
  const currentWeekMeta = MESOCYCLE_WEEKS.find(w => w.weekNumber === selectedWeek) || MESOCYCLE_WEEKS[0];

  // Global Plan Statistics
  const totalTrainingDays = plan.days.filter(d => !d.isRestDay).length;
  const completedTrainingDays = plan.days.filter(d => !d.isRestDay && d.completed).length;
  const totalBurnEstimated = plan.days.reduce((acc, d) => acc + (d.estimatedCalories || 0), 0);
  const progressPct = totalTrainingDays > 0 ? Math.round((completedTrainingDays / totalTrainingDays) * 100) : 0;

  // Find today's workout object across all plan days
  const todayWorkoutDay = plan.days.find(d => d.date === todayDateStr);

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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[94vh] sm:h-auto sm:max-h-[88vh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-[24px] border border-white/[0.08] sm:border-primary/30 bg-[#0c0c0e] text-foreground shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(250,168,2,0.12)] roadmap-sheet-animate"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Ambient Subtle Halos */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: '#FAA802' }}
        />
        <div
          className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ background: '#3B82F6' }}
        />

        {/* ── Modal Header ── */}
        <div className="relative z-10 flex items-start justify-between border-b border-white/[0.08] px-4 py-3.5 sm:px-7 sm:py-5 bg-card/70 backdrop-blur-md shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black text-primary mb-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <Icon name="Calendar" size={12} />
              <span>{ar ? 'خطة الـ 4 أسابيع الشهرية' : '4-Week Mesocycle Roadmap'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight m-0 flex items-center gap-2">
              <span>{ar ? 'خريطة تمرينك الشهرية' : 'Your Monthly Training Roadmap'}</span>
              <span className="text-primary text-xs sm:text-sm font-bold bg-primary/15 border border-primary/30 rounded-lg px-2 py-0.5">
                {userProfile.fitnessLevel || (ar ? 'متوسط' : 'Intermediate')}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
              {ar
                ? 'مبنية علمياً وفق مبادئ Renaissance Periodization (RP) لزيادة القوة والحجم العضلي'
                : 'Engineered with Renaissance Periodization (RP) progressive overload principles'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onResetPlan && (
              <button
                type="button"
                onClick={onResetPlan}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
                title={ar ? 'إعادة بناء الخطة' : 'Regenerate Plan'}
              >
                <Icon name="RotateCcw" size={13} />
                <span>{ar ? 'تجديد' : 'Regenerate'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground transition cursor-pointer"
              aria-label="Close"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* ── Mesocycle KPI Bento Strip ── */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 border-b border-white/[0.08] bg-[#0a0a0c]/80 px-4 py-2.5 sm:px-7 sm:py-3.5 shrink-0">
          {/* Stat 1: Workouts Done */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon name="Dumbbell" size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block font-bold truncate">
                {ar ? 'التمارين المنجزة' : 'Workouts Done'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-base font-black text-foreground">
                  {completedTrainingDays}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">
                  / {totalTrainingDays}
                </span>
              </div>
            </div>
          </div>

          {/* Stat 2: Caloric Burn */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="Flame" size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block font-bold truncate">
                {ar ? 'سعة الحرق المتوقعة' : 'Caloric Target'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-base font-black text-foreground">
                  ~{totalBurnEstimated}
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold">kcal</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Adherence Rate */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Icon name="TrendingUp" size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block font-bold truncate">
                {ar ? 'نسبة الالتزام' : 'Adherence'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xs sm:text-base font-black ${
                  progressPct >= 70 ? 'text-emerald-400' : progressPct >= 30 ? 'text-primary' : 'text-foreground'
                }`}>
                  {progressPct}%
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold hidden sm:inline">
                  {progressPct >= 70 ? (ar ? 'ممتاز' : 'Optimal') : (ar ? 'قيد التقدم' : 'In Progress')}
                </span>
              </div>
            </div>
          </div>

          {/* Stat 4: Split Rhythm */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icon name="Activity" size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block font-bold truncate">
                {ar ? 'مرحلة التطور' : 'Periodization'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-base font-black text-foreground truncate">
                  {ar ? `أسبوع ${selectedWeek}/4` : `Week ${selectedWeek}/4`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Creative 4-Week Segmented Pill Switcher (Mobile & Desktop) ── */}
        <div className="relative z-10 px-3 pt-2.5 sm:px-7 sm:pt-4 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 bg-black/40 rounded-2xl border border-white/[0.08]">
            {MESOCYCLE_WEEKS.map(w => {
              const isSelected = selectedWeek === w.weekNumber;
              const weekHasToday = plan.days.some(d => d.weekNumber === w.weekNumber && d.date === todayDateStr);
              const weekWorkouts = plan.days.filter(d => d.weekNumber === w.weekNumber && !d.isRestDay);
              const weekCompleted = weekWorkouts.filter(d => d.completed).length;
              const isWeekAllDone = weekWorkouts.length > 0 && weekCompleted === weekWorkouts.length;

              return (
                <button
                  key={w.weekNumber}
                  type="button"
                  onClick={() => setSelectedWeek(w.weekNumber)}
                  className={`flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 sm:px-3 rounded-xl transition-all duration-200 relative select-none cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#FAA802]/20 to-[#FAA802]/5 border border-[#FAA802] shadow-[0_0_20px_rgba(250,168,2,0.18)] text-foreground'
                      : 'border border-transparent bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
                  }`}
                >
                  {/* Today Badge Indicator */}
                  {weekHasToday && (
                    <span className="absolute -top-1.5 -right-1 sm:top-1 sm:right-1 flex items-center gap-1 bg-primary text-black text-[8px] sm:text-[9px] font-black rounded-full px-1.5 py-0.2 shadow-[0_0_8px_#FAA802]">
                      <span className="w-1 h-1 rounded-full bg-black animate-ping" />
                      <span className="hidden sm:inline">{ar ? 'الآن' : 'Active'}</span>
                    </span>
                  )}

                  {/* Week Label */}
                  <div className="flex items-center gap-1">
                    <span className={`text-xs sm:text-sm font-black tracking-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      <span className="sm:hidden">W{w.weekNumber}</span>
                      <span className="hidden sm:inline">{ar ? `الأسبوع ${w.weekNumber}` : `Week ${w.weekNumber}`}</span>
                    </span>
                    {isWeekAllDone && (
                      <span className="text-emerald-400">
                        <Icon name="Check" size={12} />
                      </span>
                    )}
                  </div>

                  {/* Phase Subtitle */}
                  <div className={`text-[10px] sm:text-xs font-semibold truncate max-w-full mt-0.5 ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {w.weekNumber === 1 && (ar ? 'التأسيس' : 'Base')}
                    {w.weekNumber === 2 && (ar ? 'التدرج' : 'Overload')}
                    {w.weekNumber === 3 && (ar ? 'الذروة' : 'Peak')}
                    {w.weekNumber === 4 && (ar ? 'استشفاء' : 'Deload')}
                  </div>

                  {/* Completion pill */}
                  <div className={`text-[9px] sm:text-[10px] mt-1 font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isWeekAllDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isSelected
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-white/[0.04] text-muted-foreground'
                  }`}>
                    {weekCompleted}/{weekWorkouts.length} {ar ? 'تم' : 'done'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Scrollable Area (Week Directive + Day Cards) ── */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-roadmap-scroll px-3 py-3 sm:px-7 sm:py-4 space-y-3 sm:space-y-4">
          {/* Week Strategy AI Directive Card */}
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/12 via-primary/5 to-transparent p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(250,168,2,0.2)]">
                <Icon name="Compass" size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-foreground m-0">
                    {ar ? currentWeekMeta.phaseAr : currentWeekMeta.phase}
                  </h3>
                  <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-black text-primary uppercase">
                    {currentWeekMeta.rpe}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {ar ? currentWeekMeta.descriptionAr : currentWeekMeta.description}
                </p>
                <p className="text-[11px] sm:text-xs text-primary/95 font-semibold mt-1 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>{ar ? currentWeekMeta.coachFocusAr : currentWeekMeta.coachFocus}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Days List for Selected Week */}
          <div className="space-y-2.5 sm:space-y-3">
            {weekDays.map(day => {
              const isToday = day.date === todayDateStr;
              const isExpanded = expandedDayIndex === day.dayIndex;
              const exercises = day.exercises || [];

              return (
                <div
                  key={day.dayIndex}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isToday
                      ? 'border-primary/70 bg-[#161619] shadow-[0_0_30px_rgba(250,168,2,0.16)]'
                      : day.completed
                      ? 'border-emerald-500/35 bg-emerald-950/15 hover:border-emerald-500/50'
                      : day.isRestDay
                      ? 'border-blue-500/20 bg-blue-950/10 hover:border-blue-500/30'
                      : 'border-white/[0.08] bg-[#121215]/90 hover:border-white/[0.18]'
                  }`}
                >
                  {/* Day Summary Header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 cursor-pointer select-none"
                    onClick={() => setExpandedDayIndex(isExpanded ? null : day.dayIndex)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Day Number Badge */}
                      <div
                        className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl font-bold border transition-all ${
                          isToday
                            ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(250,168,2,0.4)]'
                            : day.completed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : day.isRestDay
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                            : 'bg-white/[0.04] text-foreground border-white/[0.1]'
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                          {ar ? 'يوم' : 'Day'}
                        </span>
                        <span className="text-lg font-black leading-none mt-1">
                          {day.dayIndex}
                        </span>
                      </div>

                      {/* Day Info & Title */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h4 className="text-sm sm:text-base font-black text-foreground m-0">
                            {ar ? day.titleAr : day.title}
                          </h4>

                          {isToday && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary text-black px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(250,168,2,0.4)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                              {ar ? 'اليوم' : 'Today'}
                            </span>
                          )}

                          {day.completed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                              <Icon name="Check" size={10} />
                              {ar ? 'مكتمل' : 'Done'}
                            </span>
                          )}

                          {day.isRestDay && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-400">
                              {ar ? 'استشفاء' : 'Rest'}
                            </span>
                          )}
                        </div>

                        {/* Metrics or Rest note */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-muted-foreground mt-1">
                          {day.isRestDay ? (
                            <span className="text-blue-400/90 font-semibold flex items-center gap-1">
                              <span>💤</span>
                              <span>{ar ? 'استشفاء نشط، هيدريشن عميق وتمارين استطالة' : 'Active recovery, deep hydration & joint mobility'}</span>
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-1 font-medium">
                                <span>⏱️</span>
                                <span>{day.estimatedDurationMin} {ar ? 'د' : 'min'}</span>
                              </span>
                              <span className="flex items-center gap-1 font-medium text-emerald-400/90">
                                <span>🔥</span>
                                <span>~{day.estimatedCalories} kcal</span>
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <span>⚡</span>
                                <span>{exercises.length} {ar ? 'تمارين' : 'exercises'}</span>
                              </span>
                              <span className="text-muted-foreground/60 font-mono hidden sm:inline">
                                ({day.date})
                              </span>
                            </>
                          )}
                        </div>

                        {/* Quick Exercise Preview Chips (Visible when collapsed) */}
                        {!day.isRestDay && exercises.length > 0 && !isExpanded && (
                          <div className="flex flex-wrap gap-1 mt-1.5 pt-0.5">
                            {exercises.slice(0, 3).map((ex, exIdx) => (
                              <span
                                key={exIdx}
                                className="inline-block rounded-md bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[9px] sm:text-[10px] text-muted-foreground"
                              >
                                {ar ? (ex.nameAr || ex.name) : ex.name}
                              </span>
                            ))}
                            {exercises.length > 3 && (
                              <span className="text-[9px] sm:text-[10px] text-primary/80 font-bold self-center">
                                +{exercises.length - 3} {ar ? 'أخرى' : 'more'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions on Day Row */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                      {!day.isRestDay && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWorkout(day);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${
                            isToday
                              ? 'bg-primary text-black hover:bg-[#FBB502] shadow-[0_0_16px_rgba(250,168,2,0.35)] hover:scale-[1.02]'
                              : day.completed
                              ? 'bg-white/[0.06] text-foreground hover:bg-white/[0.12]'
                              : 'bg-white/[0.08] text-foreground hover:bg-primary hover:text-black hover:shadow-[0_0_12px_rgba(250,168,2,0.25)]'
                          }`}
                        >
                          <Icon name="Play" size={13} strokeWidth={2.5} />
                          <span>
                            {day.completed
                              ? (ar ? 'إعادة التمرين' : 'Replay')
                              : isToday
                              ? (ar ? 'ابدأ تمرين اليوم' : 'Start Today')
                              : (ar ? 'بدء الجلسة' : 'Start Session')}
                          </span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground sm:ml-1">
                        <span className="text-[10px] hidden sm:inline">
                          {isExpanded ? (ar ? 'إخفاء' : 'Collapse') : (ar ? 'تفاصيل' : 'Details')}
                        </span>
                        <div className={`p-1.5 rounded-lg bg-white/[0.04] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <Icon name="ChevronDown" size={14} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Exercise Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.08] bg-[#0a0a0c]/80 p-3.5 sm:p-5 space-y-3 animate-in fade-in duration-200">
                      {/* Coach Note */}
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] sm:text-xs text-muted-foreground">
                        <span className="text-primary text-sm shrink-0">💬</span>
                        <span>{ar ? day.coachTipAr : day.coachTip}</span>
                      </div>

                      {/* Exercise Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {exercises.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-3 text-xs transition"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-foreground truncate">
                                {ar ? (ex.nameAr || ex.name) : ex.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                                {ar
                                  ? (ex.targetMusclesAr?.join(' • ') || ex.targetMuscles?.join(' • '))
                                  : ex.targetMuscles?.join(' • ')}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-black text-primary text-xs sm:text-sm">
                                {ex.isTimeBased
                                  ? `${ex.sets} × ${ex.durationSec || ex.reps}s`
                                  : `${ex.sets} × ${ex.reps} ${ar ? 'عدات' : 'reps'}`}
                              </span>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {ex.restSec}s {ar ? 'راحة' : 'rest'} • ~{ex.estimatedCalories} kcal
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Launch workout from bottom of expanded card */}
                      {!day.isRestDay && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleStartWorkout(day)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary/15 border border-primary/40 px-4 py-2.5 text-xs font-black text-primary hover:bg-primary hover:text-black transition shadow-[0_0_12px_rgba(250,168,2,0.15)] cursor-pointer"
                          >
                            <Icon name="Play" size={13} strokeWidth={2.5} />
                            <span>{ar ? 'بدء هذا التمرين الآن' : 'Start This Workout Now'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sticky Modal Footer ── */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] px-4 py-3 sm:px-7 sm:py-3.5 bg-[#0a0a0c] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-24 sm:w-36 h-2 rounded-full bg-white/[0.06] overflow-hidden hidden xs:block">
              <div
                className="h-full bg-gradient-to-r from-[#FAA802] to-[#FF6B00] transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold truncate">
              {progressPct}% {ar ? 'من الدورة التدريبية مكتمل' : 'Mesocycle completed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {todayWorkoutDay && !todayWorkoutDay.completed && !todayWorkoutDay.isRestDay && (
              <button
                type="button"
                onClick={() => handleStartWorkout(todayWorkoutDay)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-black hover:bg-[#FBB502] transition shadow-[0_0_16px_rgba(250,168,2,0.35)] cursor-pointer"
              >
                <Icon name="Play" size={12} strokeWidth={2.5} />
                <span>{ar ? 'تمرين اليوم' : "Today's Session"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-white/[0.08] cursor-pointer"
            >
              {ar ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPlanOverviewModal;
