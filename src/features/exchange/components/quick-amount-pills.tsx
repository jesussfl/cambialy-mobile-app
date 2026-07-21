import { View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { formatQuickAmountLabel } from "@/features/exchange/utils";
import { PressableScale } from "pressto";

type QuickAmountPillsProps = {
  amount: string;
  onSelect: (value: string) => void;
  values: string[];
};
const UniPressableScale = withUnistyles(PressableScale);

export function QuickAmountPills({ amount, onSelect, values }: QuickAmountPillsProps) {
  return (
    <View style={styles.quickAmountList}>
      {values.map((quickAmount) => {
        const isSelected = amount === quickAmount;

        return (
          <UniPressableScale
            key={quickAmount}
            onPress={() => onSelect(quickAmount)}
            style={[styles.quickAmountPill, isSelected ? styles.quickAmountPillSelected : null]}
          >
            <AppText variant="tab" style={isSelected ? styles.quickAmountTextSelected : styles.quickAmountText}>
              {formatQuickAmountLabel(quickAmount)}
            </AppText>
          </UniPressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  quickAmountList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  quickAmountPill: {
    minWidth: 44,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  quickAmountPillSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickAmountText: {
    color: theme.colors.textSecondary,
  },
  quickAmountTextSelected: {
    color: theme.colors.primaryText,
  },
}));
