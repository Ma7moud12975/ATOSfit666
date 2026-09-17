import React from 'react';
import Icon from '../../../components/AppIcon';
import { TIER_THEMES } from '../../../utils/achievementsService';

const AchievementCard = ({ achievement, language = 'ar', onClick }) => {
  const ar = language === 'ar';
  const tier = achievement.currentTier || 'bronze';
  const theme = TIER_THEMES[tier] || TIER_THEMES.bronze;
  const isUnlocked = achievement.isUnlocked;
  const isMax = achievement.isMax;

  // Title and Description in active language
  const title = ar ? (achievement.title?.ar || achievement.title?.en) : achievement.title?.en;
  const desc = ar ? (achievement.description?.ar || achievement.description?.en) : achievement.description?.en;
  const unit = ar ? (achievement.unit?.ar || achievement.unit?.en) : achievement.unit?.en;

  // Next goal remaining
  const remaining = Math.max(0, achievement.nextTarget - achievement.progress);

  return (
    <div 
      onClick={() => onClick(achievement)}
      className={`bento-card p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
        isUnlocked 
          ? 'border-white/10 hover:border-white/25 bg-gradient-to-br from-black/40 via-white/[0.02] to-transparent hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]' 
          : 'border-white/5 bg-black/20 opacity-75 hover:opacity-100 hover:border-white/15'
      }`}
    >
      {/* Ambient background glow if unlocked */}
      {isUnlocked && (
        <div 
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[60px] pointer-events-none opacity-20 transition-opacity group-hover:opacity-40"
          style={{ background: theme.glow }}
        />
      )}

      {/* Header: Icon + Category + Tokens */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5">
          {/* Badge Icon */}
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105"
            style={{
              background: isUnlocked ? `linear-gradient(135deg, ${theme.glow} 0%, rgba(20,20,25,0.8) 100%)` : 'rgba(255,255,255,0.03)',
              borderColor: isUnlocked ? theme.border.replace('border-', '').replace('/40', '') || '#FAA802' : 'rgba(255,255,255,0.08)',
              boxShadow: isUnlocked ? `0 0 20px ${theme.glow}` : 'none'
            }}
          >
            <Icon 
              name={achievement.icon || 'Trophy'} 
              size={22} 
              className={isUnlocked ? theme.text : 'text-muted-foreground'} 
            />
          </div>

          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-white/5 border border-white/5">
                {achievement.category === 'upper_body' ? (ar ? 'جزء علوي' : 'Upper Body') :
                 achievement.category === 'lower_body' ? (ar ? 'جزء سفلي' : 'Lower Body') :
                 achievement.category === 'core' ? (ar ? 'البطن والجذع' : 'Core & Abs') :
                 achievement.category === 'cardio' ? (ar ? 'كارديو' : 'Cardio & HIIT') :
                 (ar ? 'محطة هامة' : 'Milestone')}
              </span>
              {isMax && (
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  {ar ? 'مكتمل بالكامل' : 'MAX LEVEL'}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1 m-0">
              {title}
            </h3>
          </div>
        </div>

        {/* Level Indicator Pill */}
        <div className="text-right shrink-0">
          <span 
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm ${
              isUnlocked ? `${theme.badgeBg} ${theme.text} ${theme.border}` : 'bg-white/5 text-muted-foreground border-white/10'
            }`}
          >
            {isUnlocked ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {ar ? `المستوى ${achievement.level}` : `LVL ${achievement.level}`}
              </>
            ) : (
              <>
                <Icon name="Lock" size={10} />
                {ar ? 'مغلق' : 'LOCKED'}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {desc}
      </p>

      {/* Multi-Level Star/Dot Roadmap */}
      {achievement.maxLevel > 1 && (
        <div className="flex items-center gap-1.5 mb-3.5">
          {achievement.levels.map((lvl) => {
            const isLvlDone = achievement.level >= lvl.level;
            const isLvlNext = achievement.level + 1 === lvl.level;
            const lvlTheme = TIER_THEMES[lvl.tier] || TIER_THEMES.bronze;

            return (
              <div 
                key={lvl.level}
                title={`Level ${lvl.level}: ${lvl.goal} ${unit}`}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  isLvlDone 
                    ? `bg-gradient-to-r ${lvlTheme.barGradient}` 
                    : isLvlNext 
                      ? 'bg-white/20 border border-white/20 animate-pulse' 
                      : 'bg-white/5'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Numerical Progress Row */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-mono text-muted-foreground">
          <strong className="text-foreground font-bold">{achievement.progress.toLocaleString()}</strong>
          <span className="mx-1">/</span>
          {achievement.nextTarget.toLocaleString()} {unit}
        </span>
        <span className="font-mono font-bold text-xs text-foreground">
          {achievement.percent}%
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="h-2 rounded-full bg-black/40 overflow-hidden border border-white/5 relative p-0.5 mb-3.5">
        <div 
          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
            isUnlocked ? theme.barGradient : 'from-white/10 to-white/20'
          }`}
          style={{ width: `${achievement.percent}%` }}
        />
      </div>

      {/* Footer: Next Goal / Motivational Cue + Action hint */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate pr-2">
          {isMax ? (
            <span className="text-purple-300 font-semibold flex items-center gap-1">
              <Icon name="CheckCircle2" size={13} className="text-purple-400" />
              {ar ? 'أعلى تصنيف تم تحقيقه' : 'Highest tier achieved'}
            </span>
          ) : isUnlocked ? (
            <span className="text-muted-foreground">
              {ar 
                ? `متبقي ${remaining.toLocaleString()} ${unit} للمستوى التالي`
                : `${remaining.toLocaleString()} ${unit} to next level`}
            </span>
          ) : (
            <span className="text-muted-foreground/80">
              {ar ? `ابدأ بـ ${achievement.nextTarget} ${unit} لفتح الشارة` : `Do ${achievement.nextTarget} ${unit} to unlock`}
            </span>
          )}
        </span>

        <span className="font-mono text-[11px] font-bold text-primary flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
          {ar ? 'التفاصيل' : 'Details'}
          <Icon name={ar ? 'ChevronLeft' : 'ChevronRight'} size={12} />
        </span>
      </div>
    </div>
  );
};

export default AchievementCard;

