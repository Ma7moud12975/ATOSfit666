/**
 * Rep Quality Engine & Form Drift Tracker
 * ---------------------------------------
 * Replaces simplistic binary rep counting with:
 * 1. Multi-Dimensional Form Profile:
 *    - Depth / ROM Score (%)
 *    - Structural Alignment Score (%)
 *    - Tempo & Cadence Score (%)
 *    - Joint Stability Score (%)
 * 2. Rep Quality Tiers:
 *    - PRISTINE (90-100%): Flawless textbook execution.
 *    - SOLID (75-89%): Minor deviations within acceptable tolerance.
 *    - COMPROMISED (<75%): Degraded execution, counts towards total with warning.
 * 3. Form Drift & Fatigue Prevention:
 *    - Analyzes Reps 1-3 to establish the user's fresh baseline.
 *    - Detects fatigue drift when later reps drop >15% below baseline.
 *    - Issues preventative guidance ("Take 10s breather" or "Slow down next 2 reps").
 * 4. Rep Comparison:
 *    - Compares Rep 1 vs Final Rep to show self-relative fatigue evolution.
 */

export const REP_QUALITY_TIERS = {
  PRISTINE: 'PRISTINE',       // 90-100%
  SOLID: 'SOLID',             // 75-89%
  COMPROMISED: 'COMPROMISED', // <75%
};

export class RepQualityEngine {
  constructor(exerciseId = 'squat') {
    this.exerciseId = exerciseId;
    this.reps = [];
    this.baselineMetrics = null;
    this.driftWarningEmitted = false;
  }

  reset() {
    this.reps = [];
    this.baselineMetrics = null;
    this.driftWarningEmitted = false;
  }

  /**
   * Evaluates a completed rep and calculates its multi-dimensional Form Profile
   * @param {Object} repData
   * @param {number} repData.depthScore - 0-100
   * @param {number} repData.alignmentScore - 0-100
   * @param {number} repData.tempoScore - 0-100
   * @param {number} repData.stabilityScore - 0-100
   * @param {number} repData.durationMs - rep duration
   * @param {Array} repData.deviations - deviations detected during this rep
   * @returns {Object} Rep assessment result
   */
  recordRep({
    depthScore = 90,
    alignmentScore = 90,
    tempoScore = 85,
    stabilityScore = 90,
    durationMs = 2200,
    deviations = [],
    repNumber = null,
  }) {
    const repIndex = repNumber !== null ? repNumber : this.reps.length + 1;

    // Weighted overall rep score
    // Alignment (35%) + Depth (30%) + Stability (20%) + Tempo (15%)
    const overallScore = Math.round(
      alignmentScore * 0.35 +
      depthScore * 0.30 +
      stabilityScore * 0.20 +
      tempoScore * 0.15
    );

    let tier = REP_QUALITY_TIERS.SOLID;
    if (overallScore >= 90) {
      tier = REP_QUALITY_TIERS.PRISTINE;
    } else if (overallScore < 75) {
      tier = REP_QUALITY_TIERS.COMPROMISED;
    }

    const repRecord = {
      repNumber: repIndex,
      overallScore,
      tier,
      dimensions: {
        depth: depthScore,
        alignment: alignmentScore,
        tempo: tempoScore,
        stability: stabilityScore,
      },
      durationMs,
      deviations,
      timestamp: Date.now(),
    };

    this.reps.push(repRecord);

    // Update Baseline (using first 3 completed reps)
    if (this.reps.length <= 3) {
      const avgScore = Math.round(this.reps.reduce((s, r) => s + r.overallScore, 0) / this.reps.length);
      const avgDepth = Math.round(this.reps.reduce((s, r) => s + r.dimensions.depth, 0) / this.reps.length);
      const avgAlign = Math.round(this.reps.reduce((s, r) => s + r.dimensions.alignment, 0) / this.reps.length);
      this.baselineMetrics = {
        score: avgScore,
        depth: avgDepth,
        alignment: avgAlign,
      };
    }

    // Check Form Drift (User's Rule #9)
    let formDriftDetected = false;
    let driftMessage = null;

    if (this.baselineMetrics && this.reps.length >= 4 && !this.driftWarningEmitted) {
      const dropFromBaseline = this.baselineMetrics.score - overallScore;
      if (dropFromBaseline >= 14 || overallScore < 72) {
        formDriftDetected = true;
        this.driftWarningEmitted = true;
        driftMessage = {
          ar: 'الفورم بدأ يضعف شوية. خد نفَس 10 ثواني أو خلّي العدتين الجايين أبطأ.',
          en: 'Your form is starting to fade. Catch your breath or slow down the next 2 reps.',
        };
      }
    }

    return {
      rep: repRecord,
      formDriftDetected,
      driftMessage,
      highQualityCount: this.getHighQualityCount(),
      totalCount: this.reps.length,
    };
  }

  getHighQualityCount() {
    return this.reps.filter(r => r.tier !== REP_QUALITY_TIERS.COMPROMISED).length;
  }

  /**
   * Generates comprehensive Form Profile breakdown
   */
  getFormProfile() {
    if (this.reps.length === 0) {
      return {
        overallAverage: 0,
        depth: 0,
        alignment: 0,
        tempo: 0,
        stability: 0,
        biggestImprovementArea: null,
      };
    }

    const count = this.reps.length;
    const depth = Math.round(this.reps.reduce((s, r) => s + r.dimensions.depth, 0) / count);
    const alignment = Math.round(this.reps.reduce((s, r) => s + r.dimensions.alignment, 0) / count);
    const tempo = Math.round(this.reps.reduce((s, r) => s + r.dimensions.tempo, 0) / count);
    const stability = Math.round(this.reps.reduce((s, r) => s + r.dimensions.stability, 0) / count);
    const overallAverage = Math.round(this.reps.reduce((s, r) => s + r.overallScore, 0) / count);

    // Identify lowest scoring dimension
    const dimensions = [
      { name: 'depth', labelAr: 'عمق المدى الحركي', labelEn: 'Movement Depth', score: depth },
      { name: 'alignment', labelAr: 'استقامة الجذع والعمود الفقري', labelEn: 'Body Alignment', score: alignment },
      { name: 'tempo', labelAr: 'إيقاع وسرعة التمرين', labelEn: 'Movement Tempo', score: tempo },
      { name: 'stability', labelAr: 'ثبات المفاصل ومسار الركبة', labelEn: 'Joint Stability', score: stability },
    ];

    dimensions.sort((a, b) => a.score - b.score);
    const weakest = dimensions[0];

    return {
      overallAverage,
      depth,
      alignment,
      tempo,
      stability,
      biggestImprovementArea: {
        key: weakest.name,
        labelAr: weakest.labelAr,
        labelEn: weakest.labelEn,
        score: weakest.score,
      },
    };
  }

  /**
   * Compares Rep 1 vs Final Rep for self-relative analysis (User's Rule #13)
   */
  getRepComparison() {
    if (this.reps.length < 2) return null;
    const firstRep = this.reps[0];
    const lastRep = this.reps[this.reps.length - 1];

    const scoreDelta = lastRep.overallScore - firstRep.overallScore;
    const depthDelta = lastRep.dimensions.depth - firstRep.dimensions.depth;
    const alignmentDelta = lastRep.dimensions.alignment - firstRep.dimensions.alignment;

    return {
      repA: firstRep,
      repB: lastRep,
      scoreDelta,
      depthDelta,
      alignmentDelta,
      fatigueIdentified: scoreDelta <= -10,
    };
  }
}

export default RepQualityEngine;
