/**
 * Human Micro-Cue Library
 * -----------------------
 * Action-oriented, concise verbal cues (2-4 words) in Arabic & English.
 * Follows strict coaching psychology:
 * - Directs WHAT TO DO, never what was wrong.
 * - Categorized by exercise, phase, and biomechanical deviation.
 * - Includes camera / visibility guidance when tracking confidence drops.
 */

export const MICRO_CUE_LIBRARY = {
  // Global / Camera / Framing Cues
  framing: {
    step_back: {
      ar: ['ارجع خطوة لورا', 'ابعد عن الكاميرا شوية', 'ارجع سنة للخلف'],
      en: ['Step back a bit', 'Take a step back', 'Move back slightly'],
    },
    step_forward: {
      ar: ['قرب خطوة للكاميرا', 'تعال قدام سنة'],
      en: ['Step forward slightly', 'Come closer to camera'],
    },
    show_full_body: {
      ar: ['تحرك عشان أشوفك أوضح', 'اثبت في كادر الكاميرا'],
      en: ['Stay in full camera view', 'Adjust to full view'],
    },
    lighting_warning: {
      ar: ['الإضاءة خافتة شوية', 'زوّد إضاءة الغرفة'],
      en: ['Room lighting is dim', 'Brighten your space'],
    },
  },

  // Squats & Lunges
  squat: {
    knee_valgus: {
      ar: ['ركبك مع صوابعك', 'افتح ركبتك برا سنة', 'ثبّت مسار ركبتك'],
      en: ['Knees track with toes', 'Push knees out', 'Align knees over toes'],
    },
    heels_lifting: {
      ar: ['اثبّت كعبك على الأرض', 'اضغط من كعب رجلك', 'كعبك ثابت بالأرض'],
      en: ['Keep heels down', 'Drive through heels', 'Glue heels to floor'],
    },
    shallow_depth: {
      ar: ['نزّل أعمق شوية', 'خد المدى كامل', 'كمّل عمق النزول'],
      en: ['Hit full depth', 'Drop a little lower', 'Full range of motion'],
    },
    excessive_forward_lean: {
      ar: ['ارفع صدرك لفوق', 'صدرك عالي ومفرود', 'خلّي ضهرك مشدود'],
      en: ['Chest up high', 'Keep your chest proud', 'Lift your torso'],
    },
    fast_tempo: {
      ar: ['نزّل بهدوء وتحكّم', 'أبطأ في النزول', 'تحكّم في الهبوط'],
      en: ['Control the descent', 'Slow down the drop', 'Own the tempo'],
    },
    bottom_pause: {
      ar: ['ممتاز، اثبت هنا لحظة', 'ثانية بالعمق'],
      en: ['Hold the bottom a second', 'Nice depth, hold it'],
    },
  },

  lunge: {
    knee_valgus: {
      ar: ['ثبّت الركبة الأمامية', 'ركبتك متماشية مع قدمك'],
      en: ['Stabilize front knee', 'Keep front knee tracked'],
    },
    short_stride: {
      ar: ['وسّع الخطوة شوية', 'انزل بالحوض عمودي'],
      en: ['Step a bit wider', 'Drop hips straight down'],
    },
    torso_collapse: {
      ar: ['استقم بجذعك', 'صدرك مفرود للأمام'],
      en: ['Torso tall and upright', 'Keep your core braced'],
    },
  },

  // Push-up Family (Standard, Knee, Wide, Narrow, Diamond)
  push_up: {
    hip_sag: {
      ar: ['جسمك خط واحد', 'ارفع وسطك سنة', 'شد الكور والحوض'],
      en: ['Body in one line', 'Lift your hips slightly', 'Brace your core'],
    },
    hip_pike: {
      ar: ['نزّل الحوض سنة', 'استقم في وضع البلانك', 'جسمك مستقيم تماماً'],
      en: ['Lower hips slightly', 'Stay flat in plank', 'Level out your hips'],
    },
    shallow_depth: {
      ar: ['نزّل صدرك للأرض', 'خد النزول كامل 90°', 'انزل أكتر شوية'],
      en: ['Chest to the floor', 'Full 90 degree elbow bend', 'Go deeper'],
    },
    head_drop: {
      ar: ['ارفع رأسك مع ضهرك', 'رقبتك ممتدة مع عمودك الفقري'],
      en: ['Keep neck neutral', 'Don’t drop your head'],
    },
    fast_tempo: {
      ar: ['نزّل أبطأ شوية', 'تحكّم بنزولك'],
      en: ['Slow your descent', 'Control the negative'],
    },
    elbow_lockout: {
      ar: ['افرِد ذراعك بالكامل', 'ارجع للقمة للاكتمال'],
      en: ['Full arm extension', 'Push all the way up'],
    },
  },

  // Plank Family (Forearm, High, Reverse, Side, Knee)
  plank: {
    hip_sag: {
      ar: ['ارفع الحوض سنة', 'جسمك خط مستقيم', 'شد عضلات البطن'],
      en: ['Lift hips slightly', 'Keep body in line', 'Tighten your abs'],
    },
    hip_pike: {
      ar: ['نزّل حوضك شوية', 'خلّي ضهرك مستوي'],
      en: ['Lower your hips', 'Flatten out your back'],
    },
    shoulder_collapse: {
      ar: ['ادفع الأرض بكوعك', 'ابعد كتافك عن رقبتك'],
      en: ['Push through forearms', 'Shoulders away from ears'],
    },
    side_plank_drop: {
      ar: ['ارفع الحوض للقمة', 'ثبّت جسمك على جنب'],
      en: ['Drive hips higher', 'Keep stacked straight'],
    },
    reverse_plank_drop: {
      ar: ['ادفع الحوض للأعلى', 'افرد خط جسمك بالكامل'],
      en: ['Drive hips skyward', 'Straight line to heels'],
    },
  },

  // Cardio / HIIT (Jumping Jacks, High Knees, Burpees, Wall Sit)
  jumping_jacks: {
    arms_low: {
      ar: ['ارفع إيدك فوق رأسك', 'المدى كامل فوق'],
      en: ['Arms all the way up', 'Full overhead reach'],
    },
    stiff_landing: {
      ar: ['انزل بخفة على مشطك', 'ليّن ركبتك في الهبوط'],
      en: ['Land softly on toes', 'Soft knees on landing'],
    },
  },

  high_knees: {
    low_knees: {
      ar: ['ارفع ركبتك لمستوى الحوض', 'فوق أعلى شوية'],
      en: ['Drive knees hip-high', 'Higher knee drive'],
    },
    leaning_back: {
      ar: ['جسمك مستقيم مش لورا', 'جذعك مائل للأمام سنة'],
      en: ['Stay upright, don’t lean back', 'Slight athletic forward lean'],
    },
  },

  wall_sit: {
    sliding_up: {
      ar: ['انزل لمستوى الكرسي 90°', 'اثبت في الزاوية القائمة'],
      en: ['Sink down to 90 degrees', 'Hold chair height'],
    },
    knees_inward: {
      ar: ['خلّي ركبك موازية لأقدامك', 'افتح الركب شوية'],
      en: ['Keep knees parallel', 'Don’t let knees cave'],
    },
  },

  burpees: {
    sloppy_plank: {
      ar: ['اضبط البلانك قبل القفز', 'ثانية بلانك نظيفة'],
      en: ['Solid plank before the jump', 'Lock the plank'],
    },
    hard_landing: {
      ar: ['انزل خفيف على مشطك', 'امتص الهبوط بركبتك'],
      en: ['Soft landing, knees bent', 'Absorb the impact'],
    },
  },

  // Encouragements & Positive Feedback (when user corrects form or hits pristine rep)
  positive: {
    fixed_form: {
      ar: ['ممتاز، كده مظبوط!', 'عاش، صلّحت الفورم!', 'بالظبط كده، استمر!'],
      en: ['Great fix, right there!', 'Perfect adjustment!', 'Spot on, hold that!'],
    },
    pristine_rep: {
      ar: ['عدّة مثالية!', 'فورم نقي 100%!', 'عاش جداً!'],
      en: ['Flawless rep!', '100% textbook form!', 'Solid repetition!'],
    },
    fatigue_alert: {
      ar: ['الفورم بدأ يضعف، ركز في العدّة الجاية', 'خد نفَس، ركّز في التحكم'],
      en: ['Form is fading slightly, stay focused', 'Reset breath, prioritize control'],
    },
    proactive_history_warning: {
      ar: ['ركز… من هنا بيبدأ الفورم يضعف عندك عادةً', 'انتبه… الحوض بيميل هنا عادة'],
      en: ['Stay sharp… this is where form usually fades', 'Brace tight… watch your hips here'],
    },
  },
};

/**
 * Selects a human micro-cue
 */
export function getMicroCue({ category = 'squat', faultType = 'knee_valgus', lang = 'ar', variantIndex = 0 }) {
  const isAr = lang === 'ar';
  const group = MICRO_CUE_LIBRARY[category] || MICRO_CUE_LIBRARY.squat;
  const cueVariants = group[faultType] || group[Object.keys(group)[0]];

  if (!cueVariants) {
    return isAr ? 'حافظ على استقامة جسمك' : 'Maintain good body alignment';
  }

  const list = isAr ? (cueVariants.ar || []) : (cueVariants.en || []);
  if (!list.length) return '';
  return list[variantIndex % list.length];
}

export default MICRO_CUE_LIBRARY;
