/**
 * Smart Coaching Priority & "One Cue at a Time" Engine
 * ---------------------------------------------------
 * Ensures the AI Coach acts like an elite human coach:
 * 1. Confidence Gate: If MediaPipe is not confident (<0.65) or user body is clipped,
 *    NO form corrections are given. Instead prompts framing cues ("ارجع خطوة لورا").
 * 2. Temporal Persistence: Ignores single-frame tracking glitches. Requires deviation
 *    to persist across a temporal window before declaring an error.
 * 3. Severity & Biomechanical Risk: Ranks spinal/joint safety > range of motion > tempo.
 * 4. Phase-Awareness: Only gives cues that apply to the current active movement phase.
 * 5. One Cue at a Time: Selects exactly ONE highest-impact cue.
 * 6. Flow Protection: Enforces conversational pauses (3.5s - 5s) so the user is never nagged.
 */

import { FORM_ZONES } from './anthropometryToleranceEngine.js';
import { MOVEMENT_PHASES } from './movementPhaseDetector.js';
import { getMicroCue } from './microCueLibrary.js';

export const BIOMECHANICAL_SEVERITY = {
  SAFETY_CRITICAL: 100, // Lumbar hyperextension, extreme knee valgus collapse
  STRUCTURAL_ALIGNMENT: 75, // Hip sag in plank/pushup, forward trunk drop in squat
  RANGE_OF_MOTION: 50,  // Shallow depth, incomplete elbow extension
  TEMPO_PACING: 25,     // Fast descent, rushing the rep
};

export class SmartCoachingPriorityEngine {
  constructor(config = {}) {
    this.minConfidence = config.minConfidence ?? 0.65;
    this.frameWindowSize = config.frameWindowSize ?? 8; // Frames required to confirm persistent fault
    this.voiceCooldownMs = config.voiceCooldownMs ?? 3800; // Minimum time between spoken voice cues
    this.lastSpokenTime = 0;
    this.lastSpokenKey = null;
    this.faultHistory = new Map(); // key -> consecutiveFrames
    this.coachingMode = config.coachingMode ?? 'normal'; // 'silent', 'normal', 'coach', 'performance'
  }

  setCoachingMode(mode) {
    if (['silent', 'normal', 'coach', 'performance'].includes(mode)) {
      this.coachingMode = mode;
    }
  }

