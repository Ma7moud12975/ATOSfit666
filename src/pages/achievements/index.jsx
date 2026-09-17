import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAccountId } from '../../utils/localAccountStorage';
import {
  loadFullAchievementsData,
  subscribeToAchievements
} from '../../utils/achievementsService';
import AthleteRankHero from './components/AthleteRankHero';
import AchievementsMetricsRow from './components/AchievementsMetricsRow';
import AchievementCard from './components/AchievementCard';
import AchievementDetailModal from './components/AchievementDetailModal';
import '../../styles/bento-dashboard.css';

const CATEGORIES = [
  { id: 'all', icon: 'Sparkles', label: { en: 'All Badges', ar: 'كل الشارات' } },
  { id: 'upper_body', icon: 'Dumbbell', label: { en: 'Upper Body', ar: 'الجزء العلوي' } },
  { id: 'lower_body', icon: 'Activity', label: { en: 'Lower Body', ar: 'الجزء السفلي' } },
  { id: 'core', icon: 'Shield', label: { en: 'Core & Abs', ar: 'البطن والجذع' } },
  { id: 'cardio', icon: 'Zap', label: { en: 'Cardio & HIIT', ar: 'كارديو وتحمل' } },
  { id: 'milestones', icon: 'Trophy', label: { en: 'Milestones', ar: 'المحطات والأرقام' } },
];

