/**
 * One Euro Filter & Landmark Temporal Smoother for Real-Time Pose Tracking.
 * 
 * Reference: Casiez, G., Roussel, N. and Vogel, F. (2012)
 * "1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems"
 * ACM CHI 2012.
 */

class LowPassFilter {
  constructor(alpha = 0.5) {
    this.alpha = Math.max(0, Math.min(1, alpha));
    this.s = null;
    this.initialized = false;
  }

  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  filter(value, alpha = this.alpha) {
    this.setAlpha(alpha);
    if (!this.initialized || this.s === null) {
      this.s = value;
      this.initialized = true;
    } else {
      this.s = alpha * value + (1.0 - alpha) * this.s;
    }
    return this.s;
  }

  last() {
    return this.s;
  }

  reset() {
    this.s = null;
    this.initialized = false;
  }
}

/**
 * OneEuroFilter for a single scalar value.
 * Dynamically adjusts cutoff frequency based on input velocity to eliminate jitter
 * at low speeds while maintaining responsive zero-latency tracking at high speeds.
 */
export class OneEuroFilter {
  /**
   * @param {number} freq - Expected sampling frequency in Hz (e.g. 30 FPS).
   * @param {number} minCutoff - Minimum cutoff frequency in Hz (lower = smoother when still).
   * @param {number} beta - Speed coefficient (higher = less lag during fast movement).
   * @param {number} dCutoff - Cutoff frequency for derivative filtering in Hz.
   */
  constructor(freq = 30, minCutoff = 1.0, beta = 5.0, dCutoff = 1.0) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;

    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
    this.lastTime = null;
    this.lastRawValue = null;
  }

  _computeAlpha(cutoff, dt) {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(value, timestamp = null) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return this.xFilter.last() ?? value;
    }

    const t = timestamp ?? Date.now();
    let dt = 1.0 / (this.freq || 30);

    if (this.lastTime !== null && t > this.lastTime) {
      dt = (t - this.lastTime) / 1000.0;
      if (dt <= 0 || dt > 1.0) {
        dt = 1.0 / (this.freq || 30);
      }
    }

    // Estimate derivative (rate of change)
    let dx = 0.0;
    if (this.lastRawValue !== null) {
      dx = (value - this.lastRawValue) / dt;
    }

    // Filter derivative using dCutoff
    const dAlpha = this._computeAlpha(this.dCutoff, dt);
    const edx = this.dxFilter.filter(dx, dAlpha);

    // Compute dynamic cutoff frequency: faster motion -> higher cutoff frequency
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);

    // Filter raw value
    const alpha = this._computeAlpha(cutoff, dt);
    const filteredValue = this.xFilter.filter(value, alpha);

    this.lastTime = t;
    this.lastRawValue = value;

    return filteredValue;
  }

  reset() {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
    this.lastRawValue = null;
  }
}

/**
 * Filter container for a 3D landmark (x, y, z).
 */
class Landmark3DFilter {
  constructor(freq = 30, minCutoff = 1.0, beta = 5.0, dCutoff = 1.0) {
    this.x = new OneEuroFilter(freq, minCutoff, beta, dCutoff);
    this.y = new OneEuroFilter(freq, minCutoff, beta, dCutoff);
    this.z = new OneEuroFilter(freq, minCutoff, beta, dCutoff);
    this.lastValid = null;
  }

  filter(rawLandmark, timestamp, minConfidence = 0.65, maxCoastMs = 350) {
    if (!rawLandmark) {
      return this._handleMissing(timestamp, maxCoastMs);
    }

    const visibility = rawLandmark.visibility ?? 1.0;

    // Confidence gating
    if (visibility < minConfidence) {
      return this._handleMissing(timestamp, maxCoastMs, rawLandmark);
    }

    // High confidence: update filters and record valid state
    const fx = this.x.filter(rawLandmark.x, timestamp);
    const fy = this.y.filter(rawLandmark.y, timestamp);
    const fz = rawLandmark.z !== undefined ? this.z.filter(rawLandmark.z, timestamp) : 0;

    const smoothed = {
      x: fx,
      y: fy,
      z: fz,
      visibility: visibility,
      isHeld: false,
      timestamp
    };

    this.lastValid = smoothed;
    return smoothed;
  }

