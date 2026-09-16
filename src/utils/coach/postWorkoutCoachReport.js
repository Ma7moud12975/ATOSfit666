/**
 * Post-Workout Coach Report & Biomechanical Debrief Engine
 * --------------------------------------------------------
 * Translates raw computer vision metrics into an empathetic, empowering human coach debrief:
 * 1. Overall Movement Quality Score (%)
 * 2. Form Profile Radar (Depth, Alignment, Tempo, Stability)
 * 3. "Explain the Correction" (Educational rationale for why a cue was repeated)
 * 4. Self-Relative Rep Comparison (Rep 1 fresh baseline vs Final fatigued rep)
 * 5. Fatigue Inflection Point
 * 6. Actionable Focus for Next Session
 */

import { EXERCISE_BIOMETRICS_DATASET } from './exerciseBiometricsDataset.js';

export const EXERCISE_EXPLANATIONS = {
  knee_valgus: {
    titleAr: 'أهمية استقامة الركبة مع القدم',
    titleEn: 'Why Knee Tracking Matters',
    whyItMattersAr: 'الحفاظ على ركبتك في نفس مسار صوابع رجلك يوزع أحمال الوزن بالتساوي على عضلات الفخذ والمؤخرة، ويحمي الرباط الصليبي (ACL) وغضاريف الركبة من الإجهاد الجانبي.',
    whyItMattersEn: 'Tracking knees over toes evenly distributes load across quadriceps and glutes while safeguarding the ACL and meniscus from lateral shear force.',
  },
  hip_sag: {
    titleAr: 'أهمية استقامة الحوض والبلانك',
    titleEn: 'Why Hip Alignment Matters',
    whyItMattersAr: 'الحفاظ على الحوض مشدوداً في خط مستقيم يفعّل عضلات الكور العميقة (Transverse Abdominis) ويحمي أسفل الظهر من قوى الانضغاط والتقوّس الزائد.',
    whyItMattersEn: 'A rigid torso recruits deep core stabilizers and prevents harmful compressive shear across lumbar vertebrae.',
  },
  shallow_depth: {
    titleAr: 'أهمية إتمام المدى الحركي الكامل',
    titleEn: 'Why Full Range of Motion Matters',
    whyItMattersAr: 'الوصول للعمق الكامل يفعّل الألياف العضلية المستهدفة بنسبة تفوق المدى القصير بـ 40%، ويبني مرونة مفاصل صحية طويلة المدى.',
    whyItMattersEn: 'Full depth recruits up to 40% more muscle fibers than partial reps and develops durable joint mobility.',
  },
  heels_lifting: {
    titleAr: 'أهمية ثبات الكعبين بالأرض',
    titleEn: 'Why Grounded Heels Matter',
    whyItMattersAr: 'رفع الكعبين ينقل مركز الثقل بشكل خاطئ إلى صابونة الركبة؛ ثبات الكعب يُمكّنك من الدفع بقوة من السلسلة الخلفية بأمان.',
    whyItMattersEn: 'Lifting heels shifts weight onto patellar tendons; driving through heels engages the posterior chain safely.',
  },
  fast_tempo: {
    titleAr: 'أهمية التحكم في سرعة النزول',
    titleEn: 'Why Eccentric Control Matters',
    whyItMattersAr: 'النزول الهادئ (2 ثانية) يبني تحكماً حركياً ممتازاً ويستفيد من مرحلة الانقباض اللامركزي المحفزة لنمو القوة دون اهتزاز.',
    whyItMattersEn: 'A controlled 2-second eccentric phase builds neuromuscular control and maximizes tension safely.',
  },
};

