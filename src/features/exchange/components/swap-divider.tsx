import { Pressable, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { useExchangeScreen } from "../hooks/use-exchange-screen";

const UniRemixIcon = withUnistyles(RemixIcon);

export function SwapDivider() {
  const { handleSwapDirection } = useExchangeScreen();

  return (
    <View style={styles.swapDividerRow}>
      <View style={styles.dividerLine} />
      <Pressable accessibilityRole="button" onPress={handleSwapDirection} style={styles.swapButton}>
        <UniRemixIcon
          name="arrow-up-down-line"
          size={22}
          uniProps={(theme: any) => ({
            color: theme.colors.primaryText,
          })}
        />
      </Pressable>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  swapDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
  swapButton: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.card,
  },
}));
