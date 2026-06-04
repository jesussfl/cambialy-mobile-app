import type { PressableProps } from "react-native";
import { Pressable, View } from "react-native";
import RemixIcon, { IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "./app-text";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
};

const buttonIcons = {
  calculator: "calculator-line",
  switch: "arrow-left-right-line",
} as const;

const UniRemixIcon = withUnistyles(RemixIcon);
const UniAppText = withUnistyles(AppText);

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
        <UniRemixIcon
          name={resolvedIcon}
          size={22}
          uniProps={(theme:any) => ({
            color: variant === "primary" ? theme.colors.primaryText : theme.colors.primary,
          })}
        />
        <UniAppText
          variant="button"
          uniProps={(theme) => ({
            color: variant === "primary" ? theme.colors.primaryText : undefined,
          })}
        >
          {label}
        </UniAppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.secondarySurface,
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
