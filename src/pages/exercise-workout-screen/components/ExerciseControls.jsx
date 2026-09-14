import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ExerciseControls = ({ 
  selectedExercise = null,
  planExercise = null,
  onExerciseChange,
  onWorkoutStart,
  onWorkoutPause,
  onWorkoutStop,
  onNextExercise,
  hasNextExercise = false,
  onExerciseComplete,
  onCompleteSetManual,
  isWorkoutActive = false,
  isPaused = false,
  currentSet = 1,
  currentRep = 0,
  workoutTime = 0,
  isResting = false,
  restTimeLeft = 0,
  onSkipRest,
  targetReps: propTargetReps,
  targetSets: propTargetSets,
  onTargetConfigChange
}) => {
  const [targetReps, setTargetReps] = useState(propTargetReps || 12);
  const [targetSets, setTargetSets] = useState(propTargetSets || 3);
  const [restDuration, setRestDuration] = useState(60);
  const [exerciseNotes, setExerciseNotes] = useState("");
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [setDurationSeconds, setSetDurationSeconds] = useState(30);

  // Sync with plan configuration
  useEffect(() => {
    if (planExercise) {
      if (planExercise.sets) {
        const s = Number(planExercise.sets);
        if (s > 0) setTargetSets(s);
      }
      if (planExercise.reps) {
        const parsedReps = parseInt(String(planExercise.reps).replace(/\D/g, ''), 10);
        if (parsedReps > 0) setTargetReps(parsedReps);
      }
    } else if (propTargetReps || propTargetSets) {
      if (propTargetReps) setTargetReps(propTargetReps);
      if (propTargetSets) setTargetSets(propTargetSets);
    }
  }, [planExercise, propTargetReps, propTargetSets]);

  useEffect(() => {
    if (onTargetConfigChange) {
      onTargetConfigChange({ targetReps, targetSets, restDuration });
    }
  }, [targetReps, targetSets, restDuration, onTargetConfigChange]);

  const exercises = [
    { id: 1, name: "Push-Ups", category: "Upper Body", difficulty: "Beginner", duration: "3-5 min" },
    { id: 2, name: "Squats", category: "Lower Body", difficulty: "Beginner", duration: "4-6 min" },
    { id: 3, name: "Lunges", category: "Lower Body", difficulty: "Intermediate", duration: "5-7 min" },
    { id: 4, name: "Burpees", category: "Full Body", difficulty: "Advanced", duration: "6-8 min" },
    { id: 5, name: "Mountain Climbers", category: "Cardio", difficulty: "Intermediate", duration: "3-5 min" },
    { id: 6, name: "Jumping Jacks", category: "Cardio", difficulty: "Beginner", duration: "2-4 min" },
    { id: 7, name: "High Knees", category: "Cardio", difficulty: "Beginner", duration: "2-3 min" },
    { id: 8, name: "Plank", category: "Core", difficulty: "Intermediate", duration: "1-3 min" },
    { id: 9, name: "Side Plank", category: "Core", difficulty: "Intermediate", duration: "2-4 min" },
    { id: 10, name: "Wall Sit", category: "Lower Body", difficulty: "Beginner", duration: "1-2 min" }
  ];

  const currentExercise = selectedExercise || exercises?.[0];

  const isTimeBased = useMemo(() => {
    const timeBased = new Set([
      'Plank',
      'Side Plank',
      'Wall Sit',
      'Mountain Climbers',
      'Jumping Jacks',
      'High Knees'
    ]);
    // Normalize name
    const name = currentExercise?.name?.toString()?.toLowerCase();
    return Array.from(timeBased).some(n => name?.includes(n.toLowerCase()));
  }, [currentExercise]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const adjustValue = (value, setter, min, max, step = 1) => {
    return {
      increment: () => setter(Math.min(max, value + step)),
      decrement: () => setter(Math.max(min, value - step))
    };
  };

  const repsControl = adjustValue(targetReps, setTargetReps, 5, 50, 5);
  const setsControl = adjustValue(targetSets, setTargetSets, 1, 10);
  const restControl = adjustValue(restDuration, setRestDuration, 15, 300, 15);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-success';
      case 'Intermediate': return 'text-warning';
      case 'Advanced': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressPercentage = () => {
    if (!isWorkoutActive) return 0;
    if (isTimeBased) {
      const totalSeconds = Math.max(1, targetSets * setDurationSeconds);
      const pct = (workoutTime / totalSeconds) * 100;
      return Math.min(100, pct);
    }
    const totalReps = Math.max(1, targetSets * targetReps);
    const completedReps = (currentSet - 1) * targetReps + currentRep;
    return Math.min(100, (completedReps / totalReps) * 100);
  };

  // Auto-complete when reaching 100%
  useEffect(() => {
    if (!isWorkoutActive) return;
    const pct = getProgressPercentage();
    if (pct >= 100) {
      onExerciseComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkoutActive, currentSet, currentRep, workoutTime, targetReps, targetSets, setDurationSeconds, isTimeBased]);

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-6 space-y-3 sm:space-y-6">
      {/* Exercise Selection Header */}
      <div className="space-y-2 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Exercise Setup</h2>
          <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
            <Icon name="MoreVertical" size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Button>
        </div>

        {/* Current Exercise Info */}
        <div className="bg-muted rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">{currentExercise?.name}</h3>
            <span className={`text-xs sm:text-sm font-medium ${getDifficultyColor(currentExercise?.difficulty)}`}>
              {currentExercise?.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Icon name="Tag" size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span>{currentExercise?.category}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon name="Clock" size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span>{currentExercise?.duration}</span>
            </span>
          </div>
        </div>
      </div>
      {/* Workout Configuration */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-medium text-card-foreground">Configuration</h3>
        
        {/* Primary Configuration: Reps or Time */}
        {isTimeBased ? (
          <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
            <div>
              <label className="text-xs sm:text-sm font-medium text-card-foreground">Set Duration</label>
              <p className="text-xs text-muted-foreground">Seconds per set</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSetDurationSeconds(Math.max(5, setDurationSeconds - 5))}
                className="w-7 h-7 sm:w-8 sm:h-8"
              >
                <Icon name="Minus" size={12} className="sm:w-[14px] sm:h-[14px]" />
              </Button>
              <span className="text-base sm:text-lg font-semibold text-card-foreground w-10 sm:w-12 text-center">
                {setDurationSeconds}s
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSetDurationSeconds(Math.min(600, setDurationSeconds + 5))}
                className="w-7 h-7 sm:w-8 sm:h-8"
              >
                <Icon name="Plus" size={12} className="sm:w-[14px] sm:h-[14px]" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
            <div>
              <label className="text-xs sm:text-sm font-medium text-card-foreground">Target Reps</label>
              <p className="text-xs text-muted-foreground">Repetitions per set</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={repsControl?.decrement}
                disabled={targetReps <= 5}
                className="w-7 h-7 sm:w-8 sm:h-8"
              >
                <Icon name="Minus" size={12} className="sm:w-[14px] sm:h-[14px]" />
              </Button>
              <span className="text-base sm:text-lg font-semibold text-card-foreground w-7 sm:w-8 text-center">
                {targetReps}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={repsControl?.increment}
                disabled={targetReps >= 50}
                className="w-7 h-7 sm:w-8 sm:h-8"
              >
                <Icon name="Plus" size={12} className="sm:w-[14px] sm:h-[14px]" />
              </Button>
            </div>
          </div>
        )}

        {/* Sets Configuration */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
          <div>
            <label className="text-xs sm:text-sm font-medium text-card-foreground">Target Sets</label>
            <p className="text-xs text-muted-foreground">Number of sets</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={setsControl?.decrement}
              disabled={targetSets <= 1}
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              <Icon name="Minus" size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Button>
            <span className="text-base sm:text-lg font-semibold text-card-foreground w-7 sm:w-8 text-center">
              {targetSets}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={setsControl?.increment}
              disabled={targetSets >= 10}
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              <Icon name="Plus" size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Button>
          </div>
        </div>

        {/* Rest Duration */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
          <div>
            <label className="text-xs sm:text-sm font-medium text-card-foreground">Rest Time</label>
            <p className="text-xs text-muted-foreground">Seconds between sets</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={restControl?.decrement}
              disabled={restDuration <= 15}
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              <Icon name="Minus" size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Button>
            <span className="text-xs sm:text-sm font-semibold text-card-foreground w-10 sm:w-12 text-center">
              {restDuration}s
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={restControl?.increment}
              disabled={restDuration >= 300}
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              <Icon name="Plus" size={12} className="sm:w-[14px] sm:h-[14px]" />
            </Button>
          </div>
        </div>
      </div>
      {/* Exercise Notes */}
      <div className="space-y-2">
        <Input
          label="Exercise Notes (Optional)"
          type="text"
          placeholder="Add personal reminders or modifications..."
          value={exerciseNotes}
          onChange={(e) => setExerciseNotes(e?.target?.value)}
          description="Personal notes for this workout session"
          className="text-sm"
        />
      </div>
      {/* Voice Guidance Toggle */}
      <div className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
        <div>
          <label className="text-xs sm:text-sm font-medium text-card-foreground">Voice Guidance</label>
          <p className="text-xs text-muted-foreground">Audio coaching during workout</p>
        </div>
        <Button
          variant={voiceGuidance ? "default" : "outline"}
          size="sm"
          onClick={() => setVoiceGuidance(!voiceGuidance)}
          className="text-xs sm:text-sm"
        >
          <Icon name={voiceGuidance ? "Volume2" : "VolumeX"} size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
          {voiceGuidance ? "On" : "Off"}
        </Button>
      </div>
      {/* Workout Progress (shown during active workout) */}
      {isWorkoutActive && (
        <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">Workout Progress</h3>
            <span className="text-xs sm:text-sm text-muted-foreground">{formatTime(workoutTime)}</span>
          </div>

          {/* Rest Interval Notification */}
          {isResting && (
            <div className="p-3 bg-warning/15 border border-warning/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={18} className="text-warning animate-spin" />
                <div>
                  <p className="text-xs font-bold text-card-foreground">Rest Interval</p>
                  <p className="text-[11px] text-muted-foreground">Catch your breath before Set {currentSet}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-warning font-mono">{restTimeLeft}s</span>
                <Button size="xs" variant="outline" onClick={onSkipRest} className="h-7 text-xs">
                  Skip
                </Button>
              </div>
            </div>
          )}
          
          {/* Current Set/Rep Display */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">{currentSet}</p>
              <p className="text-xs text-muted-foreground">Current Set</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-success">{currentRep}</p>
              <p className="text-xs text-muted-foreground">Current Rep</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-card-foreground">{targetSets}</p>
              <p className="text-xs text-muted-foreground">Total Sets</p>
            </div>
          </div>

          {/* Set Status Pills */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
            {Array.from({ length: targetSets }).map((_, idx) => {
              const setNum = idx + 1;
              const isCompleted = setNum < currentSet;
              const isCurrent = setNum === currentSet;
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-success/20 text-success border border-success/30'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {isCompleted && <Icon name="Check" size={11} />}
                  Set {setNum}
                </span>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-card-foreground font-medium">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {/* Control Buttons */}
      <div className="space-y-2 sm:space-y-3">
        {isWorkoutActive && !isResting && (
          <Button
            onClick={onCompleteSetManual}
            variant="outline"
            size="sm"
            className="w-full text-xs sm:text-sm font-medium border-primary/40 text-primary hover:bg-primary/10 transition-colors"
          >
            <Icon name="CheckCircle" size={15} className="mr-1.5" />
            Complete Set {currentSet} ({currentRep}/{targetReps} reps)
          </Button>
        )}
        {!isWorkoutActive ? (
          <Button
            onClick={onWorkoutStart}
            className="w-full text-sm sm:text-base"
            size="lg"
          >
            <Icon name="Play" size={18} className="mr-2 sm:w-5 sm:h-5" />
            Start Workout
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              onClick={isPaused ? onWorkoutStart : onWorkoutPause}
              variant={isPaused ? "default" : "secondary"}
              size="lg"
              className="text-sm sm:text-base"
            >
              <Icon name={isPaused ? "Play" : "Pause"} size={16} className="mr-1 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              onClick={onWorkoutStop}
              variant="destructive"
              size="lg"
              className="text-sm sm:text-base"
            >
              <Icon name="Square" size={16} className="mr-1 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
              Stop
            </Button>
          </div>
        )}

        {/* Quick Exercise Switch */}
        <Button variant="outline" className="w-full text-sm sm:text-base" onClick={() => setShowSwitchModal(true)}>
          <Icon name="RotateCcw" size={16} className="mr-1 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
          Switch Exercise
        </Button>
        {isWorkoutActive && hasNextExercise && (
          <Button variant="secondary" className="w-full text-sm sm:text-base" onClick={onNextExercise}>
            <Icon name="ChevronRight" size={16} className="mr-1 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
            Next Exercise
          </Button>
        )}
      </div>

      {/* Switch Exercise Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSwitchModal(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base sm:text-lg font-semibold text-card-foreground">Choose Exercise</h4>
              <Button variant="ghost" size="icon" onClick={() => setShowSwitchModal(false)} className="w-8 h-8">
                <Icon name="X" size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { onExerciseChange?.(ex); setShowSwitchModal(false); }}
                  className={`w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors ${currentExercise?.name === ex.name ? 'bg-primary/5 border-primary/30' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm sm:text-base font-medium text-card-foreground">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">{ex.category} • {ex.duration}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{ex.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseControls;