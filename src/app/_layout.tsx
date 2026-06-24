import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFonts, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/lib/auth-context';
import { loadPersistedLocale } from '@/lib/i18n';
import { queryClient } from '@/lib/query';
import { BRAND } from '@/lib/theme-colors';
import { loadPersistedTheme } from '@/lib/theme-mode';

/** Navigation theme derived from our refined palette, so headers/backgrounds match. */
function navTheme(scheme: 'light' | 'dark') {
  const c = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: BRAND.primary,
      background: c.background,
      card: c.background,
      text: c.text,
      border: c.border,
    },
    fonts: {
      ...base.fonts,
      regular: { fontFamily: AppFonts.body, fontWeight: '500' as const },
      medium: { fontFamily: AppFonts.bodySemibold, fontWeight: '600' as const },
      bold: { fontFamily: AppFonts.bodyBold, fontWeight: '700' as const },
      heavy: { fontFamily: AppFonts.displayBold, fontWeight: '700' as const },
    },
  };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // Restore saved language + theme (language may trigger a one-time RTL reload).
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  useEffect(() => {
    Promise.all([loadPersistedLocale(), loadPersistedTheme()]).finally(() => setPrefsLoaded(true));
  }, []);

  // Keep the animated splash up until fonts + prefs are ready.
  if (!fontsLoaded || !prefsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={navTheme(colorScheme)}>
          <AnimatedSplashOverlay />
          <Stack
            screenOptions={{
              headerShown: false,
              headerTitleStyle: { fontFamily: AppFonts.display },
              contentStyle: { backgroundColor: Colors[colorScheme].background },
            }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
