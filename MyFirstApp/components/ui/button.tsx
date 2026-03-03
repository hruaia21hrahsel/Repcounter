import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GymColors, GymGradients, BorderRadius, FontSize, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const sizeStyle = sizes[size];
  const isPrimary = variant === 'primary';

  if (isPrimary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.wrapper, sizeStyle.wrapper, style, (disabled || loading) && styles.disabled]}
      >
        <LinearGradient
          colors={GymGradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyle.inner]}
        >
          {loading ? (
            <ActivityIndicator color={GymColors.textPrimary} size="small" />
          ) : (
            <Text style={[styles.text, sizeStyle.text]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyle.inner,
        variantStyles[variant],
        style,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'danger' ? GymColors.danger : GymColors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, sizeStyle.text, variantTextStyles[variant]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const sizes = {
  sm: {
    wrapper: { borderRadius: BorderRadius.sm } as ViewStyle,
    inner: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm } as ViewStyle,
    text: { fontSize: FontSize.sm } as TextStyle,
  },
  md: {
    wrapper: { borderRadius: BorderRadius.md } as ViewStyle,
    inner: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md } as ViewStyle,
    text: { fontSize: FontSize.md } as TextStyle,
  },
  lg: {
    wrapper: { borderRadius: BorderRadius.lg } as ViewStyle,
    inner: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg } as ViewStyle,
    text: { fontSize: FontSize.lg } as TextStyle,
  },
};

const variantStyles: Record<Exclude<Variant, 'primary'>, ViewStyle> = {
  secondary: {
    backgroundColor: GymColors.elevated,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(255, 59, 59, 0.15)',
    borderWidth: 1,
    borderColor: GymColors.danger,
  },
};

const variantTextStyles: Record<Exclude<Variant, 'primary'>, TextStyle> = {
  secondary: { color: GymColors.textPrimary },
  ghost: { color: GymColors.primary },
  danger: { color: GymColors.danger },
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: GymColors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
