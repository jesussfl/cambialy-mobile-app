import { themes } from './themes';

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends typeof themes {}
  export interface UnistylesBreakpoints {
    phone: 0;
    tablet: 768;
  }
}
