import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWorkout } from '@/hooks/use-workout';

const QUICK_NAMES = [
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Chest & Triceps',
  'Back & Biceps',
  'Shoulders & Arms',
];

export default function NewWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { startNewWorkout } = useWorkout();
  const [name, setName] = useState(`Workout — ${format(new Date(), 'MMM d')}`);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      const workoutId = await startNewWorkout(name.trim());
      router.replace(`/workout/${workoutId}`);
    } catch (e) {
      console.error('Failed to start workout:', e);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <IconSymbol name="xmark" size={20} color={GymColors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.title}>New Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Name input */}
        <Text style={styles.label}>Workout Name</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Push Day"
          placeholderTextColor={GymColors.textMuted}
          returnKeyType="done"
          selectTextOnFocus
        />

        {/* Quick name suggestions */}
        <Text style={styles.suggestLabel}>Quick Pick</Text>
        <View style={styles.suggestions}>
          {QUICK_NAMES.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.suggestion, name === n && styles.suggestionActive]}
              onPress={() => setName(n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, name === n && styles.suggestionTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Start button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button
          title="Start Workout"
          onPress={handleStart}
          loading={loading}
          disabled={!name.trim()}
          size="lg"
          style={styles.startBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
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
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  label: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  nameInput: {
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  suggestLabel: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestion: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.card,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  suggestionActive: {
    backgroundColor: GymColors.primary,
    borderColor: GymColors.primary,
  },
  suggestionText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  suggestionTextActive: {
    color: GymColors.textPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: GymColors.border,
  },
  startBtn: {
    width: '100%',
  },
});
