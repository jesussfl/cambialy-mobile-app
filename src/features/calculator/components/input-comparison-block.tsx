import { ScrollView, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { TouchZone } from "@/components/ui/button";
import { AMOUNT_PRECISION, RATE_PRECISION } from "@/features/amount-input/model/constants";
import { useAmountSheet } from "@/features/amount-input/hooks/use-amount-sheet";
import { useKeypadFields } from "@/features/amount-input/hooks/use-keypad-fields";
import { AmountKeypadSheet } from "@/features/exchange/components/amount-keypad-sheet";
import { CurrencyPicker } from "@/features/exchange/components/currency-picker";
import { formatCompactAmount } from "@/features/exchange/utils";
import { useSettingsStore } from "@/features/settings/context/settings-context";

import type { InputComparisonBlockProps, PriceKeypadFieldId } from "../types";

const UniAppText = withUnistyles(AppText);

/** Amounts settle at two decimals; a user-supplied rate keeps four. */
const KEYPAD_FIELDS = {
  amount: { precision: AMOUNT_PRECISION },
  customRate: { precision: RATE_PRECISION },
} as const;

export function InputComparisonBlock({
  label,
  currency,
  options,
  selectedCurrencyId,
  onCurrencySelect,
  drafts,
  onDraftChange,
  rate,
}: InputComparisonBlockProps) {
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);
  const isCustomRate = selectedCurrencyId === "custom";
  const sheetName = `calculator-keypad-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const sheet = useAmountSheet(sheetName);

  const { activeField, setActiveField, display, expressionPreview, placeholder, handlers } = useKeypadFields<PriceKeypadFieldId>({
    fields: KEYPAD_FIELDS,
    drafts,
    setDraft: onDraftChange,
    initialField: "amount",
  });

  const openField = (field: PriceKeypadFieldId) => {
    void sheet.open(() => setActiveField(field));
  };

  return (
    <View style={styles.blockContainer}>
      <View style={styles.headerRow}>
        <CurrencyPicker
          code={currency.code}
          icon={currency.icon}
          onSelect={onCurrencySelect}
          options={options}
          selectedOptionId={selectedCurrencyId}
        />
        {rate > 0 ? (
          <AppText variant="tab" style={styles.vesValue} numberOfLines={1}>
            Bs. {formatCompactAmount(rate, decimalSeparator)}
          </AppText>
        ) : null}
      </View>

      <View style={styles.amountSection}>
        {expressionPreview ? (
          <AppText variant="label" style={styles.expressionPreview}>
            {expressionPreview}
          </AppText>
        ) : null}
        <TouchZone accessibilityRole="button" hitSlop={12} style={styles.amountInputPanel} onPress={() => openField("amount")}>
          <View style={styles.amountDisplayContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amountPreviewScroll}>
              <UniAppText variant="body" style={styles.amountPreview}>
                {`${currency.symbol} ${display.amount || placeholder}`}
              </UniAppText>
            </ScrollView>
          </View>
        </TouchZone>
      </View>

      {isCustomRate ? (
        <View style={styles.customRateRow}>
          <AppText variant="tab" style={styles.customRateLabel} numberOfLines={1}>
            Tasa
          </AppText>
          <AppText variant="tab" style={styles.customRatePrefix}>
            Bs.
          </AppText>
          <TouchZone accessibilityRole="button" hitSlop={8} style={styles.customRatePressable} onPress={() => openField("customRate")}>
            <AppText variant="body" style={styles.customRateDisplay}>
              {display.customRate || placeholder}
            </AppText>
          </TouchZone>
        </View>
      ) : null}

      <AmountKeypadSheet
        name={sheetName}
        title={activeField === "customRate" ? "Editar tasa" : "Ingresar monto"}
        showFieldSwitch={isCustomRate}
        activeField={activeField}
        onFieldChange={setActiveField}
        onKeyPress={handlers.onKeyPress}
        onDelete={handlers.onDelete}
        onClear={handlers.onClear}
        onOperatorPress={handlers.onOperatorPress}
        onEvaluate={handlers.onEvaluate}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  blockContainer: {
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  vesValue: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: "right",
  },
  amountSection: {
    gap: 2,
  },
  amountInputPanel: {
    minHeight: 44,
    justifyContent: "center",
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
