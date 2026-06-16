import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { UnistylesRuntime } from "react-native-unistyles";

import type { ThemeName } from "./themes";

type ThemePreferenceContextValue = {
  isDarkMode: boolean;
  setThemeName: (themeName: ThemeName) => Promise<void>;
  themeName: ThemeName;
  toggleTheme: () => Promise<void>;
};

const THEME_STORAGE_KEY = "paga-claro:theme";
const DEFAULT_THEME: ThemeName = "light";

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

function isThemeName(value: string | null): value is ThemeName {
  return value === "light" || value === "dark";
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const [themeName, setCurrentThemeName] = useState<ThemeName>(DEFAULT_THEME);

  const applyTheme = useCallback(async (nextThemeName: ThemeName) => {
    setCurrentThemeName(nextThemeName);
    UnistylesRuntime.setTheme(nextThemeName);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeName);
  }, []);

  const setThemeName = useCallback(
    async (nextThemeName: ThemeName) => {
      await applyTheme(nextThemeName);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(async () => {
    await applyTheme(themeName === "dark" ? "light" : "dark");
  }, [applyTheme, themeName]);

  useEffect(() => {
    let isMounted = true;

    const restoreTheme = async () => {
      const storedThemeName = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (!isMounted || !isThemeName(storedThemeName)) {
        return;
      }

      setCurrentThemeName(storedThemeName);
      UnistylesRuntime.setTheme(storedThemeName);
    };

    void restoreTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({
      isDarkMode: themeName === "dark",
      setThemeName,
      themeName,
      toggleTheme,
    }),
    [setThemeName, themeName, toggleTheme],
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error("useThemePreference must be used within ThemePreferenceProvider");
  }

  return context;
}
