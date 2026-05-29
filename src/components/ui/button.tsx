import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import type { PressableProps } from "react-native";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { appTheme as theme } from "@/theme/app-theme";
import { AppText } from "./app-text";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: ComponentProps<typeof SymbolView>["name"];
};

const buttonIcons = {
  calculator: {
    ios: "plus.forwardslash.minus",
    android: "calculate",
  },
  switch: {
    ios: "arrow.left.arrow.right",
    android: "swap_horiz",
  },
} as const;

export function AppButton({ label, variant = "primary", style, disabled, icon, ...rest }: ButtonProps) {
  const resolvedIcon = icon ?? (variant === "primary" ? buttonIcons.calculator : buttonIcons.switch);

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={(state) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        state.pressed && !disabled ? (variant === "primary" ? styles.primaryPressed : styles.secondaryPressed) : null,
        disabled ? styles.disabled : null,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <View style={styles.content}>
        <SymbolView name={resolvedIcon} size={22} tintColor={variant === "primary" ? theme.colors.primaryText : theme.colors.textSecondary} />
        <AppText variant="button" color={variant === "primary" ? theme.colors.primaryText : undefined}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create(() => ({
  base: {
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondarySurface,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  secondaryPressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
}));
