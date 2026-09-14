import { POSTURE_VALIDATION_CONFIG } from './exerciseValidationRules.js';

export class FalseAlarmSmoother {
  constructor(config = {}) {
    this.config = { ...POSTURE_VALIDATION_CONFIG, ...config };
    this.debounceMs = this.config.DEBOUNCE_MS ?? 350;
    this.reset();
  }

  reset() {
    this.validFrames = 0;
    this.invalidFrames = 0;
    this.readyFrames = 0;
    this.lostFrames = 0;
    this.stablePosture = 'unknown';
    this.lastReason = 'detecting';

    // Timestamp tracking for temporal debouncing
    this.firstValidTime = null;
    this.firstInvalidTime = null;
    this.firstReadyTime = null;
  }

  update({ hasPose, isValid, isReadyPose, reason }, timestampMs = null) {
    const now = timestampMs ?? Date.now();

    if (!hasPose) {
      this.lostFrames += 1;
      this.validFrames = 0;
      this.readyFrames = 0;
      this.firstValidTime = null;
      this.firstReadyTime = null;

      if (this.lostFrames >= this.config.LOST_TRACKING_FRAMES_LIMIT) {
        this.stablePosture = 'unknown';
      }
      this.lastReason = reason || 'no_landmarks';
      return this.snapshot();
    }

    this.lostFrames = 0;

    if (isValid) {
      this.validFrames += 1;
      this.invalidFrames = 0;
      this.firstInvalidTime = null;

      if (!this.firstValidTime) {
        this.firstValidTime = now;
      }

      const elapsedValidMs = now - this.firstValidTime;
      const framesMet = this.validFrames >= this.config.VALID_FRAMES_REQUIRED;
      const durationMet = elapsedValidMs >= this.debounceMs;

      // Require both frame count and duration before committing 'correct'
      if (framesMet && durationMet) {
        this.stablePosture = 'correct';
      }
    } else {
      this.invalidFrames += 1;
      this.validFrames = 0;
      this.firstValidTime = null;

      if (!this.firstInvalidTime) {
        this.firstInvalidTime = now;
      }

      const elapsedInvalidMs = now - this.firstInvalidTime;
      const framesMet = this.invalidFrames >= this.config.INVALID_FRAMES_REQUIRED;
      const durationMet = elapsedInvalidMs >= this.debounceMs;

      // Require both frame count and duration before committing 'incorrect'
      // This prevents single anomalous frames from flipping posture status
      if (framesMet && durationMet) {
        this.stablePosture = 'incorrect';
      }
    }

    // Ready pose debouncing
    if (isReadyPose) {
      this.readyFrames += 1;
      if (!this.firstReadyTime) {
        this.firstReadyTime = now;
      }
    } else {
      this.readyFrames = 0;
      this.firstReadyTime = null;
    }

    const elapsedReadyMs = this.firstReadyTime ? (now - this.firstReadyTime) : 0;
    const readyStable = (this.readyFrames >= this.config.READY_FRAMES_REQUIRED) && (elapsedReadyMs >= this.debounceMs);

    this.lastReason = reason || (isValid ? 'valid' : 'invalid');

    return this.snapshot(readyStable);
  }

  snapshot(readyStable = null) {
    const isReadyStable = readyStable !== null 
      ? readyStable 
      : (this.readyFrames >= this.config.READY_FRAMES_REQUIRED);

    return {
      stablePosture: this.stablePosture,
      validFrames: this.validFrames,
      invalidFrames: this.invalidFrames,
      readyFrames: this.readyFrames,
      lostFrames: this.lostFrames,
      reason: this.lastReason,
      readyStable: isReadyStable
    };
  }
}
