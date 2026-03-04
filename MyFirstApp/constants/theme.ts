import { Platform } from 'react-native';

export const GymColors = {
  background: '#F4F6FB',
  card: '#FFFFFF',
  elevated: '#EEF1F8',
  primary: '#FF4D00',
  accent: '#FF8C00',
  success: '#00C47A',
  danger: '#FF3B30',
  textPrimary: '#111827',
  textMuted: '#9CA3AF',
  border: '#E8ECF4',
  tabBar: '#FFFFFF',
};

export const GymGradients = {
  primary: ['#FF4D00', '#FF8C00'] as const,
  card: ['#1C1C26', '#13131A'] as const,
  success: ['#00D68F', '#00A36C'] as const,
};

// Legacy Colors kept for backward compatibility with any existing components
export const Colors = {
  light: {
    text: GymColors.textPrimary,
    background: GymColors.background,
    tint: GymColors.primary,
    icon: GymColors.textMuted,
    tabIconDefault: GymColors.textMuted,
    tabIconSelected: GymColors.primary,
  },
  dark: {
    text: GymColors.textPrimary,
    background: GymColors.background,
    tint: GymColors.primary,
    icon: GymColors.textMuted,
    tabIconDefault: GymColors.textMuted,
    tabIconSelected: GymColors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  display: 48,
};
