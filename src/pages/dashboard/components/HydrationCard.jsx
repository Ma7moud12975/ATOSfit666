import React from 'react';
import { Droplets, RotateCcw, Trash2 } from 'lucide-react';

export default function HydrationCard({
  water = 0,
  waterGoal = 2500,
  waterPct = 0,
  waterRemaining = 0,
  waterHistory = [],
  onAddWater,
  onUndoWater,
  onResetWater,
  onSetGoal,
  t,
}) {
  return (
    <div className="bento-card col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2 flex flex-col p-6 sm:p-7">
      <div className="flex justify-between items-center mb-5">
        <span className="font-extrabold text-[var(--bento-text)] text-base">
          {t('dashboard.hydration')}
        </span>
        <Droplets size={20} className="text-[#FAA802]" strokeWidth={2.2} />
      </div>

      {/* Animated liquid ring effect */}
      <div className="flex justify-center mx-auto relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-200/60 dark:border-slate-800/80 shadow-inner">
        <div
          className="liquid-bg"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${waterPct}%`,
            transition: 'height 1s ease-in-out',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-black text-[var(--bento-text)] drop-shadow-md">
            {waterPct}%
          </span>
          <span className="text-[0.65rem] text-[var(--bento-muted)] font-semibold tracking-wider uppercase">
            {t('dashboard.hydrated')}
          </span>
        </div>
      </div>

      <div className="text-center my-4 sm:my-5">
        <span className="text-xl sm:text-2xl font-extrabold text-[var(--bento-text)]">
          {water}
        </span>
        <span className="text-[var(--bento-muted)] text-sm font-semibold">
          {' '}/ {waterGoal} ml
        </span>
        <div className="dash-hydration-note mt-1">
          {waterRemaining > 0
            ? t('dashboard.leftToday', { amount: waterRemaining })
            : t('dashboard.goalComplete')}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {[250, 500].map((v) => (
          <button
            key={v}
            type="button"
            className="btn-olive w-full py-2 font-bold"
            onClick={() => onAddWater(v)}
          >
            + {v} ml
          </button>
        ))}
      </div>

      <div className="dash-hydration-tools mt-3">
        <button
          type="button"
          onClick={onUndoWater}
          disabled={waterHistory.length === 0}
          className="flex items-center gap-1"
        >
          <RotateCcw size={12} />
          {t('dashboard.undo')}
        </button>
        <button
          type="button"
          onClick={onResetWater}
          disabled={water === 0}
          className="flex items-center gap-1"
        >
          <Trash2 size={12} />
          {t('dashboard.resetToday')}
        </button>
      </div>

      <div className="dash-goal-picker mt-3" aria-label={t('dashboard.hydrationGoal')}>
        {[2000, 2500, 3000].map((goal) => (
          <button
            type="button"
            key={goal}
            className={waterGoal === goal ? 'active font-bold' : ''}
            onClick={() => onSetGoal(goal)}
          >
            {goal / 1000}L
          </button>
        ))}
      </div>
    </div>
  );
}
