import { TouchZone } from "@/components/ui/button";
import { Popover } from "heroui-native";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { useSettingsStore } from "@/features/settings/context/settings-context";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import type { BaseRateId } from "../hooks/exchange-screen.types";

import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { useExchangeStore } from "../store/exchange-store";
import { appendOperatorToExpression, evaluateExpression, formatDotDecimalString, formatExpressionForDisplay, type MathOperator } from "../utils";
import { AmountKeypadSheet } from "./amount-keypad-sheet";
import { CurrencyPicker } from "./currency-picker";
import { QuickAmountPills } from "./quick-amount-pills";

import { usePasteAmount } from "../hooks/use-paste-amount";

const UniAppText = withUnistyles(AppText);
const UniRemixIcon = withUnistyles(RemixIcon);
const UniPopoverContent = withUnistyles(Popover.Content);

export function SwapInputBlock() {
  const selectedBaseRateId = useExchangeStore((s) => s.selectedBaseRateId);
  const customRateValue = useExchangeStore((s) => s.customRateValue);
  const resetKey = useExchangeStore((s) => s.resetKey);

  return <SwapInputBlockInner key={resetKey} selectedBaseRateId={selectedBaseRateId} customRateValue={customRateValue} />;
}

function SwapInputBlockInner({ selectedBaseRateId, customRateValue }: { selectedBaseRateId: BaseRateId; customRateValue: number }) {
  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);
  const { handlePaste } = usePasteAmount();

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isLongPressRef = useRef(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      if (isLongPressRef.current) {
        setIsPopoverOpen(true);
      }
    } else {
      setIsPopoverOpen(false);
      isLongPressRef.current = false;
    }
  };

  const handlePress = () => {
    if (isLongPressRef.current) {
      return;
    }
    TrueSheet.present("amount-keypad-sheet");
  };

  const handleLongPress = () => {
    isLongPressRef.current = true;
    setIsPopoverOpen(true);
  };

  const amountInputMode = useSettingsStore((s) => s.amountInputMode);
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);

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
    activeField === "amount" ? inputAmountDisplay || placeholder : safeCustomRate ? formatDotDecimalString(safeCustomRate, decimalSeparator) : placeholder;

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <View style={styles.amountRow}>
          {expression ? (
            <AppText variant="label" style={styles.expressionPreview}>
              {formatExpressionForDisplay(expression, amountInputMode, decimalSeparator)}
            </AppText>
          ) : null}
          <Popover isOpen={isPopoverOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger asChild>
              <TouchZone
                accessibilityRole="button"
                hitSlop={12}
                style={styles.amountInputPanel}
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={250}
              >
                <View style={styles.amountDisplayContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
                    <UniAppText pointerEvents="none" variant="body" style={styles.amountPreview}>
                      {`${inputCurrency.symbol} ${displayValue}`}
                    </UniAppText>
                  </ScrollView>
                </View>
              </TouchZone>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Overlay />
              <UniPopoverContent presentation="popover" placement="bottom" align="start" width={140} style={styles.pastePopover}>
                <TouchZone
                  accessibilityRole="button"
                  onPress={async () => {
                    handleOpenChange(false);
                    await handlePaste();
                  }}
                  style={styles.pasteOption}
                >
                  <UniRemixIcon
                    name="clipboard-line"
                    size={18}
                    uniProps={(theme: any) => ({
                      color: theme.colors.textPrimary,
                    })}
                  />
                  <AppText variant="button" style={styles.pasteOptionText}>
                    Pegar
                  </AppText>
                </TouchZone>
              </UniPopoverContent>
            </Popover.Portal>
          </Popover>

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
            onPaste={handlePaste}
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
  pastePopover: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    ...theme.shadows.floating,
  },
  pasteOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
  },
  pasteOptionText: {
    color: theme.colors.textPrimary,
  },
}));
