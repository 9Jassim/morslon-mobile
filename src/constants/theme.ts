/**
 * Design tokens — "refined premium retail".
 * Warm cream canvas, deep warm near-black ink, brand green as a sharp accent.
 * Display type: Fraunces (characterful serif). Body: Manrope (crisp grotesque).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#20251B',          // deep warm ink (slight green undertone)
    textSecondary: '#6C7062', // warm gray
    background: '#FAF7F0',     // warm cream canvas
    surface: '#FFFFFF',        // cards / sheets
    backgroundElement: '#EFE9DC', // image placeholders / muted fills
    backgroundSelected: '#E7E0D1',
    border: '#E7E0D0',
  },
  dark: {
    text: '#F3F0E7',          // warm off-white
    textSecondary: '#A6AA99',
    background: '#13140E',     // warm near-black
    surface: '#1C1E15',
    backgroundElement: '#24271B',
    backgroundSelected: '#2D3024',
    border: '#2C2F22',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Font families — loaded in the root layout via @expo-google-fonts. */
export const AppFonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

// Legacy alias kept for the template's mono usage.
export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
