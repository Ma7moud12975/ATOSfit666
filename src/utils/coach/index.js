/**
 * ATOSfit AI Coaching Engine - Master Facade
 * ------------------------------------------
 * Integrates the 5-Layer AI Coaching Architecture:
 * 
 *               ATOSfit AI Coach
 *                      │
 *            ┌─────────┴─────────┐
 *            │                   │
 *      Movement Engine      Coaching Engine
 *            │                   │
 *     Phase Detection       Error Prioritization
 *            │                   │
 *     Joint/Body Angles     Smart Cue Selection
 *            │                   │
 *     Rep Validation        Timing & Voice
 *            │                   │
 *     Form Quality          Personalization
 *            │
 *     User Performance
 *            │
 *     Form History
 */

import { EXERCISE_BIOMETRICS_DATASET } from './exerciseBiometricsDataset.js';
import { MovementPhaseDetector, MOVEMENT_PHASES } from './movementPhaseDetector.js';
import { AnthropometryToleranceEngine, FORM_ZONES } from './anthropometryToleranceEngine.js';
import { SmartCoachingPriorityEngine, BIOMECHANICAL_SEVERITY } from './smartCoachingPriority.js';
import { RepQualityEngine, REP_QUALITY_TIERS } from './repQualityEngine.js';
import { UserPatternLearner } from './userPatternLearner.js';
import { COACHING_MODES, getSavedCoachingMode, saveCoachingMode } from './coachingModes.js';
import { PostWorkoutCoachReportGenerator } from './postWorkoutCoachReport.js';
import { MICRO_CUE_LIBRARY, getMicroCue } from './microCueLibrary.js';

export class ATOSAICoach {
  constructor(exerciseId = 'squat', config = {}) {
    this.exerciseId = exerciseId;
    this.lang = config.lang || 'ar';
    this.userId = config.userId || 'athlete_master';
    this.coachingMode = config.coachingMode || getSavedCoachingMode();

    // 1. Movement & Biometrics Engines
    this.exerciseDef = EXERCISE_BIOMETRICS_DATASET[exerciseId] || EXERCISE_BIOMETRICS_DATASET.squat;
    this.phaseDetector = new MovementPhaseDetector(exerciseId);
    this.anthropometryEngine = new AnthropometryToleranceEngine(config.userMetrics || {});

    // 2. Prioritization & Quality Engines
    this.priorityEngine = new SmartCoachingPriorityEngine({
      coachingMode: this.coachingMode,
      minConfidence: 0.65,
      frameWindowSize: 7,
      voiceCooldownMs: 3800,
    });
    this.repQualityEngine = new RepQualityEngine(exerciseId);
    this.patternLearner = new UserPatternLearner(this.userId);
    this.reportGenerator = new PostWorkoutCoachReportGenerator();

    this.currentPhase = MOVEMENT_PHASES.SETUP;
    this.activeRepsCount = 0;
  }

  setExercise(exerciseId) {
    this.exerciseId = exerciseId;
    this.exerciseDef = EXERCISE_BIOMETRICS_DATASET[exerciseId] || EXERCISE_BIOMETRICS_DATASET.squat;
    this.phaseDetector = new MovementPhaseDetector(exerciseId);
    this.repQualityEngine = new RepQualityEngine(exerciseId);
    this.priorityEngine.reset();
  }

  setCoachingMode(mode) {
    this.coachingMode = mode;
    this.priorityEngine.setCoachingMode(mode);
    saveCoachingMode(mode);
  }

  setLanguage(lang) {
    this.lang = lang;
  }

