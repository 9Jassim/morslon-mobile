import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useThemeMode } from '@/lib/theme-mode';

/**
 * Resolved color scheme: honours the user's manual preference (light/dark)
 * and falls back to the OS setting when mode is 'system'.
 */
export function useColorScheme(): 'light' | 'dark' {
  const system = useSystemColorScheme();
  const mode = useThemeMode((s) => s.mode);
  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}
