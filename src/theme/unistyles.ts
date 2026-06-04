import { StyleSheet } from 'react-native-unistyles';

import { themes } from './themes';

const breakpoints = {
  phone: 0,
  tablet: 768,
} as const;

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    initialTheme: 'light',
  },
  breakpoints,
  themes,
});
