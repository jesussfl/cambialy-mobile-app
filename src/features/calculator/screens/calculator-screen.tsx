import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { CurrencyPicker } from "@/features/exchange/components/currency-picker";
import { currencyInfo, fallbackRates, RATE_ORDER, RATES_CACHE_TIME, RATES_STALE_TIME } from "@/features/exchange/constants";
import type { CurrencyOption } from "@/features/exchange/types";
import { formatCompactAmount, formatNumber, formatUpdatedAt, parseCurrencyAmount, sanitizeAmountInput } from "@/features/exchange/utils";

import { fetchExchangeRates, type ExchangeRateId } from "../api/rates-api";

type PriceCurrencyId = ExchangeRateId | "ves" | "custom";
type PriceSide = "first" | "second";

type PriceInputState = {
  amount: string;
  customRate: string;
  currencyId: PriceCurrencyId;
};

type ComparisonOption = {
  amount: number;
  currency: CurrencyOption;
  rate: number;
  valueInVes: number;
};

const priceCurrencyMeta: Record<PriceCurrencyId, CurrencyOption> = {
  ...currencyInfo,
  usdt: {
    id: "usdt",
    symbol: "$",
    name: "Divisa",
    code: "Divisa",
    icon: "copper-coin-line",
  },
  ves: {
    id: "ves",
    code: "VES",
    name: "Bolivares",
    symbol: "Bs.",
    icon: "bank-line",
  },
  bcv: {
    ...currencyInfo.bcv,
    name: "Dolares BCV",
  },
  eur: {
    ...currencyInfo.eur,
    name: "Euros",
  },
  custom: {
    id: "custom",
    code: "PERS",
    name: "Personalizado",
    symbol: "$",
    icon: "edit-2-line",
  },
};

const priceCurrencyOrder: PriceCurrencyId[] = ["ves", "usdt", "bcv", "eur", "custom"];

const UniTextInput = withUnistyles(TextInput);
const UniRemixIcon = withUnistyles(RemixIcon);

