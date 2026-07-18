import { Pressable, TextInput, View } from "react-native";
import { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { useCopyResult } from "../hooks/use-copy-result";
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
  copyText?: string;
  customRate?: string;
  editable?: boolean;
  icon: IconName;
  label: string;
  onAmountChange?: (value: string) => void;
  onCustomRateChange?: (value: string) => void;
  onCurrencySelect: (optionId: string) => void;
  onQuickAmountSelect?: (value: string) => void;
  options: CurrencyOption[];
  quickAmounts?: string[];
  selectedOptionId: string;
  supportingHint?: string;
  supportingDetails?: ConversionDetail[];
  supportingFormula?: string;
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
  label,
  onAmountChange,
  onCustomRateChange,
  onCurrencySelect,
  onQuickAmountSelect,
  options,
  quickAmounts,
  selectedOptionId,
  supportingHint,
  supportingDetails,
  supportingFormula,
  symbol,
  showCustomRateInput = false,
}: SwapAmountBlockProps) {
  const safeAmount = amount ?? "";
  const safeCustomRate = customRate ?? "";

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
        <CurrencyPicker code={code} icon={icon} onSelect={onCurrencySelect} options={options} selectedOptionId={selectedOptionId} />

        <View style={styles.amountRow}>
          <AppText variant="title" style={styles.amountSymbol}>
            {symbol}
          </AppText>
          {editable ? (
            <UniTextInput
              value={safeAmount}
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
              <AnimatedAmountText containerStyle={styles.amountValueTextRow} style={[styles.amountValue, animatedAmountStyle]} text={safeAmount} />
              {copyText ? <CopyButton text={copyText} /> : null}
            </>
          )}
        </View>
      </View>

      {showCustomRateInput && onCustomRateChange ? (
        <View style={styles.customRateRow}>
          <AppText variant="tab" style={styles.customRateLabel} numberOfLines={1}>
            Tasa
          </AppText>
          <AppText variant="tab" style={styles.customRatePrefix}>
            Bs.
          </AppText>
          <UniTextInput
            value={safeCustomRate.replace(".", ",")}
            onChangeText={onCustomRateChange}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="0,00"
            style={styles.customRateInput}
            uniProps={(theme) => ({
              placeholderTextColor: theme.colors.textMuted,
              selectionColor: theme.colors.primary,
            })}
          />
        </View>
      ) : null}
      {editable && quickAmounts?.length && onQuickAmountSelect ? (
        <QuickAmountPills amount={safeAmount} onSelect={onQuickAmountSelect} values={quickAmounts} />
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
  customRateInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    padding: 0,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
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
