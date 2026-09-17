import React from 'react';
import { Utensils, ScanLine } from 'lucide-react';

export default function NutritionCard({ nutrition, onScanMeal, language, t }) {
  const isAr = language === 'ar';

  const macros = [
    {
      label: t('dashboard.protein'),
      val: nutrition?.proteinPct || 0,
      text: `${Math.round(nutrition?.totals?.protein || 0)} / ${nutrition?.targets?.protein || 150}g`,
      color: 'bg-emerald-500',
    },
    {
      label: t('dashboard.carbs'),
      val: nutrition?.carbsPct || 0,
      text: `${Math.round(nutrition?.totals?.carbs || 0)} / ${nutrition?.targets?.carbs || 200}g`,
      color: 'bg-blue-500',
    },
    {
      label: t('dashboard.fat'),
      val: nutrition?.fatPct || 0,
      text: `${Math.round(nutrition?.totals?.fat || 0)} / ${nutrition?.targets?.fat || 65}g`,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-1 p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="font-extrabold text-[var(--bento-text)] text-base">
            {t('dashboard.nutrition')}
          </span>
          <Utensils size={18} className="text-[#FAA802]" strokeWidth={2.2} />
        </div>

        <div className="dash-nutrition-hero mb-3">
          <strong>{Math.round(nutrition?.remainingCalories || 0)}</strong>
          <span>{t('dashboard.kcalRemaining')}</span>
        </div>

        {nutrition?.mealCount === 0 && (
          <p className="text-center text-xs text-[var(--bento-muted)] mb-3">
            {isAr ? 'لم يتم تسجيل وجبات اليوم بعد.' : 'No meals logged today yet.'}
          </p>
        )}

        <div className="dash-macro-list space-y-3">
          {macros.map((item) => (
            <div key={item.label}>
              <div className="dash-bar-row mb-1">
                <span>{item.label}</span>
                <strong>{item.text}</strong>
              </div>
              <div className="dash-soft-track">
                <div style={{ width: `${Math.min(100, item.val)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-olive w-full mt-5 font-bold" onClick={onScanMeal}>
        <ScanLine size={16} className="text-[#FAA802]" strokeWidth={2.2} />
        <span>{t('dashboard.scanNextMeal')}</span>
      </button>
    </div>
  );
}