  /**
   * Processes current frame candidates and selects at most ONE prioritized coaching decision
   * @param {Object} params
   * @param {Array} params.detectedDeviations - Array of detected issues in this frame
   * @param {number} params.poseConfidence - Overall MediaPipe landmark confidence (0-1)
   * @param {boolean} params.isBodyFullyVisible - Whether all required limbs are in frame
   * @param {string} params.currentPhase - Current MOVEMENT_PHASES
   * @param {string} params.exerciseId - e.g. 'squat', 'push_up'
   * @param {string} params.lang - 'ar' or 'en'
   * @returns {Object|null} Selected coaching cue decision, or null if silent
   */
  evaluateFrame({
    detectedDeviations = [],
    poseConfidence = 1.0,
    isBodyFullyVisible = true,
    currentPhase = MOVEMENT_PHASES.SETUP,
    exerciseId = 'squat',
    lang = 'ar',
    now = Date.now(),
  }) {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. CONFIDENCE GATE (User's Rule #6)
    // ─────────────────────────────────────────────────────────────────────────
    if (poseConfidence < this.minConfidence || !isBodyFullyVisible) {
      // User is out of frame or camera tracking is unreliable
      // MUST NOT say "Keep back straight" when we can't even see the back!
      if (now - this.lastSpokenTime > this.voiceCooldownMs) {
        this.lastSpokenTime = now;
        const framingCue = !isBodyFullyVisible
          ? getMicroCue({ category: 'framing', faultType: 'step_back', lang })
          : getMicroCue({ category: 'framing', faultType: 'show_full_body', lang });

        return {
          type: 'framing',
          speak: this.coachingMode !== 'silent',
          text: framingCue,
          category: 'framing',
          severity: BIOMECHANICAL_SEVERITY.SAFETY_CRITICAL,
          confidenceGated: true,
        };
      }
      return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. TEMPORAL PERSISTENCE FILTER (User's Rule #5)
    // ─────────────────────────────────────────────────────────────────────────
    // Update fault counters: increment active faults, decay missing ones
    const activeKeys = new Set();
    for (const dev of detectedDeviations) {
      const key = `${dev.category}_${dev.faultType}`;
      activeKeys.add(key);
      const prevCount = this.faultHistory.get(key) || 0;
      this.faultHistory.set(key, prevCount + 1);
    }

    for (const [key, count] of this.faultHistory.entries()) {
      if (!activeKeys.has(key)) {
        if (count <= 1) {
          this.faultHistory.delete(key);
        } else {
          this.faultHistory.set(key, Math.max(0, count - 2));
        }
      }
    }

    if (detectedDeviations.length === 0) {
      return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. SEVERITY & PHASE RELEVANCE FILTER
    // ─────────────────────────────────────────────────────────────────────────
    const qualifiedCandidates = [];

    for (const dev of detectedDeviations) {
      const key = `${dev.category}_${dev.faultType}`;
      const consecutiveFrames = this.faultHistory.get(key) || 0;

      // Only evaluate if fault has persisted across the required window
      // (Safety-critical faults require only 4 frames; minor tempo faults require 10)
      const requiredWindow = dev.severity >= BIOMECHANICAL_SEVERITY.SAFETY_CRITICAL 
        ? Math.max(3, Math.floor(this.frameWindowSize / 2)) 
        : this.frameWindowSize;

      if (consecutiveFrames < requiredWindow) {
        continue; // Filtered out as potential tracking noise
      }

      // Check phase compatibility:
      // Don't tell user "lift chest" when they are in lock-out / standing!
      // Don't tell user "shallow depth" until they reached or passed the BOTTOM phase!
      if (dev.faultType === 'shallow_depth' && currentPhase !== MOVEMENT_PHASES.BOTTOM && currentPhase !== MOVEMENT_PHASES.ASCENT) {
        continue;
      }
      if (dev.faultType === 'fast_tempo' && currentPhase !== MOVEMENT_PHASES.DESCENT) {
        continue;
      }

      // Calculate priority score:
      // Score = Severity (0-100) + Persistence bonus + Deviation magnitude
      const priorityScore = (dev.severity || 50) + Math.min(20, consecutiveFrames * 2) + Math.min(20, dev.deviationDeg || 0);

      qualifiedCandidates.push({
        ...dev,
        key,
        consecutiveFrames,
        priorityScore,
      });
    }

    if (qualifiedCandidates.length === 0) {
      return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. "ONE CUE AT A TIME" SELECTION (User's Rule #1)
    // ─────────────────────────────────────────────────────────────────────────
    // Sort descending by priorityScore -> Pick candidate #0
    qualifiedCandidates.sort((a, b) => b.priorityScore - a.priorityScore);
    const topFault = qualifiedCandidates[0];

    // Flow protection: Respect conversational cooldown between voice cues
    const timeSinceLastSpoken = now - this.lastSpokenTime;
    const isSameFault = this.lastSpokenKey === topFault.key;
    const effectiveCooldown = isSameFault ? this.voiceCooldownMs * 1.4 : this.voiceCooldownMs;

    // In 'silent' mode: return cue for UI banner without audio
    if (this.coachingMode === 'silent') {
      const cueText = getMicroCue({
        category: topFault.category || exerciseId,
        faultType: topFault.faultType,
        lang,
      });
      return {
        type: 'correction',
        speak: false,
        text: cueText,
        faultType: topFault.faultType,
        severity: topFault.severity,
        consecutiveFrames: topFault.consecutiveFrames,
      };
    }

    if (timeSinceLastSpoken < effectiveCooldown) {
      // Cooldown active: Return for visual HUD only, do not trigger audio
      const cueText = getMicroCue({
        category: topFault.category || exerciseId,
        faultType: topFault.faultType,
        lang,
      });
      return {
        type: 'correction',
        speak: false,
        text: cueText,
        faultType: topFault.faultType,
        severity: topFault.severity,
        visualOnly: true,
      };
    }

    // Deliver prioritized verbal micro-cue!
    this.lastSpokenTime = now;
    this.lastSpokenKey = topFault.key;

    const cueText = getMicroCue({
      category: topFault.category || exerciseId,
      faultType: topFault.faultType,
      lang,
    });

    return {
      type: 'correction',
      speak: true,
      text: cueText,
      faultType: topFault.faultType,
      severity: topFault.severity,
      visualOnly: false,
    };
  }

  /**
   * Resets internal tracking between exercise sets
   */
  reset() {
    this.lastSpokenTime = 0;
    this.lastSpokenKey = null;
    this.faultHistory.clear();
  }
}

export default SmartCoachingPriorityEngine;
