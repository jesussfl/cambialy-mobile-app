import { useState, memo } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { CopyIconButton } from "@/components/ui/copy-icon-button";

import { TrueSheet } from "@lodev09/react-native-true-sheet";
import type { CurrencyOption } from "../types";
import { AmountKeypadSheet } from "./amount-keypad-sheet";
import { AnimatedAmountText } from "./animated-amount-text";
import { CurrencyPicker } from "./currency-picker";
import { QuickAmountPills } from "./quick-amount-pills";
const AMOUNT_FONT_SIZE = 34;
const MIN_AMOUNT_FONT_SIZE = 25;

const UniAppText = withUnistyles(AppText);

type SwapAmountBlockProps = {
  amount: string;
  code: string;
  copyText?: string;
  customRate?: string;
  editable?: boolean;
  icon: IconName;
  label?: string;
  onAmountChange?: (value: string) => void;
  onCustomRateChange?: (value: string) => void;
  onCurrencySelect: (optionId: string) => void;
  onQuickAmountSelect?: (value: string) => void;
  options: CurrencyOption[];
  quickAmounts?: string[];
  selectedOptionId: string;

  symbol: string;
  showCustomRateInput?: boolean;
};

export const SwapAmountBlock = memo(function SwapAmountBlock({
  amount,
  code,
  copyText,
  customRate = "",
  editable = false,
  icon,
  onAmountChange,
  onCustomRateChange,
  onCurrencySelect,
  onQuickAmountSelect,
  options,
  quickAmounts,
  selectedOptionId,
  symbol,
  showCustomRateInput = false,
}: SwapAmountBlockProps) {
  const safeAmount = amount ?? "";
  const safeCustomRate = customRate ?? "";
  const [activeField, setActiveField] = useState<"amount" | "customRate">("amount");
  const [hasTyped, setHasTyped] = useState({ amount: false, customRate: false });

  const amountFontSize = useDerivedValue(() => {
    const compactLength = safeAmount.replace(/[^\d]/g, "").length;
    const nextFontSize = compactLength <= 5 ? AMOUNT_FONT_SIZE : Math.max(MIN_AMOUNT_FONT_SIZE, AMOUNT_FONT_SIZE - (compactLength - 5) * 2);

    return withTiming(nextFontSize, { duration: 160 });
  }, [safeAmount]);
  const animatedAmountStyle = useAnimatedStyle(() => ({
    fontSize: amountFontSize.value,
    lineHeight: amountFontSize.value + 6,
  }));

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
      onAmountChange?.(nextValue);
      return;
    }

    onCustomRateChange?.(nextValue);
  };

  const handleValueDelete = () => {
    const currentValue = activeField === "amount" ? safeAmount : safeCustomRate;
    const nextValue = currentValue.slice(0, -1);

    if (activeField === "amount") {
      onAmountChange?.(nextValue);
      return;
    }

    onCustomRateChange?.(nextValue);
  };

  const handleValueClear = () => {
    if (activeField === "amount") {
      setHasTyped((prev) => ({ ...prev, amount: false }));
      onAmountChange?.("");
      return;
    }

    setHasTyped((prev) => ({ ...prev, customRate: false }));
    onCustomRateChange?.("");
  };

  const displayValue = activeField === "amount" ? safeAmount || "0,00" : safeCustomRate || "0,00";

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <CurrencyPicker code={code} icon={icon} onSelect={onCurrencySelect} options={options} selectedOptionId={selectedOptionId} />

        <View style={styles.amountRow}>
          <AppText variant="title" style={styles.amountSymbol}>
            {symbol}
          </AppText>
          {editable ? (
            <>
              <Pressable hitSlop={12} style={styles.amountInputPanel} onPress={() => TrueSheet.present("amount-keypad-sheet")}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
                  <UniAppText variant="title" style={styles.amountPreview}>
                    {displayValue}
                  </UniAppText>
                </ScrollView>
              </Pressable>
              <AmountKeypadSheet
                title={activeField === "customRate" ? "Editar tasa" : "Ingresar monto"}
                showFieldSwitch={!!showCustomRateInput && !!onCustomRateChange}
                activeField={activeField}
                onFieldChange={setActiveField}
                onKeyPress={handleValueInput}
                onDelete={handleValueDelete}
                onClear={handleValueClear}
              />
            </>
          ) : (
            <>
              <AnimatedAmountText containerStyle={styles.amountValueTextRow} style={[styles.amountValue, animatedAmountStyle]} text={safeAmount} />
              {copyText ? <CopyIconButton text={copyText} /> : null}
            </>
          )}
        </View>
      </View>

      {editable && quickAmounts?.length && onQuickAmountSelect ? (
        <QuickAmountPills amount={safeAmount} onSelect={onQuickAmountSelect} values={quickAmounts} />
      ) : null}
    </View>
  );
});

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
  amountTitleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
  },
  amountValueGroup: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },
  blockLabel: {
    color: theme.colors.textMuted,
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
