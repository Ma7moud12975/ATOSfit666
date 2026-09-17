import React from 'react';
import { Star } from 'lucide-react';

export default function DailyDoseCard({ quotes = [], quoteIdx = 0, onNextQuote, t }) {
  const currentQuote = quotes[quoteIdx] || {
    title: 'Mindset',
    body: 'Consistency beats intensity. Show up every day.',
  };

  return (
    <div
      className="bento-card col-span-1 lg:col-span-2 p-6 sm:p-7 cursor-pointer select-none transition-all duration-300 hover:border-[#FAA802]/40"
      onClick={onNextQuote}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="inline-flex items-center gap-1.5 bg-[var(--bento-chip)] border border-[var(--bento-border)] rounded-full px-3 py-1">
          <Star size={13} className="text-[#FAA802]" strokeWidth={2.4} />
          <span className="text-[0.68rem] text-[var(--bento-muted)] font-bold uppercase tracking-wider">
            {t('dashboard.dailyDose')}
          </span>
        </div>

        <div className="flex gap-1.5 items-center">
          {quotes.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === quoteIdx ? '#FAA802' : 'var(--bento-border)',
                width: i === quoteIdx ? 20 : 6,
              }}
            />
          ))}
        </div>
      </div>

      <h4 className="text-[#FAA802] font-bold text-sm mb-2">{currentQuote.title}</h4>
      <p className="text-[var(--bento-soft-text)] text-base sm:text-lg font-medium leading-relaxed m-0 italic">
        "{currentQuote.body}"
      </p>
      <p className="text-[var(--bento-muted)] text-xs mt-4">Tap to see next →</p>
    </div>
  );
}
