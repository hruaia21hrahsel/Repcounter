import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExerciseCard } from '@/components/workout/exercise-card';
import { AddExerciseSheet } from '@/components/workout/add-exercise-sheet';
import { RepCounterModal } from '@/components/workout/rep-counter-modal';
import { useWorkout } from '@/hooks/use-workout';
import { useExercises } from '@/hooks/use-exercises';
import { Exercise } from '@/types/exercise';
import { ActiveSet } from '@/types/workout';

interface ActiveSetContext {
  exerciseId: number;
  workoutExerciseId: number | null;
  set: ActiveSet;
}

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeWorkout, addExercise, addSet, removeSet, updateSet, completeSet, finishCurrentWorkout, weightUnit } =
    useWorkout();
  const { exercises, muscleGroups } = useExercises();
  const sheetRef = useRef<BottomSheet>(null);
  const [finishing, setFinishing] = useState(false);
  const [activeSetCtx, setActiveSetCtx] = useState<ActiveSetContext | null>(null);

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeWorkout.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.startedAt]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleAddExercise = async (exercise: Exercise) => {
    await addExercise({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroupName: exercise.muscleGroupName ?? '',
    });
  };

  // Called when user taps "Start" on a set row
  const handleStartSet = (exerciseId: number, workoutExerciseId: number | null, set: ActiveSet) => {
    const weight = set.weight.trim();
    if (!weight || parseFloat(weight) === 0) {
      Alert.alert('Set a weight first', 'Enter the weight before starting the set.');
      return;
    }
    setActiveSetCtx({ exerciseId, workoutExerciseId, set });
  };

  // Called when rep counter modal saves
  const handleRepCountSave = async (reps: number, method: 'auto' | 'voice' | 'manual') => {
    if (!activeSetCtx) return;
    const { exerciseId, workoutExerciseId, set } = activeSetCtx;
    setActiveSetCtx(null);

    // Update set with final reps, then complete it
    updateSet(exerciseId, set.setNumber, {
      reps: String(reps),
      repCountMethod: method,
    });

    const updatedSet: ActiveSet = { ...set, reps: String(reps), repCountMethod: method };

    if (workoutExerciseId) {
      const result = await completeSet(exerciseId, workoutExerciseId, updatedSet);
      if (result?.isPR) {
        Toast.show({
          type: 'success',
          text1: '🏆 New PR!',
          text2: `${set.weight} ${weightUnit} × ${reps} reps`,
          visibilityTime: 3000,
        });
      }
    }
  };

  const handleFinish = () => {
    if (!activeWorkout?.exercises.length) {
      Alert.alert('No exercises logged', 'Add at least one exercise before finishing.');
      return;
    }
    Alert.alert('Finish Workout?', 'This will end your workout and save all completed sets.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        style: 'default',
        onPress: async () => {
          setFinishing(true);
          const workoutId = await finishCurrentWorkout();
          router.replace(`/workout/summary/${workoutId}`);
        },
      },
    ]);
  };

  if (!activeWorkout) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.noWorkoutText}>No active workout found.</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.workoutName}>{activeWorkout.name}</Text>
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
        </View>
        <Button title="Finish" onPress={handleFinish} loading={finishing} variant="primary" size="sm" />
      </View>

      {/* Exercise list */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeWorkout.exercises.length === 0 && (
          <View style={styles.emptyExercises}>
            <IconSymbol name="dumbbell.fill" size={40} color={GymColors.textMuted} />
            <Text style={styles.emptyTitle}>Add your first exercise</Text>
            <Text style={styles.emptyText}>Tap the button below to get started.</Text>
          </View>
        )}

        {activeWorkout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            weightUnit={weightUnit}
            onUpdateSet={(setNum, data) => updateSet(exercise.exerciseId, setNum, data)}
            onStartSet={(set) => handleStartSet(exercise.exerciseId, exercise.workoutExerciseId, set)}
            onDeleteSet={(setNum) => removeSet(exercise.exerciseId, setNum)}
            onAddSet={() => addSet(exercise.exerciseId)}
            onRemove={() => {
              Alert.alert('Remove Exercise?', `Remove ${exercise.exerciseName}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => {} },
              ]);
            }}
          />
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add exercise FAB */}
      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => sheetRef.current?.expand()}
          activeOpacity={0.85}
        >
          <IconSymbol name="plus" size={22} color={GymColors.textPrimary} />
          <Text style={styles.addBtnText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise picker sheet */}
      <AddExerciseSheet
        exercises={exercises}
        muscleGroups={muscleGroups}
        onSelect={handleAddExercise}
        sheetRef={sheetRef}
      />

      {/* Rep counter modal */}
      {activeSetCtx && (
        <RepCounterModal
          visible={!!activeSetCtx}
          exerciseName={
            activeWorkout.exercises.find((e) => e.exerciseId === activeSetCtx.exerciseId)?.exerciseName ?? ''
          }
          setNumber={activeSetCtx.set.setNumber}
          weight={activeSetCtx.set.weight}
          weightUnit={weightUnit}
          onSave={handleRepCountSave}
          onCancel={() => setActiveSetCtx(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GymColors.border,
  },
  workoutName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  timer: {
    color: GymColors.primary,
    fontSize: FontSize.md,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptyText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    textAlign: 'center',
    maxWidth: 240,
  },
  fab: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: GymColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
  },
  addBtnText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  noWorkoutText: {
    color: GymColors.textMuted,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
  },
});
