import { useState } from "react";
import { Pressable, View } from "react-native";
import { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { PressableScale } from "pressto";
import { useCopyResult } from "../hooks/use-copy-result";
import type { CurrencyOption } from "../types";
import { AmountKeypadSheet } from "./amount-keypad-sheet";
import { AnimatedAmountText } from "./animated-amount-text";
import { CurrencyPicker } from "./currency-picker";
import { QuickAmountPills } from "./quick-amount-pills";
const AMOUNT_FONT_SIZE = 34;
const MIN_AMOUNT_FONT_SIZE = 25;

const UniRemixIcon = withUnistyles(RemixIcon);
const UniAppText = withUnistyles(AppText);

type SwapAmountBlockProps = {
  amount: string;
  code: string;
  copyText?: string;
  customRate?: string;
  editable?: boolean;
  icon: IconName;
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

function CopyButton({ text }: { text: string }) {
  const { handleCopyResult, resultCopied } = useCopyResult(text);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={resultCopied ? "Resultado copiado" : "Copiar resultado"}
      hitSlop={10}
      onPress={handleCopyResult}
      style={({ pressed }) => [styles.copyButton, resultCopied ? styles.copyButtonActive : null, pressed ? styles.copyButtonPressed : null]}
    >
      <UniRemixIcon
        name={resultCopied ? "check-line" : "file-copy-line"}
        size={18}
        uniProps={(theme: any) => ({
          color: resultCopied ? theme.colors.primaryText : theme.colors.primary,
        })}
      />
    </Pressable>
  );
}

export function SwapAmountBlock({
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
    const nextValue = (() => {
      if (activeField === "amount") {
        const currentValue = safeAmount ?? "";

        if (normalizedValue === ".") {
          return currentValue.includes(".") ? currentValue : currentValue ? `${currentValue}.` : "0.";
        }

        return `${currentValue}${normalizedValue}`;
      }

      const currentValue = safeCustomRate ?? "";

      if (normalizedValue === ".") {
        return currentValue.includes(".") ? currentValue : currentValue ? `${currentValue}.` : "0.";
      }

      return `${currentValue}${normalizedValue}`;
    })();

    if (activeField === "amount") {
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
      onAmountChange?.("");
      return;
    }

    onCustomRateChange?.("");
  };

  const displayValue = activeField === "amount" ? safeAmount || "0" : safeCustomRate || "0";

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
              <PressableScale style={styles.amountInputPanel} onPress={() => TrueSheet.present("amount-keypad-sheet")}>
                <UniAppText variant="title" style={styles.amountPreview} numberOfLines={1}>
                  {displayValue}
                </UniAppText>
              </PressableScale>
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
              {copyText ? <CopyButton text={copyText} /> : null}
            </>
          )}
        </View>
      </View>

      {editable && quickAmounts?.length && onQuickAmountSelect ? (
        <QuickAmountPills amount={safeAmount} onSelect={onQuickAmountSelect} values={quickAmounts} />
      ) : null}
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
    paddingVertical: theme.spacing.xs,
  },
  amountPreview: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 34,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 40,
  },
  copyButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  copyButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  copyButtonPressed: {
    opacity: 0.75,
  },
}));
