import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

const MUSCLE_META: Record<string, { color: string; matIcon: string }> = {
  Chest:     { color: '#EF4444', matIcon: 'fitness-center' },
  Back:      { color: '#3B82F6', matIcon: 'accessibility' },
  Shoulders: { color: '#10B981', matIcon: 'fitness-center' },
  Biceps:    { color: '#F59E0B', matIcon: 'fitness-center' },
  Triceps:   { color: '#8B5CF6', matIcon: 'fitness-center' },
  Legs:      { color: '#EC4899', matIcon: 'directions-run' },
  Core:      { color: '#FF6B35', matIcon: 'local-fire-department' },
  Glutes:    { color: '#06B6D4', matIcon: 'directions-walk' },
  Calves:    { color: '#14B8A6', matIcon: 'directions-walk' },
  Forearms:  { color: '#84CC16', matIcon: 'fitness-center' },
};

export function MuscleGroupIcon({ name, size = 36 }: { name: string; size?: number }) {
  const meta = MUSCLE_META[name] ?? { color: GymColors.primary, matIcon: 'fitness-center' };
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: meta.color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={meta.matIcon as any} size={size * 0.52} color="#FFF" />
    </View>
  );
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
