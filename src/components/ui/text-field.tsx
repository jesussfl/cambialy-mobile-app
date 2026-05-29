import type { ComponentProps } from 'react';
import { forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native-unistyles';

import { appTheme as theme } from '@/theme/app-theme';
import { AppText } from './app-text';

type AppTextFieldProps = TextInputProps & {
  label: string;
  prefix?: string;
  icon?: ComponentProps<typeof SymbolView>['name'];
};

export const AppTextField = forwardRef<TextInput, AppTextFieldProps>(
  ({ label, prefix, icon, style, placeholderTextColor, ...rest }, ref) => {
    return (
      <View style={styles.wrapper}>
        <AppText variant="label">{label}</AppText>
        <View style={styles.inputContainer}>
          {icon ? (
            <SymbolView
              name={icon}
              size={24}
              tintColor={theme.colors.textSecondary}
            />
          ) : null}
          {prefix ? <AppText variant="value" style={styles.prefix}>{prefix}</AppText> : null}
          <TextInput
            ref={ref}
            {...rest}
            placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
            selectionColor={theme.colors.primary}
            style={[styles.input, style]}
          />
        </View>
      </View>
    );
  }
);

AppTextField.displayName = 'AppTextField';

const styles = StyleSheet.create(() => ({
  wrapper: {
    gap: theme.spacing.md,
  },
  inputContainer: {
    minHeight: 88,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.inputSurface,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  prefix: {
    color: theme.colors.textSecondary,
  },
  input: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    fontWeight: theme.typography.fontWeight.medium,
    paddingVertical: 0,
  },
}));
