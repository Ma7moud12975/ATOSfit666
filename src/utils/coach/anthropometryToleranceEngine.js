/**
 * Anthropometry & Multi-Zone Tolerance Engine
 * -------------------------------------------
 * Replaces rigid binary (correct/incorrect) checks with nuanced biomechanical zones.
 * Differentiates between natural anatomical body types (e.g. long femur ratios, hip geometry)
 * and true injurious form breakdowns.
 * 
 * 4 Biomechanical Zones:
 * 1. IDEAL: Textbook gold-standard range (ACE / PubMed).
 * 2. PREFERRED: Healthy, anatomically comfortable adaptation (User Style).
 * 3. WARNING: Minor transient deviation (Yellow); do not interrupt flow immediately.
 * 4. COMPROMISED: Clear structural failure or joint safety violation (Red).
 */

export const FORM_ZONES = {
  IDEAL: 'IDEAL',             // 95-100% form quality
  PREFERRED: 'PREFERRED',     // 85-94% natural user style
  WARNING: 'WARNING',         // 70-84% drift / minor deviation
  COMPROMISED: 'COMPROMISED', // <70% error requiring correction
};

export class AnthropometryToleranceEngine {
  constructor(userMetrics = {}) {
    // User physical characteristics (optional adaptation)
    this.heightCm = userMetrics.heightCm ?? 175;
    this.femurTorsoRatio = userMetrics.femurTorsoRatio ?? 1.0; // >1.1 means long femurs
    this.mobilityLevel = userMetrics.mobilityLevel ?? 'medium'; // 'low', 'medium', 'high'
  }

  /**
   * Evaluates an angle against exercise thresholds with anthropometric tolerance
   * @param {number} measuredAngle
   * @param {Object} angleDef - from EXERCISE_BIOMETRICS_DATASET
   * @param {string} jointName - e.g. 'knee_bottom', 'elbow_bottom', 'trunk_from_vertical'
   * @returns {Object} { zone, deviationDeg, score, isAcceptable }
   */
  evaluateZone(measuredAngle, angleDef, jointName = '') {
    if (!Number.isFinite(measuredAngle) || !angleDef) {
      return { zone: FORM_ZONES.WARNING, deviationDeg: 0, score: 75, isAcceptable: true };
    }

    const [minIdeal, maxIdeal] = angleDef.target_deg || [80, 100];
    const refVal = angleDef.reference_value_deg ?? (minIdeal + maxIdeal) / 2;

    // Anthropometric expansions for natural user style
    let userPreferredMin = minIdeal;
    let userPreferredMax = maxIdeal;

    // Squat depth / trunk lean adaptation for long femurs
    if (jointName.includes('squat') && jointName.includes('knee')) {
      if (this.femurTorsoRatio > 1.08) {
        userPreferredMax = maxIdeal + 12; // Allow 102°-122° for long femurs
      }
    }
    if (jointName.includes('trunk_from_vertical')) {
      if (this.femurTorsoRatio > 1.08) {
        userPreferredMax = maxIdeal + 10; // Allow greater forward lean safely
      }
    }

    // Push-up bottom depth adaptation
    if (jointName.includes('elbow_bottom')) {
      userPreferredMin = Math.max(65, minIdeal - 5);
      userPreferredMax = Math.min(115, maxIdeal + 5);
    }

    // 1. Check IDEAL
    if (measuredAngle >= minIdeal && measuredAngle <= maxIdeal) {
      const distFromRef = Math.abs(measuredAngle - refVal);
      const score = Math.round(100 - (distFromRef / Math.max(1, (maxIdeal - minIdeal) / 2)) * 5);
      return {
        zone: FORM_ZONES.IDEAL,
        deviationDeg: 0,
        score: Math.max(95, Math.min(100, score)),
        isAcceptable: true,
      };
    }

    // 2. Check PREFERRED (User Style)
    if (measuredAngle >= userPreferredMin && measuredAngle <= userPreferredMax) {
      return {
        zone: FORM_ZONES.PREFERRED,
        deviationDeg: measuredAngle < minIdeal ? minIdeal - measuredAngle : measuredAngle - maxIdeal,
        score: 88,
        isAcceptable: true,
      };
    }

    // 3. Check WARNING (Within 10°-15° beyond preferred)
    const warningBuffer = 12;
    if (
      (measuredAngle >= userPreferredMin - warningBuffer && measuredAngle < userPreferredMin) ||
      (measuredAngle > userPreferredMax && measuredAngle <= userPreferredMax + warningBuffer)
    ) {
      const deviationDeg = measuredAngle < userPreferredMin 
        ? userPreferredMin - measuredAngle 
        : measuredAngle - userPreferredMax;
      return {
        zone: FORM_ZONES.WARNING,
        deviationDeg,
        score: Math.max(70, Math.round(85 - (deviationDeg / warningBuffer) * 15)),
        isAcceptable: true, // Do NOT stop user, gentle tracking
      };
    }

    // 4. COMPROMISED (Definite biomechanical breakdown)
    const deviationDeg = measuredAngle < userPreferredMin
      ? userPreferredMin - measuredAngle
      : measuredAngle - userPreferredMax;

    return {
      zone: FORM_ZONES.COMPROMISED,
      deviationDeg,
      score: Math.max(40, Math.round(70 - Math.min(30, deviationDeg * 1.5))),
      isAcceptable: false,
    };
  }
}

export default AnthropometryToleranceEngine;
