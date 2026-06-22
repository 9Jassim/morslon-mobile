import { create } from 'zustand';

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
  setMode: (mode) => set({ mode }),
  cycle: () => {
    const next = ORDER[(ORDER.indexOf(get().mode) + 1) % ORDER.length];
    set({ mode: next });
  },
}));
