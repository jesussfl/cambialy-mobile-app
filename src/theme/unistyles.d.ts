import type { AppThemes } from './themes';

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    dark: AppThemes['dark'];
    light: AppThemes['light'];
  }
  export interface UnistylesBreakpoints {
    phone: 0;
    tablet: 768;
  }
}
