import { View } from "react-native";
import { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { CopyIconButton } from "@/components/ui/copy-icon-button";

import { useExchangeContext } from "../context/exchange-context";
import { useExchangeConversion } from "../hooks/use-exchange-conversion";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { AnimatedAmountText } from "./animated-amount-text";
import { CurrencyPicker } from "./currency-picker";

const AMOUNT_FONT_SIZE = 34;
const MIN_AMOUNT_FONT_SIZE = 25;

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

  const amountFontSize = useDerivedValue(() => {
    const compactLength = safeAmount.replace(/[^\d]/g, "").length;
    const nextFontSize = compactLength <= 5 ? AMOUNT_FONT_SIZE : Math.max(MIN_AMOUNT_FONT_SIZE, AMOUNT_FONT_SIZE - (compactLength - 5) * 2);

    return withTiming(nextFontSize, { duration: 160 });
  }, [safeAmount]);

  const animatedAmountStyle = useAnimatedStyle(() => ({
    fontSize: amountFontSize.value,
    lineHeight: amountFontSize.value + 6,
  }));

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <CurrencyPicker code={outputCurrency.code} icon={outputCurrency.icon} onSelect={handleOutputCurrencySelect} options={outputOptions} selectedOptionId={outputSelectedOptionId} />

        <View style={styles.amountRow}>
          <AppText variant="title" style={styles.amountSymbol}>
            {outputCurrency.symbol}
          </AppText>

          <AnimatedAmountText containerStyle={styles.amountValueTextRow} style={[styles.amountValue, animatedAmountStyle]} text={safeAmount} />
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
