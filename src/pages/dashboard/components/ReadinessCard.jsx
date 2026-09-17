import React from 'react';
import { Zap } from 'lucide-react';

export default function ReadinessCard({ readiness, t }) {
  return (
    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-3 p-6 sm:p-7 dash-readiness-card">
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="font-extrabold text-[var(--bento-text)] text-base">
            {t('dashboard.readiness')}
          </span>
          <p className="text-[var(--bento-muted)] text-xs mt-1">
            {t('dashboard.readinessCopy')}
          </p>
        </div>
        <Zap size={20} className="text-[#FBB502]" strokeWidth={2.2} />
      </div>

      <div className="dash-readiness-layout">
        <div>
          <div className="dash-readiness-score">
            <span>{readiness?.score ?? '--'}</span>
            <small>{readiness?.score == null ? '' : '/100'}</small>
          </div>
          <div className="dash-readiness-status">{readiness?.label}</div>
        </div>

        <div className="dash-readiness-bars">
          {(readiness?.factors || []).map((item) => (
            <div key={item.label}>
              <div className="dash-bar-row">
                <span>{item.label}</span>
                <strong>{item.val}%</strong>
              </div>
              <div className="dash-soft-track">
                <div style={{ width: `${item.val}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="dash-readiness-focus">
          <span>{t('dashboard.bestNextBlock')}</span>
          <strong>{readiness?.bestNextBlock}</strong>
          <p>{readiness?.copy}</p>
        </div>
      </div>
    </div>
  );
}
