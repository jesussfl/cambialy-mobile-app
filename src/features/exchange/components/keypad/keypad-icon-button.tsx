import React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { type IconName } from "react-native-remix-icon";
import { StyleSheet } from "react-native-unistyles";

import { TouchZone, type TouchZoneProps } from "@/components/ui/button";
import { UniRemixIcon } from "@/components/ui/icon";

export type KeypadIconButtonProps = Omit<TouchZoneProps, "style"> & {
  icon: IconName;
  iconColor?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function KeypadIconButton({
  icon,
  iconColor,
  iconSize = 22,
  style,
  disabled,
  ...rest
}: KeypadIconButtonProps) {
  return (
    <TouchZone style={[styles.base, style]} disabled={disabled} {...rest}>
      <UniRemixIcon
        name={icon}
        size={iconSize}
        uniProps={(theme: any) => ({
          color: iconColor || theme.colors.primary,
        })}
      />
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
    backgroundColor: theme.gray[800],
    borderWidth: 0,
  },
}));
