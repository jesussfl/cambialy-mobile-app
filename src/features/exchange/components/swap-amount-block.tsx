import { Pressable, TextInput, View } from "react-native";
import { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import type { ConversionDetail, CurrencyOption } from "../types";
import { AnimatedAmountText } from "./animated-amount-text";
import { ConversionDetails } from "./conversion-details";
import { CurrencyPicker } from "./currency-picker";
import { QuickAmountPills } from "./quick-amount-pills";

const AMOUNT_FONT_SIZE = 34;
const MIN_AMOUNT_FONT_SIZE = 25;

const UniTextInput = withUnistyles(TextInput);
const UniRemixIcon = withUnistyles(RemixIcon);

type SwapAmountBlockProps = {
  amount: string;
  code: string;
  editable?: boolean;
  icon: IconName;
  label: string;
  onAmountChange?: (value: string) => void;
  onCopyAmount?: () => void;
  onCurrencySelect: (optionId: string) => void;
  onQuickAmountSelect?: (value: string) => void;
  options: CurrencyOption[];
  quickAmounts?: string[];
  resultCopied?: boolean;
  selectedOptionId: string;
  supportingHint?: string;
  supportingDetails?: ConversionDetail[];
  supportingFormula?: string;
  symbol: string;
};

export function SwapAmountBlock({
  amount,
  code,
  editable = false,
  icon,
  label,
  onAmountChange,
  onCopyAmount,
  onCurrencySelect,
  onQuickAmountSelect,
  options,
  quickAmounts,
  resultCopied = false,
  selectedOptionId,
  supportingHint,
  supportingDetails,
  supportingFormula,
  symbol,
}: SwapAmountBlockProps) {
  const amountFontSize = useDerivedValue(() => {
    const compactLength = amount.replace(/[^\d]/g, "").length;
    const nextFontSize = compactLength <= 5 ? AMOUNT_FONT_SIZE : Math.max(MIN_AMOUNT_FONT_SIZE, AMOUNT_FONT_SIZE - (compactLength - 5) * 2);

    return withTiming(nextFontSize, { duration: 160 });
  }, [amount]);
  const animatedAmountStyle = useAnimatedStyle(() => ({
    fontSize: amountFontSize.value,
    lineHeight: amountFontSize.value + 6,
  }));

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <View style={styles.amountValueGroup}>
          <AppText variant="tab" style={styles.blockLabel}>
            {label}
          </AppText>
          <View style={styles.amountRow}>
            <AppText variant="title" style={styles.amountSymbol}>
              {symbol}
            </AppText>
            {editable ? (
              <UniTextInput
                value={amount}
                onChangeText={onAmountChange}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="0"
                style={styles.amountInput}
                uniProps={(theme) => ({
                  placeholderTextColor: theme.colors.textMuted,
                  selectionColor: theme.colors.primary,
                })}
              />
            ) : (
              <>
                <AnimatedAmountText containerStyle={styles.amountValueTextRow} style={[styles.amountValue, animatedAmountStyle]} text={amount} />
                {onCopyAmount ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={resultCopied ? "Resultado copiado" : "Copiar resultado"}
                    hitSlop={10}
                    onPress={onCopyAmount}
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
                ) : null}
              </>
            )}
          </View>
        </View>

        <CurrencyPicker code={code} icon={icon} onSelect={onCurrencySelect} options={options} selectedOptionId={selectedOptionId} />
      </View>

      {editable && quickAmounts?.length && onQuickAmountSelect ? (
        <QuickAmountPills amount={amount} onSelect={onQuickAmountSelect} values={quickAmounts} />
      ) : null}

      {supportingHint ? (
        <AppText variant="tab" style={styles.supportingHint} numberOfLines={1}>
          {supportingHint}
        </AppText>
      ) : null}

      {supportingDetails?.length ? <ConversionDetails details={supportingDetails} formula={supportingFormula} /> : null}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
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
  amountInput: {
    flex: 1,
    minWidth: 0,
    height: 56,
    padding: 0,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 34,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 40,
  },
  supportingHint: {
    color: theme.colors.textMuted,
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
