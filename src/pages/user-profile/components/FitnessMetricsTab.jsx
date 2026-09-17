import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { updateUser, getUserStats } from '../../../utils/api/userApi';
import { getExercises } from '../../../utils/api/exerciseApi';
import { resolveDbUserId } from '../../../utils/api/chatApi';
import { calculateMetabolicTargets } from '../../../utils/metabolism';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  getLocalWeightHistory,
  saveLocalWeightEntry,
  deleteLocalWeightEntry
} from '../../../utils/localAccountStorage';

const FitnessMetricsTab = ({ user, onUpdateMetrics }) => {
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  const [weightHistory, setWeightHistory] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newHeight, setNewHeight] = useState('');
  const [newAge, setNewAge] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [liveStats, setLiveStats] = useState({
    calories: 0,
    workoutMinutes: 0,
    workoutCount: 0,
    streak: 0,
    synced: false
  });

  const accountId = user?.id || user?.email || user?.principal || 'default-user';

  // 1. Dynamic Weight History
  useEffect(() => {
    const history = getLocalWeightHistory(accountId, user?.weight);
    setWeightHistory(history);
  }, [accountId, user?.weight]);

  // 2. Fetch live Activity Summary from Supabase user_stats & exercises
  useEffect(() => {
    let isMounted = true;
    async function fetchActivity() {
      try {
        const resolvedUid = await resolveDbUserId(accountId);
        let cals = Number(user?.totalCaloriesBurned) || 0;
        let mins = 0;
        let count = Number(user?.totalWorkouts) || 0;
        let streak = Number(user?.currentStreak) || 0;

        if (resolvedUid) {
          const stats = await getUserStats(resolvedUid);
          if (stats) {
            cals = Math.max(cals, Number(stats.total_calories_burned) || 0);
            mins = Math.max(mins, Number(stats.total_workout_time) || 0);
            count = Math.max(count, Number(stats.total_workouts) || 0);
            streak = Math.max(streak, Number(stats.current_streak) || 0);
          }

          // Cross-verify with exercises table logs
          try {
            const exercises = await getExercises(resolvedUid);
            if (Array.isArray(exercises) && exercises.length > 0) {
              const exCount = exercises.length;
              const exCals = exercises.reduce((acc, curr) => acc + (Number(curr.calories_burned) || 0), 0);
              const exSecs = exercises.reduce((acc, curr) => acc + (Number(curr.duration_sec) || 0), 0);
              const exMins = Math.round(exSecs / 60);

              count = Math.max(count, exCount);
              cals = Math.max(cals, exCals);
              mins = Math.max(mins, exMins);
            }
          } catch (e) {
            // Graceful fallback
          }
        }

        if (isMounted) {
          setLiveStats({
            calories: cals,
            workoutMinutes: mins,
            workoutCount: count,
            streak,
            synced: true
          });
        }
      } catch (err) {
        if (isMounted) {
          setLiveStats(prev => ({ ...prev, synced: false }));
        }
      }
    }
    fetchActivity();
    return () => {
      isMounted = false;
    };
  }, [accountId, user?.totalCaloriesBurned, user?.totalWorkouts, user?.currentStreak]);

  // BMI calculations
  const calculateBMI = (weight, height) => {
    const w = Number(weight);
    const h = Number(height);
    if (!w || !h || h <= 0) return 0;
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    const num = Number(bmi);
    if (!num || num <= 0) return { category: isAr ? 'غير محدد' : 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted/30' };
    if (num < 18.5) return { category: t('profile.underweight'), color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (num < 25) return { category: t('profile.normal'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (num < 30) return { category: t('profile.overweight'), color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { category: t('profile.obese'), color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const currentBMI = calculateBMI(user?.weight, user?.height);
  const bmiInfo = getBMICategory(currentBMI);
  const metabolic = calculateMetabolicTargets(user || {});

  // Options
  const fitnessLevelOptions = [
    { value: 'beginner', label: isAr ? 'مبتدئ' : 'Beginner' },
    { value: 'intermediate', label: isAr ? 'متوسط' : 'Intermediate' },
    { value: 'advanced', label: isAr ? 'متقدم' : 'Advanced' },
    { value: 'expert', label: isAr ? 'خبير / رياضي' : 'Expert / Pro' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: isAr ? 'إنقاص الوزن وحرق الدهون' : 'Weight Loss & Fat Burn' },
    { value: 'muscle_gain', label: isAr ? 'بناء وتضخيم العضلات' : 'Muscle Gain & Hypertrophy' },
    { value: 'endurance', label: isAr ? 'بناء اللياقة والتحمل' : 'Build Endurance & Stamina' },
    { value: 'strength', label: isAr ? 'زيادة القوة البدنية' : 'Increase Maximum Strength' },
    { value: 'general_fitness', label: isAr ? 'لياقة وصحة عامة' : 'General Fitness & Mobility' }
  ];

  // Weight Trend Statistics
  const weightStats = useMemo(() => {
    if (!weightHistory || weightHistory.length === 0) {
      return { start: Number(user?.weight) || 0, current: Number(user?.weight) || 0, change: 0 };
    }
    const start = weightHistory[0]?.weight || Number(user?.weight) || 0;
    const current = weightHistory[weightHistory.length - 1]?.weight || Number(user?.weight) || start;
    const change = Number((current - start).toFixed(1));
    return { start, current, change };
  }, [weightHistory, user?.weight]);

  // Handlers
  const handleAddWeight = async () => {
    const val = Number(newWeight);
    if (!val || isNaN(val) || val <= 20 || val >= 350) return;

    setIsSaving(true);
    try {
      saveLocalWeightEntry(accountId, val, newWeightDate);
      const updatedHistory = getLocalWeightHistory(accountId, val);
      setWeightHistory(updatedHistory);

      onUpdateMetrics({ weight: val });

      const resolvedUid = await resolveDbUserId(accountId);
      if (resolvedUid) {
        await updateUser(resolvedUid, { weight: val });
      }
    } catch (err) {
      console.error('Error saving weight entry:', err);
    } finally {
      setIsSaving(false);
      setNewWeight('');
      setShowWeightModal(false);
    }
  };

  const handleSaveHeight = async () => {
    const val = Number(newHeight);
    if (!val || isNaN(val) || val <= 50 || val >= 260) return;

    setIsSaving(true);
    try {
      onUpdateMetrics({ height: val });
      const resolvedUid = await resolveDbUserId(accountId);
      if (resolvedUid) {
        await updateUser(resolvedUid, { height: val });
      }
    } catch (err) {
      console.error('Error saving height:', err);
    } finally {
      setIsSaving(false);
      setNewHeight('');
      setShowHeightModal(false);
    }
  };

  const handleSaveAge = async () => {
    const val = Number(newAge);
    if (!val || isNaN(val) || val <= 5 || val >= 120) return;

    setIsSaving(true);
    try {
      onUpdateMetrics({ age: val });
      const resolvedUid = await resolveDbUserId(accountId);
      if (resolvedUid) {
        await updateUser(resolvedUid, { age: val });
      }
    } catch (err) {
      console.error('Error saving age:', err);
    } finally {
      setIsSaving(false);
      setNewAge('');
      setShowAgeModal(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const updates = { [key]: value };
    if (key === 'primaryGoal') {
      updates.goals = [value];
    }
    onUpdateMetrics(updates);
    try {
      const resolvedUid = await resolveDbUserId(accountId);
      if (resolvedUid) {
        const dbPayload = key === 'fitnessLevel' ? { fitness_level: value } : { goals: [value] };
        await updateUser(resolvedUid, dbPayload);
      }
    } catch (err) {
      console.error(`Error saving preference ${key}:`, err);
    }
  };

  const formattedWorkoutTime = useMemo(() => {
    const totalMinutes = liveStats.workoutMinutes;
    if (!totalMinutes || totalMinutes <= 0) return `0${t('profile.hours')}`;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}${t('profile.hours')} ${mins}${t('profile.mins')}`;
    if (hrs > 0) return `${hrs}${t('profile.hours')}`;
    return `${mins}${t('profile.mins')}`;
  }, [liveStats.workoutMinutes, t]);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Body Metrics Cards */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-elevation-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FAA802]/15 text-[#FAA802]">
                <Icon name="Activity" size={18} />
              </span>
              <h3 className="text-lg font-bold text-card-foreground">
                {t('profile.currentMetrics')}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('profile.currentMetricsCopy')}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {isAr ? 'مُتصل بالسحابة' : 'Cloud Synchronized'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Age Card */}
          <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-card p-4 transition-all duration-300 hover:border-[#FAA802]/40 hover:shadow-elevation-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon name="Calendar" size={16} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('profile.age')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewAge(user?.age || '');
                  setShowAgeModal(true);
                }}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
              >
                <Icon name="Edit2" size={13} />
              </Button>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-card-foreground">{user?.age || '--'}</p>
              <span className="text-xs font-medium text-muted-foreground">{t('profile.yearsOld')}</span>
            </div>
          </div>

          {/* Height Card */}
          <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-card p-4 transition-all duration-300 hover:border-[#FAA802]/40 hover:shadow-elevation-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Icon name="Ruler" size={16} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('profile.height')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewHeight(user?.height || '');
                  setShowHeightModal(true);
                }}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-400"
              >
                <Icon name="Edit2" size={13} />
              </Button>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-card-foreground">{user?.height || '--'}</p>
              <span className="text-xs font-medium text-muted-foreground">{t('profile.cm')}</span>
            </div>
          </div>

          {/* Weight Card */}
          <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-card p-4 transition-all duration-300 hover:border-[#FAA802]/40 hover:shadow-elevation-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="p-2 rounded-lg bg-[#FAA802]/15 text-[#FAA802]">
                  <Icon name="Scale" size={16} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('profile.weight')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewWeight(user?.weight || '');
                  setShowWeightModal(true);
                }}
                className="h-7 w-7 p-0 text-[#FAA802] hover:bg-[#FAA802]/20"
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-card-foreground">{user?.weight || '--'}</p>
              <span className="text-xs font-medium text-muted-foreground">{t('profile.kg')}</span>
            </div>
          </div>

          {/* BMI Card */}
          <div className="group relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-card via-background to-card p-4 transition-all duration-300 hover:border-[#FAA802]/40 hover:shadow-elevation-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Icon name="Flame" size={16} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('profile.bmi')}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiInfo.bg} ${bmiInfo.color}`}>
                {bmiInfo.category}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-card-foreground">{currentBMI || '--'}</p>
              <span className="text-xs font-medium text-muted-foreground">kg/m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scientific Metabolic Profile (Mifflin-St Jeor) */}
      <div className="relative overflow-hidden rounded-2xl border border-[#FAA802]/30 bg-gradient-to-br from-[#FAA802]/10 via-card/90 to-background p-6 shadow-elevation-2">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#FAA802]/20 text-[#FAA802]">
                <Icon name="Sparkles" size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FAA802]">
                {t('profile.scientificMetabolism')}
              </span>
            </div>
            <h4 className="text-2xl font-black text-card-foreground mt-1">
              {Number(user?.dailyCalorieGoal || metabolic.dailyCalorieGoal).toLocaleString()}{' '}
              <span className="text-sm font-normal text-muted-foreground">{t('profile.kcalPerDay')}</span>
            </h4>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#FAA802]/15 text-[#FAA802] border border-[#FAA802]/30 shadow-sm">
            {metabolic.goalType === 'weight_loss'
              ? t('profile.deficit')
              : metabolic.goalType === 'muscle_gain'
              ? t('profile.surplus')
              : t('profile.maintenance')}
          </span>
        </div>

        {/* 4 Bio-Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-border/80 bg-card/70 p-3.5 backdrop-blur-sm">
            <span className="text-xs text-muted-foreground block mb-1">{t('profile.tdee')}</span>
            <p className="text-lg font-bold text-card-foreground">
              {metabolic.tdee} <span className="text-xs font-normal text-muted-foreground">kcal</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-3.5 backdrop-blur-sm">
            <span className="text-xs text-muted-foreground block mb-1">{t('profile.bmr')}</span>
            <p className="text-lg font-bold text-card-foreground">
              {metabolic.bmr} <span className="text-xs font-normal text-muted-foreground">kcal</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-3.5 backdrop-blur-sm">
            <span className="text-xs text-muted-foreground block mb-1">{t('profile.dailyWater')}</span>
            <p className="text-lg font-bold text-card-foreground">
              {metabolic.waterGoalLiters} <span className="text-xs font-normal text-muted-foreground">{t('profile.liters')}</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card/70 p-3.5 backdrop-blur-sm">
            <span className="text-xs text-muted-foreground block mb-1">{t('profile.activityFactor')}</span>
            <p className="text-lg font-bold text-card-foreground capitalize">
              {metabolic.activityLevel || 'Moderate'}
            </p>
          </div>
        </div>

        {/* Macro Nutrient Breakdown */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border-r border-border/60 last:border-0">
              <span className="text-xs font-bold text-emerald-400 block mb-0.5">{t('profile.proteinTarget')}</span>
              <p className="text-xl font-extrabold text-card-foreground">{metabolic.proteinGoal}g</p>
              <span className="text-[11px] text-muted-foreground">
                {Math.round((metabolic.proteinGoal * 4 / metabolic.dailyCalorieGoal) * 100)}% kcal
              </span>
            </div>

            <div className="border-r border-border/60 last:border-0">
              <span className="text-xs font-bold text-amber-400 block mb-0.5">{t('profile.carbsTarget')}</span>
              <p className="text-xl font-extrabold text-card-foreground">{metabolic.carbsGoal}g</p>
              <span className="text-[11px] text-muted-foreground">
                {Math.round((metabolic.carbsGoal * 4 / metabolic.dailyCalorieGoal) * 100)}% kcal
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-rose-400 block mb-0.5">{t('profile.fatsTarget')}</span>
              <p className="text-xl font-extrabold text-card-foreground">{metabolic.fatGoal}g</p>
              <span className="text-[11px] text-muted-foreground">
                {Math.round((metabolic.fatGoal * 9 / metabolic.dailyCalorieGoal) * 100)}% kcal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Weight Progress Chart (Interactive & Live) */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-elevation-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FAA802]/15 text-[#FAA802]">
                <Icon name="TrendingUp" size={18} />
              </span>
              <h3 className="text-lg font-bold text-card-foreground">
                {t('profile.weightProgress')}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('profile.weightProgressCopy')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Net Change Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-background/60 text-xs font-bold">
              <span className="text-muted-foreground">{t('profile.totalChange')}:</span>
              <span className={weightStats.change < 0 ? 'text-emerald-400' : weightStats.change > 0 ? 'text-[#FAA802]' : 'text-card-foreground'}>
                {weightStats.change > 0 ? `+${weightStats.change}` : weightStats.change} {t('profile.kg')}
              </span>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setNewWeight(user?.weight || '');
                setNewWeightDate(new Date().toISOString().slice(0, 10));
                setShowWeightModal(true);
              }}
              className="bg-[#FAA802] hover:bg-[#FAA802]/90 text-black font-bold flex items-center gap-1.5"
            >
              <Icon name="Plus" size={14} />
              {t('profile.addWeight')}
            </Button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full pt-2">
          {weightHistory && weightHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FAA802" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FAA802" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-[#FAA802]/30 bg-[#12141a]/95 backdrop-blur-md p-3 shadow-elevation-3">
                          <p className="text-xs text-muted-foreground mb-1">{data.label || data.date?.slice(0, 10)}</p>
                          <p className="text-sm font-bold text-[#FAA802]">
                            {data.weight} {t('profile.kg')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#FAA802"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                  dot={{ fill: '#FAA802', stroke: '#12141a', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#FAA802', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {isAr ? 'لا توجد بيانات وزن مسجلة بعد. اضغط على تسجيل وزن جديد.' : 'No weight logs recorded yet. Tap Log Weight Entry.'}
            </div>
          )}
        </div>

        {/* History Quick Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <span>{t('profile.startWeight')}: <strong className="text-card-foreground">{weightStats.start} {t('profile.kg')}</strong></span>
          <span>{t('profile.currentWeight')}: <strong className="text-card-foreground">{weightStats.current} {t('profile.kg')}</strong></span>
          <span>{isAr ? 'آخر تحديث' : 'Last update'}: <strong className="text-card-foreground">{weightHistory[weightHistory.length - 1]?.label || 'Today'}</strong></span>
        </div>
      </div>

      {/* 4. Fitness Preferences (Bento Style) */}
      <div className="relative z-30 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-elevation-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
            <Icon name="Sliders" size={18} />
          </span>
          <h3 className="text-lg font-bold text-card-foreground">
            {t('profile.fitnessPreferences')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative z-20 rounded-xl border border-border/70 bg-background/50 p-4">
            <Select
              label={t('profile.fitnessLevel')}
              options={fitnessLevelOptions}
              value={user?.fitnessLevel || 'beginner'}
              onChange={(value) => handlePreferenceChange('fitnessLevel', value)}
            />
          </div>

          <div className="relative z-20 rounded-xl border border-border/70 bg-background/50 p-4">
            <Select
              label={t('profile.primaryGoal')}
              options={goalOptions}
              value={user?.primaryGoal || 'weight_loss'}
              onChange={(value) => handlePreferenceChange('primaryGoal', value)}
            />
          </div>
        </div>
      </div>

      {/* 5. Live Activity Summary (Connected to Supabase user_stats & exercises) */}
      <div className="relative z-10 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-elevation-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                <Icon name="Zap" size={18} />
              </span>
              <h3 className="text-lg font-bold text-card-foreground">
                {t('profile.activitySummary')}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('profile.activitySummaryCopy')}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#FAA802] flex items-center gap-1.5 bg-[#FAA802]/10 px-3 py-1 rounded-full border border-[#FAA802]/20">
            <Icon name="CheckCircle2" size={13} />
            {isAr ? 'بيانات حية مباشرة' : 'Live Verified'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Calories Burned */}
          <div className="rounded-xl border border-border/70 bg-gradient-to-br from-card to-background p-5 text-center transition-all duration-300 hover:border-amber-500/40">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Icon name="Flame" size={24} />
            </div>
            <p className="text-3xl font-black text-card-foreground mb-1">
              {Number(liveStats.calories || 0).toLocaleString()}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('profile.totalCalories')}
            </p>
          </div>

          {/* Workout Time */}
          <div className="rounded-xl border border-border/70 bg-gradient-to-br from-card to-background p-5 text-center transition-all duration-300 hover:border-blue-500/40">
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Icon name="Clock" size={24} />
            </div>
            <p className="text-3xl font-black text-card-foreground mb-1">
              {formattedWorkoutTime}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('profile.totalWorkoutTime')}
            </p>
          </div>

          {/* Workouts Completed */}
          <div className="rounded-xl border border-border/70 bg-gradient-to-br from-card to-background p-5 text-center transition-all duration-300 hover:border-emerald-500/40">
            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Icon name="Target" size={24} />
            </div>
            <p className="text-3xl font-black text-card-foreground mb-1">
              {Number(liveStats.workoutCount || 0)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('profile.workoutsCompleted')}
            </p>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12141a] border border-[#FAA802]/30 rounded-2xl shadow-elevation-3 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Icon name="Scale" size={18} className="text-[#FAA802]" />
                  {t('profile.addWeight')}
                </h3>
                <button onClick={() => setShowWeightModal(false)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label={`${t('profile.weight')} (${t('profile.kg')})`}
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder={t('profile.enterWeight')}
                  autoFocus
                />

                <Input
                  label={isAr ? 'تاريخ القياس' : 'Measurement Date'}
                  type="date"
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                />

                <div className="flex space-x-3 space-x-reverse pt-2">
                  <Button
                    variant="default"
                    onClick={handleAddWeight}
                    disabled={isSaving || !newWeight}
                    className="flex-1 bg-[#FAA802] hover:bg-[#FAA802]/90 text-black font-bold"
                  >
                    {isSaving ? <Icon name="Loader" size={16} className="animate-spin mr-2" /> : t('profile.save')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowWeightModal(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {t('profile.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Height Modal */}
      {showHeightModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12141a] border border-[#FAA802]/30 rounded-2xl shadow-elevation-3 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Icon name="Ruler" size={18} className="text-emerald-400" />
                  {t('profile.updateHeight')}
                </h3>
                <button onClick={() => setShowHeightModal(false)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label={`${t('profile.height')} (${t('profile.cm')})`}
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  placeholder={t('profile.enterHeight')}
                  autoFocus
                />

                <div className="flex space-x-3 space-x-reverse pt-2">
                  <Button
                    variant="default"
                    onClick={handleSaveHeight}
                    disabled={isSaving || !newHeight}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                  >
                    {isSaving ? <Icon name="Loader" size={16} className="animate-spin mr-2" /> : t('profile.save')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowHeightModal(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {t('profile.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Age Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12141a] border border-[#FAA802]/30 rounded-2xl shadow-elevation-3 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Icon name="Calendar" size={18} className="text-primary" />
                  {t('profile.updateAge')}
                </h3>
                <button onClick={() => setShowAgeModal(false)} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label={`${t('profile.age')} (${t('profile.yearsOld')})`}
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  placeholder={t('profile.enterAge')}
                  autoFocus
                />

                <div className="flex space-x-3 space-x-reverse pt-2">
                  <Button
                    variant="default"
                    onClick={handleSaveAge}
                    disabled={isSaving || !newAge}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    {isSaving ? <Icon name="Loader" size={16} className="animate-spin mr-2" /> : t('profile.save')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAgeModal(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {t('profile.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessMetricsTab;