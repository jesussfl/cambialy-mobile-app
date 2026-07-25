import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useEffect, type PropsWithChildren } from "react";
import { UnistylesRuntime } from "react-native-unistyles";

import type { ThemeName } from "./themes";

const THEME_STORAGE_KEY = "paga-claro:theme";

type ThemeStore = {
  themeName: ThemeName;
  isHydrated: boolean;
  setThemeName: (themeName: ThemeName) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themeName: "light",
      isHydrated: false,
      setThemeName: async (nextThemeName: ThemeName) => {
        UnistylesRuntime.setTheme(nextThemeName);
        set({ themeName: nextThemeName });
      },
      toggleTheme: async () => {
        const nextTheme = get().themeName === "dark" ? "light" : "dark";
        UnistylesRuntime.setTheme(nextTheme);
        set({ themeName: nextTheme });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeName: state.themeName }),
    },
  ),
);

export function useThemePreference() {
  const themeName = useThemeStore((s) => s.themeName);
  const setThemeName = useThemeStore((s) => s.setThemeName);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return { isDarkMode: themeName === "dark", setThemeName, themeName, toggleTheme };
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const stored = useThemeStore.getState().themeName;
    if (stored) {
      UnistylesRuntime.setTheme(stored);
    }
  }, []);

  return children;
}
