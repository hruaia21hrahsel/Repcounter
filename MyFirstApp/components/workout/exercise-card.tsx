import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { ActiveExercise, ActiveSet } from '@/types/workout';
import { SetRow } from './set-row';
import { MuscleGroupBadge } from '@/components/ui/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ExerciseCardProps {
  exercise: ActiveExercise;
  weightUnit: string;
  onUpdateSet: (setNumber: number, data: Partial<ActiveSet>) => void;
  onCompleteSet: (set: ActiveSet) => void;
  onDeleteSet: (setNumber: number) => void;
  onAddSet: () => void;
  onRemove: () => void;
}

export function ExerciseCard({
  exercise,
  weightUnit,
  onUpdateSet,
  onCompleteSet,
  onDeleteSet,
  onAddSet,
  onRemove,
}: ExerciseCardProps) {
  const completedSets = exercise.sets.filter((s) => s.isDone).length;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <View style={styles.headerMeta}>
            <MuscleGroupBadge name={exercise.muscleGroupName} />
            <Text style={styles.setsCount}>
              {completedSets}/{exercise.sets.length} sets
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} activeOpacity={0.7}>
          <IconSymbol name="xmark" size={16} color={GymColors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <Text style={[styles.colHeader, { width: 28 }]}>SET</Text>
        <Text style={[styles.colHeader, { flex: 1 }]}>WEIGHT</Text>
        <Text style={[styles.colHeader, { width: 16 }]} />
        <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
        <Text style={[styles.colHeader, { width: 64 }]} />
      </View>

      {/* Set rows */}
      {exercise.sets.map((set) => (
        <SetRow
          key={set.setNumber}
          set={set}
          weightUnit={weightUnit}
          onWeightChange={(val) => onUpdateSet(set.setNumber, { weight: val })}
          onRepsChange={(val) => onUpdateSet(set.setNumber, { reps: val })}
          onComplete={() => onCompleteSet(set)}
          onDelete={() => onDeleteSet(set.setNumber)}
        />
      ))}

      {/* Add set button */}
      <TouchableOpacity onPress={onAddSet} style={styles.addSetBtn} activeOpacity={0.7}>
        <IconSymbol name="plus" size={16} color={GymColors.primary} />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: GymColors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  setsCount: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  colHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  colHeader: {
    color: GymColors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: GymColors.primary + '40',
    borderStyle: 'dashed',
  },
  addSetText: {
    color: GymColors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
