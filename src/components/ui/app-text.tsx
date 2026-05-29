import type { PropsWithChildren } from 'react';
import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { appTheme as theme } from '@/theme/app-theme';

type AppTextVariant =
  | 'title'
  | 'subtitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'label'
  | 'body'
  | 'value'
  | 'button'
  | 'tab';

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: AppTextVariant;
    color?: string;
  }
>;

export function AppText({
  children,
  style,
  variant = 'body',
  color,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        styles[variant],
        color ? { color } : null,
        style,
      ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create(() => ({
  base: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: theme.typography.fontWeight.regular,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: theme.typography.lineHeight['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
    color: theme.colors.textSecondary,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    letterSpacing: -0.5,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: theme.typography.fontSize.lg,
    lineHeight: theme.typography.lineHeight.lg,
    color: theme.colors.textSecondary,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    color: theme.colors.textSecondary,
    letterSpacing: -0.2,
  },
  value: {
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: -0.4,
  },
  button: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  tab: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: -0.2,
  },
}));
