import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Tiny persisted key/value for app preferences (locale, theme). Web → localStorage. */
const isWeb = Platform.OS === 'web';

export async function getPref(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setPref(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* unavailable */
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export const PREF_LOCALE = 'morslon.locale';
export const PREF_THEME = 'morslon.themeMode';
