import { forwardRef } from "react";
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import RemixIcon, { IconName } from "react-native-remix-icon";
import { AppText } from "./app-text";

type AppTextFieldProps = TextInputProps & {
  label: string;
  prefix?: string;
  icon?: IconName;
  inputContainerStyle?: StyleProp<ViewStyle> | AnimatedStyle<ViewStyle>;
};

const UniTextInput = withUnistyles(TextInput);
const UniRemixIcon = withUnistyles(RemixIcon)
export const AppTextField = forwardRef<TextInput, AppTextFieldProps>(
  ({ label, prefix, icon, style, inputContainerStyle, placeholderTextColor, ...rest }, ref) => {
    return (
      <View style={styles.wrapper}>
        <AppText variant="label">{label}</AppText>
        <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
          {icon ? <UniRemixIcon name={icon} size={24} uniProps={(theme:any) => ({ color: theme.colors.icon })} /> : null}
          {prefix ? (
            <AppText variant="body" style={styles.prefix}>
              {prefix}
            </AppText>
          ) : null}

          <UniTextInput
            ref={ref}
            {...rest}
            style={[styles.input, style]}
            uniProps={(theme) => ({
              placeholderTextColor: placeholderTextColor ?? theme.colors.textMuted,
              selectionColor: theme.colors.primary,
            })}
          />
        </Animated.View>
      </View>
    );
  },
);

AppTextField.displayName = "AppTextField";

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    gap: theme.spacing.xs,
  },
  inputContainer: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.inputSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  prefix: {
    color: theme.colors.textSecondary,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
  },
}));
