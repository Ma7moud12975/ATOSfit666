/**
 * Coaching Modes Controller
 * -------------------------
 * Gives the athlete absolute control over verbal feedback frequency and style:
 * 
 * 1. SILENT: Zero spoken audio cues. Visual HUD overlays and haptic pulses only.
 * 2. NORMAL (Default): Minimal intervention. Silent during good form, only speaks on
 *    severe biomechanical deviations after temporal confirmation.
 * 3. COACH: Standard personal trainer presence. Spoken micro-cues on deviations,
 *    positive encouragement on pristine reps, and pre-rep fatigue alerts.
 * 4. PERFORMANCE: Tailored for athletes focusing on tempo, cadence consistency,
 *    time under tension, and Form Drift velocity.
 */

export const COACHING_MODES = {
  SILENT: 'silent',
  NORMAL: 'normal',
  COACH: 'coach',
  PERFORMANCE: 'performance',
};

export const COACHING_MODE_CONFIGS = {
  silent: {
    id: 'silent',
    labelAr: 'صامت (مرئي فقط)',
    labelEn: 'Silent (Visual Only)',
    descriptionAr: 'توجيهات مرئية على الشاشة دون أي مقاطعة صوتية أثناء التمرين.',
    descriptionEn: 'On-screen visual cues only with zero voice interruption.',
    allowVoice: false,
    allowWarningSound: false,
    voiceCooldownMs: 999999,
  },
  normal: {
    id: 'normal',
    labelAr: 'المدرّب الذكي (الافتراضي)',
    labelEn: 'Smart Coach (Normal)',
    descriptionAr: 'صامت تماماً وأنت تؤدي جيداً، ويتدخل بصوت مقتضب فقط عند الأخطاء الحرجة.',
    descriptionEn: 'Quiet when form is solid; intervenes only for significant deviations.',
    allowVoice: true,
    allowWarningSound: true,
    voiceCooldownMs: 4200,
  },
  coach: {
    id: 'coach',
    labelAr: 'مدرّب شخصي كامل',
    labelEn: 'Active Personal Coach',
    descriptionAr: 'تفاعل صوتي نشط: تشجيع عند العدات المثالية، وتوجيه سريع فوري عند أي خطأ.',
    descriptionEn: 'Full verbal coaching: instant micro-cues and positive reinforcement.',
    allowVoice: true,
    allowWarningSound: true,
    voiceCooldownMs: 3200,
  },
  performance: {
    id: 'performance',
    labelAr: 'وضع الأداء والسرعة',
    labelEn: 'Performance & Tempo',
    descriptionAr: 'تركيز فائق على الإيقاع والتحكم في الهبوط وتنبيهات تراجع الطاقة والسرعة.',
    descriptionEn: 'Focuses on cadence, eccentric tempo, and fatigue drift prevention.',
    allowVoice: true,
    allowWarningSound: true,
    voiceCooldownMs: 3500,
  },
};

const MODE_STORAGE_KEY = 'atos_preferred_coaching_mode';

export function getSavedCoachingMode() {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return saved && COACHING_MODES[saved.toUpperCase()] ? saved : COACHING_MODES.NORMAL;
  } catch {
    return COACHING_MODES.NORMAL;
  }
}

export function saveCoachingMode(mode) {
  try {
    if (Object.values(COACHING_MODES).includes(mode)) {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      window.dispatchEvent(new CustomEvent('atos_coaching_mode_changed', { detail: mode }));
    }
  } catch {}
}

export default {
  COACHING_MODES,
  COACHING_MODE_CONFIGS,
  getSavedCoachingMode,
  saveCoachingMode,
};
