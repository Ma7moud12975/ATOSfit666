/**
 * Exercise Form-Correction Reference Dataset (Version 1.0)
 * --------------------------------------------------------
 * Biomechanical reference standards for the 18 ATOSfit bodyweight exercises,
 * synthesized directly from ACE Exercise Library, PubMed/NCBI, and NIH PMC kinematics studies.
 * 
 * Conventions:
 * - Joint angles: Smaller included angle at middle landmark.
 * - Extension convention: 180° = straight line; smaller values = flexion.
 * - Trunk line: Shoulder-Hip-Ankle or Shoulder-Hip-Knee (180° = ideal straight body).
 * - Camera: Sagittal (side) for flexion/extension; Frontal/Oblique for knee tracking/body width.
 */

export const EVIDENCE_LEVELS = {
  HIGH: 'high', // Supported by primary biomechanical/kinematic study or detailed ACE standard
  MODERATE: 'moderate', // Reputable exercise standard + related literature with operational tolerance
  IMPLEMENTATION: 'implementation', // Robust CV engineering tolerance for mobile camera detection
};

export const EXERCISE_BIOMETRICS_DATASET = {
  push_up: {
    id: 'push_up',
    name: 'Push-ups',
    variant: 'standard',
    level: 'beginner',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle', 'ear'],
    angles: {
      elbow_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      elbow_bottom: {
        target_deg: [70, 110],
        reference_value_deg: 90,
        basis: 'direct_literature_plus_operational_tolerance',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'operational_threshold_from_rigid_torso_rule',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      head_spine_alignment: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
    },
    form_rules: [
      'Shoulders positioned over the hands at setup.',
      'Rigid torso; do not let the hips sag or pike.',
      'Head aligned with the spine.',
      'Controlled descent and return to elbow extension.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Body in rigid plank with elbows near full extension (165°-180°).',
      bottom: 'Elbows reach bottom target range centered around 90° (70°-110°), then reverse.',
      end: 'Return to near-full elbow extension (>165°).',
      counting_rule: 'Count one repetition when both descent and ascent criteria are satisfied.',
    },
    references: [
      { title: 'Push-Ups | ACE Exercise Library', url: 'https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/' },
      { title: 'Kinematic and kinetic analysis of push-up exercise', pmid: '2334780' },
      { title: 'Kinetic analysis of push-up exercises: systematic review', pmid: '30284496' },
      { title: 'Push-Up Techniques Affect Elbows and Shoulders (2026)', pmid: '42269686' },
    ],
  },

  knee_plank: {
    id: 'knee_plank',
    name: 'Knee Plank',
    variant: 'forearm / modified plank on knees',
    level: 'beginner',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'hip', 'knee', 'ear'],
    angles: {
      elbow: {
        target_deg: [80, 100],
        basis: 'operational_threshold_around_90',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      body_line_shoulder_hip_knee: {
        target_deg: [170, 180],
        basis: 'operational_threshold_from_no_sag_no_pike_rule',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Elbows directly under or very near the shoulders.',
      'Do not allow the lower back to sag.',
      'Do not lift the hips high.',
      'Keep shoulders away from the ears.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Stable straight-body knee-plank alignment.',
      end: 'Hold while alignment remains inside thresholds.',
    },
    references: [
      { title: '4 Core Movements for Beginners | ACE', url: 'https://www.acefitness.org/resources/everyone/blog/5250/4-core-movements-for-beginners/' },
    ],
  },

  knee_push_up: {
    id: 'knee_push_up',
    name: 'Knee Push Ups',
    variant: 'modified push-up from knees',
    level: 'beginner',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ear'],
    angles: {
      elbow_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      elbow_bottom: {
        target_deg: [70, 110],
        reference_value_deg: 90,
        basis: 'direct_literature_plus_operational_tolerance',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      body_line_shoulder_hip_knee: {
        target_deg: [170, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Maintain a straight line from head/shoulders through hips to knees.',
      'Keep shoulders positioned over the hands.',
      'Do not let the hips sag or pike.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Knee-plank position with elbows near extension.',
      bottom: 'Controlled descent to bottom elbow target (70°-110°).',
      end: 'Return to near-full extension (>165°).',
    },
    references: [
      { title: 'Dynamic and electromyographical analysis in variants of push-up', pmid: '15705025' },
      { title: 'The effect of position on percentage of body mass in push-up variants', pmid: '20179649' },
    ],
  },

  squat: {
    id: 'squat',
    name: 'Squats',
    variant: 'bodyweight',
    level: 'beginner',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      knee_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      knee_bottom: {
        target_deg: [90, 110],
        reference_value_deg: 90,
        basis: 'direct_literature_plus_operational_tolerance',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      trunk_from_vertical: {
        target_deg: [0, 35],
        basis: 'operational_threshold_with_anthropometry_caveat',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      knee_tracking_from_front: {
        rule: 'Knee should track in the same general direction as toes; avoid visible valgus/varus collapse',
        basis: 'direct_exercise_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Heels stay grounded.',
      'Knees track with the toes rather than collapsing inward.',
      'Avoid lumbar rounding and excessive forward trunk collapse.',
      'Depth is commonly around thigh-parallel (~90° knee flexion), with anatomical tolerance.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Standing with knees near extension (165°-180°).',
      bottom: 'Configured squat depth reached (90°-110° knee flexion).',
      end: 'Return to standing with controlled knee extension.',
    },
    references: [
      { title: 'Biomechanical Review of the Squat Exercise', pmcid: 'PMC10987311' },
      { title: 'Knee Joint Kinetics in Relation to Squat Depths', pmcid: 'PMC4064719' },
      { title: 'How to Squat Properly: Body Type Breakdown | ACE', url: 'https://www.acefitness.org/resources/pros/expert-articles/7356/how-to-squat-properly/' },
    ],
  },

  jumping_jacks: {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    variant: 'standard',
    level: 'beginner',
    primary_camera: 'front',
    secondary_camera: 'side',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'],
    angles: {
      arm_overhead: {
        target_deg: [150, 180],
        basis: 'operational_threshold_for_arms_overhead',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      knee_on_landing: {
        target_deg: [160, 180],
        basis: 'operational_threshold_for_soft_but_near_upright_landing',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      leg_abduction: {
        rule: 'Feet move clearly wider than starting stance during open phase',
        basis: 'exercise_standard',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Stand tall at the starting position.',
      'Jump the legs wide while raising arms overhead.',
      'Return to feet together and arms by the sides.',
      'Land softly; avoid stiff or locked-knee landings.',
    ],
    rep_definition: {
      type: 'dynamic_cyclic',
      start: 'Feet together + arms down.',
      middle: 'Feet apart + arms overhead (>150°).',
      end: 'Return to feet together + arms down.',
    },
    references: [
      { title: 'HIIT for Beginners | ACE', url: 'https://www.acefitness.org/resources/pros/expert-articles/5880/a-basic-high-intensity-interval-training-routine-for-beginning-exercisers/' },
    ],
  },

  high_knees: {
    id: 'high_knees',
    name: 'High Knees',
    variant: 'running in place',
    level: 'beginner',
    primary_camera: 'front',
    secondary_camera: 'side',
    landmarks: ['hip', 'knee', 'ankle', 'shoulder', 'ear'],
    angles: {
      hip_flexion_top: {
        target_deg: [80, 100],
        reference_value_deg: 90,
        basis: 'direct_exercise_description_plus_operational_angle',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      knee_flexion_top: {
        target_deg: [80, 130],
        basis: 'operational_threshold_varying_with_shin_position',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
    },
    form_rules: [
      'Drive the knee to approximately hip level (~90° hip flexion) or above.',
      'Keep the core engaged.',
      'Maintain an upright trunk rather than leaning backward to fake knee height.',
      'Land softly and rhythmically.',
    ],
    rep_definition: {
      type: 'dynamic_cyclic',
      start: 'Both feet on ground / running-in-place cycle.',
      peak: 'One thigh reaches hip level or above (~90°).',
      end: 'Return foot to ground with alternating knee drive.',
    },
    references: [
      { title: '15-minute Cardio Workout | ACE', url: 'https://www.acefitness.org/resources/pros/expert-articles/5744/15-minute-cardio-workout-using-nontraditional-equipment/' },
    ],
  },

  wall_sit: {
    id: 'wall_sit',
    name: 'Wall Sit',
    variant: 'static wall squat',
    level: 'beginner',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      knee: {
        target_deg: [85, 100],
        reference_value_deg: 90,
        basis: 'direct_literature_target_band',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      hip: {
        target_deg: [85, 110],
        basis: 'operational_threshold_for_neutralized_wall_sit',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      trunk_wall_alignment: {
        rule: 'Back remains supported by the wall without visible pelvic dumping',
        basis: 'exercise_standard',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Maintain a stable wall-supported squat.',
      'Around 90 degrees of knee flexion is the primary reference position.',
      'Do not allow the knees to collapse inward.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Configured wall-sit knee angle reached (85°-100°).',
      end: 'Hold until configured time expires or form leaves tolerance.',
    },
    references: [
      { title: 'Isometric wall squat exercise in normotensive population', pmid: '23879248' },
      { title: 'Cruciate ligament force during wall squat', pmid: '19127183' },
      { title: 'Patellofemoral joint stress during wall squat', pmid: '19276845' },
    ],
  },

  wide_push_up: {
    id: 'wide_push_up',
    name: 'Wide Push Ups',
    variant: 'hands wider than standard',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle', 'ear'],
    angles: {
      elbow_bottom: {
        target_deg: [70, 110],
        reference_value_deg: 90,
        basis: 'shared_push_up_ROM_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      elbow_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Hands are intentionally wider than standard shoulder-width.',
      'Maintain the same rigid torso requirement as the standard push-up.',
      'Do not sacrifice shoulder control or body alignment simply to achieve greater width.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Wide-hand plank with elbows near extension.',
      bottom: 'Elbows reach target flexion range (70°-110°).',
      end: 'Return to near-full elbow extension (>165°).',
    },
    references: [
      { title: 'Muscle activation using various hand positions in push-up', pmid: '16095413' },
      { title: 'Hand position affects elbow joint load during push-up', pmid: '8514808' },
      { title: 'EMG Activation in Standard, Diamond, and Wide Push-Ups (2026)', pmid: '41892990' },
    ],
  },

  straight_arm_plank: {
    id: 'straight_arm_plank',
    name: 'Straight Arm Plank',
    variant: 'high plank',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      elbow: {
        target_deg: [165, 180],
        basis: 'operational_threshold_for_straight_arm_support',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'operational_threshold_from_straight_torso_rule',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Hands support body with elbows near full extension.',
      'Body stays in one rigid line (170°-180°).',
      'Avoid lumbar sagging and hip piking.',
      'Head remains aligned with the spine.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Aligned high-plank position.',
      end: 'Hold while all form constraints remain valid.',
    },
    references: [
      { title: '4 Core Movements for Beginners | ACE', url: 'https://www.acefitness.org/resources/everyone/blog/5250/4-core-movements-for-beginners/' },
    ],
  },

  reverse_straight_arm_plank: {
    id: 'reverse_straight_arm_plank',
    name: 'Reverse Straight Arm Plank',
    variant: 'straight-arm reverse plank',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      elbow: {
        target_deg: [165, 180],
        basis: 'direct_exercise_instruction_plus_operational_tolerance',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'straight_line_requirement',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Shoulders, hips and heels should form a straight body line.',
      'Elbows remain extended.',
      'Lift the hips rather than letting them sag.',
      'Keep the trunk braced and shoulders controlled.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Seated setup transitions to straight reverse plank.',
      end: 'Hold until line or elbow criteria fail.',
    },
    references: [
      { title: 'Effects of Reverse Plank on Muscle Thickness and Postural Angle', pmid: '36278743', pmcid: 'PMC9624361' },
    ],
  },

  narrow_push_up: {
    id: 'narrow_push_up',
    name: 'Narrow Push Ups',
    variant: 'hands narrower than standard',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle', 'ear'],
    angles: {
      elbow_bottom: {
        target_deg: [70, 110],
        reference_value_deg: 90,
        basis: 'shared_push_up_ROM_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      elbow_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Hands remain narrower than standard shoulder-width setup.',
      'Do not allow change in hand width to create trunk rotation or hip sag.',
      'Elbows move in a controlled path close to the ribcage.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Narrow-hand plank with elbows near extension.',
      bottom: 'Elbow target reached (70°-110°).',
      end: 'Return to near-full extension (>165°).',
    },
    references: [
      { title: 'Muscle activation using various hand positions during push-up', pmid: '16095413' },
    ],
  },

  lunge: {
    id: 'lunge',
    name: 'Lunges',
    variant: 'standard forward lunge',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      front_knee_bottom: {
        target_deg: [80, 100],
        reference_value_deg: 90,
        basis: 'direct_ACE_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      rear_knee_bottom: {
        target_deg: [80, 100],
        reference_value_deg: 90,
        basis: 'direct_ACE_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      knee_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      trunk_from_vertical: {
        target_deg: [0, 25],
        basis: 'operational_threshold_with_forward_hip_hinge_allowed',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Both knees can approach 90 degrees at the standard bottom position.',
      'Front knee tracks forward in line with foot/toes; avoid uncontrolled valgus.',
      'Core remains braced and torso controlled.',
      'Return to an upright standing position.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Standing upright.',
      bottom: 'Both knees approach configured 90° target (80°-100°).',
      end: 'Push through front leg to return upright.',
    },
    references: [
      { title: '5 Lunge Variations for Leaner Legs | ACE', url: 'https://www.acefitness.org/resources/everyone/blog/6971/5-lunge-variations-for-leaner-legs/' },
      { title: 'Forward Lunge | ACE Exercise Library', url: 'https://www.acefitness.org/resources/everyone/exercise-library/94/forward-lunge/' },
      { title: 'Healthy Knee Kinematics during Dynamic Full Flexion', pmcid: 'PMC3591185' },
    ],
  },

  sit_up: {
    id: 'sit_up',
    name: 'Sit-Ups',
    variant: 'standard floor sit-up',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      knee_start: {
        target_deg: [80, 100],
        reference_value_deg: 90,
        basis: 'common_bent_knee_setup; operational threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      trunk_to_floor_start: {
        target_deg: [0, 20],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      trunk_to_floor_top: {
        target_deg: [60, 90],
        basis: 'operational_threshold_for_full_sit_up_completion',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      lumbar_flexion: {
        target_rule: 'Avoid uncontrolled or excessive lumbar flexion; prioritize controlled trunk motion',
        reference_value_deg: 3,
        reference_context: '1979 study found shoulder-lift hook-lying required ~3° vs 38° in long-lying.',
        basis: 'direct_literature',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Use a controlled trunk lift rather than jerking the neck.',
      'Avoid starting from lumbar hyperextension.',
      'Literature does not support one universal top angle for all variants.',
      'Do not use single lumbar angle as medical safety diagnosis.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Back/torso near floor with knees bent (~90°).',
      top: 'Torso reaches completion zone (60°-90° from floor).',
      end: 'Controlled descent return without loss of trunk control.',
    },
    references: [
      { title: 'Sit-up exercises: an electromyographic study', pmid: '161217' },
      { title: 'Biomechanics of sit-up exercises', pmid: '6452564' },
      { title: 'Mechanics of torso flexion in situps', pmid: '11415551' },
    ],
  },

  plank: {
    id: 'plank',
    name: 'Plank',
    variant: 'forearm plank',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'hip', 'ankle', 'ear'],
    angles: {
      elbow: {
        target_deg: [80, 100],
        reference_value_deg: 90,
        basis: 'operational_threshold_around_forearm_support',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'straight_body_no_sag_no_pike_rule',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Elbows/forearms support the body under shoulders.',
      'Shoulder-to-hip-to-ankle line stays rigid (170°-180°).',
      'Do not allow the lower back to sag.',
      'Do not raise the hips into a pike.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Aligned forearm plank.',
      end: 'Hold while line remains within tolerance.',
    },
    references: [
      { title: '4 Core Movements for Beginners | ACE', url: 'https://www.acefitness.org/resources/everyone/blog/5250/4-core-movements-for-beginners/' },
      { title: 'Core Muscle Activation With Static Planks', pmcid: 'PMC8964357' },
    ],
  },

  side_plank: {
    id: 'side_plank',
    name: 'Side Plank',
    variant: 'straight-leg side plank',
    level: 'intermediate',
    primary_camera: 'front_or_oblique',
    secondary_camera: 'side',
    landmarks: ['shoulder', 'elbow', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      support_elbow: {
        target_deg: [80, 100],
        reference_value_deg: 90,
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'straight_line_requirement',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Support shoulder stacked over support elbow/forearm.',
      'Hips lifted so shoulders, hips and feet form a straight line.',
      'Avoid trunk rotation and hip dropping.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Aligned side-plank position.',
      end: 'Hold while straight line and shoulder stack remain valid.',
    },
    references: [
      { title: '4 Core Movements for Beginners | ACE', url: 'https://www.acefitness.org/resources/everyone/blog/5250/4-core-movements-for-beginners/' },
      { title: 'Influence of Body Position on Muscle Activation in Side Plank', pmcid: 'PMC6044124' },
    ],
  },

  reverse_plank: {
    id: 'reverse_plank',
    name: 'Reverse Plank',
    variant: 'straight-arm supine/reverse plank',
    level: 'intermediate',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      elbow: {
        target_deg: [165, 180],
        basis: 'direct_exercise_instruction_plus_operational_tolerance',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'straight_line_requirement_in_primary_study',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
    },
    form_rules: [
      'Lift the pelvis and torso until a straight line is formed.',
      'Keep elbows straight.',
      'Keep knees straight for the straight-leg variant.',
      'Engage abdomen and glutes rather than letting pelvis drop.',
    ],
    rep_definition: {
      type: 'isometric',
      start: 'Seated setup transitions to straight line.',
      end: 'Hold once shoulder-hip-ankle line is reached; terminate when alignment is lost.',
    },
    references: [
      { title: 'Immediate Effects of Reverse Plank on Muscle Thickness', pmid: '36278743', pmcid: 'PMC9624361' },
    ],
  },

  diamond_push_up: {
    id: 'diamond_push_up',
    name: 'Diamond Push Ups',
    variant: 'hands close / diamond position',
    level: 'advanced',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle', 'ear'],
    angles: {
      elbow_bottom: {
        target_deg: [70, 110],
        reference_value_deg: 90,
        basis: 'shared_push_up_ROM_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      elbow_top: {
        target_deg: [165, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      body_line_shoulder_hip_ankle: {
        target_deg: [170, 180],
        basis: 'operational_threshold',
        evidence: EVIDENCE_LEVELS.MODERATE,
      },
    },
    form_rules: [
      'Hands placed close together in diamond/close-hand configuration.',
      'Keep the torso rigid (170°-180°).',
      'Control elbow motion; do not let shoulders collapse forward uncontrolled.',
    ],
    rep_definition: {
      type: 'dynamic',
      start: 'Diamond plank with elbows near extension (>165°).',
      bottom: 'Configured elbow flexion reached (70°-110°).',
      end: 'Return to near-full extension.',
    },
    references: [
      { title: 'EMG Activation in Standard, Diamond, and Wide Push-Ups (2026)', pmid: '41892990' },
      { title: 'Dynamic and EMG analysis in push-up variants', pmid: '15705025' },
    ],
  },

  burpees: {
    id: 'burpees',
    name: 'Burpees',
    variant: 'standard bodyweight burpee with plank',
    level: 'advanced',
    primary_camera: 'side',
    secondary_camera: 'front',
    landmarks: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'ear'],
    angles: {
      high_plank_body_line: {
        target_deg: [170, 180],
        basis: 'ACE_straight_line_rule',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      push_up_elbow_bottom_if_pushup_included: {
        target_deg: [70, 110],
        reference_value_deg: 90,
        basis: 'shared_push_up_ROM_standard',
        evidence: EVIDENCE_LEVELS.HIGH,
      },
      squat_knee_bottom: {
        target_deg: [80, 120],
        basis: 'operational_threshold_for_deep_squat_transition',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
      landing_knee_flexion: {
        target_deg: [20, 60],
        basis: 'soft_landing_operational_threshold',
        evidence: EVIDENCE_LEVELS.IMPLEMENTATION,
      },
    },
    form_rules: [
      'Move from squat to high plank without losing core control.',
      'If push-up is included, use push-up form criteria.',
      'At the plank phase, maintain straight head-to-heel line.',
      'On landing from jump, absorb impact with hip and knee flexion rather than locking knees.',
    ],
    rep_definition: {
      type: 'multi_phase_compound',
      start: 'Standing tall.',
      middle_1: 'Hands down, jump/step feet back into high plank.',
      middle_2: 'Plank established (optional push-up).',
      middle_3: 'Feet jump forward toward hands into squat stance.',
      end: 'Explosive stand/jump with soft athletic landing.',
    },
    references: [
      { title: 'Burpee | ACE Exercise Library', url: 'https://www.acefitness.org/resources/everyone/exercise-library/306/burpee/' },
      { title: 'Drop jumping: influence of technique on biomechanics', pmid: '3657481' },
    ],
  },
};

export default EXERCISE_BIOMETRICS_DATASET;
