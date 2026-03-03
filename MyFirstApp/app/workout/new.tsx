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
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Calendar } from 'react-native-calendars';

import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWorkout } from '@/hooks/use-workout';

const QUICK_NAMES = [
  'Push Day', 'Pull Day', 'Leg Day', 'Upper Body',
  'Lower Body', 'Full Body', 'Chest & Triceps', 'Back & Biceps',
];

const todayString = format(new Date(), 'yyyy-MM-dd');

function formatSelectedDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

export default function NewWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { startNewWorkout } = useWorkout();
  const [name, setName] = useState(`Workout — ${format(new Date(), 'MMM d')}`);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    // Update workout name if it still has today's default date
    const newDate = parseISO(day.dateString);
    setName(`Workout — ${format(newDate, 'MMM d')}`);
    setShowCalendar(false);
  };

  const handleStart = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      // Build timestamp: use selected date at current time of day
      const [year, month, day] = selectedDate.split('-').map(Number);
      const startedAt = new Date(year, month - 1, day, new Date().getHours(), new Date().getMinutes()).getTime();
      const workoutId = await startNewWorkout(name.trim(), startedAt);
      router.replace(`/workout/${workoutId}`);
    } catch (e) {
      console.error('Failed to start workout:', e);
      setLoading(false);
    }
  };

  const isDateToday = selectedDate === todayString;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <IconSymbol name="xmark" size={20} color={GymColors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.title}>New Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Date selector */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setShowCalendar((v) => !v)}
          activeOpacity={0.8}
        >
          <IconSymbol name="calendar" size={18} color={GymColors.primary} />
          <Text style={styles.dateText}>{formatSelectedDate(selectedDate)}</Text>
          <IconSymbol
            name={showCalendar ? 'xmark' : 'chevron.right'}
            size={14}
            color={GymColors.textMuted}
          />
        </TouchableOpacity>

        {showCalendar && (
          <Calendar
            onDayPress={handleDayPress}
            maxDate={todayString}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: GymColors.primary,
              },
            }}
            theme={{
              backgroundColor: GymColors.card,
              calendarBackground: GymColors.card,
              textSectionTitleColor: GymColors.textMuted,
              selectedDayBackgroundColor: GymColors.primary,
              selectedDayTextColor: '#fff',
              todayTextColor: GymColors.primary,
              dayTextColor: GymColors.textPrimary,
              textDisabledColor: GymColors.border,
              arrowColor: GymColors.primary,
              monthTextColor: GymColors.textPrimary,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
            style={styles.calendar}
          />
        )}

        {/* Workout name */}
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
        {!isDateToday && (
          <Text style={styles.backdateNote}>
            This workout will be logged for {formatSelectedDate(selectedDate)}
          </Text>
        )}
        <Button
          title={isDateToday ? 'Start Workout' : `Log for ${formatSelectedDate(selectedDate)}`}
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
  closeBtn: {
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
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  dateText: {
    flex: 1,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  calendar: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GymColors.border,
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
    gap: Spacing.sm,
  },
  backdateNote: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  startBtn: {
    width: '100%',
  },
});
