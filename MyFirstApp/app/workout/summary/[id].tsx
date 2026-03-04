import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { GymColors, GymGradients, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MuscleGroupBadge } from '@/components/ui/badge';
import { getWorkoutById, getWorkoutExercises, getWorkoutSets, deleteWorkoutCascade } from '@/db/queries/workouts';
import { useSettingsStore } from '@/stores/settings-store';

interface SummaryExercise {
  id: number;
  exerciseName: string;
  muscleGroupName: string | null;
  sets: Array<{ setNumber: number; weight: number; reps: number; isPR: boolean }>;
}

export default function WorkoutSummaryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { weightUnit } = useSettingsStore();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<SummaryExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const workoutId = parseInt(id ?? '0');
      const [w, exs] = await Promise.all([
        getWorkoutById(workoutId),
        getWorkoutExercises(workoutId),
      ]);
      setWorkout(w);

      const exercisesWithSets = await Promise.all(
        exs.map(async (ex) => {
          const sets = await getWorkoutSets(ex.id);
          return {
            id: ex.id,
            exerciseName: ex.exerciseName,
            muscleGroupName: ex.muscleGroupName,
            sets: sets.map((s) => ({
              setNumber: s.setNumber,
              weight: s.weight,
              reps: s.reps,
              isPR: s.isPR,
            })),
          };
        }),
      );
      setExercises(exercisesWithSets);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={GymColors.primary} size="large" />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'This will permanently delete this workout and all its sets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkoutCascade(parseInt(id ?? '0'));
            router.replace('/history');
          },
        },
      ],
    );
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const prs = exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.isPR).length, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Victory header */}
        <LinearGradient
          colors={GymGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.victoryCard}
        >
          <IconSymbol name="checkmark.circle.fill" size={48} color={GymColors.textPrimary} />
          <Text style={styles.victoryTitle}>Workout Complete!</Text>
          <Text style={styles.victoryName}>{workout?.name}</Text>
          {workout?.startedAt && (
            <Text style={styles.victoryDate}>{format(new Date(workout.startedAt), 'EEEE, MMMM d')}</Text>
          )}
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} elevated>
            <IconSymbol name="timer" size={20} color={GymColors.primary} />
            <Text style={styles.statValue}>{formatDuration(workout?.durationSecs)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </Card>
          <Card style={styles.statCard} elevated>
            <IconSymbol name="dumbbell.fill" size={20} color={GymColors.accent} />
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </Card>
          <Card style={styles.statCard} elevated>
            <IconSymbol name="trophy.fill" size={20} color={GymColors.success} />
            <Text style={styles.statValue}>{prs}</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </Card>
        </View>

        {workout?.totalVolume && (
          <Card style={styles.volumeCard} elevated>
            <Text style={styles.volumeLabel}>Total Volume</Text>
            <Text style={styles.volumeValue}>
              {workout.totalVolume.toFixed(0)} <Text style={styles.volumeUnit}>{weightUnit}</Text>
            </Text>
          </Card>
        )}

        {/* Exercise breakdown */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        {exercises.map((ex) => (
          <Card key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
              {ex.muscleGroupName && <MuscleGroupBadge name={ex.muscleGroupName} />}
            </View>
            {ex.sets.map((set) => (
              <View key={set.setNumber} style={styles.setRow}>
                <Text style={styles.setNum}>Set {set.setNumber}</Text>
                <Text style={styles.setValue}>
                  {set.weight} {weightUnit} × {set.reps} reps
                </Text>
                {set.isPR && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prText}>PR!</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        ))}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => router.push({ pathname: '/workout/edit/[id]', params: { id: id ?? '' } })}
            activeOpacity={0.8}
          >
            <IconSymbol name="pencil" size={16} color={GymColors.textPrimary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.doneBtn]}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <IconSymbol name="trash" size={16} color={GymColors.danger} />
          <Text style={styles.deleteBtnText}>Delete Workout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  victoryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  victoryTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  victoryName: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  victoryDate: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  statValue: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  volumeCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  volumeLabel: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  volumeValue: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: '900',
  },
  volumeUnit: {
    fontSize: FontSize.lg,
    fontWeight: '500',
    color: GymColors.textMuted,
  },
  sectionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  exerciseCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  setNum: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    width: 44,
  },
  setValue: {
    color: GymColors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  prBadge: {
    backgroundColor: GymColors.accent + '25',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prText: {
    color: GymColors.accent,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  editBtn: {
    backgroundColor: GymColors.elevated,
    borderWidth: 1,
    borderColor: GymColors.border,
    width: 90,
  },
  editBtnText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: GymColors.elevated,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  doneBtnText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: GymColors.danger + '60',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  deleteBtnText: {
    color: GymColors.danger,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
