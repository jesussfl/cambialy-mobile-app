import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { UniRemixIcon } from "@/components/ui/icon";
import { fallbackRates, RATES_CACHE_TIME, RATES_STALE_TIME, RATE_ORDER } from "@/features/exchange/constants";
import { sanitizeAmountInput } from "@/features/exchange/utils";

import { fetchExchangeRates } from "../api/rates-api";
import { ComparisonSummary } from "../components/comparison-summary";
import { PriceComparisonBlock } from "../components/price-comparison-block";
import { priceCurrencyMeta, priceCurrencyOrder } from "../constants";
import type { PriceCurrencyId, PriceInputState, PriceSide } from "../types";
import { getComparisonOption, getComparisonResult } from "../utils";

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
  const sortedRates = [...rates].sort((a, b) => RATE_ORDER[a.id] - RATE_ORDER[b.id]);
  const ratesById = new Map(sortedRates.map((rate) => [rate.id, rate]));
  const currencyOptions = priceCurrencyOrder.map((id) => priceCurrencyMeta[id]);
  const ratesError = ratesQuery.isError ? "No se pudieron cargar las tasas actualizadas." : null;

  const firstOption = getComparisonOption(firstPrice, ratesById);
  const secondOption = getComparisonOption(secondPrice, ratesById);
  const result = getComparisonResult(firstOption, secondOption);

  const handleAmountChange = (side: PriceSide, value: string) => {
    const sanitizedValue = sanitizeAmountInput(value);
    const setter = side === "first" ? setFirstPrice : setSecondPrice;
    setter((prev) => ({ ...prev, amount: sanitizedValue }));
  };

  const handleCustomRateChange = (side: PriceSide, value: string) => {
    const sanitizedValue = sanitizeAmountInput(value);
    const setter = side === "first" ? setFirstPrice : setSecondPrice;
    setter((prev) => ({ ...prev, customRate: sanitizedValue }));
  };

  const handleCurrencySelect = (side: PriceSide, currencyId: string) => {
    const setter = side === "first" ? setFirstPrice : setSecondPrice;
    setter((prev) => ({ ...prev, currencyId: currencyId as PriceCurrencyId }));
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="cardTitle" style={styles.headerTitle}>
          Compara precios
        </AppText>
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
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: rt.insets.top,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  headerTitle: {},
  comparePanel: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
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
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
}));
