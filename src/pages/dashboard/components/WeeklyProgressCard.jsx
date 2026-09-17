import React from 'react';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

const RingProgress = ({ pct = 0, r = 30, sw = 5, size = 74, color = '#FAA802', children }) => {
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring-animate"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const StatPill = ({ label, value, unit, icon: IconComponent, pct, color = '#FAA802' }) => (
  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
    <RingProgress pct={pct} color={color} r={28} sw={4.5} size={70}>
      <IconComponent size={17} stroke={color} strokeWidth={2.2} />
    </RingProgress>
    <div className="text-center">
      <div className="text-lg font-extrabold text-[var(--bento-text)] leading-tight">{value}</div>
      <div className="text-[0.65rem] font-bold text-[var(--bento-muted)] tracking-wider uppercase mt-0.5">
        {unit}
      </div>
    </div>
    <div className="text-xs text-[var(--bento-muted)] font-medium text-center">{label}</div>
  </div>
);

export default function WeeklyProgressCard({ weeklyWorkout, achievements, t }) {
  const volumeBars = [
    {
      label: 'Push-up volume',
      val: Math.min(100, Math.round(((weeklyWorkout?.pushupVolume || 0) / 100) * 100)),
      detail: `${weeklyWorkout?.pushupVolume || 0} reps`,
    },
    {
      label: 'Plank record',
      val: Math.min(100, Math.round(((weeklyWorkout?.plankRecordSec || 0) / 120) * 100)),
      detail: `${weeklyWorkout?.plankRecordSec || 0}s`,
    },
    {
      label: 'Squat volume',
      val: Math.min(100, Math.round(((weeklyWorkout?.squatVolume || 0) / 100) * 100)),
      detail: `${weeklyWorkout?.squatVolume || 0} reps`,
    },
  ];

  return (
    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-3 p-6 sm:p-7">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-extrabold text-[var(--bento-text)] text-base sm:text-lg m-0">
            {t('dashboard.progressHub')}
          </h3>
          <p className="text-[var(--bento-muted)] text-xs mt-0.5">
            {t('dashboard.weeklyOverview')}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#FAA802]/10 border border-[#FAA802]/20 rounded-full px-3 py-1">
          <TrendingUp size={14} className="text-[#FAA802]" strokeWidth={2.2} />
          <span className="text-xs text-[#FAA802] font-bold">
            {t('dashboard.weekTrend')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatPill
          icon={Flame}
          label={t('dashboard.caloriesBurned')}
          value={Math.round(weeklyWorkout?.caloriesBurned || 0).toLocaleString()}
          unit="kcal"
          pct={Math.min(100, Math.round(((weeklyWorkout?.caloriesBurned || 0) / 2000) * 100))}
        />
        <StatPill
          icon={Trophy}
          label={t('nav.achievements')}
          value={achievements?.unlockedCount || 0}
          unit={t('dashboard.unlocked')}
          pct={(achievements?.unlockedCount || 0) > 0 ? 100 : 0}
          color="#FBB502"
        />
        <StatPill
          icon={TrendingUp}
          label={t('dashboard.workouts')}
          value={`${weeklyWorkout?.workoutsCompleted || 0}/${weeklyWorkout?.weeklyGoal || 4}`}
          unit={t('dashboard.weeklyGoal')}
          pct={weeklyWorkout?.weeklyGoalPct || 0}
          color="#10B981"
        />
      </div>

      {/* Mini volume progress bars */}
      <div className="mt-6 flex flex-col gap-3 pt-2">
        {volumeBars.map(({ label, val, detail }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-[var(--bento-muted)]">{label}</span>
              <span className="text-[#FAA802] font-bold">{detail}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bento-field)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFC107] via-[#FAA802] to-[#FF6B00] transition-all duration-1000"
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