export class PostWorkoutCoachReportGenerator {
  /**
   * Builds the complete post-workout coach report
   * @param {Object} params
   * @param {string} params.exerciseId
   * @param {Object} params.formProfile - from RepQualityEngine.getFormProfile()
   * @param {Object} params.repComparison - from RepQualityEngine.getRepComparison()
   * @param {Array} params.reps - evaluated reps array
   * @param {Object} params.userPatternInsights - from UserPatternLearner
   * @param {string} params.lang - 'ar' or 'en'
   * @returns {Object} Comprehensive Coach Report
   */
  generateReport({
    exerciseId = 'squat',
    formProfile = {},
    repComparison = null,
    reps = [],
    userPatternInsights = null,
    lang = 'ar',
  }) {
    const isAr = lang === 'ar';
    const exerciseDef = EXERCISE_BIOMETRICS_DATASET[exerciseId] || { name: exerciseId };
    const exerciseName = exerciseDef.name || exerciseId;

    const totalReps = reps.length;
    const highQualityReps = reps.filter(r => r.tier !== 'COMPROMISED').length;
    const pristineReps = reps.filter(r => r.tier === 'PRISTINE').length;

    // Identify most frequent deviation
    const deviationCounts = {};
    for (const r of reps) {
      for (const d of (r.deviations || [])) {
        deviationCounts[d.faultType] = (deviationCounts[d.faultType] || 0) + 1;
      }
    }

    const sortedFaults = Object.entries(deviationCounts).sort((a, b) => b[1] - a[1]);
    const topFaultKey = sortedFaults[0]?.[0] || 'hip_sag';
    const explanation = EXERCISE_EXPLANATIONS[topFaultKey] || EXERCISE_EXPLANATIONS.hip_sag;

    // Determine fatigue rep
    let fatigueRepNumber = userPatternInsights?.expectedFatigueRep || null;
    if (!fatigueRepNumber && reps.length >= 5) {
      // Find first rep where score dropped by >12
      const base = reps[0]?.overallScore || 90;
      const found = reps.find((r, idx) => idx >= 3 && r.overallScore < base - 12);
      if (found) fatigueRepNumber = found.repNumber;
    }

    // Generate actionable advice for next workout
    const weakestArea = formProfile.biggestImprovementArea;
    let nextFocusAdvice = '';
    if (weakestArea) {
      if (weakestArea.key === 'depth') {
        nextFocusAdvice = isAr 
          ? `التركيز على عمق النزول في تمرين ${exerciseName} مع الحفاظ على الإيقاع المتزن.`
          : `Focus on hitting consistent depth in ${exerciseName} while maintaining tempo.`;
      } else if (weakestArea.key === 'alignment') {
        nextFocusAdvice = isAr
          ? `الحفاظ على استقامة الجذع وشد عضلات البطن لمنع أي ميل بالحوض.`
          : `Prioritize rigid trunk alignment and core bracing to prevent hip deviation.`;
      } else if (weakestArea.key === 'stability') {
        nextFocusAdvice = isAr
          ? `تثبيت مسار الركب مع أصابع القدمين أثناء الدفع من الأرض.`
          : `Keep knees locked in line with toes during both descent and ascent.`;
      } else {
        nextFocusAdvice = isAr
          ? `التحكم في سرعة الهبوط (2 ثانية) لزيادة القوة والتحكم الحركي.`
          : `Slow your descent down to a controlled 2-second negative for stability.`;
      }
    } else {
      nextFocusAdvice = isAr 
        ? `أداء متوازن جداً! استمر بنفس الإيقاع وزد عدد التكرارات بثقة.`
        : `Outstanding movement quality! Maintain this cadence and progress volume safely.`;
    }

    return {
      exerciseId,
      exerciseName,
      overallScore: formProfile.overallAverage || 88,
      repSummary: {
        total: totalReps,
        highQuality: highQualityReps,
        pristine: pristineReps,
        ratioText: isAr 
          ? `${totalReps} عدات مسجلة (${highQualityReps} بجودة احترافية عالية)`
          : `${totalReps} total reps (${highQualityReps} high-quality standard)`,
      },
      formProfile: {
        depth: formProfile.depth || 90,
        alignment: formProfile.alignment || 90,
        tempo: formProfile.tempo || 85,
        stability: formProfile.stability || 88,
        biggestImprovementArea: weakestArea,
      },
      explainTheCorrection: {
        faultKey: topFaultKey,
        title: isAr ? explanation.titleAr : explanation.titleEn,
        whyItMatters: isAr ? explanation.whyItMattersAr : explanation.whyItMattersEn,
        successRate: Math.max(65, Math.round((highQualityReps / Math.max(1, totalReps)) * 100)),
      },
      repComparison: repComparison ? {
        repA: repComparison.repA,
        repB: repComparison.repB,
        scoreDelta: repComparison.scoreDelta,
        depthDelta: repComparison.depthDelta,
        summaryText: isAr 
          ? (repComparison.scoreDelta < -8 
              ? `تراجع الفورم بمقدار ${Math.abs(repComparison.scoreDelta)}% بين العدّة الأولى والأخيرة نتيجة الإجهاد العضلي الطبيعي.` 
              : `حافظت على ثبات متميز بين العدّة الأولى والأخيرة (فارق ${Math.abs(repComparison.scoreDelta)}% فقط).`)
          : (repComparison.scoreDelta < -8
              ? `Form quality drifted by ${Math.abs(repComparison.scoreDelta)}% between Rep 1 and your final rep due to muscle fatigue.`
              : `Maintained excellent consistency between Rep 1 and final rep (only ${Math.abs(repComparison.scoreDelta)}% change).`),
      } : null,
      fatigueInsight: fatigueRepNumber ? {
        repNumber: fatigueRepNumber,
        text: isAr 
          ? `لوحظ بداية تراجع الفورم بعد العدّة رقم ${fatigueRepNumber}.`
          : `Fatigue inflection detected after Rep ${fatigueRepNumber}.`,
      } : null,
      nextWorkoutFocus: nextFocusAdvice,
      generatedAt: new Date().toISOString(),
    };
  }
}

export default PostWorkoutCoachReportGenerator;
