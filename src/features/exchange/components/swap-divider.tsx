import { Pressable, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

const UniRemixIcon = withUnistyles(RemixIcon);

type SwapDividerProps = {
  onPress: () => void;
};

export function SwapDivider({ onPress }: SwapDividerProps) {
  return (
    <View style={styles.swapDividerRow}>
      <View style={styles.dividerLine} />
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.swapButton}>
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
