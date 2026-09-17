import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../utils/nativeAuth';
import AppHeader from '../../components/ui/AppHeader';
import SidebarNavigation from '../../components/ui/SidebarNavigation';
import CoachPulse from '../../components/CoachPulse';
import MonthlyPlanOverviewModal from '../../components/MonthlyPlanOverviewModal';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  DASHBOARD_DATA_UPDATED,
  addHydration,
  getDashboardSnapshot,
  resetHydration,
  setHydrationGoal,
  undoHydration,
} from '../../utils/dashboardStatsService';
import {
  getUserTrainingPlan,
  resetTrainingPlan,
} from '../../utils/trainingPlanEngine';
import '../../styles/bento-dashboard.css';

// Modular Bento Components
import TodayMissionCard from './components/TodayMissionCard';
import TodayWorkoutCard from './components/TodayWorkoutCard';
import HydrationCard from './components/HydrationCard';
import NutritionCard from './components/NutritionCard';
import ReadinessCard from './components/ReadinessCard';
import WeeklyProgressCard from './components/WeeklyProgressCard';
import DailyDoseCard from './components/DailyDoseCard';
import SubscriptionCard from './components/SubscriptionCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language, t } = useLanguage();

  const [user, setUser] = useState({ name: 'Mahmoud Ayman', profilePicture: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const [dashboardData, setDashboardData] = useState(() => getDashboardSnapshot());
  const [trainingPlan, setTrainingPlan] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return getUserTrainingPlan(u.principal || u.id || u.email || u.name, u);
    } catch {
      return null;
    }
  });

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Initial user & plan load
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name || u?.id) setUser(u);
      const accountId = u.principal || u.id || u.email || u.name;
      setDashboardData(getDashboardSnapshot(accountId));
      setTrainingPlan(getUserTrainingPlan(accountId, u));
    } catch (err) {
      console.error('Error hydrating dashboard initial state:', err);
    }
  }, [todayKey]);

  // Reactive listeners for live updates (Supabase, workouts, logs, profile)
  useEffect(() => {
    const refreshDashboard = () => {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.name || u?.id) setUser(u);
      const accountId = user.principal || user.id || user.email || user.name || u.principal || u.id || u.email || u.name;
      setDashboardData(getDashboardSnapshot(accountId));
      setTrainingPlan(getUserTrainingPlan(accountId, u));
    };

    window.addEventListener(DASHBOARD_DATA_UPDATED, refreshDashboard);
    window.addEventListener('workoutCompleted', refreshDashboard);
    window.addEventListener('achievementEarned', refreshDashboard);
    window.addEventListener('atos_user_profile_hydrated', refreshDashboard);
    window.addEventListener('storage', refreshDashboard);

    return () => {
      window.removeEventListener(DASHBOARD_DATA_UPDATED, refreshDashboard);
      window.removeEventListener('workoutCompleted', refreshDashboard);
      window.removeEventListener('achievementEarned', refreshDashboard);
      window.removeEventListener('atos_user_profile_hydrated', refreshDashboard);
      window.removeEventListener('storage', refreshDashboard);
    };
  }, [user]);

  // Handlers
  const handleResetPlan = useCallback(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const accountId = user.principal || user.id || user.email || user.name || u.principal || u.id || u.email || u.name;
      const newPlan = resetTrainingPlan(accountId, u);
      setTrainingPlan(newPlan);
      setDashboardData(getDashboardSnapshot(accountId));
    } catch (e) {
      console.error('Error resetting plan:', e);
    }
  }, [user]);

  const handleStartWorkout = useCallback((customDay = null) => {
    const planToPass = customDay || dashboardData.todayWorkout?.plan;
    if (planToPass) {
      navigate('/exercise-workout-screen', {
        state: {
          todayPlan: {
            name: planToPass.title || planToPass.name,
            phase: planToPass.phase,
            isRestDay: planToPass.isRestDay,
            dayIndex: planToPass.dayIndex,
            exercises: (planToPass.exercises || []).map((ex) => ({
              name: ex.name,
              category: ex.category,
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.durationSec ? `${Math.round(ex.durationSec / 60)} min` : `${ex.sets} sets`,
              completed: Boolean(ex.completed),
            })),
          },
        },
      });
    } else {
      navigate('/exercise-workout-screen');
    }
  }, [navigate, dashboardData.todayWorkout]);

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch {}
    try { await logoutUser(); } catch {}
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('atos_native_session');
      localStorage.removeItem('atos_auth_token');
      localStorage.removeItem('atos_auth_token_exp');
      localStorage.removeItem('atos_google_session');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/login-screen';
  }, [logout]);

  const dashboardAccountId = dashboardData.accountId || user.principal || user.id || user.email || user.name;

  const handleAddWater = (amount) => {
    addHydration(amount, dashboardAccountId);
  };
  const handleUndoWater = () => {
    undoHydration(dashboardAccountId);
  };
  const handleResetWater = () => {
    resetHydration(dashboardAccountId);
  };
  const handleSetGoal = (goal) => {
    setHydrationGoal(goal, dashboardAccountId);
  };

  const handleMissionAction = (action) => {
    if (action === 'workout') {
      handleStartWorkout();
      return;
    }
    if (action === 'meal') {
      navigate('/food-scanner');
      return;
    }
    if (action === 'hydrate') {
      handleAddWater(250);
    }
  };

  // Quotes / Daily Dose
  const quotes = useMemo(() => [
    dashboardData.tip,
    { title: 'Mindset', body: "Consistency beats intensity. Show up every day, even when you don't feel like it." },
    { title: 'Recovery', body: 'Sleep is where your muscles are built. Aim for 7–9 hrs to maximize gains.' },
    { title: 'Nutrition', body: 'Protein within 30 min post-workout accelerates muscle repair and growth.' },
  ].filter(Boolean), [dashboardData.tip]);

  // Fallback exercises
  const defaultExercises = language === 'ar'
    ? ['ضغط', 'ضغط واسع', 'سكوات', 'بلانك', 'اندفاع', 'متسلق الجبل']
    : ['Push-ups', 'Wide Push Ups', 'Squats', 'Plank', 'Lunges', 'Mountain Climbers'];

  const displayedExercises = dashboardData.todayWorkout?.planItems?.length
    ? dashboardData.todayWorkout.planItems.map((item) => (language === 'ar' && item.nameAr ? item.nameAr : item.name)).filter(Boolean)
    : defaultExercises;

  // Pulse & missions
  const dailyMission = dashboardData.missions;
  const coachPulse = dashboardData.missions
    ? {
        mission: dailyMission,
        water: dashboardData.hydration?.water,
        waterGoal: dashboardData.hydration?.goal,
      }
    : null;

  return (
    <div className="bento-root">
      {/* Ambient background aura */}
      <div className="trail trail-coral" style={{ width: 500, height: 500, top: '-10%', right: '5%', opacity: 0.08 }} />
      <div className="trail trail-olive" style={{ width: 400, height: 400, bottom: '10%', left: '20%', opacity: 0.07 }} />

      {/* App Header & Navigation */}
      <AppHeader
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />
      <SidebarNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Bento Layout */}
      <main className="pt-24 lg:pl-72 min-h-screen">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">

            {/* 1. Today's Mission (Hero Command Checklist) */}
            <TodayMissionCard
              dailyMission={dailyMission}
              onAction={handleMissionAction}
              language={language}
            />

            {/* 2. Coach Pulse (AI Realtime Guidance) */}
            {coachPulse && (
              <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <CoachPulse
                  {...coachPulse}
                  actionLabel={language === 'ar' ? 'تحدث مع المدرب ←' : 'Chat with Coach →'}
                  onClick={() => navigate('/ai-chat')}
                />
              </div>
            )}

            {/* 3. Today's Workout Hero (3 cols) */}
            <TodayWorkoutCard
              todayWorkout={dashboardData.todayWorkout}
              displayedExercises={displayedExercises}
              onOpenPlanModal={() => setIsPlanModalOpen(true)}
              onStartWorkout={handleStartWorkout}
              language={language}
              t={t}
            />

            {/* 4. Hydration Hub (1 col, 2 rows) */}
            <HydrationCard
              water={dashboardData.hydration?.water}
              waterGoal={dashboardData.hydration?.goal}
              waterPct={dashboardData.hydration?.percentage}
              waterRemaining={dashboardData.hydration?.remaining}
              waterHistory={dashboardData.hydration?.history}
              onAddWater={handleAddWater}
              onUndoWater={handleUndoWater}
              onResetWater={handleResetWater}
              onSetGoal={handleSetGoal}
              t={t}
            />

            {/* 5. Readiness & Recovery Score (3 cols) */}
            <ReadinessCard
              readiness={dashboardData.readiness}
              t={t}
            />

            {/* 6. Weekly Progress Hub (3 cols) */}
            <WeeklyProgressCard
              weeklyWorkout={dashboardData.weeklyWorkout}
              achievements={dashboardData.achievements}
              t={t}
            />

            {/* 7. Nutrition & Macros Tracker (1 col) */}
            <NutritionCard
              nutrition={dashboardData.nutrition}
              onScanMeal={() => navigate('/food-scanner')}
              language={language}
              t={t}
            />

            {/* 8. Daily Mindset & Motivation Carousel (2 cols) */}
            <DailyDoseCard
              quotes={quotes}
              quoteIdx={quoteIdx}
              onNextQuote={() => setQuoteIdx((i) => (i + 1) % quotes.length)}
              t={t}
            />

            {/* 9. Membership & Pro Card (2 cols) */}
            <SubscriptionCard
              subscription={dashboardData.subscription}
              onUpgrade={() => navigate('/pricing')}
              t={t}
            />

          </div>
        </div>
      </main>

      {/* 4-Week Plan Modal */}
      <MonthlyPlanOverviewModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plan={trainingPlan}
        userProfile={user}
        onSelectWorkout={(day) => handleStartWorkout(day)}
        onResetPlan={handleResetPlan}
      />
    </div>
  );
}
