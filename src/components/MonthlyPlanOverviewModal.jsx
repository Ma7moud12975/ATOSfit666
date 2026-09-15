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

  // Sync selectedWeek when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedWeek(defaultWeek);
      // Auto expand today's workout if found
      const todayDay = plan?.days?.find(d => d.weekNumber === defaultWeek && d.date === todayDateStr);
      if (todayDay) {
        setExpandedDayIndex(todayDay.dayIndex);
      } else {
        setExpandedDayIndex(null);
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

  // Quick stats
  const totalTrainingDays = plan.days.filter(d => !d.isRestDay).length;
  const completedTrainingDays = plan.days.filter(d => !d.isRestDay && d.completed).length;

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121214] text-white shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#141417]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FAA802]" />
              <h3 className="text-base sm:text-lg font-bold text-white m-0">
                {ar ? 'خطة التمارين الشهرية' : 'Monthly Workout Plan'}
              </h3>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {ar ? 'موزعة على 4 أسابيع تدريبية' : 'Structured 4-Week Training Roadmap'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onResetPlan && (
              <button
                type="button"
                onClick={onResetPlan}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition"
                title={ar ? 'إعادة توليد الخطة' : 'Regenerate'}
              >
                <Icon name="RotateCcw" size={13} />
                <span>{ar ? 'تجديد' : 'Reset'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
              aria-label="Close"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* ── Clean Calm Week Tabs ── */}
        <div className="px-5 pt-4 pb-2">
          <div className="grid grid-cols-4 gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
            {[1, 2, 3, 4].map(wNum => {
              const isSelected = selectedWeek === wNum;
              const hasToday = plan.days.some(d => d.weekNumber === wNum && d.date === todayDateStr);

              return (
                <button
                  key={wNum}
                  type="button"
                  onClick={() => setSelectedWeek(wNum)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all duration-150 relative select-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAA802] text-black shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="sm:hidden">{ar ? `أ${wNum}` : `W${wNum}`}</span>
                  <span className="hidden sm:inline">{ar ? `الأسبوع ${wNum}` : `Week ${wNum}`}</span>
                  {hasToday && (
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ml-1 ${
                        isSelected ? 'bg-black' : 'bg-[#FAA802]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Simple 1-Line Week Strategy */}
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/70">
            <span className="text-[#FAA802]">💡</span>
            <span className="font-semibold text-white truncate">
              {ar ? currentWeekMeta.phaseAr : currentWeekMeta.phase}
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="text-white/60 truncate hidden sm:inline">
              {ar ? currentWeekMeta.coachFocusAr : currentWeekMeta.coachFocus}
            </span>
          </div>
        </div>

        {/* ── Days List ── */}
        <div className="flex-1 overflow-y-auto custom-roadmap-scroll px-5 py-2 space-y-2.5">
          {weekDays.map(day => {
            const isToday = day.date === todayDateStr;
            const isExpanded = expandedDayIndex === day.dayIndex;
            const exercises = day.exercises || [];

            return (
              <div
                key={day.dayIndex}
                className={`rounded-xl border transition-all ${
                  isToday
                    ? 'border-[#FAA802]/60 bg-[#FAA802]/[0.06]'
                    : day.completed
                    ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                    : day.isRestDay
                    ? 'border-white/[0.06] bg-white/[0.02]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                {/* Day Header Row */}
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                  onClick={() => setExpandedDayIndex(isExpanded ? null : day.dayIndex)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Day Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isToday
                          ? 'bg-[#FAA802] text-black'
                          : day.completed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : day.isRestDay
                          ? 'bg-white/5 text-white/50'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {day.dayIndex}
                    </div>

                    {/* Title and Meta */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate m-0">
                          {ar ? day.titleAr : day.title}
                        </h4>
                        {isToday && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAA802] text-black">
                            {ar ? 'اليوم' : 'Today'}
                          </span>
                        )}
                        {day.completed && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            {ar ? 'تم' : 'Done'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                        {day.isRestDay ? (
                          <span className="text-blue-400/90 text-[11px]">
                            💤 {ar ? 'استشفاء وراحة نشطة' : 'Active Recovery'}
                          </span>
                        ) : (
                          <>
                            <span>⏱️ {day.estimatedDurationMin} {ar ? 'دقيقة' : 'min'}</span>
                            <span>•</span>
                            <span>⚡ {exercises.length} {ar ? 'تمارين' : 'exercises'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!day.isRestDay && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartWorkout(day);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isToday
                            ? 'bg-[#FAA802] text-black hover:bg-[#FBB502]'
                            : day.completed
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-white/10 text-white hover:bg-[#FAA802] hover:text-black'
                        }`}
                      >
                        <Icon name="Play" size={12} strokeWidth={2.5} />
                        <span>
                          {day.completed
                            ? (ar ? 'إعادة' : 'Replay')
                            : isToday
                            ? (ar ? 'ابدأ اليوم' : 'Start Today')
                            : (ar ? 'ابدأ' : 'Start')}
                        </span>
                      </button>
                    )}

                    <div className="text-white/40 p-1">
                      <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
                    </div>
                  </div>
                </div>

                {/* Expanded Exercises */}
                {isExpanded && !day.isRestDay && exercises.length > 0 && (
                  <div className="px-4 pb-3.5 pt-1 border-t border-white/[0.06] bg-black/20">
                    <div className="space-y-1.5 mt-2">
                      {exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/[0.02]"
                        >
                          <span className="text-white/90 font-medium truncate">
                            {exIdx + 1}. {ar ? (ex.nameAr || ex.name) : ex.name}
                          </span>
                          <span className="text-[#FAA802] font-semibold text-[11px] shrink-0">
                            {ex.isTimeBased
                              ? `${ex.sets} × ${ex.durationSec || ex.reps}s`
                              : `${ex.sets} × ${ex.reps} ${ar ? 'عدات' : 'reps'}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Clean Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.08] bg-[#141417] text-xs text-white/50">
          <span>
            {ar ? `تم إنجاز ${completedTrainingDays} من ${totalTrainingDays} تمرين` : `${completedTrainingDays} of ${totalTrainingDays} workouts done`}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition cursor-pointer"
          >
            {ar ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPlanOverviewModal;
