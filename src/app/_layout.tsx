import '@/theme/unistyles';

import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StatusBar } from 'expo-status-bar';

import { appTheme as theme } from '@/theme/app-theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <NativeTabs
        backgroundColor={theme.colors.tabSurface}
        tintColor={theme.colors.primary}
        iconColor={{
          default: theme.colors.textMuted,
          selected: theme.colors.primary,
        }}
        labelStyle={{
          default: {
            color: theme.colors.textMuted,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
          },
          selected: {
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
          },
        }}
        shadowColor={theme.colors.background}
        blurEffect="systemChromeMaterialDark">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'plus.forwardslash.minus', selected: 'plus.forwardslash.minus' }}
            md={{ default: 'calculate', selected: 'calculate' }}
          />
          <NativeTabs.Trigger.Label>Calcular</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