  _handleMissing(timestamp, maxCoastMs, partialRaw = null) {
    if (this.lastValid && (timestamp - this.lastValid.timestamp) <= maxCoastMs) {
      // Coasting through brief occlusion
      return {
        ...this.lastValid,
        visibility: 0.5,
        isHeld: true,
        backfilled: true,
        timestamp
      };
    }

    // Occlusion lasted too long: unviable
    return partialRaw ? { ...partialRaw, visibility: 0.2, isHeld: false } : null;
  }

  reset() {
    this.x.reset();
    this.y.reset();
    this.z.reset();
    this.lastValid = null;
  }
}

/**
 * Full skeleton landmark smoothing manager.
 * Applies OneEuroFilter across all 33 MediaPipe pose landmarks,
 * enforces confidence gating (> 0.65), handles brief occlusions gracefully,
 * and reports tracking status.
 */
export class PoseLandmarkSmoother {
  constructor(config = {}) {
    this.minConfidence = config.minConfidence ?? 0.65;
    this.maxCoastMs = config.maxCoastMs ?? 350;
    this.freq = config.freq ?? 30;
    this.minCutoff = config.minCutoff ?? 1.0;
    this.beta = config.beta ?? 5.0;
    this.dCutoff = config.dCutoff ?? 1.0;

    this.filters = Array.from({ length: 33 }, () => 
      new Landmark3DFilter(this.freq, this.minCutoff, this.beta, this.dCutoff)
    );

    this.lastFrameTime = null;
    this.consecutiveOccludedFrames = 0;
  }

  /**
   * Process and smooth raw pose landmarks from MediaPipe.
   * @param {Array<Object>|null} rawLandmarks - Array of 33 normalized landmarks.
   * @param {Array<number>} criticalIndices - Indices of joints essential for current exercise.
   * @param {number} timestamp - Current frame timestamp in ms.
   * @returns {{
   *   landmarks: Array<Object>|null,
   *   isSearching: boolean,
   *   trackingQuality: number,
   *   occludedIndices: Array<number>
   * }}
   */
  process(rawLandmarks, criticalIndices = [11, 12, 13, 14, 15, 16, 23, 24], timestamp = Date.now()) {
    if (!rawLandmarks || rawLandmarks.length === 0) {
      this.consecutiveOccludedFrames += 1;
      return {
        landmarks: null,
        isSearching: true,
        trackingQuality: 0,
        occludedIndices: [...criticalIndices]
      };
    }

    const smoothedLandmarks = new Array(rawLandmarks.length);
    const occludedIndices = [];
    let highConfidenceCount = 0;

    for (let i = 0; i < rawLandmarks.length; i++) {
      const raw = rawLandmarks[i];
      const isCritical = criticalIndices.includes(i);
      const minConf = isCritical ? this.minConfidence : 0.45;

      const smoothed = this.filters[i].filter(raw, timestamp, minConf, this.maxCoastMs);
      smoothedLandmarks[i] = smoothed;

      if (isCritical) {
        if (!smoothed || smoothed.isHeld || (smoothed.visibility ?? 0) < this.minConfidence) {
          occludedIndices.push(i);
        } else {
          highConfidenceCount += 1;
        }
      }
    }

    const trackingQuality = criticalIndices.length > 0 
      ? highConfidenceCount / criticalIndices.length 
      : 1.0;

    // If more than half of critical indices are missing or stale past coast limit, enter SEARCHING
    const isSearching = occludedIndices.length > (criticalIndices.length * 0.5);

    if (isSearching) {
      this.consecutiveOccludedFrames += 1;
    } else {
      this.consecutiveOccludedFrames = 0;
    }

    return {
      landmarks: smoothedLandmarks,
      isSearching,
      trackingQuality,
      occludedIndices
    };
  }

  reset() {
    this.filters.forEach(f => f.reset());
    this.lastFrameTime = null;
    this.consecutiveOccludedFrames = 0;
  }
}
