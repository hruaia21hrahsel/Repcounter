import React from 'react';
import { StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { GymColors, BorderRadius } from '@/constants/theme';

interface WorkoutCalendarProps {
  markedDates: Record<string, { marked: boolean; dotColor: string }>;
  onDayPress?: (day: { dateString: string }) => void;
}

export function WorkoutCalendar({ markedDates, onDayPress }: WorkoutCalendarProps) {
  return (
    <Calendar
      onDayPress={onDayPress}
      markedDates={markedDates}
      theme={{
        backgroundColor: GymColors.card,
        calendarBackground: GymColors.card,
        textSectionTitleColor: GymColors.textMuted,
        selectedDayBackgroundColor: GymColors.primary,
        selectedDayTextColor: GymColors.textPrimary,
        todayTextColor: GymColors.primary,
        dayTextColor: GymColors.textPrimary,
        textDisabledColor: GymColors.border,
        dotColor: GymColors.primary,
        selectedDotColor: GymColors.textPrimary,
        arrowColor: GymColors.primary,
        monthTextColor: GymColors.textPrimary,
        indicatorColor: GymColors.primary,
        textDayFontWeight: '500',
        textMonthFontWeight: '700',
        textDayHeaderFontWeight: '600',
      }}
      style={styles.calendar}
    />
  );
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
