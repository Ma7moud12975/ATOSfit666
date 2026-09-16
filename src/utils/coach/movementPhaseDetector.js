/**
 * Movement Phase Detector
 * -----------------------
 * Fine-grained biomechanical phase detector for bodyweight exercises.
 * Recognizes that movement rules and coaching cues MUST differ by phase.
 * 
 * Dynamic Phases:
 *   SETUP -> DESCENT -> BOTTOM (Inflection) -> ASCENT -> LOCKOUT -> REP_CONFIRMED
 * Isometric Phases:
 *   SETUP -> HOLD_STABLE -> DRIFT_WARNING -> TERMINATED
 */

export const MOVEMENT_PHASES = {
  // Dynamic phases
  SETUP: 'SETUP',
  DESCENT: 'DESCENT',
  BOTTOM: 'BOTTOM',
  ASCENT: 'ASCENT',
  LOCKOUT: 'LOCKOUT',
  REP_CONFIRMED: 'REP_CONFIRMED',

  // Isometric phases
  HOLD_STABLE: 'HOLD_STABLE',
  DRIFT_WARNING: 'DRIFT_WARNING',
  HOLD_TERMINATED: 'HOLD_TERMINATED',

  // Common
  UNKNOWN: 'UNKNOWN',
};

export class MovementPhaseDetector {
  constructor(exerciseId = 'squat', config = {}) {
    this.exerciseId = exerciseId;
    this.currentPhase = MOVEMENT_PHASES.SETUP;
    this.phaseStartTime = Date.now();
    this.history = [];
    this.velocityHistory = [];
    this.lastAngle = null;
    this.lastTimestamp = null;
    this.minPhaseDurationMs = config.minPhaseDurationMs ?? 150;
    this.inflectionTolerance = config.inflectionTolerance ?? 4; // degrees
    this.repCount = 0;
  }

  reset() {
    this.currentPhase = MOVEMENT_PHASES.SETUP;
    this.phaseStartTime = Date.now();
    this.history = [];
    this.velocityHistory = [];
    this.lastAngle = null;
    this.lastTimestamp = null;
  }

