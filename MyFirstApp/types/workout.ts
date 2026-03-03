export type RepCountMethod = 'manual' | 'voice' | 'camera';

export interface WorkoutSet {
  id: number;
  workoutExerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isPR: boolean;
  repCountMethod: RepCountMethod;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  exerciseName: string;
  muscleGroupName: string;
  sortOrder: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: number;
  name: string;
  templateId: number | null;
  startedAt: number;
  finishedAt: number | null;
  durationSecs: number | null;
  totalVolume: number | null;
  exercises: WorkoutExercise[];
}

export interface PersonalRecord {
  id: number;
  exerciseId: number;
  setId: number;
  type: 'weight' | '1rm' | 'volume';
  value: number;
  achievedAt: number;
}

export interface ActiveSet {
  id: number | null;
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
  isDone: boolean;
  isPR: boolean;
  repCountMethod: RepCountMethod;
}

export interface ActiveExercise {
  workoutExerciseId: number | null;
  exerciseId: number;
  exerciseName: string;
  muscleGroupName: string;
  sets: ActiveSet[];
}

export interface ActiveWorkout {
  workoutId: number | null;
  name: string;
  startedAt: number;
  exercises: ActiveExercise[];
}
