import { radius, shadows, spacing, typography } from './tokens';

const commonTheme = {
  spacing,
  radius,
  typography,
  shadows,
} as const;

export const themes = {
  dark: {
    ...commonTheme,
    colors: {
      background: '#081427',
      backgroundAccent: '#0B1B33',
      surface: '#10233E',
      surfaceMuted: '#162A47',
      surfaceSoft: '#122441',
      border: '#1A4374',
      borderSubtle: '#14345D',
      textPrimary: '#F5F7FB',
      textSecondary: '#7D97B7',
      textMuted: '#6882A3',
      primary: '#11C283',
      primaryPressed: '#0EA36E',
      primaryText: '#041D18',
      secondarySurface: '#182B4B',
      secondaryText: '#E8EDF6',
      tabSurface: '#0D2039',
      tabBorder: '#173E70',
      inputSurface: '#182B4A',
      icon: '#87A2C5',
      error: '#FFB4AB',
    },
  },
  light: {
    ...commonTheme,
    colors: {
      background: '#EEF4FB',
      backgroundAccent: '#E1EBF8',
      surface: '#FFFFFF',
      surfaceMuted: '#F3F7FC',
      surfaceSoft: '#F8FAFE',
      border: '#C8D8EE',
      borderSubtle: '#D9E4F3',
      textPrimary: '#10233E',
      textSecondary: '#59718F',
      textMuted: '#7A92AF',
      primary: '#11C283',
      primaryPressed: '#0EA36E',
      primaryText: '#041D18',
      secondarySurface: '#E6EEF8',
      secondaryText: '#183153',
      tabSurface: '#FFFFFF',
      tabBorder: '#D1DEF1',
      inputSurface: '#F4F7FC',
      icon: '#5D789C',
      error: '#BA1A1A',
    },
  },
} as const;

export type AppThemes = typeof themes;
export type ThemeName = keyof AppThemes;
