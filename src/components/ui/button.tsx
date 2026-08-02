import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { Pressable, PressableProps } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

import { AppText, AppTextVariant } from "./app-text";
import { UniRemixIcon } from "./icon";

const UniPressable = withUnistyles(Pressable);
const AnimatedUniPressable = Animated.createAnimatedComponent(UniPressable);
const UniAppText = withUnistyles(AppText);

export type TouchZoneProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  children?: React.ReactNode;
};

export const TouchZone: React.FC<TouchZoneProps> = ({
  children,
  style,
  activeOpacity = 0.5,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}) => {
  const opacity = useSharedValue(1);

  const handlePressIn = (e: any) => {
    opacity.value = withTiming(activeOpacity, { duration: 100 });
    onPressIn?.(e);
  };
  const handlePressOut = (e: any) => {
    opacity.value = withTiming(1, { duration: 150 });
    onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.6 : opacity.value,
  }));

  return (
    <AnimatedUniPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...rest}
    >
      {children}
    </AnimatedUniPressable>
  );
};

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = TouchZoneProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
  contentStyle?: StyleProp<ViewStyle>;
  labelVariant?: AppTextVariant;
  labelColor?: string;
};

export const AppButton: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  style,
  disabled,
  icon,
  contentStyle,
  labelVariant,
  labelColor,
  ...rest
}) => {
  return (
    <TouchZone style={[styles.base, styles[variant], style]} disabled={disabled} {...rest}>
      <View style={[styles.content, contentStyle]}>
        {icon ? (
          <UniRemixIcon
            name={icon}
            size={22}
            uniProps={(theme: any) => ({
              color: labelColor || (variant === "primary" ? theme.colors.primaryText : theme.colors.primary),
            })}
          />
        ) : null}
        <UniAppText
          variant={labelVariant || "button"}
          uniProps={(theme) => ({
            color: labelColor || (variant === "primary" ? theme.colors.primaryText : theme.colors.primary),
          })}
        >
          {label}
        </UniAppText>
      </View>
    </TouchZone>
  );
};

export type IconButtonProps = TouchZoneProps & {
  icon: IconName;
  iconColor?: string;
  variant?: ButtonVariant;
};

export const IconButton: React.FC<IconButtonProps> = ({ icon, variant = "primary", style, iconColor, disabled, ...rest }) => {
  return (
    <TouchZone style={[styles.iconButtonBase, styles[variant], style]} disabled={disabled} {...rest}>
      <UniRemixIcon
        name={icon || "question-line"}
        size={22}
        uniProps={(theme: any) => ({
          color: iconColor || (variant === "primary" ? theme.colors.primaryText : theme.colors.primary),
        })}
      />
    </TouchZone>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  iconButtonBase: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
}));
