import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { useSettingsStore } from "@/features/settings/context/settings-context";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useExchangeContext } from "../context/exchange-context";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { useExchangeStore } from "../store/exchange-store";
import { formatAmountNumber } from "../utils";
import { appendOperatorToExpression, evaluateExpression, formatExpressionForDisplay, type MathOperator } from "../utils/calculator";
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
    inputAmountDisplay,
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
  const [expression, setExpression] = useState("");

  const resetKey = useExchangeStore((s) => s.resetKey);

  useEffect(() => {
    setActiveField("amount");
    setHasTyped({ amount: false, customRate: false });
    setExpression("");
  }, [resetKey]);

  const { amountInputMode, decimalSeparator } = useSettingsStore();

  const updateFieldValue = (nextValue: string) => {
    if (activeField === "amount") {
      handleInputAmountChange(nextValue);
    } else {
      handleCustomRateChange(nextValue);
    }
  };

  const handleValueInput = (value: string) => {
    const field = activeField;
    const isFirst = !hasTyped[field];

    if (isFirst) {
      setHasTyped((prev) => ({ ...prev, [field]: true }));
    }

    const currentBase = isFirst ? "" : expression ? expression : field === "amount" ? safeAmount : safeCustomRate;

    const nextExpr = `${currentBase}${value}`;
    setExpression(nextExpr);

    const { formattedResult } = evaluateExpression(nextExpr, amountInputMode, decimalSeparator);
    if (formattedResult) {
      updateFieldValue(formattedResult);
    }
  };

  const handleOperatorPress = (op: MathOperator) => {
    const field = activeField;
    const currentBase = expression ? expression : field === "amount" ? safeAmount : safeCustomRate;

    if (!currentBase) return;

    setHasTyped((prev) => ({ ...prev, [field]: true }));
    const nextExpr = appendOperatorToExpression(currentBase, op);
    setExpression(nextExpr);
  };

  const handleEvaluate = () => {
    if (!expression) return;
    const { formattedResult } = evaluateExpression(expression, amountInputMode, decimalSeparator);
    if (formattedResult) {
      updateFieldValue(formattedResult);
    }
    setExpression("");
  };

  const handleValueDelete = () => {
    if (expression.length > 0) {
      const nextExpr = expression.slice(0, -1);
      setExpression(nextExpr);

      if (nextExpr.length === 0) {
        updateFieldValue("");
      } else {
        const { formattedResult } = evaluateExpression(nextExpr, amountInputMode, decimalSeparator);
        if (formattedResult) {
          updateFieldValue(formattedResult);
        }
      }
      return;
    }

    const currentValue = activeField === "amount" ? safeAmount : safeCustomRate;
    const nextValue = currentValue.slice(0, -1);
    updateFieldValue(nextValue);
  };

  const handleValueClear = () => {
    setExpression("");
    if (activeField === "amount") {
      setHasTyped((prev) => ({ ...prev, amount: false }));
      handleInputAmountChange("");
    } else {
      setHasTyped((prev) => ({ ...prev, customRate: false }));
      handleCustomRateChange("");
    }
  };

  const placeholder = decimalSeparator === "comma" ? "0,00" : "0.00";
  const displayValue =
    activeField === "amount" ? inputAmountDisplay || placeholder : safeCustomRate ? formatAmountNumber(safeCustomRate, decimalSeparator) : placeholder;

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <View style={styles.amountRow}>
          {expression ? (
            <AppText variant="label" style={styles.expressionPreview}>
              {formatExpressionForDisplay(expression, amountInputMode, decimalSeparator)}
            </AppText>
          ) : null}
          <Pressable hitSlop={12} style={styles.amountInputPanel} onPress={() => TrueSheet.present("amount-keypad-sheet")}>
            <View style={styles.amountDisplayContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
                <UniAppText variant="body" style={styles.amountPreview}>
                  {`${inputCurrency.symbol} ${displayValue}`}
                </UniAppText>
              </ScrollView>
            </View>
          </Pressable>

          <AmountKeypadSheet
            title={activeField === "customRate" ? "Editar tasa" : "Ingresar monto"}
            showFieldSwitch={inputSelectedOptionId === "custom"}
            activeField={activeField}
            onFieldChange={(field) => {
              setExpression("");
              setActiveField(field);
            }}
            onKeyPress={handleValueInput}
            onDelete={handleValueDelete}
            onClear={handleValueClear}
            onOperatorPress={handleOperatorPress}
            onEvaluate={handleEvaluate}
          />
        </View>
        <CurrencyPicker
          code={inputCurrency.code}
          icon={inputCurrency.icon}
          onSelect={handleInputCurrencySelect}
          options={inputOptions}
          selectedOptionId={inputSelectedOptionId}
        />
      </View>

      {quickAmounts.length ? <QuickAmountPills amount={safeAmount} onSelect={handleQuickAmountSelect} values={quickAmounts} /> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  amountBlock: {
    justifyContent: "center",
    gap: theme.spacing.md,
    marginTop: 12,
  },
  amountTopRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  amountRow: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  amountInputPanel: {
    flex: 1,
    minWidth: 0,
    paddingVertical: theme.spacing.xs,
  },
  amountDisplayContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  expressionPreview: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 18,
    position: "absolute",
    top: -12,
    left: 0,
  },
  amountPreview: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.bold,
  },
  amountPreviewScroll: {
    alignItems: "center",
  },
}));
