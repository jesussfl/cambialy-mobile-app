import { useQuery } from "@tanstack/react-query";
import { Popover } from "heroui-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { fetchExchangeRates, type ExchangeRate, type ExchangeRateId } from "@/features/calculator/api/rates-api";
const fallbackRates: ExchangeRate[] = [
  {
    id: "usdt",
    label: "Binance USDT",
    value: 0,
    icon: "copper-coin-line",
  },
  {
    id: "bcv",
    label: "BCV USD",
    value: 0,
    icon: "money-dollar-circle-line",
  },
  {
    id: "eur",
    label: "EUR BCV",
    value: 0,
    icon: "money-euro-circle-line",
  },
];

type CurrencyOption = {
  code: string;
  icon: IconName;
  id: string;
  name: string;
  symbol: string;
};

type TargetCurrencyId = "ves" | "bcv";

const currencyMeta: Record<ExchangeRateId, CurrencyOption> = {
  usdt: {
    id: "usdt",
    code: "USDT",
    name: "Binance",
    symbol: "$",
    icon: "copper-coin-line",
  },
  bcv: {
    id: "bcv",
    code: "BCV",
    name: "Dólar BCV",
    symbol: "$",
    icon: "money-dollar-circle-line",
  },
  eur: {
    id: "eur",
    code: "EUR",
    name: "Euro",
    symbol: "€",
    icon: "money-euro-circle-line",
  },
};

const targetCurrencyMeta: Record<TargetCurrencyId, CurrencyOption> = {
  ves: {
    id: "ves",
    code: "VES",
    name: "Bolívares",
    symbol: "Bs.",
    icon: "bank-line",
  },
  bcv: {
    id: "bcv",
    code: "BCV",
    name: "Dólar BCV",
    symbol: "$",
    icon: "money-dollar-circle-line",
  },
};

const RATES_CACHE_TIME = 1000 * 60 * 10;
const RATES_STALE_TIME = 1000 * 60 * 5;
const QUICK_AMOUNTS = ["5", "10", "15", "20", "30", "50", "100"];
const AMOUNT_FONT_SIZE = 34;
const MIN_AMOUNT_FONT_SIZE = 25;

const UniRemixIcon = withUnistyles(RemixIcon);
const UniTextInput = withUnistyles(TextInput);

const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.includes(",") && trimmedValue.includes(".") ? trimmedValue.replace(/,/g, "") : trimmedValue.replace(",", ".");

  return Number(normalizedValue);
};

const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

const formatCompactAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatRate = (value: number) => (value > 0 ? `${formatNumber(value)} Bs.` : "Sin datos");

