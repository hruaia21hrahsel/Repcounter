import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GymColors, BorderRadius, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: boolean;
}

export function Card({ children, style, elevated = false, padding = true }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  elevated: {
    backgroundColor: GymColors.elevated,
  },
  padding: {
    padding: Spacing.md,
  },
});
