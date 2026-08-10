import { brand, gray, radius, shadows, spacing, typography } from "./tokens";

const commonTheme = {
  brand,
  gray,
  spacing,
  radius,
  typography,
  shadows,
} as const;

export const themes = {
  dark: {
    ...commonTheme,
    colors: {
      background: gray[1000],
      backgroundAccent: "#063BAF",
      surface: gray[900],
      surfaceMuted: gray[800],
      surfaceSoft: "#111B2B",
      border: gray[700],
      borderSubtle: gray[800],
      textPrimary: gray[0],
      textSecondary: gray[300],
      textMuted: gray[400],
      primary: brand.blue,
      primaryPressed: brand.bluePressed,
      primaryText: gray[0],
      accent: brand.green,
      accentPressed: brand.greenPressed,
      accentText: gray[1000],
      secondarySurface: gray[800],
      secondaryText: gray[100],
      tabSurface: gray[900],
      tabBorder: gray[800],
      inputSurface: gray[800],
      icon: gray[300],
      error: "#FFB4AB",
    },
  },
  light: {
    ...commonTheme,
    colors: {
      background: gray[0],
      backgroundAccent: gray[50],
      surface: gray[0],
      surfaceMuted: gray[50],
      surfaceSoft: gray[25],
      border: gray[300],
      borderSubtle: gray[200],
      textPrimary: gray[1000],
      textSecondary: gray[600],
      textMuted: gray[500],
      primary: brand.blue,
      primaryPressed: brand.bluePressed,
      primaryText: gray[0],
      accent: brand.green,
      accentPressed: brand.greenPressed,
      accentText: gray[1000],
      secondarySurface: gray[100],
      secondaryText: gray[800],
      tabSurface: gray[0],
      tabBorder: gray[200],
      inputSurface: gray[100],
      icon: gray[600],
      error: "#BA1A1A",
    },
  },
} as const;

export type AppThemes = typeof themes;
export type ThemeName = keyof AppThemes;

/** The resolved theme handed to `StyleSheet.create` and to `withUnistyles` `uniProps` callbacks. */
export type AppTheme = AppThemes[ThemeName];