const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return "Actualizacion pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Actualizacion pendiente";
  }

  return `Actualizado ${new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
};

const getDisplayAmount = (amount: string) => {
  if (!amount) {
    return "";
  }

  return amount.replace(".", ",");
};

const sanitizeAmountInput = (value: string) => {
  const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [wholePart = "", ...decimalParts] = normalizedValue.split(".");
  const decimals = decimalParts.join("").slice(0, 2);
  const trimmedWholePart = wholePart.replace(/^0+(?=\d)/, "").slice(0, 9);

  if (normalizedValue.includes(".")) {
    return `${trimmedWholePart || "0"}.${decimals}`;
  }

  return trimmedWholePart;
};

export default function ExchangeScreen() {
  const [amount, setAmount] = useState("1");
  const [selectedRateId, setSelectedRateId] = useState<ExchangeRateId>("usdt");
  const [targetCurrencyId, setTargetCurrencyId] = useState<TargetCurrencyId>("ves");

  const ratesQuery = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });

  const rates = ratesQuery.data ?? fallbackRates;
  const sortedRates = useMemo(
    () =>
      [...rates].sort((leftRate, rightRate) => {
        const order: Record<ExchangeRateId, number> = { usdt: 0, bcv: 1, eur: 2 };

        return order[leftRate.id] - order[rightRate.id];
      }),
    [rates],
  );
  const selectedRate = sortedRates.find((rate) => rate.id === selectedRateId) ?? sortedRates[0] ?? fallbackRates[0];
  const selectedMeta = currencyMeta[selectedRate.id];
  const targetMeta = targetCurrencyMeta[targetCurrencyId];
  const bcvRate = sortedRates.find((rate) => rate.id === "bcv")?.value ?? fallbackRates.find((rate) => rate.id === "bcv")?.value ?? 0;
  const parsedAmount = parseCurrencyAmount(amount);
  const safeAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const convertedAmount =
    selectedRate.value > 0 ? (targetCurrencyId === "ves" ? safeAmount * selectedRate.value : bcvRate > 0 ? (safeAmount * selectedRate.value) / bcvRate : 0) : 0;
  const targetRateValue = targetCurrencyId === "ves" ? selectedRate.value : bcvRate > 0 ? selectedRate.value / bcvRate : 0;
  const ratesError = ratesQuery.isError ? "No se pudieron cargar las tasas actualizadas." : null;

  const handleChangeAmount = (value: string) => {
    setAmount(sanitizeAmountInput(value));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <UniRemixIcon
              name="exchange-2-line"
              size={22}
              uniProps={(theme: any) => ({
                color: theme.colors.primary,
              })}
            />
          </View>
          <View style={styles.headerTitleGroup}>
            <AppText variant="cardTitle" style={styles.headerTitle}>
              Intercambio
            </AppText>
            <AppText variant="tab" style={styles.headerSubtitle}>
              {ratesQuery.isFetching ? "Actualizando tasas" : "Tasas en vivo"}
            </AppText>
          </View>
          <View style={styles.headerButton}>
            <View style={[styles.statusDot, ratesQuery.isFetching ? styles.statusDotLoading : null]} />
          </View>
        </View>

        <View style={styles.swapPanel}>
          <SwapAmountBlock
            amount={getDisplayAmount(amount)}
            code={selectedMeta.code}
            editable
            icon={selectedRate.icon}
            label="Monto"
            name={selectedMeta.name}
            onAmountChange={handleChangeAmount}
            onCurrencySelect={(optionId) => setSelectedRateId(optionId as ExchangeRateId)}
            onQuickAmountSelect={setAmount}
            options={sortedRates.map((rate) => currencyMeta[rate.id])}
            quickAmounts={QUICK_AMOUNTS}
            selectedOptionId={selectedRate.id}
            sideValue={`${safeAmount > 0 ? formatCompactAmount(safeAmount) : "0"} ${selectedMeta.code}`}
            symbol={selectedMeta.symbol}
          />

          <View style={styles.swapDividerRow}>
            <View style={styles.dividerLine} />
            <Pressable
              accessibilityRole="button"
              onPress={() => setTargetCurrencyId((currentValue) => (currentValue === "ves" ? "bcv" : "ves"))}
              style={styles.swapButton}
            >
              <UniRemixIcon
                name="arrow-up-down-line"
                size={22}
                uniProps={(theme: any) => ({
                  color: theme.colors.primaryText,
                })}
              />
            </Pressable>
            <View style={styles.dividerLine} />
          </View>

          <SwapAmountBlock
            amount={formatCompactAmount(convertedAmount)}
            code={targetMeta.code}
            icon={targetMeta.icon}
            label="Cambio estimado"
            name={targetMeta.name}
            onCurrencySelect={(optionId) => setTargetCurrencyId(optionId as TargetCurrencyId)}
            options={Object.values(targetCurrencyMeta)}
            selectedOptionId={targetCurrencyId}
            sideValue={
              targetRateValue > 0
                ? `1 ${selectedMeta.code} = ${targetCurrencyId === "ves" ? formatRate(targetRateValue) : `${formatNumber(targetRateValue)} BCV`}`
                : "Tasa no disponible"
            }
            symbol={targetMeta.symbol}
          />
        </View>

        <View style={styles.rateMeta}>
          <AppText variant="tab" style={styles.rateMetaText} numberOfLines={1}>
            {selectedRate.label} · {formatUpdatedAt(selectedRate.updatedAt)}
          </AppText>
          {ratesError ? (
            <AppText variant="tab" style={styles.errorText} numberOfLines={1}>
              {ratesError}
            </AppText>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SwapAmountBlockProps = {
  amount: string;
  code: string;
  editable?: boolean;
  icon: IconName;
  label: string;
  name: string;
  onAmountChange?: (value: string) => void;
  onCurrencySelect: (optionId: string) => void;
  onQuickAmountSelect?: (value: string) => void;
  options: CurrencyOption[];
  quickAmounts?: string[];
  selectedOptionId: string;
  sideValue: string;
  symbol: string;
};

function SwapAmountBlock({
  amount,
  code,
  editable = false,
  icon,
  label,
  name,
  onAmountChange,
  onCurrencySelect,
  onQuickAmountSelect,
  options,
  quickAmounts,
  selectedOptionId,
  sideValue,
  symbol,
}: SwapAmountBlockProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const amountFontSize = useDerivedValue(() => {
    const compactLength = amount.replace(/[^\d]/g, "").length;
    const nextFontSize = compactLength <= 5 ? AMOUNT_FONT_SIZE : Math.max(MIN_AMOUNT_FONT_SIZE, AMOUNT_FONT_SIZE - (compactLength - 5) * 2);

    return withTiming(nextFontSize, { duration: 160 });
  }, [amount]);
  const animatedAmountStyle = useAnimatedStyle(() => ({
    fontSize: amountFontSize.value,
    lineHeight: amountFontSize.value + 6,
  }));

  const handleSelectOption = (optionId: string) => {
    onCurrencySelect(optionId);
    setIsPickerOpen(false);
  };

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
              <Animated.Text style={[styles.amountValue, animatedAmountStyle]} numberOfLines={1}>
                {amount}
              </Animated.Text>
            )}
          </View>
        </View>

        <Popover isOpen={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <Popover.Trigger asChild>
            <Pressable accessibilityRole="button" style={styles.currencyPill}>
              <View style={styles.currencyIcon}>
                <UniRemixIcon
                  name={icon}
                  size={18}
                  uniProps={(theme: any) => ({
                    color: theme.colors.primary,
                  })}
                />
              </View>
              <AppText variant="button" numberOfLines={1}>
                {code}
              </AppText>
              <UniRemixIcon
                name="arrow-down-s-line"
                size={18}
                uniProps={(theme: any) => ({
                  color: theme.colors.textSecondary,
                })}
              />
            </Pressable>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Overlay />
            <Popover.Content presentation="popover" placement="bottom" align="end" width={220} style={styles.currencyPopover}>
              {options.map((option) => {
                const isSelected = option.id === selectedOptionId;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option.id}
                    onPress={() => handleSelectOption(option.id)}
                    style={[styles.currencyOption, isSelected ? styles.currencyOptionSelected : null]}
                  >
                    <View style={styles.currencyIcon}>
                      <UniRemixIcon
                        name={option.icon}
                        size={18}
                        uniProps={(theme: any) => ({
                          color: theme.colors.primary,
                        })}
                      />
                    </View>
                    <View style={styles.currencyOptionText}>
                      <AppText variant="button" numberOfLines={1}>
                        {option.code}
                      </AppText>
                      <AppText variant="tab" style={styles.currencyOptionName} numberOfLines={1}>
                        {option.name}
                      </AppText>
                    </View>
                    {isSelected ? (
                      <UniRemixIcon
                        name="check-line"
                        size={18}
                        uniProps={(theme: any) => ({
                          color: theme.colors.primary,
                        })}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </View>

      {editable && quickAmounts?.length && onQuickAmountSelect ? (
        <View style={styles.quickAmountList}>
          {quickAmounts.map((quickAmount) => {
            const isSelected = amount === quickAmount;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={isSelected ? { selected: true } : undefined}
                key={quickAmount}
                onPress={() => onQuickAmountSelect(quickAmount)}
                style={[styles.quickAmountPill, isSelected ? styles.quickAmountPillSelected : null]}
              >
                <AppText variant="tab" style={isSelected ? styles.quickAmountTextSelected : styles.quickAmountText}>
                  {quickAmount}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.amountFooterRow}>
        <AppText variant="body" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="body" style={styles.amountSideValue} numberOfLines={1}>
          {sideValue}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["3xl"],
    gap: theme.spacing.lg,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xxs,
  },
  headerTitle: {
    textAlign: "center",
  },
  headerSubtitle: {
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  statusDotLoading: {
    opacity: 0.45,
  },
  swapPanel: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
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
    flex: 1,
    minWidth: 0,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: AMOUNT_FONT_SIZE,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: AMOUNT_FONT_SIZE + 6,
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
  currencyPill: {
    maxWidth: 116,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  currencyIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
  },
  currencyPopover: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    ...theme.shadows.card,
  },
  currencyOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  currencyOptionSelected: {
    backgroundColor: theme.colors.secondarySurface,
  },
  currencyOptionText: {
    flex: 1,
    minWidth: 0,
  },
  currencyOptionName: {
    color: theme.colors.textMuted,
  },
  quickAmountList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  quickAmountPill: {
    minWidth: 44,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  quickAmountPillSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickAmountText: {
    color: theme.colors.textSecondary,
  },
  quickAmountTextSelected: {
    color: theme.colors.primaryText,
  },
  amountFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  amountSideValue: {
    maxWidth: "58%",
    color: theme.colors.textSecondary,
    textAlign: "right",
  },
  swapDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
  swapButton: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.card,
  },
  rateMeta: {
    minHeight: 22,
    gap: theme.spacing.xxs,
  },
  rateMetaText: {
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
}));
