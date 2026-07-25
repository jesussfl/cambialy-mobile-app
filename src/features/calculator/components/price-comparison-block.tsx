import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { AmountKeypadSheet } from "@/features/exchange/components/amount-keypad-sheet";
import { CurrencyPicker } from "@/features/exchange/components/currency-picker";
import { formatAmountNumber, formatCompactAmount } from "@/features/exchange/utils";
import { appendOperatorToExpression, evaluateExpression, formatExpressionForDisplay, type MathOperator } from "@/features/exchange/utils/calculator";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { PressableOpacity } from "pressto";

import { useSettingsStore } from "@/features/settings/context/settings-context";
import type { PriceComparisonBlockProps } from "../types";

export function PriceComparisonBlock({
  amount,
  currency,
  customRate,
  label,
  onAmountChange,
  onCustomRateChange,
  onCurrencySelect,
  options,
  selectedCurrencyId,
  valueInVes,
}: PriceComparisonBlockProps) {
  const { decimalSeparator, amountInputMode } = useSettingsStore();
  const isCustomRate = selectedCurrencyId === "custom";
  const [activeField, setActiveField] = useState<"amount" | "customRate">("amount");
  const [hasTyped, setHasTyped] = useState(false);
  const [expression, setExpression] = useState("");

  const safeAmount = amount ?? "";
  const safeCustomRate = customRate ?? "";
  const placeholder = decimalSeparator === "comma" ? "0,00" : "0.00";
  const displayValue = safeAmount ? formatAmountNumber(safeAmount, decimalSeparator) : placeholder;
  const displayCustomRate = safeCustomRate ? formatAmountNumber(safeCustomRate, decimalSeparator) : placeholder;
  const sheetName = `calculator-keypad-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const updateFieldValue = (nextValue: string) => {
    if (activeField === "amount") {
      onAmountChange(nextValue);
    } else {
      onCustomRateChange(nextValue);
    }
  };

  const handleValueInput = (value: string) => {
    const field = activeField;
    const currentBase = !hasTyped ? "" : expression ? expression : field === "amount" ? safeAmount : safeCustomRate;
    const nextExpr = `${currentBase}${value}`;
    setExpression(nextExpr);
    setHasTyped(true);
    const { formattedResult } = evaluateExpression(nextExpr, amountInputMode, decimalSeparator);
    if (formattedResult) {
      updateFieldValue(formattedResult);
    }
  };

  const handleOperatorPress = (op: MathOperator) => {
    const field = activeField;
    const currentBase = expression ? expression : field === "amount" ? safeAmount : safeCustomRate;
    if (!currentBase) return;
    setHasTyped(true);
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
    const field = activeField;
    const currentValue = field === "amount" ? safeAmount : safeCustomRate;
    const nextValue = currentValue.slice(0, -1);
    updateFieldValue(nextValue);
  };

  const handleValueClear = () => {
    setExpression("");
    setHasTyped(false);
    if (activeField === "amount") {
      onAmountChange("");
    } else {
      onCustomRateChange("");
    }
  };

  return (
    <View style={styles.priceBlock}>
      <View style={styles.priceTopRow}>
        <View style={styles.priceValueGroup}>
          <View style={styles.amountRow}>
            {expression ? (
              <AppText variant="label" style={styles.expressionPreview}>
                {formatExpressionForDisplay(expression, amountInputMode, decimalSeparator)}
              </AppText>
            ) : null}
            <PressableOpacity hitSlop={12} style={styles.amountInputPanel} onPress={() => TrueSheet.present(sheetName)}>
              <View style={styles.amountDisplayContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
                  <AppText variant="body" style={styles.amountPreview}>
                    {`${currency.symbol} ${displayValue}`}
                  </AppText>
                </ScrollView>
              </View>
            </PressableOpacity>
          </View>
        </View>

        <CurrencyPicker code={currency.code} icon={currency.icon} onSelect={onCurrencySelect} options={options} selectedOptionId={selectedCurrencyId} />
      </View>

      <View style={styles.priceFooter}>
        <AppText variant="tab" style={styles.vesValue} numberOfLines={1}>
          Bs. {formatCompactAmount(valueInVes, decimalSeparator)}
        </AppText>
      </View>

      {isCustomRate ? (
        <View style={styles.customRateRow}>
          <AppText variant="tab" style={styles.customRateLabel} numberOfLines={1}>
            Tasa
          </AppText>
          <AppText variant="tab" style={styles.customRatePrefix}>
            Bs.
          </AppText>
          <PressableOpacity
            hitSlop={8}
            style={styles.customRatePressable}
            onPress={() => {
              setActiveField("customRate");
              setExpression("");
              TrueSheet.present(sheetName);
            }}
          >
            <AppText variant="body" style={styles.customRateDisplay}>
              {displayCustomRate}
            </AppText>
          </PressableOpacity>
        </View>
      ) : null}

      <AmountKeypadSheet
        name={sheetName}
        title={activeField === "customRate" ? "Editar tasa" : "Ingresar monto"}
        showFieldSwitch={isCustomRate}
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
  );
}

const styles = StyleSheet.create((theme) => ({
  priceBlock: {
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  priceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  priceValueGroup: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  amountRow: {
    minHeight: 58,
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
  priceFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  vesValue: {
    maxWidth: "42%",
    color: theme.colors.textPrimary,
    textAlign: "right",
  },
  customRateRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  customRateLabel: {
    minWidth: 42,
    color: theme.colors.textMuted,
  },
  customRatePrefix: {
    color: theme.colors.textSecondary,
  },
  customRatePressable: {
    flex: 1,
    minWidth: 0,
  },
  customRateDisplay: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));