export function CalculatorScreen() {
  const [firstPrice, setFirstPrice] = useState<PriceInputState>({ amount: "1", customRate: "", currencyId: "usdt" });
  const [secondPrice, setSecondPrice] = useState<PriceInputState>({ amount: "", customRate: "", currencyId: "ves" });

  const ratesQuery = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });

  const rates = ratesQuery.data ?? fallbackRates;
  const sortedRates = useMemo(() => [...rates].sort((leftRate, rightRate) => RATE_ORDER[leftRate.id] - RATE_ORDER[rightRate.id]), [rates]);
  const ratesById = useMemo(() => new Map(sortedRates.map((rate) => [rate.id, rate])), [sortedRates]);
  const currencyOptions = useMemo(() => priceCurrencyOrder.map((currencyId) => priceCurrencyMeta[currencyId]), []);
  const latestUpdate = sortedRates.find((rate) => rate.updatedAt)?.updatedAt;
  const ratesError = ratesQuery.isError ? "No se pudieron cargar las tasas actualizadas." : null;

  const firstOption = getComparisonOption(firstPrice, ratesById);
  const secondOption = getComparisonOption(secondPrice, ratesById);
  const result = getComparisonResult(firstOption, secondOption);

  const handleAmountChange = (side: PriceSide, value: string) => {
    const sanitizedValue = sanitizeAmountInput(value);

    if (side === "first") {
      setFirstPrice((currentValue) => ({ ...currentValue, amount: sanitizedValue }));
      return;
    }

    setSecondPrice((currentValue) => ({ ...currentValue, amount: sanitizedValue }));
  };

  const handleCurrencySelect = (side: PriceSide, currencyId: string) => {
    if (side === "first") {
      setFirstPrice((currentValue) => ({ ...currentValue, currencyId: currencyId as PriceCurrencyId }));
      return;
    }

    setSecondPrice((currentValue) => ({ ...currentValue, currencyId: currencyId as PriceCurrencyId }));
  };

  const handleCustomRateChange = (side: PriceSide, value: string) => {
    const sanitizedValue = sanitizeAmountInput(value);

    if (side === "first") {
      setFirstPrice((currentValue) => ({ ...currentValue, customRate: sanitizedValue }));
      return;
    }

    setSecondPrice((currentValue) => ({ ...currentValue, customRate: sanitizedValue }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <AppText variant="cardTitle" style={styles.headerTitle}>
              Comparar precios
            </AppText>
            <AppText variant="tab" style={styles.headerSubtitle} numberOfLines={1}>
              {ratesQuery.isFetching ? "Actualizando tasas" : formatUpdatedAt(latestUpdate)}
            </AppText>
          </View>
          {/* <View style={styles.headerButton}>
            <View style={[styles.statusDot, ratesQuery.isFetching ? styles.statusDotLoading : null]} />
          </View> */}
        </View>

        <View style={styles.comparePanel}>
          <PriceComparisonBlock
            amount={firstPrice.amount}
            currency={priceCurrencyMeta[firstPrice.currencyId]}
            customRate={firstPrice.customRate}
            label="Precio A"
            onAmountChange={(value) => handleAmountChange("first", value)}
            onCustomRateChange={(value) => handleCustomRateChange("first", value)}
            onCurrencySelect={(currencyId) => handleCurrencySelect("first", currencyId)}
            options={currencyOptions}
            rate={firstOption.rate}
            selectedCurrencyId={firstPrice.currencyId}
            valueInVes={firstOption.valueInVes}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.compareIcon}>
              <UniRemixIcon
                name="arrow-left-right-line"
                size={22}
                uniProps={(theme: any) => ({
                  color: theme.colors.primaryText,
                })}
              />
            </View>
            <View style={styles.dividerLine} />
          </View>

          <PriceComparisonBlock
            amount={secondPrice.amount}
            currency={priceCurrencyMeta[secondPrice.currencyId]}
            customRate={secondPrice.customRate}
            label="Precio B"
            onAmountChange={(value) => handleAmountChange("second", value)}
            onCustomRateChange={(value) => handleCustomRateChange("second", value)}
            onCurrencySelect={(currencyId) => handleCurrencySelect("second", currencyId)}
            options={currencyOptions}
            rate={secondOption.rate}
            selectedCurrencyId={secondPrice.currencyId}
            valueInVes={secondOption.valueInVes}
          />
        </View>

        <ComparisonSummary firstOption={firstOption} secondOption={secondOption} result={result} />

        {ratesError ? (
          <AppText variant="tab" style={styles.errorText} numberOfLines={1}>
            {ratesError}
          </AppText>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function getComparisonOption(price: PriceInputState, ratesById: Map<ExchangeRateId, { value: number }>): ComparisonOption {
  const amount = parseCurrencyAmount(price.amount);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const customRate = parseCurrencyAmount(price.customRate);
  const safeCustomRate = Number.isFinite(customRate) && customRate > 0 ? customRate : 0;
  const rate = price.currencyId === "ves" ? 1 : price.currencyId === "custom" ? safeCustomRate : (ratesById.get(price.currencyId)?.value ?? 0);

  return {
    amount: safeAmount,
    currency: priceCurrencyMeta[price.currencyId],
    rate,
    valueInVes: safeAmount > 0 && rate > 0 ? safeAmount * rate : 0,
  };
}

function getComparisonResult(firstOption: ComparisonOption, secondOption: ComparisonOption) {
  if (firstOption.valueInVes <= 0 || secondOption.valueInVes <= 0) {
    return null;
  }

  const differenceVes = Math.abs(firstOption.valueInVes - secondOption.valueInVes);
  const isEquivalent = differenceVes < 0.01;
  const betterSide = isEquivalent ? null : firstOption.valueInVes < secondOption.valueInVes ? "first" : "second";
  const cheaperValue = betterSide === "first" ? firstOption.valueInVes : secondOption.valueInVes;
  const expensiveValue = betterSide === "first" ? secondOption.valueInVes : firstOption.valueInVes;
  const savingPercent = betterSide && expensiveValue > 0 ? (differenceVes / expensiveValue) * 100 : 0;

  return {
    betterSide,
    differenceVes,
    isEquivalent,
    savingPercent,
    cheaperValue,
  };
}

type PriceComparisonBlockProps = {
  amount: string;
  currency: CurrencyOption;
  customRate: string;
  label: string;
  onAmountChange: (value: string) => void;
  onCustomRateChange: (value: string) => void;
  onCurrencySelect: (currencyId: string) => void;
  options: CurrencyOption[];
  rate: number;
  selectedCurrencyId: PriceCurrencyId;
  valueInVes: number;
};

function PriceComparisonBlock({
  amount,
  currency,
  customRate,
  label,
  onAmountChange,
  onCustomRateChange,
  onCurrencySelect,
  options,
  rate,
  selectedCurrencyId,
  valueInVes,
}: PriceComparisonBlockProps) {
  const isCustomRate = selectedCurrencyId === "custom";
  const rateText = selectedCurrencyId === "ves" ? "Precio directo en bolivares" : `1 ${currency.code} equivale Bs. ${formatNumber(rate)}`;
  const amountPlaceholder = selectedCurrencyId === "ves" ? "0,00" : "0";

  return (
    <View style={styles.priceBlock}>
      <View style={styles.priceTopRow}>
        <View style={styles.priceValueGroup}>
          <AppText variant="tab" style={styles.blockLabel}>
            {label}
          </AppText>
          <View style={styles.amountRow}>
            <AppText variant="title" style={styles.amountSymbol}>
              {currency.symbol}
            </AppText>
            <UniTextInput
              value={amount.replace(".", ",")}
              onChangeText={onAmountChange}
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={amountPlaceholder}
              style={styles.amountInput}
              uniProps={(theme) => ({
                placeholderTextColor: theme.colors.textMuted,
                selectionColor: theme.colors.primary,
              })}
            />
          </View>
        </View>

        <CurrencyPicker code={currency.code} icon={currency.icon} onSelect={onCurrencySelect} options={options} selectedOptionId={selectedCurrencyId} />
      </View>

      <View style={styles.priceFooter}>
        <AppText variant="tab" style={styles.rateHint} numberOfLines={1}>
          {rate > 0 ? rateText : isCustomRate ? "Ingresa la tasa personalizada" : "Tasa no disponible"}
        </AppText>
        <AppText variant="tab" style={styles.vesValue} numberOfLines={1}>
          Bs. {formatCompactAmount(valueInVes)}
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
          <UniTextInput
            value={customRate.replace(".", ",")}
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
    </View>
  );
}

type ComparisonSummaryProps = {
  firstOption: ComparisonOption;
  secondOption: ComparisonOption;
  result: ReturnType<typeof getComparisonResult>;
};

function ComparisonSummary({ firstOption, secondOption, result }: ComparisonSummaryProps) {
  const hasValues = firstOption.valueInVes > 0 || secondOption.valueInVes > 0;
  const winnerLabel = result?.isEquivalent ? "Precios equivalentes" : result?.betterSide === "first" ? "Precio A conviene mas" : "Precio B conviene mas";

  return (
    <Card elevated style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTitleGroup}>
          <AppText variant="tab" style={styles.summaryEyebrow}>
            Resultado
          </AppText>
          <AppText variant="cardTitle" style={styles.summaryTitle}>
            {result ? winnerLabel : "Ingresa ambos precios"}
          </AppText>
        </View>
        <View style={styles.summaryBadge}>
          <UniRemixIcon
            name={result?.isEquivalent ? "equal-line" : "price-tag-3-line"}
            size={18}
            uniProps={(theme: any) => ({
              color: theme.colors.accentText,
            })}
          />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryMetric label="Precio A en Bs." value={`Bs. ${formatCompactAmount(firstOption.valueInVes)}`} isActive={result?.betterSide === "first"} />
        <SummaryMetric label="Precio B en Bs." value={`Bs. ${formatCompactAmount(secondOption.valueInVes)}`} isActive={result?.betterSide === "second"} />
      </View>

      <View style={styles.differenceBox}>
        <AppText variant="label">Diferencia</AppText>
        <AppText variant="title" style={styles.differenceValue} numberOfLines={1}>
          {result ? `Bs. ${formatCompactAmount(result.differenceVes)}` : "Bs. 0"}
        </AppText>
        <AppText variant="body">
          {result
            ? result.isEquivalent
              ? "Ambos precios tienen el mismo costo en bolivares."
              : `Ahorras ${formatNumber(result.savingPercent)}% frente a la opcion mas cara.`
            : hasValues
              ? "Falta completar uno de los precios para comparar."
              : "Compara precios usando VES, BCV, Divisa (USDT), EUR o una tasa personalizada."}
        </AppText>
      </View>
    </Card>
  );
}

type SummaryMetricProps = {
  isActive: boolean;
  label: string;
  value: string;
};

function SummaryMetric({ isActive, label, value }: SummaryMetricProps) {
  return (
    <View style={[styles.summaryMetric, isActive ? styles.summaryMetricActive : null]}>
      <AppText variant="tab" style={styles.summaryMetricLabel}>
        {label}
      </AppText>
      <AppText variant="value" style={styles.summaryMetricValue} numberOfLines={1}>
        {value}
      </AppText>
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
    gap: theme.spacing.xxs,
  },
  headerTitle: {},
  headerSubtitle: {
    color: theme.colors.textMuted,
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
  comparePanel: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  priceBlock: {
    minHeight: 142,
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
  priceFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  rateHint: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.textMuted,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
  compareIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.card,
  },
  summaryCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  summaryTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  summaryEyebrow: {
    color: theme.colors.textMuted,
  },
  summaryTitle: {
    flexShrink: 1,
  },
  summaryBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  summaryGrid: {
    gap: theme.spacing.sm,
  },
  summaryMetric: {
    gap: theme.spacing.xxs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  summaryMetricActive: {
    borderColor: theme.colors.accent,
  },
  summaryMetricLabel: {
    color: theme.colors.textMuted,
  },
  summaryMetricValue: {
    fontSize: theme.typography.fontSize.md,
  },
  differenceBox: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundAccent,
  },
  differenceValue: {
    color: theme.colors.textPrimary,
  },
  rateList: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  rateRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  rateMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  rateIcon: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
  },
  rateLabel: {
    color: theme.colors.textSecondary,
  },
  rateValue: {
    maxWidth: "58%",
    color: theme.colors.textPrimary,
    textAlign: "right",
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
}));
