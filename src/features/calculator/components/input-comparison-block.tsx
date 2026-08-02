import { useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { TouchZone } from "@/components/ui/button";
import { AmountKeypadSheet } from "@/features/exchange/components/amount-keypad-sheet";
import { CurrencyPicker } from "@/features/exchange/components/currency-picker";
import {
  appendOperatorToExpression,
  evaluateExpression,
  formatCompactAmount,
  formatDotDecimalString,
  formatExpressionForDisplay,
  type MathOperator,
} from "@/features/exchange/utils";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

import type { InputComparisonBlockProps } from "../types";

const UniAppText = withUnistyles(AppText);

export function InputComparisonBlock({
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
}: InputComparisonBlockProps) {
  const { decimalSeparator, amountInputMode } = useSettingsStore();
  const isCustomRate = selectedCurrencyId === "custom";
  const [activeField, setActiveField] = useState<"amount" | "customRate">("amount");
  const [hasTyped, setHasTyped] = useState(false);
  const [expression, setExpression] = useState("");

  const safeAmount = amount ?? "";
  const safeCustomRate = customRate ?? "";
  const placeholder = decimalSeparator === "comma" ? "0,00" : "0.00";
  const displayValue = safeAmount ? formatDotDecimalString(safeAmount, decimalSeparator) : placeholder;
  const displayCustomRate = safeCustomRate ? formatDotDecimalString(safeCustomRate, decimalSeparator) : placeholder;
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
    <Animated.View layout={LinearTransition.springify().damping(20)}>
      <View style={styles.blockContainer}>
        <View style={styles.topRow}>
          <View style={styles.valueGroup}>
            <View style={styles.amountRow}>
              {expression ? (
                <AppText variant="label" style={styles.expressionPreview}>
                  {formatExpressionForDisplay(expression, amountInputMode, decimalSeparator)}
                </AppText>
              ) : null}
              <TouchZone hitSlop={12} style={styles.amountInputPanel} onPress={() => TrueSheet.present(sheetName)}>
                <View style={styles.amountDisplayContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
                    <UniAppText variant="body" style={styles.amountPreview}>
                      {`${currency.symbol} ${displayValue}`}
                    </UniAppText>
                  </ScrollView>
                </View>
              </TouchZone>
            </View>
          </View>

          <CurrencyPicker
            code={currency.code}
            icon={currency.icon}
            onSelect={onCurrencySelect}
            options={options}
            selectedOptionId={selectedCurrencyId}
          />
        </View>

        <View style={styles.footerRow}>
          <AppText variant="tab" style={styles.vesValue} numberOfLines={1}>
            Bs. {formatCompactAmount(valueInVes, decimalSeparator)}
          </AppText>
        </View>

        {isCustomRate ? (
          <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)}>
            <View style={styles.customRateRow}>
              <AppText variant="tab" style={styles.customRateLabel} numberOfLines={1}>
                Tasa
              </AppText>
              <AppText variant="tab" style={styles.customRatePrefix}>
                Bs.
              </AppText>
              <TouchZone
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
              </TouchZone>
            </View>
          </Animated.View>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  blockContainer: {
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  valueGroup: {
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
  footerRow: {
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
