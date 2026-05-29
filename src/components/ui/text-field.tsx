import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { forwardRef } from "react";
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { appTheme as theme } from "@/theme/app-theme";
import { AppText } from "./app-text";

type AppTextFieldProps = TextInputProps & {
  label: string;
  prefix?: string;
  icon?: ComponentProps<typeof SymbolView>["name"];
  inputContainerStyle?: StyleProp<ViewStyle> | AnimatedStyle<ViewStyle>;
};

export const AppTextField = forwardRef<TextInput, AppTextFieldProps>(
  ({ label, prefix, icon, style, inputContainerStyle, placeholderTextColor, ...rest }, ref) => {
    return (
      <View style={styles.wrapper}>
        <AppText variant="label">{label}</AppText>
        <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
          {icon ? <SymbolView name={icon} size={24} tintColor={theme.colors.textSecondary} /> : null}
          {prefix ? (
            <AppText variant="body" style={styles.prefix}>
              {prefix}
            </AppText>
          ) : null}

          <TextInput
            ref={ref}
            {...rest}
            placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
            selectionColor={theme.colors.primary}
            style={[styles.input, style]}
          />
        </Animated.View>
      </View>
    );
  },
);

AppTextField.displayName = "AppTextField";

const styles = StyleSheet.create(() => ({
  wrapper: {
    gap: theme.spacing.xs,
  },
  inputContainer: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.inputSurface,
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
