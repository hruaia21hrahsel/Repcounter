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
    shadowColor: '#94A3C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#6080A8',
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 4,
  },
  padding: {
    padding: Spacing.md,
  },
});
