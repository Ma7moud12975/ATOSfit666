import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { TIER_THEMES } from '../../../utils/achievementsService';

const AchievementDetailModal = ({ achievement, isOpen, onClose, language = 'ar' }) => {
  const navigate = useNavigate();
  const ar = language === 'ar';

  if (!isOpen || !achievement) return null;

  const tier = achievement.currentTier || 'bronze';
  const theme = TIER_THEMES[tier] || TIER_THEMES.bronze;
  const isUnlocked = achievement.isUnlocked;
  const isMax = achievement.isMax;

  const title = ar ? (achievement.title?.ar || achievement.title?.en) : achievement.title?.en;
  const desc = ar ? (achievement.description?.ar || achievement.description?.en) : achievement.description?.en;
  const unit = ar ? (achievement.unit?.ar || achievement.unit?.en) : achievement.unit?.en;

  const handleStartWorkout = () => {
    onClose();
    if (achievement.exerciseKey) {
      navigate('/exercise-workout', { state: { selectedExercise: achievement.exerciseKey } });
    } else {
      navigate('/exercise-workout');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[10000] animate-fadeIn"
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div 
          dir={ar ? 'rtl' : 'ltr'}
          className="w-full max-w-xl rounded-[28px] border bg-gradient-to-b from-[#181820] to-[#121217] p-6 sm:p-8 relative shadow-[0_32px_80px_rgba(0,0,0,0.8)] animate-scaleUp overflow-hidden"
          style={{ borderColor: theme.border.replace('border-', '').replace('/40', '') || '#FAA802' }}
        >
          {/* Top Ambient Glow */}
          <div 
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-[90px] pointer-events-none opacity-35"
            style={{ background: theme.glow }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center border border-white/10 transition-colors z-20 cursor-pointer"
          >
            <Icon name="X" size={16} />
          </button>

          {/* Badge Icon & Tier Emblem */}
          <div className="flex flex-col items-center text-center relative z-10 mb-6">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center border-2 mb-4 relative shadow-2xl transition-transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(15,15,20,0.9) 100%)`,
                borderColor: theme.border.replace('border-', '').replace('/40', '') || '#FAA802',
                boxShadow: `0 0 40px ${theme.glow}`
              }}
            >
              <Icon 
                name={achievement.icon || 'Trophy'} 
                size={44} 
                className={isUnlocked ? theme.text : 'text-muted-foreground'} 
              />
              <span className={`absolute -bottom-2.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-md ${theme.badgeBg} ${theme.text}`}>
                {theme.name} TIER
              </span>
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
              {achievement.category === 'upper_body' ? (ar ? 'الجزء العلوي • قوة ودفع' : 'Upper Body • Push Power') :
               achievement.category === 'lower_body' ? (ar ? 'الجزء السفلي • قوة وثبات' : 'Lower Body • Strength') :
               achievement.category === 'core' ? (ar ? 'البطن والجذع • ثبات' : 'Core & Midsection') :
               achievement.category === 'cardio' ? (ar ? 'كارديو وتحمل' : 'Cardio & Endurance') :
               (ar ? 'محطة قياسية' : 'Athletic Milestone')}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground m-0 tracking-tight">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md">
              {desc}
            </p>
          </div>

          {/* Current Progress Meter */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:p-5 mb-6 relative z-10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground font-semibold">
                {ar ? 'التقدم الإجمالي المسجل' : 'Cumulative Progress'}
              </span>
              <span className="font-mono font-bold text-foreground">
                <strong className="text-lg text-primary">{achievement.progress.toLocaleString()}</strong>
                <span className="text-muted-foreground mx-1">/</span>
                {achievement.nextTarget.toLocaleString()} {unit}
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/10 mb-2 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${theme.barGradient}`}
                style={{ width: `${achievement.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>{achievement.percent}% {ar ? 'مكتمل' : 'Completed'}</span>
              <span>
                {isMax ? (
                  ar ? 'وصلت لأعلى رتبة! 🏆' : 'Max Level Achieved! 🏆'
                ) : (
                  ar 
                    ? `باقي ${(achievement.nextTarget - achievement.progress).toLocaleString()} ${unit} للرتبة التالية`
                    : `${(achievement.nextTarget - achievement.progress).toLocaleString()} ${unit} remaining`
                )}
              </span>
            </div>
          </div>

          {/* Multi-Level Milestones List */}
          <div className="space-y-2 mb-6 relative z-10 max-h-56 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {ar ? 'مستويات الشارة ومكافآتها' : 'Tier Milestones & Rewards'}
            </h4>

            {achievement.levels.map((lvl) => {
              const isAchieved = achievement.level >= lvl.level;
              const isCurrent = achievement.level + 1 === lvl.level;
              const lvlTheme = TIER_THEMES[lvl.tier] || TIER_THEMES.bronze;
              const lvlTitle = ar ? (lvl.title?.ar || lvl.title?.en) : lvl.title?.en;

              return (
                <div 
                  key={lvl.level}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAchieved 
                      ? 'bg-white/[0.04] border-white/15' 
                      : isCurrent 
                        ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(250,168,2,0.15)]' 
                        : 'bg-white/[0.01] border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isAchieved ? `${lvlTheme.badgeBg} ${lvlTheme.text}` : 'bg-white/5 text-muted-foreground'
                    }`}>
                      {isAchieved ? <Icon name="Check" size={14} /> : `L${lvl.level}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {lvlTitle}
                        </span>
                        <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${lvlTheme.badgeBg} ${lvlTheme.text}`}>
                          {lvl.tier}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {lvl.goal.toLocaleString()} {unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-primary block">
                      +{lvl.tokens} Tokens
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      +{lvl.xp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Biomechanical Tip */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-6 flex items-start gap-3 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="Sparkles" size={15} />
            </div>
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>{ar ? 'نصيحة الكوتش الذكي:' : 'AI Coach Cue:'}</strong>{' '}
              {ar 
                ? 'حافظ على وتيرة 2 ثانية في النزول وثانية واحدة في الصعود لزيادة التفعيل العضلي وسرعة حصد التكرارات الدقيقة.'
                : 'Maintain controlled 2-second eccentric movement to maximize biomechanical motor unit recruitment and log pristine reps.'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={handleStartWorkout}
              className="flex-1 py-3.5 px-5 rounded-xl font-black text-sm text-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_10px_25px_rgba(250,168,2,0.35)] hover:shadow-[0_12px_30px_rgba(250,168,2,0.5)] hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, #FAA802 0%, #FBB502 100%)' }}
            >
              <Icon name="Play" size={16} />
              {ar ? 'تمرّن الآن لترقية الشارة' : 'Train Now to Level Up'}
            </button>

            <button
              onClick={onClose}
              className="py-3.5 px-5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10 transition-colors cursor-pointer"
            >
              {ar ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AchievementDetailModal;