  /**
   * Main real-time frame processing entry point.
   * Invoked for each camera / MediaPipe frame.
   */
  processFrame({
    primaryAngle = 180,
    secondaryAngle = null,
    trunkAngle = 180,
    poseConfidence = 1.0,
    isBodyFullyVisible = true,
    kneeTrackingOk = true,
    heelsGrounded = true,
    timestamp = Date.now(),
  }) {
    // 1. Understand Movement Phase (Layer 1)
    const phaseResult = this.phaseDetector.update(primaryAngle, secondaryAngle, timestamp);
    this.currentPhase = phaseResult.phase;

    // 2. Evaluate Anthropometric Tolerance & Biomechanical Deviations (Layer 2)
    const detectedDeviations = [];

    // Check primary joint (e.g. knee or elbow)
    const primaryAngleDef = this.exerciseDef.angles?.knee_bottom || this.exerciseDef.angles?.elbow_bottom;
    if (primaryAngleDef && (this.currentPhase === MOVEMENT_PHASES.BOTTOM || this.currentPhase === MOVEMENT_PHASES.DESCENT)) {
      const evaluation = this.anthropometryEngine.evaluateZone(primaryAngle, primaryAngleDef, 'bottom_depth');
      if (evaluation.zone === FORM_ZONES.COMPROMISED && primaryAngle > (primaryAngleDef.target_deg?.[1] || 110)) {
        detectedDeviations.push({
          category: this.exerciseId.includes('push') ? 'push_up' : 'squat',
          faultType: 'shallow_depth',
          severity: BIOMECHANICAL_SEVERITY.RANGE_OF_MOTION,
          deviationDeg: evaluation.deviationDeg,
        });
      }
    }

    // Check torso / spine alignment (e.g. rigid plank or excessive forward lean)
    const bodyLineDef = this.exerciseDef.angles?.body_line_shoulder_hip_ankle || this.exerciseDef.angles?.body_line_shoulder_hip_knee;
    if (bodyLineDef && Number.isFinite(trunkAngle)) {
      const trunkEval = this.anthropometryEngine.evaluateZone(trunkAngle, bodyLineDef, 'body_line');
      if (trunkEval.zone === FORM_ZONES.COMPROMISED) {
        const isSag = trunkAngle < (bodyLineDef.target_deg?.[0] || 170);
        detectedDeviations.push({
          category: this.exerciseId.includes('push') ? 'push_up' : 'plank',
          faultType: isSag ? 'hip_sag' : 'hip_pike',
          severity: BIOMECHANICAL_SEVERITY.STRUCTURAL_ALIGNMENT,
          deviationDeg: trunkEval.deviationDeg,
        });
      }
    }

    // Check knee valgus tracking (Frontal view)
    if (!kneeTrackingOk && (this.exerciseId.includes('squat') || this.exerciseId.includes('lunge'))) {
      detectedDeviations.push({
        category: 'squat',
        faultType: 'knee_valgus',
        severity: BIOMECHANICAL_SEVERITY.SAFETY_CRITICAL,
        deviationDeg: 15,
      });
    }

    // Check heel lift (Squat)
    if (!heelsGrounded && this.exerciseId.includes('squat') && this.currentPhase === MOVEMENT_PHASES.BOTTOM) {
      detectedDeviations.push({
        category: 'squat',
        faultType: 'heels_lifting',
        severity: BIOMECHANICAL_SEVERITY.STRUCTURAL_ALIGNMENT,
        deviationDeg: 10,
      });
    }

    // Check rapid drop / tempo
    if (this.currentPhase === MOVEMENT_PHASES.DESCENT && phaseResult.velocity < -120) {
      detectedDeviations.push({
        category: 'squat',
        faultType: 'fast_tempo',
        severity: BIOMECHANICAL_SEVERITY.TEMPO_PACING,
        deviationDeg: 20,
      });
    }

    // 3. Smart Coaching Priority & "One Cue at a Time" (Layer 3)
    const coachingDecision = this.priorityEngine.evaluateFrame({
      detectedDeviations,
      poseConfidence,
      isBodyFullyVisible,
      currentPhase: this.currentPhase,
      exerciseId: this.exerciseId,
      lang: this.lang,
      now: timestamp,
    });

    return {
      phase: this.currentPhase,
      phaseName: this.phaseDetector.getPhaseName(this.lang),
      coachingDecision, // null or { speak: boolean, text: string, faultType: string, severity: number }
      deviationsCount: detectedDeviations.length,
      currentRepCount: this.phaseDetector.repCount,
    };
  }

  /**
   * Invoked whenever a rep successfully locks out and finishes
   */
  handleRepCompleted({
    depthScore = 90,
    alignmentScore = 90,
    tempoScore = 85,
    stabilityScore = 90,
    durationMs = 2200,
    repDeviations = [],
  }) {
    this.activeRepsCount += 1;

    // 1. Record Rep & Multi-Dimensional Quality (Layer 4)
    const repResult = this.repQualityEngine.recordRep({
      depthScore,
      alignmentScore,
      tempoScore,
      stabilityScore,
      durationMs,
      deviations: repDeviations,
      repNumber: this.activeRepsCount,
    });

    // 2. Check Proactive Historical Fatigue Pre-Cueing (Layer 5)
    const proactiveAlert = this.patternLearner.checkProactiveCue(this.exerciseId, this.activeRepsCount + 1);

    return {
      repAssessment: repResult,
      proactiveAlert, // e.g. { promptAr, promptEn }
      highQualityCount: repResult.highQualityCount,
      totalCount: repResult.totalCount,
    };
  }

  /**
   * Finishes workout set and produces the comprehensive Post-Workout Coach Report
   */
  generateSessionReport() {
    const formProfile = this.repQualityEngine.getFormProfile();
    const repComparison = this.repQualityEngine.getRepComparison();
    const userInsights = this.patternLearner.getExerciseInsights(this.exerciseId);

    // Save this session to user movement history
    this.patternLearner.recordCompletedSet(this.exerciseId, this.repQualityEngine.reps);

    return this.reportGenerator.generateReport({
      exerciseId: this.exerciseId,
      formProfile,
      repComparison,
      reps: this.repQualityEngine.reps,
      userPatternInsights: userInsights,
      lang: this.lang,
    });
  }

  reset() {
    this.phaseDetector.reset();
    this.priorityEngine.reset();
    this.repQualityEngine.reset();
    this.activeRepsCount = 0;
  }
}

export {
  EXERCISE_BIOMETRICS_DATASET,
  MOVEMENT_PHASES,
  FORM_ZONES,
  REP_QUALITY_TIERS,
  COACHING_MODES,
  MICRO_CUE_LIBRARY,
  getMicroCue,
};

export default ATOSAICoach;
