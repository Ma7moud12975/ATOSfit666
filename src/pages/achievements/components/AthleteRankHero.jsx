import React from 'react';
import Icon from '../../../components/AppIcon';
import { TIER_THEMES } from '../../../utils/achievementsService';

const AthleteRankHero = ({ stats, language = 'ar', isSyncing = false, onSync = () => {} }) => {
  const ar = language === 'ar';
  const tier = stats?.rankTier || 'bronze';
  const theme = TIER_THEMES[tier] || TIER_THEMES.bronze;

  return (
    <div className="bento-card mb-6 p-6 sm:p-8 relative overflow-hidden border border-white/10 bg-gradient-to-br from-black/40 via-white/[0.02] to-transparent shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      {/* Ambient background glow matching athlete tier */}
      <div 
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-25"
        style={{ background: theme.glow }}
      />
      <div 
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-[90px] pointer-events-none opacity-20"
        style={{ background: 'rgba(250, 168, 2, 0.2)' }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left / Main Profile Crest */}
        <div className="flex items-center gap-5 sm:gap-6 w-full lg:w-auto">
          {/* Glowing Emblem */}
          <div className="relative shrink-0">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-2 transition-transform duration-500 hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(20,20,25,0.9) 100%)`,
                borderColor: theme.border.replace('border-', '').replace('/40', '') || '#FAA802',
                boxShadow: `0 0 30px ${theme.glow}`
              }}
            >
              <div className="text-center">
                <Icon name="Trophy" size={32} className={theme.text} />
                <span className="block text-[11px] font-mono font-black tracking-widest uppercase mt-0.5 text-white/80">
                  LVL {stats?.level || 1}
                </span>
              </div>
            </div>

            {/* Tier Mini Badge */}
            <span 
              className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-lg ${theme.badgeBg} ${theme.text}`}
            >
              {theme.name}
            </span>
          </div>

          {/* Rank Title & Bio */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-primary">
                {ar ? 'رتبة الرياضي' : 'ATHLETE RANK'}
              </span>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Icon name="Sparkles" size={13} className="text-[#FAA802]" />
                {stats?.totalXp?.toLocaleString() || 0} {ar ? 'نقطة خبرة XP' : 'ATOS XP'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight m-0">
              {ar ? stats?.rankTitle?.ar : stats?.rankTitle?.en}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl line-clamp-1">
              {ar 
                ? `افتح شارات إضافية من التمارين اليومية لترقية رتبتك إلى المستوى التالي (+${stats?.xpToNextLevel || 100} XP)`
                : `Unlock more exercise badges to elevate your rank to the next tier (+${stats?.xpToNextLevel || 100} XP to next rank)`}
            </p>
          </div>
        </div>

        {/* Right: XP Bar & Live Sync Button */}
        <div className="w-full lg:w-80 flex flex-col gap-3 bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold">
              {ar ? 'التقدم للمستوى التالي' : 'Level Progression'}
            </span>
            <span className="font-mono font-bold text-foreground">
              {stats?.progressPct || 0}%
            </span>
          </div>

          {/* Progress track */}
          <div className="h-3 rounded-full bg-black/40 overflow-hidden border border-white/10 relative p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${theme.barGradient}`}
              style={{ width: `${stats?.progressPct || 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {ar ? `المستوى ${stats?.level || 1}` : `Level ${stats?.level || 1}`}
            </span>
            <span className="font-mono">
              {ar ? `متبقي ${stats?.xpToNextLevel || 0} XP` : `${stats?.xpToNextLevel || 0} XP to Level ${(stats?.level || 1) + 1}`}
            </span>
          </div>

          {/* Sync status & trigger */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {ar ? 'مربوط بقاعدة البيانات' : 'Synced with Cloud DB'}
            </div>
            <button
              onClick={onSync}
              disabled={isSyncing}
              title={ar ? 'تحديث ومزامنة الإنجازات' : 'Sync achievements with database'}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer border border-white/10"
            >
              <Icon 
                name="RefreshCw" 
                size={12} 
                className={isSyncing ? 'animate-spin text-primary' : ''} 
              />
              {isSyncing ? (ar ? 'جاري المزامنة...' : 'Syncing...') : (ar ? 'مزامنة الآن' : 'Sync Now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteRankHero;

