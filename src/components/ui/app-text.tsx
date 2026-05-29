import type { PropsWithChildren } from "react";
import { Text, type TextProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type AppTextVariant = "title" | "subtitle" | "sectionTitle" | "cardTitle" | "label" | "body" | "value" | "button" | "tab";

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
    fontSize: theme.typography.fontSize["lg"],
    fontWeight: theme.typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
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
