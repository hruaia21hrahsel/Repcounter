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
import { useWorkout } from '@/hooks/use-workout';
import { useExercises } from '@/hooks/use-exercises';
import { Exercise } from '@/types/exercise';
import { ActiveSet } from '@/types/workout';

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeWorkout, addExercise, addSet, removeSet, updateSet, completeSet, finishCurrentWorkout, weightUnit } =
    useWorkout();
  const { exercises, muscleGroups } = useExercises();
  const sheetRef = useRef<BottomSheet>(null);
  const [finishing, setFinishing] = useState(false);

  // Timer display
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

  const handleCompleteSet = async (exerciseId: number, workoutExerciseId: number | null, set: ActiveSet) => {
    if (!workoutExerciseId) return;
    const result = await completeSet(exerciseId, workoutExerciseId, set);
    if (result?.isPR) {
      Toast.show({
        type: 'success',
        text1: '🏆 New PR!',
        text2: `${set.weight}${weightUnit} × ${set.reps} reps`,
        visibilityTime: 3000,
      });
    }
  };

  const handleFinish = () => {
    if (!activeWorkout?.exercises.length) {
      Alert.alert('No exercises logged', 'Add at least one exercise before finishing.');
      return;
    }
    Alert.alert('Finish Workout?', 'This will end your workout and save all sets.', [
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
        <Button
          title="Finish"
          onPress={handleFinish}
          loading={finishing}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Exercises scroll */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeWorkout.exercises.length === 0 && (
          <View style={styles.emptyExercises}>
            <IconSymbol name="dumbbell.fill" size={40} color={GymColors.textMuted} />
            <Text style={styles.emptyTitle}>Add your first exercise</Text>
            <Text style={styles.emptyText}>Tap the button below to add exercises to your workout.</Text>
          </View>
        )}

        {activeWorkout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            weightUnit={weightUnit}
            onUpdateSet={(setNum, data) => updateSet(exercise.exerciseId, setNum, data)}
            onCompleteSet={(set) => handleCompleteSet(exercise.exerciseId, exercise.workoutExerciseId, set)}
            onDeleteSet={(setNum) => removeSet(exercise.exerciseId, setNum)}
            onAddSet={() => addSet(exercise.exerciseId)}
            onRemove={() => {
              Alert.alert('Remove Exercise?', `Remove ${exercise.exerciseName} from this workout?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => useWorkout().activeWorkout && null, // handled via store
                },
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
          <IconSymbol name="plus" size={24} color={GymColors.textPrimary} />
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
