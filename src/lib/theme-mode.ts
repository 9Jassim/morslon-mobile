import { create } from 'zustand';

import { getPref, PREF_THEME, setPref } from './prefs';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeModeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycle: () => void;
};

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

/** User's chosen theme preference. 'system' follows the OS setting. */
export const useThemeMode = create<ThemeModeState>((set, get) => ({
  mode: 'system',
  setMode: (mode) => {
    set({ mode });
    setPref(PREF_THEME, mode);
  },
  cycle: () => {
    const next = ORDER[(ORDER.indexOf(get().mode) + 1) % ORDER.length];
    get().setMode(next);
  },
}));

/** Load the persisted theme mode at boot. */
export async function loadPersistedTheme(): Promise<void> {
  const saved = await getPref(PREF_THEME);
  if (saved === 'system' || saved === 'light' || saved === 'dark') {
    useThemeMode.setState({ mode: saved });
  }
}
