import { View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import { formatQuickActionAmount, parseLocalizedAmountToNumber } from "@/features/exchange/utils";
import { TouchZone } from "@/components/ui/button";

type QuickAmountPillsProps = {
  amount: string;
  onSelect: (value: string) => void;
  values: string[];
};

export function QuickAmountPills({ amount, onSelect, values }: QuickAmountPillsProps) {
  const numAmount = parseLocalizedAmountToNumber(amount);
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);

  return (
    <View style={styles.quickAmountList}>
      {values.map((quickAmount) => {
        const isSelected = numAmount === Number(quickAmount);

        return (
          <TouchZone
            key={quickAmount}
            onPress={() => onSelect(quickAmount)}
            style={[styles.quickAmountPill, isSelected ? styles.quickAmountPillSelected : null]}
          >
            <AppText variant="tab" style={isSelected ? styles.quickAmountTextSelected : styles.quickAmountText}>
              {formatQuickActionAmount(quickAmount, decimalSeparator)}
            </AppText>
          </TouchZone>
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
