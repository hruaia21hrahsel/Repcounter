import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

import { GymColors, GymGradients, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/stores/workout-store';
import { useSettingsStore } from '@/stores/settings-store';
import { getRecentWorkouts } from '@/db/queries/workouts';

interface RecentWorkout {
  id: number;
  name: string;
  startedAt: number;
  durationSecs: number | null;
  totalVolume: number | null;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const { userName, weightUnit, loadSettings, isLoaded } = useSettingsStore();
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoaded) loadSettings();
  }, []);

  const loadRecent = async () => {
    try {
      const data = await getRecentWorkouts(5);
      setRecentWorkouts(data as RecentWorkout[]);
    } catch {}
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecent();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDuration = (secs: number | null) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    return `${m}m`;
  };

  const formatVolume = (vol: number | null) => {
    if (!vol) return '--';
    return `${vol.toFixed(0)} ${weightUnit}`;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GymColors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{userName} 💪</Text>
          </View>
          <Text style={styles.date}>{format(new Date(), 'EEE, MMM d')}</Text>
        </View>

        {/* Active workout banner */}
        {activeWorkout && (
          <TouchableOpacity
            onPress={() => router.push(`/workout/${activeWorkout.workoutId}`)}
            activeOpacity={0.9}
            style={styles.activeBannerWrapper}
          >
            <LinearGradient
              colors={GymGradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeBanner}
            >
              <View>
                <Text style={styles.activeBannerLabel}>ACTIVE WORKOUT</Text>
                <Text style={styles.activeBannerName}>{activeWorkout.name}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Start Workout CTA */}
        {!activeWorkout && (
          <Button
            title="Start Workout"
            onPress={() => router.push('/workout/new')}
            size="lg"
            style={styles.startBtn}
          />
        )}

        {/* Week stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} elevated>
            <IconSymbol name="flame.fill" size={20} color={GymColors.primary} />
            <Text style={styles.statNum}>{recentWorkouts.filter(w => {
              const d = new Date(w.startedAt);
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              return d >= startOfWeek;
            }).length}</Text>
            <Text style={styles.statLabel}>This week</Text>
          </Card>
          <Card style={styles.statCard} elevated>
            <IconSymbol name="dumbbell.fill" size={20} color={GymColors.accent} />
            <Text style={styles.statNum}>{recentWorkouts.length}</Text>
            <Text style={styles.statLabel}>Total sessions</Text>
          </Card>
          <Card style={styles.statCard} elevated>
            <IconSymbol name="trophy.fill" size={20} color={GymColors.success} />
            <Text style={styles.statNum}>
              {recentWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total vol ({weightUnit})</Text>
          </Card>
        </View>

        {/* Recent workouts */}
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No workouts yet.</Text>
            <Text style={styles.emptySubText}>Tap "Start Workout" to begin your first session!</Text>
          </Card>
        ) : (
          recentWorkouts.map((w) => (
            <TouchableOpacity
              key={w.id}
              onPress={() => router.push(`/workout/summary/${w.id}`)}
              activeOpacity={0.7}
            >
              <Card style={styles.workoutCard}>
                <View style={styles.workoutRow}>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{w.name}</Text>
                    <Text style={styles.workoutMeta}>
                      {format(new Date(w.startedAt), 'EEE, MMM d')} · {formatDuration(w.durationSecs)} · {formatVolume(w.totalVolume)}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={GymColors.textMuted} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  greeting: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
  },
  userName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  date: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  activeBannerWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  activeBannerLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  activeBannerName: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  startBtn: {
    marginTop: Spacing.sm,
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
  statNum: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    color: GymColors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  emptySubText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  workoutCard: {
    marginBottom: Spacing.xs,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutInfo: {
    flex: 1,
    gap: 4,
  },
  workoutName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  workoutMeta: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
});
