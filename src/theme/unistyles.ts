import { StyleSheet } from 'react-native-unistyles';

import { themes } from './themes';

StyleSheet.configure({
  settings: {
    initialTheme: 'dark' as never,
  },
  themes: themes as never,
});
