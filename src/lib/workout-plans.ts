
// ------------------ Types ------------------
export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface DailyWorkout {
  day: number;
  focus: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WorkoutPlanOutput {
  title: string;
  summary: string;
  weeklySchedule: DailyWorkout[];
}

// ------------------ Pre-built Plans ------------------

export const PRE_BUILT_PLANS: { [key: string]: WorkoutPlanOutput } = {
  Beginner: {
    title: "Beginner Full-Body Foundation",
    summary: "A 3-day full-body workout plan designed for beginners to build foundational strength and confidence in the gym.",
    weeklySchedule: [
      {
        day: 1,
        focus: "Full Body A",
        notes: "Focus on proper form over heavy weight. Watch videos to learn the movements.",
        exercises: [
          { name: "Goblet Squat", sets: "3", reps: "8-12", rest: "60s" },
          { name: "Push-ups (on knees or toes)", sets: "3", reps: "As many as possible", rest: "60s" },
          { name: "Dumbbell Rows", sets: "3", reps: "8-12 per arm", rest: "60s" },
          { name: "Plank", sets: "3", reps: "Hold for 30-60s", rest: "45s" },
          { name: "Glute Bridges", sets: "3", reps: "12-15", rest: "45s" },
        ],
      },
      {
        day: 2,
        focus: "Full Body B",
        notes: "Take at least one rest day between workouts. For example, workout on Mon, Wed, Fri.",
        exercises: [
          { name: "Romanian Deadlifts (with Dumbbells)", sets: "3", reps: "10-12", rest: "60s" },
          { name: "Overhead Press (with Dumbbells)", sets: "3", reps: "8-12", rest: "60s" },
          { name: "Lat Pulldowns (or Resistance Band Pulldowns)", sets: "3", reps: "10-15", rest: "60s" },
          { name: "Lunges", sets: "3", reps: "10-12 per leg", rest: "45s" },
          { name: "Bird-Dog", sets: "3", reps: "10-12 per side", rest: "45s" },
        ],
      },
      {
        day: 3,
        focus: "Full Body C",
        notes: "Remember to warm up before each session and cool down with some light stretching afterward.",
        exercises: [
          { name: "Bodyweight Squats", sets: "3", reps: "15-20", rest: "60s" },
          { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "60s" },
          { name: "Seated Cable Rows", sets: "3", reps: "10-12", rest: "60s" },
          { name: "Leg Press", sets: "3", reps: "10-15", rest: "60s" },
          { name: "Hanging Knee Raises", sets: "3", reps: "10-15", rest: "45s" },
        ],
      },
    ],
  },
  Intermediate: {
    title: "Intermediate Push/Pull/Legs Split",
    summary: "A 4-day PPL (Push/Pull/Legs) split for intermediate lifters looking to increase muscle mass and strength.",
    weeklySchedule: [
      {
        day: 1,
        focus: "Upper Body - Push",
        notes: "Focus on chest, shoulders, and triceps.",
        exercises: [
          { name: "Barbell Bench Press", sets: "4", reps: "6-8", rest: "90s" },
          { name: "Overhead Press (Barbell)", sets: "3", reps: "8-10", rest: "90s" },
          { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "60s" },
          { name: "Lateral Raises", sets: "4", reps: "12-15", rest: "45s" },
          { name: "Tricep Pushdowns", sets: "3", reps: "10-15", rest: "45s" },
          { name: "Dips (assisted or bodyweight)", sets: "3", reps: "To failure", rest: "60s" },
        ],
      },
      {
        day: 2,
        focus: "Upper Body - Pull",
        notes: "Focus on back and biceps.",
        exercises: [
          { name: "Pull-ups (or Lat Pulldowns)", sets: "4", reps: "6-10", rest: "90s" },
          { name: "Bent-Over Barbell Rows", sets: "3", reps: "8-10", rest: "90s" },
          { name: "Seated Cable Rows", sets: "3", reps: "10-12", rest: "60s" },
          { name: "Face Pulls", sets: "4", reps: "15-20", rest: "45s" },
          { name: "Barbell Curls", sets: "3", reps: "8-12", rest: "45s" },
          { name: "Hammer Curls", sets: "3", reps: "10-15", rest: "45s" },
        ],
      },
       {
        day: 3,
        focus: "Lower Body",
        notes: "A dedicated day for leg strength and hypertrophy.",
        exercises: [
          { name: "Barbell Back Squats", sets: "4", reps: "6-8", rest: "120s" },
          { name: "Romanian Deadlifts", sets: "3", reps: "8-10", rest: "90s" },
          { name: "Leg Press", sets: "3", reps: "10-15", rest: "60s" },
          { name: "Leg Curls", sets: "3", reps: "12-15", rest: "45s" },
          { name: "Calf Raises", sets: "5", reps: "15-20", rest: "45s" },
          { name: "Goblet Squats", sets: "3", reps: "12-15", rest: "60s" },
        ],
      },
      {
        day: 4,
        focus: "Full Body / Accessories",
        notes: "A lighter day to hit muscles again and work on weak points.",
        exercises: [
          { name: "Dumbbell Bench Press", sets: "3", reps: "10-12", rest: "60s" },
          { name: "T-Bar Rows", sets: "3", reps: "10-12", rest: "60s" },
          { name: "Bulgarian Split Squats", sets: "3", reps: "10-12 per leg", rest: "60s" },
          { name: "Arnold Press", sets: "3", reps: "10-15", rest: "60s" },
          { name: "Bicep Curls (Cable)", sets: "3", reps: "12-15", rest: "45s" },
          { name: "Tricep Overhead Extensions", sets: "3", reps: "12-15", rest: "45s" },
        ],
      },
    ],
  },
  Advanced: {
    title: "Advanced 5-Day Body Part Split",
    summary: "A high-volume, 5-day split for advanced lifters aiming to maximize muscle hypertrophy by targeting specific muscle groups each day.",
    weeklySchedule: [
      {
        day: 1,
        focus: "Chest",
        exercises: [
          { name: "Flat Barbell Bench Press", sets: "4", reps: "5-8", rest: "90-120s" },
          { name: "Incline Dumbbell Press", sets: "4", reps: "8-12", rest: "60-90s" },
          { name: "Decline Hammer Strength Press", sets: "3", reps: "10-12", rest: "60s" },
          { name: "Cable Crossovers", sets: "3", reps: "12-15", rest: "45s" },
          { name: "Push-ups", sets: "3", reps: "To Failure", rest: "60s" },
        ],
      },
      {
        day: 2,
        focus: "Back",
        exercises: [
          { name: "Deadlifts", sets: "4", reps: "4-6", rest: "120-180s" },
          { name: "Weighted Pull-ups", sets: "4", reps: "6-10", rest: "90s" },
          { name: "T-Bar Rows", sets: "3", reps: "8-12", rest: "90s" },
          { name: "Single-Arm Dumbbell Rows", sets: "3", reps: "10-12 per arm", rest: "60s" },
          { name: "Straight-Arm Pulldowns", sets: "3", reps: "15-20", rest: "45s" },
        ],
      },
      {
        day: 3,
        focus: "Legs",
        exercises: [
          { name: "Barbell Back Squats", sets: "5", reps: "5-8", rest: "120-180s" },
          { name: "Leg Press", sets: "4", reps: "10-15", rest: "90s" },
          { name: "Stiff-Legged Deadlifts", sets: "4", reps: "8-12", rest: "90s" },
          { name: "Walking Lunges", sets: "3", reps: "12-15 per leg", rest: "60s" },
          { name: "Seated Leg Curls", sets: "3", reps: "12-15", rest: "45s" },
          { name: "Standing Calf Raises", sets: "5", reps: "15-20", rest: "45s" },
        ],
      },
      {
        day: 4,
        focus: "Shoulders",
        exercises: [
          { name: "Seated Barbell Overhead Press", sets: "4", reps: "6-8", rest: "90-120s" },
          { name: "Seated Arnold Press", sets: "4", reps: "8-12", rest: "60s" },
          { name: "Heavy Lateral Raises", sets: "5", reps: "10-15", rest: "45s" },
          { name: "Bent-Over Reverse Dumbbell Flyes", sets: "4", reps: "12-15", rest: "45s" },
          { name: "Barbell Shrugs", sets: "4", reps: "8-12", rest: "60s" },
        ],
      },
      {
        day: 5,
        focus: "Arms (Biceps & Triceps)",
        exercises: [
          { name: "Close-Grip Bench Press", sets: "4", reps: "6-10", rest: "90s" },
          { name: "EZ-Bar Skull Crushers", sets: "4", reps: "8-12", rest: "60s" },
          { name: "Rope Tricep Pushdowns", sets: "4", reps: "12-15", rest: "45s" },
          { name: "Standing Barbell Curls", sets: "4", reps: "6-10", rest: "90s" },
          { name: "Incline Dumbbell Curls", sets: "4", reps: "8-12", rest: "60s" },
          { name: "Preacher Curls", sets: "4", reps: "12-15", rest: "45s" },
        ],
      },
    ],
  },
};
