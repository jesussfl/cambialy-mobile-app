import { useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useExchangeContext } from "../context/exchange-context";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { AmountKeypadSheet } from "./amount-keypad-sheet";
import { CurrencyPicker } from "./currency-picker";
import { QuickAmountPills } from "./quick-amount-pills";

const UniAppText = withUnistyles(AppText);

export function SwapInputBlock() {
  const { selectedBaseRateId, customRateValue } = useExchangeContext();
  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const {
    inputAmount,
    inputCurrency,
    handleInputAmountChange,
    handleQuickAmountSelect,
    handleCustomRateChange,
    handleInputCurrencySelect,
    inputOptions,
    quickAmounts,
    customRateInput,
    inputSelectedOptionId,
  } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const safeAmount = inputAmount ?? "";
  const safeCustomRate = customRateInput ?? "";
  const [activeField, setActiveField] = useState<"amount" | "customRate">("amount");
  const [hasTyped, setHasTyped] = useState({ amount: false, customRate: false });

  const handleValueInput = (value: string) => {
    const normalizedValue = value === "," ? "." : value;
    const field = activeField;
    const isFirst = !hasTyped[field];

    if (isFirst) {
      setHasTyped((prev) => ({ ...prev, [field]: true }));
    }

    const nextValue = (() => {
      if (field === "amount") {
        const currentValue = isFirst ? "" : (safeAmount ?? "");

        if (normalizedValue === ".") {
          return currentValue.includes(".") ? currentValue : currentValue ? `${currentValue}.` : "0.";
        }

        return `${currentValue}${normalizedValue}`;
      }

      const currentValue = isFirst ? "" : (safeCustomRate ?? "");

      if (normalizedValue === ".") {
        return currentValue.includes(".") ? currentValue : currentValue ? `${currentValue}.` : "0.";
      }

      return `${currentValue}${normalizedValue}`;
    })();

    if (field === "amount") {
      handleInputAmountChange(nextValue);
      return;
    }

    handleCustomRateChange(nextValue);
  };

  const handleValueDelete = () => {
    const currentValue = activeField === "amount" ? safeAmount : safeCustomRate;
    const nextValue = currentValue.slice(0, -1);

    if (activeField === "amount") {
      handleInputAmountChange(nextValue);
      return;
    }

    handleCustomRateChange(nextValue);
  };

  const handleValueClear = () => {
    if (activeField === "amount") {
      setHasTyped((prev) => ({ ...prev, amount: false }));
      handleInputAmountChange("");
      return;
    }

    setHasTyped((prev) => ({ ...prev, customRate: false }));
    handleCustomRateChange("");
  };

  const displayValue = activeField === "amount" ? safeAmount || "0,00" : safeCustomRate || "0,00";

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <CurrencyPicker
          code={inputCurrency.code}
          icon={inputCurrency.icon}
          onSelect={handleInputCurrencySelect}
          options={inputOptions}
          selectedOptionId={inputSelectedOptionId}
        />

        <View style={styles.amountRow}>
          <AppText variant="title" style={styles.amountSymbol}>
            {inputCurrency.symbol}
          </AppText>

          <Pressable hitSlop={12} style={styles.amountInputPanel} onPress={() => TrueSheet.present("amount-keypad-sheet")}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
              <UniAppText variant="title" style={styles.amountPreview}>
                {displayValue}
              </UniAppText>
            </ScrollView>
          </Pressable>

          <AmountKeypadSheet
            title={activeField === "customRate" ? "Editar tasa" : "Ingresar monto"}
            showFieldSwitch={inputSelectedOptionId === "custom"}
            activeField={activeField}
            onFieldChange={setActiveField}
            onKeyPress={handleValueInput}
            onDelete={handleValueDelete}
            onClear={handleValueClear}
          />
        </View>
      </View>

      {quickAmounts.length ? <QuickAmountPills amount={safeAmount} onSelect={handleQuickAmountSelect} values={quickAmounts} /> : null}
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
  amountInputPanel: {
    flex: 1,
    minWidth: 0,
    paddingVertical: theme.spacing.md,
  },
  amountPreview: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 34,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 40,
  },
  amountPreviewScroll: {
    alignItems: "center",
  },
}));