  /**
   * Updates phase based on primary tracking angle and timestamp
   * @param {number} primaryAngle - e.g. knee angle for squat, elbow for pushup
   * @param {number} secondaryMetric - e.g. trunk inclination or hip angle
   * @param {number} timestamp
   * @returns {Object} { phase, phaseDuration, velocity, isInflection }
   */
  update(primaryAngle, secondaryMetric = null, timestamp = Date.now()) {
    if (!Number.isFinite(primaryAngle)) {
      return {
        phase: this.currentPhase,
        phaseDuration: timestamp - this.phaseStartTime,
        velocity: 0,
        isInflection: false,
      };
    }

    let velocity = 0;
    if (this.lastAngle !== null && this.lastTimestamp !== null) {
      const dt = Math.max(16, timestamp - this.lastTimestamp) / 1000;
      velocity = (primaryAngle - this.lastAngle) / dt; // deg/sec (+ means extending, - means flexing)
    }

    this.velocityHistory.push({ velocity, timestamp });
    if (this.velocityHistory.length > 8) this.velocityHistory.shift();

    // Smoothed velocity
    const avgVelocity = this.velocityHistory.reduce((s, v) => s + v.velocity, 0) / this.velocityHistory.length;
    const now = timestamp;
    const timeInCurrentPhase = now - this.phaseStartTime;

    const previousPhase = this.currentPhase;
    let nextPhase = this.currentPhase;
    let isInflection = false;

    // Phase transition logic based on exercise mechanics
    const isPushupFamily = this.exerciseId.includes('push_up') || this.exerciseId.includes('pushup');
    const isSquatFamily = this.exerciseId.includes('squat') || this.exerciseId.includes('lunge');

    if (isSquatFamily) {
      // Squat: primaryAngle is knee angle (180 = standing, 90 = deep squat)
      if (this.currentPhase === MOVEMENT_PHASES.SETUP) {
        if (primaryAngle < 165 && avgVelocity < -15) {
          nextPhase = MOVEMENT_PHASES.DESCENT;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.DESCENT) {
        if (primaryAngle <= 110 && Math.abs(avgVelocity) < 25) {
          nextPhase = MOVEMENT_PHASES.BOTTOM;
          isInflection = true;
        } else if (avgVelocity > 20) {
          nextPhase = MOVEMENT_PHASES.ASCENT;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.BOTTOM) {
        if (avgVelocity > 15 || primaryAngle > 115) {
          nextPhase = MOVEMENT_PHASES.ASCENT;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.ASCENT) {
        if (primaryAngle >= 165) {
          nextPhase = MOVEMENT_PHASES.LOCKOUT;
          this.repCount++;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.LOCKOUT) {
        if (timeInCurrentPhase > 250) {
          nextPhase = MOVEMENT_PHASES.SETUP;
        }
      }
    } else if (isPushupFamily) {
      // Push-up: primaryAngle is elbow angle (170 = top, 90 = bottom)
      if (this.currentPhase === MOVEMENT_PHASES.SETUP) {
        if (primaryAngle < 160 && avgVelocity < -15) {
          nextPhase = MOVEMENT_PHASES.DESCENT;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.DESCENT) {
        if (primaryAngle <= 110 && Math.abs(avgVelocity) < 25) {
          nextPhase = MOVEMENT_PHASES.BOTTOM;
          isInflection = true;
        } else if (avgVelocity > 20) {
          nextPhase = MOVEMENT_PHASES.ASCENT;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.BOTTOM) {
        if (avgVelocity > 15 || primaryAngle > 115) {
          nextPhase = MOVEMENT_PHASES.ASCENT;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.ASCENT) {
        if (primaryAngle >= 165) {
          nextPhase = MOVEMENT_PHASES.LOCKOUT;
          this.repCount++;
        }
      } else if (this.currentPhase === MOVEMENT_PHASES.LOCKOUT) {
        if (timeInCurrentPhase > 250) {
          nextPhase = MOVEMENT_PHASES.SETUP;
        }
      }
    } else {
      // General dynamic fallback
      if (avgVelocity < -20 && primaryAngle < 160) {
        nextPhase = MOVEMENT_PHASES.DESCENT;
      } else if (primaryAngle < 110 && Math.abs(avgVelocity) < 20) {
        nextPhase = MOVEMENT_PHASES.BOTTOM;
        isInflection = true;
      } else if (avgVelocity > 20) {
        nextPhase = MOVEMENT_PHASES.ASCENT;
      } else if (primaryAngle > 165 && this.currentPhase === MOVEMENT_PHASES.ASCENT) {
        nextPhase = MOVEMENT_PHASES.LOCKOUT;
      }
    }

    // Protect against instant jitter transitions
    if (nextPhase !== previousPhase && timeInCurrentPhase >= this.minPhaseDurationMs) {
      this.currentPhase = nextPhase;
      this.phaseStartTime = now;
    }

    this.lastAngle = primaryAngle;
    this.lastTimestamp = now;

    return {
      phase: this.currentPhase,
      phaseDuration: now - this.phaseStartTime,
      velocity: avgVelocity,
      isInflection,
      repCount: this.repCount,
    };
  }

  getPhaseName(lang = 'ar') {
    const isAr = lang === 'ar';
    switch (this.currentPhase) {
      case MOVEMENT_PHASES.SETUP:
        return isAr ? 'وضع الاستعداد' : 'Setup';
      case MOVEMENT_PHASES.DESCENT:
        return isAr ? 'مرحلة النزول' : 'Descent';
      case MOVEMENT_PHASES.BOTTOM:
        return isAr ? 'أقصى عمق' : 'Bottom Inflection';
      case MOVEMENT_PHASES.ASCENT:
        return isAr ? 'مرحلة الصعود' : 'Ascent';
      case MOVEMENT_PHASES.LOCKOUT:
        return isAr ? 'اكتمال العدّة' : 'Lockout';
      case MOVEMENT_PHASES.HOLD_STABLE:
        return isAr ? 'ثبات ممتاز' : 'Stable Hold';
      case MOVEMENT_PHASES.DRIFT_WARNING:
        return isAr ? 'تراجع في الثبات' : 'Drift Warning';
      default:
        return isAr ? 'حركة عامة' : 'General';
    }
  }
}

export default MovementPhaseDetector;
