import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemeMode } from '@/lib/theme-mode';

/**
 * Resolved color scheme for web. Honours the user's manual preference and
 * falls back to the OS setting. Re-calculated on the client to support static
 * rendering (server has no scheme).
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const system = useRNColorScheme();
  const mode = useThemeMode((s) => s.mode);

  if (mode === 'light' || mode === 'dark') return mode;
  if (hasHydrated) return system === 'dark' ? 'dark' : 'light';
  return 'light';
}
