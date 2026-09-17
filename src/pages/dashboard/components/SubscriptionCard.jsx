import React from 'react';
import { Crown, Check, Zap } from 'lucide-react';

export default function SubscriptionCard({ subscription, onUpgrade, t }) {
  const isPro = subscription?.isPro;

  const features = [
    'Personalized AI programs',
    'Unlimited food scanning',
    'Advanced performance analytics',
  ];

  return (
    <div className="bento-card sub-border col-span-1 lg:col-span-2 p-6 sm:p-7 bg-gradient-to-br from-[#FAA802]/10 via-[var(--bento-card-strong)] to-[var(--bento-card)]">
      <div
        className="trail trail-coral"
        style={{ width: 200, height: 200, top: '-30%', right: '-10%', opacity: 0.18 }}
      />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-[#FAA802]/15 border border-[#FAA802]/35 rounded-full px-3 py-1 mb-4">
          <Crown size={14} className="text-[#FAA802]" strokeWidth={2.4} />
          <span className="text-xs text-[#FAA802] font-black uppercase tracking-wider">
            {isPro ? `${subscription?.plan || 'PRO'} PLAN` : t('dashboard.proPlan')}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-[var(--bento-text)] m-0 mb-2 leading-tight">
          {isPro ? 'Your Plan is Active' : t('dashboard.unlockElite')}
        </h3>

        <p className="text-[var(--bento-muted)] text-sm leading-relaxed mb-5">
          {isPro
            ? 'Elite access and all AI intelligent coaching features are fully activated.'
            : t('dashboard.upgradeCopy')}
        </p>

        <div className="flex flex-col gap-2.5 mb-6">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Check size={13} className="text-emerald-400" strokeWidth={2.8} />
              </div>
              <span className="text-[var(--bento-soft-text)] text-xs sm:text-sm font-medium">
                {f}
              </span>
            </div>
          ))}
        </div>

        {!isPro && (
          <button
            type="button"
            className="btn-coral w-full justify-center py-3 text-sm font-extrabold shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={onUpgrade}
          >
            <Zap size={16} fill="#08080A" stroke="#08080A" strokeWidth={2} />
            <span>{t('dashboard.upgradeNow')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
