import React from 'react';
import { Zap, Flame, Utensils, Target, Trophy, Check } from 'lucide-react';

export default function TodayMissionCard({ dailyMission, onAction, language }) {
  const isAr = language === 'ar';

  const getIcon = (iconName, isDone) => {
    const color = isDone ? '#10B981' : '#FAA802';
    switch (iconName) {
      case 'flame':
        return <Flame size={17} stroke={color} strokeWidth={2.2} />;
      case 'fork':
        return <Utensils size={17} stroke={color} strokeWidth={2.2} />;
      case 'target':
        return <Target size={17} stroke={color} strokeWidth={2.2} />;
      default:
        return <Zap size={17} stroke={color} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bento-card mission-card col-span-1 md:col-span-2 lg:col-span-4">
      <div className="trail trail-coral" style={{ width: 360, height: 360, top: '-55%', right: '12%', opacity: 0.14 }} />
      <div className="mission-card-inner">
        <div className="mission-hero">
          <div className="dash-eyebrow">
            <Zap size={13} className="text-[#FAA802]" strokeWidth={2.5} />
            <span>{isAr ? 'رحلة اليوم' : "Today's Mission"}</span>
          </div>
          <h1>{isAr ? 'ماذا يحتاج جسمك اليوم؟' : 'What does your body need today?'}</h1>
          <p>{dailyMission?.coachNote}</p>
          <div className="mission-progress">
            <div>
              <strong>{dailyMission?.completedCount || 0}/3</strong>
              <span>{isAr ? 'مهام مكتملة' : 'missions complete'}</span>
            </div>
            <div className="mission-progress-track">
              <div style={{ width: `${((dailyMission?.completedCount || 0) / 3) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="mission-list">
          {(dailyMission?.items || []).map((item) => (
            <div className={item.done ? 'mission-row mission-row-done' : 'mission-row'} key={item.id}>
              <div className="mission-icon">
                {getIcon(item.icon, item.done)}
              </div>
              <div className="mission-copy">
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
              </div>
              <button
                type="button"
                className={item.done ? 'mission-action is-done' : 'mission-action'}
                onClick={() => onAction(item.action)}
                disabled={item.done && item.action === 'hydrate'}
              >
                {item.done && item.action === 'hydrate' ? (
                  <Check size={14} stroke="#10B981" strokeWidth={2.6} />
                ) : (
                  item.cta
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mission-streak">
          <Trophy size={15} stroke="#FBB502" strokeWidth={2} />
          <span>{dailyMission?.streakText}</span>
        </div>
      </div>
    </div>
  );
}
