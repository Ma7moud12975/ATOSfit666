import { getExerciseValidationRule, LANDMARK_INDEX, POSTURE_VALIDATION_CONFIG, pushupLeftChain, pushupRightChain } from './exerciseValidationRules.js';

const visible = (landmarks, name, minConfidence) => {
  const landmark = landmarks?.[LANDMARK_INDEX[name]];
  if (!landmark) return false;
  // If landmark is held during brief occlusion coasting, treat as tentatively visible
  if (landmark.isHeld && landmark.visibility >= 0.45) return true;
  return (landmark.visibility ?? 0) >= minConfidence;
};

const center = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const angleBetween = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
};

const get = (landmarks, name) => landmarks?.[LANDMARK_INDEX[name]];

const evaluateStartingPose = (landmarks, mode, rule, helpers = {}, config = {}) => {
  const family = rule.family;

  if (family === 'pushup') {
    const inStart = helpers.isPushupStartPose ? helpers.isPushupStartPose(landmarks) : false;
    return {
      ready: inStart,
      valid: inStart,
      reason: inStart ? 'pushup_start_ready' : 'pushup_start_not_ready',
      feedback: inStart 
        ? (rule.readyMessage || 'Ready position detected') 
        : (rule.invalidMessages?.starting || 'Get into push-up plank position')
    };
  }

  if (family === 'plank') {
    const alignment = helpers.checkBackAlignment ? helpers.checkBackAlignment(landmarks, { exerciseMode: mode }) : { isValid: false };
    return {
      ready: !!alignment.isValid,
      valid: !!alignment.isValid,
      reason: alignment.reason || (alignment.isValid ? 'plank_ready' : 'plank_not_ready'),
      feedback: alignment.feedback || (alignment.isValid ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.alignment || 'Keep your back straight'))
    };
  }

  if (family === 'squat') {
    const lh = get(landmarks, 'leftHip');
    const rh = get(landmarks, 'rightHip');
    const lk = get(landmarks, 'leftKnee');
    const rk = get(landmarks, 'rightKnee');
    const ls = get(landmarks, 'leftShoulder');
    const rs = get(landmarks, 'rightShoulder');

    if (!lh && !rh) {
      return { ready: false, valid: false, reason: 'hips_not_visible', feedback: 'Ensure hips and legs are visible' };
    }

    const hip = center(lh || rh, rh || lh);
    const knee = (lk && rk) ? center(lk, rk) : (lk || rk);
    const shoulder = (ls && rs) ? center(ls, rs) : (ls || rs);

    if (!knee || !shoulder) {
      return { ready: false, valid: false, reason: 'joints_missing', feedback: 'Stand upright and hold still' };
    }

    const torsoTilt = Math.min(angleBetween(shoulder, hip), Math.abs(180 - angleBetween(shoulder, hip)));
    const standing = hip.y < knee.y - 0.03 && torsoTilt > 40;
    return {
      ready: standing,
      valid: standing,
      reason: standing ? 'standing_ready' : 'standing_not_ready',
      feedback: standing ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.starting || 'Stand upright and hold still')
    };
  }

  if (family === 'wallsit') {
    const lh = get(landmarks, 'leftHip');
    const rh = get(landmarks, 'rightHip');
    const lk = get(landmarks, 'leftKnee');
    const rk = get(landmarks, 'rightKnee');
    const la = get(landmarks, 'leftAnkle');
    const ra = get(landmarks, 'rightAnkle');
    const angle = helpers.calculateAngle;
    const leftKnee = angle && lh && lk && la ? angle(lh, lk, la) : 180;
    const rightKnee = angle && rh && rk && ra ? angle(rh, rk, ra) : 180;
    const bent = Number.isFinite(leftKnee) && Number.isFinite(rightKnee)
      && leftKnee >= 80 && leftKnee <= 150
      && rightKnee >= 80 && rightKnee <= 150;
    return {
      ready: bent,
      valid: bent,
      reason: bent ? 'wallsit_ready' : 'wallsit_not_ready',
      feedback: bent ? (rule.readyMessage || 'Ready position detected') : (rule.invalidMessages?.starting || 'Adjust your knees')
    };
  }

  return {
    ready: true,
    valid: true,
    reason: 'general_ready',
    feedback: rule.readyMessage || 'Ready position detected'
  };
};

export const evaluatePostureFrame = (landmarks, mode, helpers = {}, config = {}) => {
  const mergedConfig = { ...POSTURE_VALIDATION_CONFIG, ...config };
  const rule = getExerciseValidationRule(mode);

  if (!landmarks?.length) {
    return {
      hasPose: false,
      isValid: false,
      isReadyPose: false,
      requiredVisible: false,
      confidence: 0,
      reason: 'no_landmarks',
      feedback: 'Position yourself in front of camera',
      rule
    };
  }

  const minConfidence = mergedConfig.MIN_KEYPOINT_CONFIDENCE ?? 0.65;
  const required = rule.requiredJoints || [];

  let requiredVisible = false;
  let confidence = 0;

  if (rule.supportsSideChain) {
    // For pushups and side-profile horizontal exercises:
    // User may face camera sideways; accept if either left or right chain is visible,
    // OR if bilateral upper body reaches 60% visibility.
    const leftVisible = pushupLeftChain.filter(name => visible(landmarks, name, minConfidence)).length;
    const rightVisible = pushupRightChain.filter(name => visible(landmarks, name, minConfidence)).length;
    const bilateralVisible = required.filter(name => visible(landmarks, name, minConfidence)).length;

    const leftOk = leftVisible >= 3; // At least 3 of 4 joints in left chain
    const rightOk = rightVisible >= 3; // At least 3 of 4 joints in right chain
    const bilateralOk = bilateralVisible >= Math.ceil(required.length * 0.55);

    requiredVisible = leftOk || rightOk || bilateralOk;
    confidence = Math.max(leftVisible / 4, rightVisible / 4, bilateralVisible / required.length);
  } else {
    // Standard exercise check (squats, etc.)
    const visibleCount = required.filter(name => visible(landmarks, name, minConfidence)).length;
    confidence = required.length ? visibleCount / required.length : 1;
    requiredVisible = required.length ? visibleCount >= Math.ceil(required.length * 0.65) : true;
  }

  if (!requiredVisible) {
    // Graceful SEARCHING status rather than loud failure
    const isSearching = confidence > 0.25;
    return {
      hasPose: true,
      isValid: false,
      isReadyPose: false,
      requiredVisible: false,
      confidence,
      reason: isSearching ? 'searching' : 'required_joints_missing',
      feedback: isSearching 
        ? 'Adjust position - body partially occluded' 
        : (rule.invalidMessages?.visibility || 'Ensure upper body and arms are visible'),
      rule
    };
  }

  const start = evaluateStartingPose(landmarks, mode, rule, helpers, mergedConfig);
  return {
    hasPose: true,
    isValid: start.valid,
    isReadyPose: start.ready,
    requiredVisible: true,
    confidence,
    reason: start.reason,
    feedback: start.feedback,
    rule
  };
};
