import type { PropsWithChildren } from "react";
import { Text, type TextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type AppTextVariant = "title" | "subtitle" | "sectionTitle" | "cardTitle" | "label" | "body" | "value" | "button" | "tab";

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: AppTextVariant;
    color?: string;
  }
>;

export function AppText({ children, style, variant = "body", color, ...rest }: AppTextProps) {
  return (
    <Text {...rest} style={[styles.base, styles[variant], color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    fontWeight: theme.typography.fontWeight.regular,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.lineHeight.xl,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  body: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  button: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tab: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));
