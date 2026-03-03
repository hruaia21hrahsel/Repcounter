export const MUSCLE_GROUPS = [
  { id: 1, name: 'Chest', icon: 'chest' },
  { id: 2, name: 'Back', icon: 'back' },
  { id: 3, name: 'Shoulders', icon: 'shoulders' },
  { id: 4, name: 'Biceps', icon: 'biceps' },
  { id: 5, name: 'Triceps', icon: 'triceps' },
  { id: 6, name: 'Legs', icon: 'legs' },
  { id: 7, name: 'Core', icon: 'core' },
  { id: 8, name: 'Glutes', icon: 'glutes' },
  { id: 9, name: 'Calves', icon: 'calves' },
  { id: 10, name: 'Forearms', icon: 'forearms' },
] as const;

export interface SeedExercise {
  name: string;
  muscleGroupId: number;
  equipment: string;
  mechanic: string;
}

export const SEED_EXERCISES: SeedExercise[] = [
  // Chest
  { name: 'Barbell Bench Press', muscleGroupId: 1, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Incline Barbell Bench Press', muscleGroupId: 1, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Decline Barbell Bench Press', muscleGroupId: 1, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Dumbbell Bench Press', muscleGroupId: 1, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'Incline Dumbbell Press', muscleGroupId: 1, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'Dumbbell Flye', muscleGroupId: 1, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Cable Crossover', muscleGroupId: 1, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Chest Press Machine', muscleGroupId: 1, equipment: 'machine', mechanic: 'compound' },
  { name: 'Push-Up', muscleGroupId: 1, equipment: 'bodyweight', mechanic: 'compound' },
  { name: 'Pec Deck', muscleGroupId: 1, equipment: 'machine', mechanic: 'isolation' },

  // Back
  { name: 'Deadlift', muscleGroupId: 2, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Barbell Row', muscleGroupId: 2, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Pull-Up', muscleGroupId: 2, equipment: 'bodyweight', mechanic: 'compound' },
  { name: 'Chin-Up', muscleGroupId: 2, equipment: 'bodyweight', mechanic: 'compound' },
  { name: 'Lat Pulldown', muscleGroupId: 2, equipment: 'cable', mechanic: 'compound' },
  { name: 'Seated Cable Row', muscleGroupId: 2, equipment: 'cable', mechanic: 'compound' },
  { name: 'Dumbbell Row', muscleGroupId: 2, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'T-Bar Row', muscleGroupId: 2, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Face Pull', muscleGroupId: 2, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Hyperextension', muscleGroupId: 2, equipment: 'machine', mechanic: 'isolation' },

  // Shoulders
  { name: 'Barbell Overhead Press', muscleGroupId: 3, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Dumbbell Shoulder Press', muscleGroupId: 3, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'Dumbbell Lateral Raise', muscleGroupId: 3, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Cable Lateral Raise', muscleGroupId: 3, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Arnold Press', muscleGroupId: 3, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'Front Raise', muscleGroupId: 3, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Rear Delt Flye', muscleGroupId: 3, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Machine Shoulder Press', muscleGroupId: 3, equipment: 'machine', mechanic: 'compound' },
  { name: 'Upright Row', muscleGroupId: 3, equipment: 'barbell', mechanic: 'compound' },

  // Biceps
  { name: 'Barbell Curl', muscleGroupId: 4, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'EZ Bar Curl', muscleGroupId: 4, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'Dumbbell Curl', muscleGroupId: 4, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Hammer Curl', muscleGroupId: 4, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Incline Dumbbell Curl', muscleGroupId: 4, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Cable Curl', muscleGroupId: 4, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Preacher Curl', muscleGroupId: 4, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'Concentration Curl', muscleGroupId: 4, equipment: 'dumbbell', mechanic: 'isolation' },

  // Triceps
  { name: 'Tricep Pushdown', muscleGroupId: 5, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Skull Crusher', muscleGroupId: 5, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'Dumbbell Tricep Extension', muscleGroupId: 5, equipment: 'dumbbell', mechanic: 'isolation' },
  { name: 'Overhead Tricep Extension', muscleGroupId: 5, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Close-Grip Bench Press', muscleGroupId: 5, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Dips', muscleGroupId: 5, equipment: 'bodyweight', mechanic: 'compound' },
  { name: 'Diamond Push-Up', muscleGroupId: 5, equipment: 'bodyweight', mechanic: 'compound' },
  { name: 'Tricep Kickback', muscleGroupId: 5, equipment: 'dumbbell', mechanic: 'isolation' },

  // Legs
  { name: 'Back Squat', muscleGroupId: 6, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Front Squat', muscleGroupId: 6, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Romanian Deadlift', muscleGroupId: 6, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Leg Press', muscleGroupId: 6, equipment: 'machine', mechanic: 'compound' },
  { name: 'Leg Extension', muscleGroupId: 6, equipment: 'machine', mechanic: 'isolation' },
  { name: 'Leg Curl', muscleGroupId: 6, equipment: 'machine', mechanic: 'isolation' },
  { name: 'Lunges', muscleGroupId: 6, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Dumbbell Lunges', muscleGroupId: 6, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'Bulgarian Split Squat', muscleGroupId: 6, equipment: 'dumbbell', mechanic: 'compound' },
  { name: 'Hack Squat', muscleGroupId: 6, equipment: 'machine', mechanic: 'compound' },
  { name: 'Goblet Squat', muscleGroupId: 6, equipment: 'kettlebell', mechanic: 'compound' },

  // Core
  { name: 'Plank', muscleGroupId: 7, equipment: 'bodyweight', mechanic: 'isolation' },
  { name: 'Crunch', muscleGroupId: 7, equipment: 'bodyweight', mechanic: 'isolation' },
  { name: 'Sit-Up', muscleGroupId: 7, equipment: 'bodyweight', mechanic: 'isolation' },
  { name: 'Russian Twist', muscleGroupId: 7, equipment: 'bodyweight', mechanic: 'isolation' },
  { name: 'Leg Raise', muscleGroupId: 7, equipment: 'bodyweight', mechanic: 'isolation' },
  { name: 'Cable Crunch', muscleGroupId: 7, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Ab Wheel Rollout', muscleGroupId: 7, equipment: 'other', mechanic: 'compound' },
  { name: 'Hanging Knee Raise', muscleGroupId: 7, equipment: 'bodyweight', mechanic: 'isolation' },

  // Glutes
  { name: 'Hip Thrust', muscleGroupId: 8, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'Glute Bridge', muscleGroupId: 8, equipment: 'bodyweight', mechanic: 'isolation' },
  { name: 'Cable Kickback', muscleGroupId: 8, equipment: 'cable', mechanic: 'isolation' },
  { name: 'Sumo Deadlift', muscleGroupId: 8, equipment: 'barbell', mechanic: 'compound' },
  { name: 'Step-Up', muscleGroupId: 8, equipment: 'dumbbell', mechanic: 'compound' },

  // Calves
  { name: 'Standing Calf Raise', muscleGroupId: 9, equipment: 'machine', mechanic: 'isolation' },
  { name: 'Seated Calf Raise', muscleGroupId: 9, equipment: 'machine', mechanic: 'isolation' },
  { name: 'Donkey Calf Raise', muscleGroupId: 9, equipment: 'machine', mechanic: 'isolation' },

  // Forearms
  { name: 'Wrist Curl', muscleGroupId: 10, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'Reverse Wrist Curl', muscleGroupId: 10, equipment: 'barbell', mechanic: 'isolation' },
  { name: 'Farmer Walk', muscleGroupId: 10, equipment: 'dumbbell', mechanic: 'compound' },
];
