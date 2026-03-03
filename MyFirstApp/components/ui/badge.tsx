import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { GymColors, BorderRadius, FontSize, Spacing } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function Badge({ label, color, textColor, style }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        color ? { backgroundColor: color + '33' } : null,
        style,
      ]}
    >
      <Text style={[styles.label, textColor ? { color: textColor } : null]}>
        {label}
      </Text>
    </View>
  );
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: '#FF4D00',
  Back: '#4D79FF',
  Shoulders: '#FF8C00',
  Biceps: '#00D68F',
  Triceps: '#B44DFF',
  Legs: '#FF4D8C',
  Core: '#FFD700',
  Glutes: '#FF6B4D',
  Calves: '#4DFFB4',
  Forearms: '#FF4D4D',
};

export function MuscleGroupBadge({ name, style }: { name: string; style?: ViewStyle }) {
  const color = MUSCLE_COLORS[name] ?? GymColors.primary;
  return <Badge label={name} color={color} textColor={color} style={style} />;
}

export function EquipmentBadge({ name, style }: { name: string; style?: ViewStyle }) {
  return <Badge label={name} color={GymColors.textMuted} textColor={GymColors.textMuted} style={style} />;
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: GymColors.elevated,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 2,
    alignSelf: 'flex-start',
  },
  label: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
