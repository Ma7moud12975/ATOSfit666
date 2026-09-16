/**
 * User Movement Pattern Learner
 * -----------------------------
 * Learns personal biometric tendencies across multiple workouts:
 * 1. Identifies the user's Fatigue Inflection Point:
 *    E.g. "User consistently loses form after Rep 7".
 * 2. Proactive Pre-Cueing:
 *    At Rep 6, speaks a tailored preventative cue before the breakdown occurs:
 *    "ركز… من هنا بيبدأ الفورم يضعف عندك عادةً" / "Stay sharp… form usually fades on this rep".
 * 3. Identifies recurring personal weaknesses per exercise:
 *    E.g. "Knee valgus" on squats, "Hip sag" on pushups.
 * 4. Persists cross-session intelligence in local storage.
 */

const STORAGE_KEY = 'atos_user_movement_patterns';

export class UserPatternLearner {
  constructor(userId = 'default_athlete') {
    this.userId = userId;
    this.patterns = this._loadPatterns();
  }

  _loadPatterns() {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${this.userId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  _savePatterns() {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${this.userId}`, JSON.stringify(this.patterns));
    } catch (e) {
      console.warn('UserPatternLearner save notice:', e);
    }
  }

  /**
   * Records completed set data to update learned patterns
   * @param {string} exerciseId
   * @param {Array} reps - array of evaluated reps from RepQualityEngine
   */
  recordCompletedSet(exerciseId, reps = []) {
    if (!reps || reps.length < 4) return;

    if (!this.patterns[exerciseId]) {
      this.patterns[exerciseId] = {
        sessionsCount: 0,
        fatigueInflectionReps: [],
        frequentFaults: {},
        avgQualityScore: 0,
      };
    }

    const exData = this.patterns[exerciseId];
    exData.sessionsCount += 1;

    // Detect where quality started dropping significantly below initial reps
    const baseline = (reps[0]?.overallScore + reps[1]?.overallScore) / 2;
    let inflectionRep = null;

    for (let i = 2; i < reps.length; i++) {
      if (reps[i].overallScore < baseline - 12) {
        inflectionRep = reps[i].repNumber;
        break;
      }
    }

    if (inflectionRep) {
      exData.fatigueInflectionReps.push(inflectionRep);
      if (exData.fatigueInflectionReps.length > 8) {
        exData.fatigueInflectionReps.shift();
      }
    }

    // Accumulate fault frequencies
    for (const rep of reps) {
      for (const dev of (rep.deviations || [])) {
        const fault = dev.faultType || 'general_form';
        exData.frequentFaults[fault] = (exData.frequentFaults[fault] || 0) + 1;
      }
    }

    this._savePatterns();
  }

  /**
   * Checks if proactive pre-cueing is recommended for the current rep
   * @param {string} exerciseId
   * @param {number} currentRepNumber
   * @returns {Object|null} { shouldPreCue, promptAr, promptEn, targetFault }
   */
  checkProactiveCue(exerciseId, currentRepNumber) {
    const exData = this.patterns[exerciseId];
    if (!exData || exData.sessionsCount < 2 || exData.fatigueInflectionReps.length === 0) {
      return null;
    }

    // Calculate median fatigue rep
    const reps = [...exData.fatigueInflectionReps].sort((a, b) => a - b);
    const medianFatigueRep = reps[Math.floor(reps.length / 2)];

    // If current rep is exactly 1 rep BEFORE typical fatigue point (e.g. Rep 6 before Rep 7)
    if (currentRepNumber === medianFatigueRep - 1 && currentRepNumber >= 4) {
      // Find user's most frequent fault on this exercise
      const faults = Object.entries(exData.frequentFaults || {}).sort((a, b) => b[1] - a[1]);
      const topFault = faults[0]?.[0] || 'stability';

      return {
        shouldPreCue: true,
        fatiguePoint: medianFatigueRep,
        topFault,
        promptAr: 'ركز… من هنا بيبدأ الفورم يضعف عندك عادةً. حافظ على ثباتك!',
        promptEn: 'Stay sharp… this is where your form usually fades. Lock in!',
      };
    }

    return null;
  }

  /**
   * Retrieves summary of learned user movement profile for an exercise
   */
  getExerciseInsights(exerciseId) {
    const exData = this.patterns[exerciseId];
    if (!exData || exData.sessionsCount === 0) {
      return null;
    }

    const reps = [...(exData.fatigueInflectionReps || [])].sort((a, b) => a - b);
    const expectedFatigueRep = reps.length ? reps[Math.floor(reps.length / 2)] : null;

    const faults = Object.entries(exData.frequentFaults || {}).sort((a, b) => b[1] - a[1]);
    const mostCommonFault = faults[0]?.[0] || null;

    return {
      sessionsAnalyzed: exData.sessionsCount,
      expectedFatigueRep,
      mostCommonFault,
    };
  }
}

export default UserPatternLearner;
