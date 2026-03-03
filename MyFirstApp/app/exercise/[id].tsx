import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/card';
import { MuscleGroupBadge, EquipmentBadge } from '@/components/ui/badge';
import { ProgressChart } from '@/components/history/progress-chart';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getExerciseById, getExerciseHistory } from '@/db/queries/exercises';
import { useSettingsStore } from '@/stores/settings-store';

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { weightUnit } = useSettingsStore();
  const [exercise, setExercise] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const exerciseId = parseInt(id ?? '0');
      const [ex, hist] = await Promise.all([
        getExerciseById(exerciseId),
        getExerciseHistory(exerciseId),
      ]);
      setExercise(ex);
      setHistory(hist);
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

  if (!exercise) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Exercise not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Build chart data: group by workout and get max weight per workout
  const chartData = history.slice(0, 20).reverse().map((h, i) => ({
    date: `Set ${i + 1}`,
    value: h.weight * (1 + h.reps / 30), // 1RM estimate
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <IconSymbol name="arrow.left" size={20} color={GymColors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{exercise.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Badges */}
        <View style={styles.badges}>
          <MuscleGroupBadge name={exercise.muscleGroupName ?? ''} />
          <EquipmentBadge name={exercise.equipment} />
          <View style={[styles.badge, exercise.mechanic === 'compound' ? styles.compoundBadge : styles.isolationBadge]}>
            <Text style={[styles.badgeText, exercise.mechanic === 'compound' ? styles.compoundText : styles.isolationText]}>
              {exercise.mechanic}
            </Text>
          </View>
        </View>

        {/* Progress chart */}
        <ProgressChart
          data={chartData}
          title="Estimated 1RM Progress"
          unit={weightUnit}
        />

        {/* History */}
        <Text style={styles.sectionTitle}>Recent Sets</Text>
        {history.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyText}>No sets logged yet for this exercise.</Text>
          </Card>
        ) : (
          history.slice(0, 15).map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyNum}>#{i + 1}</Text>
              <Text style={styles.historyValue}>
                {h.weight} {weightUnit} × {h.reps} reps
              </Text>
              {h.isPR && (
                <View style={styles.prBadge}>
                  <Text style={styles.prText}>PR</Text>
                </View>
              )}
            </View>
          ))
        )}
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  compoundBadge: {
    backgroundColor: GymColors.success + '20',
  },
  isolationBadge: {
    backgroundColor: GymColors.accent + '20',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  compoundText: {
    color: GymColors.success,
  },
  isolationText: {
    color: GymColors.accent,
  },
  sectionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: GymColors.border,
  },
  historyNum: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    width: 32,
  },
  historyValue: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
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
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  notFound: {
    color: GymColors.textMuted,
    fontSize: FontSize.lg,
  },
  backLink: {
    color: GymColors.primary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
