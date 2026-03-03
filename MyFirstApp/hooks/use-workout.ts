import { useCallback } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { useSettingsStore } from '@/stores/settings-store';
import {
  createWorkout,
  addExerciseToWorkout,
  finishWorkout,
} from '@/db/queries/workouts';
import { saveSet } from '@/db/queries/sets';
import { ActiveSet } from '@/types/workout';
import * as Haptics from 'expo-haptics';

export function useWorkout() {
  const store = useWorkoutStore();
  const { defaultRestSecs, weightUnit, setActiveWorkoutId } = useSettingsStore();

  const startNewWorkout = useCallback(async (name: string) => {
    const workoutId = await createWorkout(name);
    store.startWorkout(name, workoutId);
    setActiveWorkoutId(workoutId);
    return workoutId;
  }, []);

  const addExercise = useCallback(async (exercise: {
    exerciseId: number;
    exerciseName: string;
    muscleGroupName: string;
  }) => {
    const { activeWorkout } = useWorkoutStore.getState();
    if (!activeWorkout?.workoutId) return;

    const sortOrder = activeWorkout.exercises.length;
    const workoutExerciseId = await addExerciseToWorkout(
      activeWorkout.workoutId,
      exercise.exerciseId,
      sortOrder,
    );

    store.addExercise(
      {
        exerciseId: exercise.exerciseId,
        workoutExerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroupName: exercise.muscleGroupName,
      },
      workoutExerciseId,
    );
  }, []);

  const completeSet = useCallback(async (
    exerciseId: number,
    workoutExerciseId: number,
    set: ActiveSet,
  ) => {
    if (!workoutExerciseId) return;

    const weight = parseFloat(set.weight) || 0;
    const reps = parseInt(set.reps) || 0;
    const rpe = set.rpe ? parseFloat(set.rpe) : undefined;

    const { id, isPR } = await saveSet({
      workoutExerciseId,
      setNumber: set.setNumber,
      weight,
      reps,
      rpe,
      repCountMethod: set.repCountMethod,
    });

    store.updateSet(exerciseId, set.setNumber, { id });
    store.markSetDone(exerciseId, set.setNumber, isPR);
    store.startRestTimer(defaultRestSecs);

    await Haptics.notificationAsync(
      isPR ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Success,
    );

    return { id, isPR };
  }, [defaultRestSecs]);

  const finishCurrentWorkout = useCallback(async () => {
    const { activeWorkout } = useWorkoutStore.getState();
    if (!activeWorkout?.workoutId) return;

    const durationSecs = Math.floor((Date.now() - activeWorkout.startedAt) / 1000);
    let totalVolume = 0;
    for (const ex of activeWorkout.exercises) {
      for (const s of ex.sets) {
        if (s.isDone) {
          totalVolume += (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
        }
      }
    }

    await finishWorkout(activeWorkout.workoutId, durationSecs, totalVolume);
    const workoutId = activeWorkout.workoutId;
    store.endWorkout();
    setActiveWorkoutId(null);
    return workoutId;
  }, []);

  return {
    activeWorkout: store.activeWorkout,
    restTimerEndAt: store.restTimerEndAt,
    weightUnit,
    startNewWorkout,
    addExercise,
    addSet: store.addSet,
    removeSet: store.removeSet,
    updateSet: store.updateSet,
    completeSet,
    finishCurrentWorkout,
    clearRestTimer: store.clearRestTimer,
  };
}
