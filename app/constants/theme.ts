/**
 * Theme Colors & Styling Constants
 * Primary: Black, Accent: Green Gradient
 */

export const Colors = {
  // Primary Colors
  primary: '#000000',
  primaryLight: '#1a1a1a',
  primaryDark: '#000000',

  // Accent - Green Gradient
  accent: '#10B981', // Emerald Green
  accentLight: '#34D399', // Light Emerald
  accentDark: '#059669', // Dark Emerald
  accentXLight: '#D1FAE5', // Very Light Green

  // Gradients
  gradient: {
    primary: ['#10B981', '#059669'], // Dark green to emerald
    secondary: ['#34D399', '#10B981'], // Light to medium green
    vibrant: ['#10B981', '#000000'], // Green to black
  },

  // Neutrals
  white: '#FFFFFF',
  gray100: '#F9FAFB',
  gray200: '#F3F4F6',
  gray300: '#E5E7EB',
  gray400: '#D1D5DB',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#0F172A',
  surface: '#F9FAFB',
  surfaceDark: '#1F2937',

  // Text
  text: '#000000',
  textLight: '#6B7280',
  textDark: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderDark: '#374151',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    fontFamily: 'Inter_700Bold',
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    fontFamily: 'Inter_600SemiBold',
  },
};
