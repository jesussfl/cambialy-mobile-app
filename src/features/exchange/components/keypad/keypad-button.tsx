import React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText, type AppTextVariant } from "@/components/ui/app-text";
import { TouchZone, type TouchZoneProps } from "@/components/ui/button";

const UniAppText = withUnistyles(AppText);

export type KeypadButtonVariant = "digit" | "operator";

export type KeypadButtonProps = Omit<TouchZoneProps, "style"> & {
  label: string;
  variant?: KeypadButtonVariant;
  labelVariant?: AppTextVariant;
  labelColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function KeypadButton({
  label,
  variant = "digit",
  labelVariant = "title",
  labelColor = "#fff",
  style,
  disabled,
  ...rest
}: KeypadButtonProps) {
  return (
    <TouchZone style={[styles.base, styles[variant], style]} disabled={disabled} {...rest}>
      <UniAppText
        variant={labelVariant}
        uniProps={() => ({
          color: labelColor,
        })}
      >
        {label}
      </UniAppText>
    </TouchZone>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  digit: {
    backgroundColor: theme.gray[700],
  },
  operator: {
    backgroundColor: theme.gray[800],
  },
}));
