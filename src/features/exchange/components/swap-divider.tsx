import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { IconButton } from "@/components/ui/button";
import { useExchangeContext } from "../context/exchange-context";
import { useExchangeConversion } from "../hooks/use-exchange-conversion";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";

export function SwapDivider() {
  const { selectedBaseRateId, customRateValue, selectedTargetCurrencyId, inputAmount, isReversed } = useExchangeContext();

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const { handleSwapDirection } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const { convertedAmount } = useExchangeConversion({
    inputAmount,
    isReversed,
    rates,
    selectedBaseRate,
    selectedTargetCurrencyId,
    customRateValue,
  });

  return (
    <View style={styles.swapDividerRow}>
      <View style={styles.dividerLine} />
      <IconButton icon="arrow-up-down-line" onPress={() => handleSwapDirection(convertedAmount)} />
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
}));
