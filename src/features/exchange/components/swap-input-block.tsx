import { TouchZone } from "@/components/ui/button";
import { Popover } from "heroui-native";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import type { AppTheme } from "@/theme/themes";

import { AMOUNT_PRECISION, RATE_PRECISION } from "@/features/amount-input/model/constants";
import type { AmountDraft } from "@/features/amount-input/model/types";
import { useAmountSheet } from "@/features/amount-input/hooks/use-amount-sheet";
import { useKeypadFields } from "@/features/amount-input/hooks/use-keypad-fields";

import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { useExchangeStore } from "../store/exchange-store";
import { AmountKeypadSheet } from "./amount-keypad-sheet";
import { CurrencyPicker } from "./currency-picker";
import { QuickAmountPills } from "./quick-amount-pills";

import { usePasteAmount } from "../hooks/use-paste-amount";

const UniAppText = withUnistyles(AppText);
const UniRemixIcon = withUnistyles(RemixIcon);
const UniPopoverContent = withUnistyles(Popover.Content);

const SHEET_NAME = "amount-keypad-sheet";

/** Amounts settle at two decimals; a user-supplied rate keeps four. */
const KEYPAD_FIELDS = {
  amount: { precision: AMOUNT_PRECISION },
  customRate: { precision: RATE_PRECISION },
} as const;

type KeypadFieldId = keyof typeof KEYPAD_FIELDS;

export function SwapInputBlock() {
  const selectedBaseRateId = useExchangeStore((s) => s.selectedBaseRateId);
  const customRateValue = useExchangeStore((s) => s.customRateValue);

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);
  const { handlePaste } = usePasteAmount();

  const baseRateOptions = rates.map((rate) => rate.info);

  const {
    inputAmount,
    amountDraft,
    customRateDraft,
    setAmountDraft,
    setCustomRateDraft,
    inputCurrency,
    handleQuickAmountSelect,
    handleInputCurrencySelect,
    inputOptions,
    quickAmounts,
    inputSelectedOptionId,
  } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const setDraft = (field: KeypadFieldId, next: AmountDraft) => {
    if (field === "amount") {
      setAmountDraft(next);
      return;
    }
    setCustomRateDraft(next);
  };

  const { activeField, setActiveField, display, expressionPreview, placeholder, handlers } = useKeypadFields<KeypadFieldId>({
    fields: KEYPAD_FIELDS,
    drafts: { amount: amountDraft, customRate: customRateDraft },
    setDraft,
    initialField: "amount",
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isLongPressRef = useRef(false);
  const sheet = useAmountSheet(SHEET_NAME);

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
    void sheet.open();
  };

  const handleLongPress = () => {
    isLongPressRef.current = true;
    setIsPopoverOpen(true);
  };

  const displayValue = display[activeField] || placeholder;

  return (
    <View style={styles.amountBlock}>
      <View style={styles.amountTopRow}>
        <View style={styles.amountRow}>
          {expressionPreview ? (
            <AppText variant="label" style={styles.expressionPreview}>
              {expressionPreview}
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
                    uniProps={(theme: AppTheme) => ({
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
            name={SHEET_NAME}
            title={activeField === "customRate" ? "Editar tasa" : "Ingresar monto"}
            showFieldSwitch={inputSelectedOptionId === "custom"}
            activeField={activeField}
            onFieldChange={setActiveField}
            onKeyPress={handlers.onKeyPress}
            onDelete={handlers.onDelete}
            onClear={handlers.onClear}
            onPaste={handlePaste}
            onOperatorPress={handlers.onOperatorPress}
            onEvaluate={handlers.onEvaluate}
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

      {quickAmounts.length ? <QuickAmountPills amount={inputAmount} onSelect={handleQuickAmountSelect} values={quickAmounts} /> : null}
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
