import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { useToast } from "heroui-native";
import { PressableOpacity } from "pressto";
import { useExchangeContext } from "../context/exchange-context";
import { useCopyResult } from "../hooks/use-copy-result";
import { useExchangeConversion } from "../hooks/use-exchange-conversion";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { CurrencyPicker } from "./currency-picker";

const AMOUNT_FONT_SIZE = 34;

export function SwapOutputBlock() {
  const { selectedBaseRateId, customRateValue, selectedTargetCurrencyId, inputAmount, isReversed } = useExchangeContext();

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const { outputCurrency, handleOutputCurrencySelect, outputOptions, outputSelectedOptionId } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const { outputAmountText, outputCopyText } = useExchangeConversion({
    inputAmount,
    isReversed,
    rates,
    selectedBaseRate,
    selectedTargetCurrencyId,
    customRateValue,
  });

  const { handleCopyResult } = useCopyResult(outputCopyText);
  const { toast } = useToast();
  const safeAmount = outputAmountText ?? "";

  const copyResult = async () => {
    handleCopyResult();
    toast.show({
      label: "Resultado copiado",
    });
  };

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <View style={styles.amountRow}>
          <PressableOpacity onPress={copyResult} hitSlop={12}>
            <AppText variant="title" style={[styles.amountValue, styles.amountValueTextRow]} numberOfLines={1}>
              {outputCurrency.symbol} {safeAmount}
            </AppText>
          </PressableOpacity>
        </View>
        <CurrencyPicker
          code={outputCurrency.code}
          icon={outputCurrency.icon}
          onSelect={handleOutputCurrencySelect}
          options={outputOptions}
          selectedOptionId={outputSelectedOptionId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  amountBlock: {
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  amountTopRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  amountRow: {
    flex: 1,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },

  amountValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: AMOUNT_FONT_SIZE + 9,
  },
  amountValueTextRow: {
    flex: 1,
    minWidth: 0,
  },
}));
