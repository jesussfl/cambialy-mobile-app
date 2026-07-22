import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { CopyIconButton } from "@/components/ui/copy-icon-button";

import { useExchangeContext } from "../context/exchange-context";
import { useExchangeConversion } from "../hooks/use-exchange-conversion";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { CurrencyPicker } from "./currency-picker";

const AMOUNT_FONT_SIZE = 34;

export function SwapOutputBlock() {
  const { selectedBaseRateId, customRateValue, selectedTargetCurrencyId, inputAmount, isReversed } = useExchangeContext();

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const {
    outputCurrency,
    handleOutputCurrencySelect,
    outputOptions,
    outputSelectedOptionId,
  } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const { outputAmountText, outputCopyText } = useExchangeConversion({
    inputAmount,
    isReversed,
    rates,
    selectedBaseRate,
    selectedTargetCurrencyId,
    customRateValue,
  });

  const safeAmount = outputAmountText ?? "";

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <CurrencyPicker code={outputCurrency.code} icon={outputCurrency.icon} onSelect={handleOutputCurrencySelect} options={outputOptions} selectedOptionId={outputSelectedOptionId} />

        <View style={styles.amountRow}>
          <AppText variant="title" style={styles.amountSymbol}>
            {outputCurrency.symbol}
          </AppText>

          <AppText variant="title" style={[styles.amountValue, styles.amountValueTextRow]} numberOfLines={1}>
            {safeAmount}
          </AppText>
          <CopyIconButton text={outputCopyText} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  amountBlock: {
    minHeight: 142,
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  amountTopRow: {
    flexDirection: "column",
    gap: theme.spacing.sm,
  },
  amountRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  amountSymbol: {
    color: theme.colors.textSecondary,
    fontSize: 34,
    lineHeight: 40,
  },
  amountValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: AMOUNT_FONT_SIZE,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: AMOUNT_FONT_SIZE + 6,
  },
  amountValueTextRow: {
    flex: 1,
    minWidth: 0,
  },
}));
