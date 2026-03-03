import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { WorkoutCalendar } from '@/components/history/workout-calendar';
import { Card } from '@/components/ui/card';
import { useHistory } from '@/hooks/use-history';
import { useSettingsStore } from '@/stores/settings-store';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { workouts, loading, markedDates } = useHistory();
  const { weightUnit } = useSettingsStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredWorkouts = selectedDate
    ? workouts.filter((w) => new Date(w.startedAt).toISOString().slice(0, 10) === selectedDate)
    : workouts;

  const formatDuration = (secs: number | null) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    return `${m} min`;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>History</Text>

        {/* Calendar */}
        <WorkoutCalendar
          markedDates={markedDates}
          onDayPress={(day) => {
            setSelectedDate((prev) => (prev === day.dateString ? null : day.dateString));
          }}
        />

        {/* Workout list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : 'All Workouts'}
          </Text>
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text style={styles.clearFilter}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={GymColors.primary} style={{ marginTop: Spacing.xl }} />
        ) : filteredWorkouts.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyText}>
              {selectedDate ? 'No workouts on this day.' : 'No workouts logged yet.'}
            </Text>
          </Card>
        ) : (
          filteredWorkouts.map((w) => (
            <TouchableOpacity
              key={w.id}
              onPress={() => router.push(`/workout/summary/${w.id}`)}
              activeOpacity={0.7}
            >
              <Card style={styles.workoutCard}>
                <Text style={styles.workoutName}>{w.name}</Text>
                <Text style={styles.workoutMeta}>
                  {format(new Date(w.startedAt), 'EEE, MMM d · h:mm a')}
                </Text>
                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatDuration(w.durationSecs)}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {w.totalVolume ? `${w.totalVolume.toFixed(0)} ${weightUnit}` : '--'}
                    </Text>
                    <Text style={styles.statLabel}>Volume</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
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
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  clearFilter: {
    color: GymColors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
  },
  workoutCard: {
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  workoutName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  workoutMeta: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  statLabel: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: GymColors.border,
  },
});
