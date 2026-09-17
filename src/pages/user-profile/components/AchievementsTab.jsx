import React, { useEffect, useState } from 'react';
import { loadFullAchievementsData, subscribeToAchievements } from '../../../utils/achievementsService';
import AchievementCard from '../../achievements/components/AchievementCard';
import AchievementDetailModal from '../../achievements/components/AchievementDetailModal';
import { useLanguage } from '../../../contexts/LanguageContext';

const AchievementsTab = ({ user }) => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const uid = user?.id || user?.email || user?.principal;
        const res = await loadFullAchievementsData(uid);
        if (res?.achievements) {
          setAchievements(res.achievements);
          setStats(res.stats);
        }
      } catch (e) {
        console.warn('AchievementsTab load error:', e);
      }
    };

    load();
    const unsub = subscribeToAchievements(load);
    return () => unsub();
  }, [user]);

  const filtered = achievements.filter(a => {
    if (filter === 'unlocked') return a.isUnlocked;
    if (filter === 'in_progress') return a.isUnlocked && !a.isMax || !a.isUnlocked && a.progress > 0;
    if (filter === 'locked') return !a.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-bold block">{ar ? 'الشارات المفتوحة' : 'Unlocked'}</span>
            <strong className="text-xl font-mono text-foreground font-black">{stats.unlockedCount} / {stats.totalBadges}</strong>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-bold block">{ar ? 'رتبة الرياضي' : 'Rank Tier'}</span>
            <strong className="text-xl font-mono text-primary font-black uppercase">{stats.rankTier}</strong>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-bold block">{ar ? 'إجمالي XP' : 'Total XP'}</span>
            <strong className="text-xl font-mono text-foreground font-black">{stats.totalXp}</strong>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-bold block">{ar ? 'عملات ATOS' : 'ATOS Tokens'}</span>
            <strong className="text-xl font-mono text-emerald-400 font-black">+{stats.totalTokens}</strong>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: ar ? 'الكل' : 'All' },
          { id: 'unlocked', label: ar ? 'المكتملة' : 'Unlocked' },
          { id: 'in_progress', label: ar ? 'قيد التقدم' : 'In Progress' },
          { id: 'locked', label: ar ? 'المغلقة' : 'Locked' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <AchievementCard
            key={item.id}
            achievement={item}
            language={language}
            onClick={(a) => setSelectedAchievement(a)}
          />
        ))}
      </div>

      <AchievementDetailModal
        isOpen={Boolean(selectedAchievement)}
        onClose={() => setSelectedAchievement(null)}
        achievement={selectedAchievement}
        language={language}
      />
    </div>
  );
};

export default AchievementsTab;
