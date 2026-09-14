export const READINESS_STATES = {
  DETECTING_USER: 'DETECTING_USER',
  BODY_VISIBLE: 'BODY_VISIBLE',
  SEARCHING: 'SEARCHING',
  POSITION_NOT_READY: 'POSITION_NOT_READY',
  POSITION_READY: 'POSITION_READY',
  WORKOUT_ACTIVE: 'WORKOUT_ACTIVE',
  FORM_WARNING: 'FORM_WARNING',
  REP_COUNTING_PAUSED: 'REP_COUNTING_PAUSED',
  RESUME_WHEN_VALID: 'RESUME_WHEN_VALID'
};

export const POSTURE_VALIDATION_CONFIG = {
  MIN_KEYPOINT_CONFIDENCE: 0.65,
  VALID_FRAMES_REQUIRED: 8,
  INVALID_FRAMES_REQUIRED: 10,
  READY_FRAMES_REQUIRED: 10,
  LOST_TRACKING_FRAMES_LIMIT: 12,
  DEBOUNCE_MS: 350,
  COOLDOWN_AUDIO_MS: 2800,
  // Push-up Rep Hysteresis Thresholds
  PUSHUP_DOWN_ELBOW: 90,
  PUSHUP_UP_ELBOW: 160,
  PUSHUP_MIN_REP_MS: 650,
  PUSHUP_MAX_CAMERA_TILT_DEG: 55
};

export const LANDMARK_INDEX = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28
};

// Push-ups require upper body: shoulders, elbows, wrists, and hips.
// Knees and feet are optional to allow standard room setups and webcam angles.
export const pushupUpperBodyJoints = [
  'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
  'leftWrist', 'rightWrist', 'leftHip', 'rightHip'
];

export const pushupLeftChain = ['leftShoulder', 'leftElbow', 'leftWrist', 'leftHip'];
export const pushupRightChain = ['rightShoulder', 'rightElbow', 'rightWrist', 'rightHip'];

export const CRITICAL_INDICES_BY_EXERCISE = {
  pushups: [11, 12, 13, 14, 15, 16, 23, 24],
  widepushups: [11, 12, 13, 14, 15, 16, 23, 24],
  narrowpushups: [11, 12, 13, 14, 15, 16, 23, 24],
  diamondpushups: [11, 12, 13, 14, 15, 16, 23, 24],
  kneepushups: [11, 12, 13, 14, 15, 16, 23, 24],
  squats: [11, 12, 23, 24, 25, 26],
  lunges: [23, 24, 25, 26, 27, 28],
  plank: [11, 12, 23, 24],
  sideplank: [11, 12, 23, 24],
  wallsit: [11, 12, 23, 24, 25, 26],
  situps: [11, 12, 23, 24],
  burpees: [11, 12, 23, 24, 25, 26],
  highknees: [23, 24, 25, 26],
  jumpingjacks: [11, 12, 13, 14, 23, 24, 25, 26]
};

export const EXERCISE_VALIDATION_RULES = {
  pushups: {
    family: 'pushup',
    requiredJoints: pushupUpperBodyJoints,
    supportsSideChain: true,
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the starting plank position',
    invalidMessages: {
      visibility: 'Ensure shoulders, arms, and hips are visible',
      alignment: 'Keep hips and torso aligned',
      starting: 'Get into push-up plank position'
    }
  },
  widepushups: {
    family: 'pushup',
    requiredJoints: pushupUpperBodyJoints,
    supportsSideChain: true,
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the starting plank position',
    invalidMessages: {
      visibility: 'Ensure shoulders, arms, and hips are visible',
      alignment: 'Keep hips and torso aligned',
      starting: 'Get into push-up plank position'
    }
  },
  narrowpushups: {
    family: 'pushup',
    requiredJoints: pushupUpperBodyJoints,
    supportsSideChain: true,
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the starting plank position',
    invalidMessages: {
      visibility: 'Ensure shoulders, arms, and hips are visible',
      alignment: 'Keep hips and torso aligned',
      starting: 'Get into push-up plank position'
    }
  },
  diamondpushups: {
    family: 'pushup',
    requiredJoints: pushupUpperBodyJoints,
    supportsSideChain: true,
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the starting plank position',
    invalidMessages: {
      visibility: 'Ensure shoulders, arms, and hips are visible',
      alignment: 'Keep hips and torso aligned',
      starting: 'Get into push-up plank position'
    }
  },
  kneepushups: {
    family: 'pushup',
    requiredJoints: pushupUpperBodyJoints,
    supportsSideChain: true,
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the starting position',
    invalidMessages: {
      visibility: 'Ensure upper body is visible',
      starting: 'Adjust your knee push-up starting position'
    }
  },
  squats: {
    family: 'squat',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    readyMessage: 'Ready position detected',
    waitingMessage: 'Stand upright and hold still',
    invalidMessages: {
      visibility: 'Move back so your shoulders, hips, and knees are visible',
      alignment: 'Stand facing the camera',
      starting: 'Adjust your standing starting position'
    }
  },
  lunges: {
    family: 'squat',
    requiredJoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    waitingMessage: 'Set your feet and hold the starting position',
    invalidMessages: {
      visibility: 'Ensure hips and knees are visible',
      starting: 'Set your stance for lunges'
    }
  },
  plank: {
    family: 'plank',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
    readyMessage: 'Ready position detected',
    waitingMessage: 'Hold the correct plank position',
    invalidMessages: {
      visibility: 'Ensure shoulders and hips are visible',
      alignment: 'Keep your back straight',
      hipsHigh: 'Lower your hips slightly',
      hipsLow: 'Raise your hips slightly'
    }
  },
  sideplank: {
    family: 'plank',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
    waitingMessage: 'Hold the correct side plank position',
    invalidMessages: {
      visibility: 'Ensure upper body and torso are visible',
      alignment: 'Keep your body in a straight line'
    }
  },
  wallsit: {
    family: 'wallsit',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    readyMessage: 'Ready position detected',
    waitingMessage: 'Bend your knees into the wall sit position',
    invalidMessages: {
      visibility: 'Move back so your legs are visible',
      starting: 'Adjust your knees',
      alignment: 'Hold a stable wall sit position'
    }
  },
  situps: {
    family: 'core',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
    waitingMessage: 'Lie down in the starting position'
  },
  burpees: {
    family: 'general',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
    waitingMessage: 'Stand facing the camera'
  },
  highknees: {
    family: 'cardio',
    requiredJoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    waitingMessage: 'Stand facing the camera'
  },
  jumpingjacks: {
    family: 'cardio',
    requiredJoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
    waitingMessage: 'Stand facing the camera'
  }
};

export const getExerciseValidationRule = (mode = 'pushups') => {
  const normalized = String(mode || 'pushups').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return EXERCISE_VALIDATION_RULES[normalized] || EXERCISE_VALIDATION_RULES.pushups;
};
