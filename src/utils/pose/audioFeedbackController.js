/**
 * Centralized Audio & Voice Feedback Controller
 * Enforces cooldown throttling (2.8s) between automated voice prompts and warning beeps
 * to avoid overwhelming the user during exercise sets.
 */

export class AudioFeedbackController {
  constructor(config = {}) {
    this.cooldownMs = config.cooldownMs ?? 2800; // 2.8s minimum cooldown between voice/warning alerts
    this.lastAlertTime = 0;
    this.lastSpokenMessage = null;
    this.speechEnabled = config.speechEnabled ?? true;
    this.soundEnabled = config.soundEnabled ?? true;
    this.audioCtx = null;
  }

  _getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Play warning beep when posture is out of bounds (throttled)
   */
  playWarningBeep(force = false) {
    const now = Date.now();
    if (!force && (now - this.lastAlertTime < this.cooldownMs)) {
      return false;
    }

    try {
      const ctx = this._getAudioContext();
      if (!ctx) return false;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);

      this.lastAlertTime = now;
      return true;
    } catch (e) {
      console.warn('AudioFeedbackController: warning sound error', e);
      return false;
    }
  }

  /**
   * Play crisp success pop for counted rep
   */
  playSuccessSound() {
    try {
      if (typeof Audio !== 'undefined') {
        const audio = new Audio('/assets/sounds/pop.wav');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch (e) {
      // Non-critical fallback
    }
  }

  /**
   * Speak a form correction message via Web Speech API (throttled to 2.8s)
   */
  speak(text, lang = 'en-US', force = false) {
    if (!this.speechEnabled || !text || typeof window === 'undefined' || !window.speechSynthesis) {
      return false;
    }

    const now = Date.now();
    if (!force && (now - this.lastAlertTime < this.cooldownMs)) {
      return false;
    }

    // Cancel pending utterances to prevent queued chatter
    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.lang = lang;

      window.speechSynthesis.speak(utterance);
      this.lastAlertTime = now;
      this.lastSpokenMessage = text;
      return true;
    } catch (e) {
      console.warn('AudioFeedbackController: speech synthesis error', e);
      return false;
    }
  }

  /**
   * Trigger debounced posture correction (sound + optional voice prompt)
   */
  triggerFormCorrection(feedbackText, options = {}) {
    const now = Date.now();
    if (now - this.lastAlertTime < this.cooldownMs) {
      return false;
    }

    this.playWarningBeep(true);

    if (options.speakVoice && feedbackText) {
      this.speak(feedbackText, options.lang || 'en-US', true);
    }

    this.lastAlertTime = now;
    return true;
  }

  reset() {
    this.lastAlertTime = 0;
    this.lastSpokenMessage = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const globalAudioFeedback = new AudioFeedbackController();