const STATUS_FILTERS = [
  { id: 'all', label: { en: 'All', ar: 'الكل' } },
  { id: 'unlocked', label: { en: 'Unlocked', ar: 'المكتملة' } },
  { id: 'in_progress', label: { en: 'In Progress', ar: 'قيد التقدم' } },
  { id: 'locked', label: { en: 'Locked', ar: 'المغلقة' } },
];

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const ar = language === 'ar';

  const [user, setUser] = useState({ name: 'Athlete', email: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name || u?.email) {
        setUser(u);
      }
    } catch {}
  }, []);

  // Fetch full reconciled achievements
  const refreshAchievements = useCallback(async (showSyncSpinner = false) => {
    if (showSyncSpinner) setIsSyncing(true);
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const uid = u?.id || u?.principal || u?.email || getAccountId();
      const result = await loadFullAchievementsData(uid);

      if (result?.achievements) {
        setAchievements(result.achievements);
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setIsLoading(false);
      if (showSyncSpinner) setIsSyncing(false);
    }
  }, []);

  // Initial load + real-time subscription
  useEffect(() => {
    // 1. Instant load from local cache if present
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const uid = u?.id || u?.principal || u?.email || getAccountId();
      const cached = localStorage.getItem(`atos_account:${getAccountId(uid)}:achievements_cache`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.achievements) {
          setAchievements(parsed.achievements);
          setStats(parsed.stats);
          setIsLoading(false);
        }
      }
    } catch {}

    // 2. Fresh background fetch & reconciliation
    refreshAchievements();

    // 3. Listen to live updates from workouts or data updates
    const unsubscribe = subscribeToAchievements(() => {
      console.log('⚡ [AchievementsPage] Live update signal received, refreshing...');
      refreshAchievements(false);
    });

    return () => unsubscribe();
  }, [refreshAchievements]);

  // Filtering & Search
  const filteredAchievements = useMemo(() => {
    return achievements.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'unlocked' && !item.isUnlocked) return false;
      if (statusFilter === 'in_progress' && (item.isUnlocked && item.isMax || !item.isUnlocked && item.progress === 0)) return false;
      if (statusFilter === 'locked' && item.isUnlocked) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const enTitle = String(item.title?.en || '').toLowerCase();
        const arTitle = String(item.title?.ar || '').toLowerCase();
        const enDesc = String(item.description?.en || '').toLowerCase();
        const arDesc = String(item.description?.ar || '').toLowerCase();
        if (!enTitle.includes(q) && !arTitle.includes(q) && !enDesc.includes(q) && !arDesc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [achievements, activeCategory, statusFilter, searchQuery]);

  // Counts per category for pills
  const categoryCounts = useMemo(() => {
    const counts = { all: achievements.length };
    CATEGORIES.forEach(c => {
      if (c.id !== 'all') {
        counts[c.id] = achievements.filter(a => a.category === c.id).length;
      }
    });
    return counts;
  }, [achievements]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-screen');
  };

  return (
    <div className="bento-root achievements-shell min-h-screen">
      {/* Background ambient lighting */}
      <div className="trail trail-coral" style={{ width: 650, height: 650, top: '-5%', right: '10%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 550, height: 550, bottom: '10%', left: '-5%', opacity: 0.06 }} />

      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />
      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-24 lg:pl-72 min-h-screen relative z-10 pb-16">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
          
          {/* Header Title Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-primary font-mono">
                  ATOS GAMIFIED ENGINE
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black m-0 tracking-tight" style={{ color: 'var(--bento-text)' }}>
                {t('achievements.title')}
              </h1>
              <p className="text-sm sm:text-base mt-1 font-medium" style={{ color: 'var(--bento-soft-text)' }}>
                {t('achievements.subtitle')}
              </p>
            </div>

            {/* Direct Link to workout screen */}
            <button
              onClick={() => navigate('/exercise-workout')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-black shadow-[0_8px_20px_rgba(250,168,2,0.3)] hover:shadow-[0_10px_25px_rgba(250,168,2,0.45)] hover:scale-[1.02] transition-all cursor-pointer shrink-0 self-start sm:self-auto"
              style={{ background: 'linear-gradient(135deg, #FAA802 0%, #FBB502 100%)' }}
            >
              <Icon name="Play" size={16} />
              {ar ? 'ابدأ تمريناً جديداً' : 'Start Workout'}
            </button>
          </div>

          {/* 1. Athlete Rank & Level Hero Banner */}
          <AthleteRankHero 
            stats={stats} 
            language={language}
            isSyncing={isSyncing}
            onSync={() => refreshAchievements(true)}
          />

          {/* 2. Core Metrics Row (4 Bento cards) */}
          <AchievementsMetricsRow 
            stats={stats} 
            language={language} 
          />

          {/* 3. Category Tabs & Search Bar */}
          <div className="mb-6 flex flex-col gap-4">
            {/* Category Pills Carousel / Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer border ${
                      isActive 
                        ? 'bg-primary text-black border-primary shadow-[0_6px_20px_rgba(250,168,2,0.35)]' 
                        : 'bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] border-white/5'
                    }`}
                  >
                    <Icon name={cat.icon} size={15} />
                    <span>{cat.label[language] || cat.label.en}</span>
                    <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Bar: Status Tabs + Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/20 border border-white/5 p-3 rounded-2xl">
              {/* Status Segmented Control */}
              <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 overflow-x-auto">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-white/15 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f.label[language] || f.label.en}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Icon 
                  name="Search" 
                  size={15} 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={ar ? 'ابحث عن شارة أو تمرين...' : 'Search badges or exercises...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Achievements Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bento-card p-6 h-52 animate-pulse bg-white/[0.02] border border-white/5" />
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="bento-card p-12 text-center border border-white/5 bg-black/20">
              <div className="w-16 h-16 rounded-2xl bg-white/5 text-muted-foreground flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" size={28} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {ar ? 'لم يتم العثور على شارات مطابقة' : 'No matching badges found'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                {ar 
                  ? 'جرّب تعديل الفلتر أو مصطلح البحث، أو أكمل تمريناً جديداً لفتح شارات جديدة.' 
                  : 'Try adjusting your filters or search term, or complete a new workout session to unlock more badges.'}
              </p>
              <button
                onClick={() => { setActiveCategory('all'); setStatusFilter('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-foreground transition-colors cursor-pointer"
              >
                {ar ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  language={language}
                  onClick={(item) => setSelectedAchievement(item)}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Achievement Detail & Roadmap Modal */}
      <AchievementDetailModal
        isOpen={Boolean(selectedAchievement)}
        onClose={() => setSelectedAchievement(null)}
        achievement={selectedAchievement}
        language={language}
      />
    </div>
  );
};

export default AchievementsPage;

