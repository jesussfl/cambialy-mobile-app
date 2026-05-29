import type { PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";


type CardProps = PropsWithChildren<
  ViewProps & {
    elevated?: boolean;
  }
>;

export function Card({ children, elevated = false, style, ...rest }: CardProps) {
  return (
    <View {...rest} style={[styles.base, elevated ? styles.elevated : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  elevated: {
    ...theme.shadows.card,
  },
}));
