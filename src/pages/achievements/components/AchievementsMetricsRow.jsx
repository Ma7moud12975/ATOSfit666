import React from 'react';
import Icon from '../../../components/AppIcon';

const AchievementsMetricsRow = ({ stats, language = 'ar' }) => {
  const ar = language === 'ar';

  const cards = [
    {
      title: ar ? 'الشارات المفتوحة' : 'Unlocked Badges',
      value: `${stats?.unlockedCount || 0}`,
      subvalue: `/${stats?.totalBadges || 0}`,
      subtitle: ar ? `${stats?.overallProgressPct || 0}% من إجمالي الشارات` : `${stats?.overallProgressPct || 0}% total completion`,
      icon: 'Award',
      iconColor: 'text-[#FAA802]',
      iconBg: 'bg-[#FAA802]/15',
      barPct: stats?.overallProgressPct || 0,
      barGradient: 'from-[#FAA802] to-[#FBB502]'
    },
    {
      title: ar ? 'أيام الاستمرار' : 'Active Streak',
      value: `${stats?.currentStreak || 0}`,
      subvalue: ar ? 'أيام' : 'days',
      subtitle: ar ? `أطول سلسلة: ${stats?.longestStreak || 0} أيام` : `Best streak: ${stats?.longestStreak || 0} days`,
      icon: 'Flame',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/15',
      barPct: Math.min(100, ((stats?.currentStreak || 0) / 7) * 100),
      barGradient: 'from-amber-500 to-orange-500'
    },
    {
      title: ar ? 'إجمالي التمارين' : 'Workouts Logged',
      value: `${stats?.totalWorkouts || 0}`,
      subvalue: ar ? 'جلسة' : 'sessions',
      subtitle: ar ? `${(stats?.totalCalories || 0).toLocaleString()} سعرة حرارية محروقة` : `${(stats?.totalCalories || 0).toLocaleString()} kcal burned`,
      icon: 'Dumbbell',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-400/15',
      barPct: Math.min(100, ((stats?.totalWorkouts || 0) / 50) * 100),
      barGradient: 'from-cyan-400 to-blue-500'
    },
    {
      title: ar ? 'عملات المكافأة' : 'Reward Tokens',
      value: `${(stats?.totalTokens || 0).toLocaleString()}`,
      subvalue: 'ATOS',
      subtitle: ar ? 'تُمنح مع كل مستوى وشارة' : 'Earned from unlocked tiers',
      icon: 'Sparkles',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/15',
      barPct: Math.min(100, ((stats?.totalTokens || 0) / 2000) * 100),
      barGradient: 'from-emerald-400 to-teal-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div 
          key={idx}
          className="bento-card p-5 border border-white/10 bg-gradient-to-br from-black/30 via-white/[0.02] to-transparent hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
              <Icon name={card.icon} size={18} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
              {card.value}
            </span>
            <span className="text-xs font-mono font-semibold text-muted-foreground">
              {card.subvalue}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${card.barGradient}`}
              style={{ width: `${card.barPct}%` }}
            />
          </div>

          <p className="text-[11px] text-muted-foreground font-medium m-0 truncate">
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AchievementsMetricsRow;

