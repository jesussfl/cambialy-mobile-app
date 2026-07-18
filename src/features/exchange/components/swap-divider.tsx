import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { IconButton } from "@/components/ui/button";
import { useExchangeScreen } from "../hooks/use-exchange-screen";

export function SwapDivider() {
  const { handleSwapDirection } = useExchangeScreen();

  return (
    <View style={styles.swapDividerRow}>
      <View style={styles.dividerLine} />
      <IconButton icon="arrow-up-down-line" onPress={handleSwapDirection} />
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
