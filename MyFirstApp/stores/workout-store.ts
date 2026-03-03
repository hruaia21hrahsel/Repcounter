import { create } from 'zustand';
import { ActiveWorkout, ActiveExercise, ActiveSet } from '@/types/workout';

interface WorkoutStore {
  activeWorkout: ActiveWorkout | null;
  restTimerEndAt: number | null;

  startWorkout: (name: string, workoutId: number) => void;
  endWorkout: () => void;
  addExercise: (exercise: Omit<ActiveExercise, 'sets'>, workoutExerciseId: number) => void;
  removeExercise: (exerciseId: number) => void;
  addSet: (exerciseId: number) => void;
  removeSet: (exerciseId: number, setNumber: number) => void;
  updateSet: (exerciseId: number, setNumber: number, data: Partial<ActiveSet>) => void;
  markSetDone: (exerciseId: number, setNumber: number, isPR?: boolean) => void;
  startRestTimer: (durationSecs: number) => void;
  clearRestTimer: () => void;
  setWorkoutId: (id: number) => void;
}

const DEFAULT_SET: Omit<ActiveSet, 'setNumber'> = {
  id: null,
  weight: '0',
  reps: '0',
  rpe: '',
  isDone: false,
  isPR: false,
  repCountMethod: 'manual',
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeWorkout: null,
  restTimerEndAt: null,

  startWorkout: (name, workoutId) =>
    set({
      activeWorkout: {
        workoutId,
        name,
        startedAt: Date.now(),
        exercises: [],
      },
    }),

  endWorkout: () => set({ activeWorkout: null, restTimerEndAt: null }),

  setWorkoutId: (id) =>
    set((state) => ({
      activeWorkout: state.activeWorkout ? { ...state.activeWorkout, workoutId: id } : null,
    })),

  addExercise: (exercise, workoutExerciseId) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      const newExercise: ActiveExercise = {
        ...exercise,
        workoutExerciseId,
        sets: [{ ...DEFAULT_SET, setNumber: 1 }],
      };
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: [...state.activeWorkout.exercises, newExercise],
        },
      };
    }),

  removeExercise: (exerciseId) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.filter((e) => e.exerciseId !== exerciseId),
        },
      };
    }),

  addSet: (exerciseId) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;
            const lastSet = ex.sets[ex.sets.length - 1];
            const newSet: ActiveSet = {
              ...DEFAULT_SET,
              setNumber: ex.sets.length + 1,
              weight: lastSet?.weight ?? '0',
              reps: lastSet?.reps ?? '0',
            };
            return { ...ex, sets: [...ex.sets, newSet] };
          }),
        },
      };
    }),

  removeSet: (exerciseId, setNumber) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;
            const newSets = ex.sets
              .filter((s) => s.setNumber !== setNumber)
              .map((s, i) => ({ ...s, setNumber: i + 1 }));
            return { ...ex, sets: newSets };
          }),
        },
      };
    }),

  updateSet: (exerciseId, setNumber, data) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.setNumber === setNumber ? { ...s, ...data } : s,
              ),
            };
          }),
        },
      };
    }),

  markSetDone: (exerciseId, setNumber, isPR = false) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((ex) => {
            if (ex.exerciseId !== exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.setNumber === setNumber ? { ...s, isDone: true, isPR } : s,
              ),
            };
          }),
        },
      };
    }),

  startRestTimer: (durationSecs) =>
    set({ restTimerEndAt: Date.now() + durationSecs * 1000 }),

  clearRestTimer: () => set({ restTimerEndAt: null }),
}));
