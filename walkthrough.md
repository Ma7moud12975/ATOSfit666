# Walkthrough: Adaptive Mesocycle Training Engine & Closed-Loop Dashboard System

We have successfully engineered and integrated an intelligent, science-grounded training system for **ATOSfit**. The application now functions as a true, autonomous AI fitness coach: calculating a tailored **4-Week Periodized Mesocycle (28 Days)** directly from the user's Onboarding profile, and interconnecting workouts, caloric burn, hydration targets, and real-time Readiness in a unified closed loop.

---

## 1. Key Architectural Implementations

### A. Intelligent Training Plan Engine (`src/utils/trainingPlanEngine.js`)
- **Periodization Philosophy**: Renaissance Periodization (RP) 4-Week Mesocycle:
  - **Week 1 (MEV Baseline & Technique)**: 3 sets, moderate baseline intensity (RPE 7 / 3 RIR). Focus on motor control and neurological priming.
  - **Week 2 (Progressive Overload I)**: +15% volume/reps and metabolic density (RPE 8 / 2 RIR).
  - **Week 3 (Peak Volume & MAV)**: Maximum Adaptive Volume, +25-30% volume, higher sets, shorter rest intervals (RPE 9 / 1 RIR).
  - **Week 4 (Deload & Supercompensation)**: 50% volume drop, light restorative mobility to allow joint/neural supercompensation without burnout or injury.
- **Customized Split by User Profile**:
  - **Beginner**: 3 training days/week + 4 rest & recovery days.
  - **Intermediate**: 4 training days/week + 3 rest & recovery days.
  - **Advanced**: 5 training days/week + 2 rest & recovery days.
  - **Target Goals**: Distinct circuits for **Lean / Fat Loss** (high metabolic density, cardio finishers, EPOC effect) vs **Muscular / Hypertrophy** (mechanical tension, compound focus tailored to user-selected focus areas: Chest, Legs, Arms, Core).
- **Closed-Loop Storage**:
  - Automatically loads or generates the mesocycle under `atos_training_mesocycle_${accountId}`.
  - Keeps backward compatibility with `fitcoach_today_plan`.
  - Supports tracking completions, actual calories burned, and exercise-level marks.

### B. Interactive 4-Week Roadmap Modal (`src/components/MonthlyPlanOverviewModal.jsx`)
- Sleek, dark-and-gold bento modal with subtle ambient glows.
- **Tabbed 4-Week Navigation**: Easy switching between Week 1 (Baseline), Week 2 (Overload), Week 3 (Peak), and Week 4 (Deload).
- **Macro Metrics Bar**: Displays completed workouts count (e.g. 1/16), total estimated caloric capacity (~1,500–3,800 kcal), and adherence percentage.
- **Coach Strategy Banner**: Explains the scientific purpose, RPE target, and coaching cues of each week.
- **Day-by-Day Cards**:
  - Clear distinction between Training Days vs Active Recovery Days.
  - "Today" badge with illuminated border.
  - Breakdown of exercises, sets, reps, durations, and rest times.
  - One-click **"Start Workout"** button to immediately launch the session in the AI camera workout screen.
- Fully localized in Arabic and English.

### C. Dashboard Integration (`src/pages/dashboard/index.jsx` & `src/utils/dashboardStatsService.js`)
- **Today's Workout Bento Card**:
  - Dynamically displays the user's scheduled workout from the 4-week mesocycle: Phase badge (e.g., `الأسبوع 1: التأسيس والتكنيك`), workout title, estimated duration, and target exercises.
  - Rest Day handling: Shows a calm "💤 استشفاء نشط (Rest & Recovery)" status with guidance on hydration and sleep.
  - Added a dedicated button: **"عرض خطة الـ 4 أسابيع" (4-Week Plan)** which opens the `MonthlyPlanOverviewModal`.
  - "Start Workout" button routes directly into the scheduled workout.
- **Mission Progress Hub & Readiness Loop**:
  - Reflects the real training plan in daily missions.
  - Caloric burn and completed exercises feed back into daily progress and achievements.

### D. AI Camera Workout Screen Integration (`src/pages/exercise-workout-screen/index.jsx`)
- Automatically loads today's prescribed exercises from navigation state or the user's active mesocycle.
- When exercises and workouts are finished, marks them completed in the mesocycle via `completeScheduledWorkout` and `markPlanExerciseCompleted`.
- Fires `DASHBOARD_DATA_UPDATED` so the Dashboard, calories burned, and mission progress update live.

### E. Onboarding Sync (`src/pages/onboarding/index.jsx`)
- Generates the user's 4-week periodized mesocycle upon completing Onboarding.
- In **Step 11 (Scientific Blueprint)**, added a dedicated **4-Week Mesocycle Architecture** card displaying weekly progression landmarks alongside Mifflin-St Jeor metabolic targets.

---

## 2. Verification Results

1. **Automated Test Suite (`testTrainingPlanEngine.mjs`)**:
   - Beginner Lean test: generated 28 days with 3 workouts/week (12 workouts total, 16 rest days), with exact RP phases (MEV Baseline -> Overload I -> Peak Volume -> Deload).
   - Intermediate Muscular test: generated 4 workouts/week (16 workouts total). Verified progression from W1 (Sets: 3, Reps: 10) to W3 (Sets: 4, Reps: 13).
   - Test suite passed with 100% accuracy.
2. **Production Build (`npm run build`)**:
   - `vite build` completed with **0 errors** (`✓ built in 34.86s`).
