import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { TopNavbar } from "@/components/ui/top-navbar";
import { UniRemixIcon } from "@/components/ui/icon";
import { toNumber } from "@/features/amount-input/model/amount-draft";
import { AMOUNT_PRECISION, RATE_PRECISION } from "@/features/amount-input/model/constants";
import { EMPTY_DRAFT, type AmountDraft, type KeypadConfig } from "@/features/amount-input/model/types";
import { fallbackRates, RATES_CACHE_TIME, RATES_STALE_TIME, RATE_ORDER } from "@/features/exchange/constants";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import type { AppTheme } from "@/theme/themes";

import { fetchExchangeRates } from "../api/rates-api";
import { ComparisonSummary } from "../components/comparison-summary";
import { InputComparisonBlock } from "../components/input-comparison-block";
import { PRICE_SIDES, priceCurrencyMeta, priceCurrencyOrder, type PriceSideId } from "../constants";
import type { PriceCurrencyId, PriceInputState, PriceKeypadFieldId } from "../types";
import { getComparisonOption, getComparisonResult } from "../utils";

type PricesState = Record<PriceSideId, PriceInputState>;

const initialPrices = (): PricesState =>
  Object.fromEntries(
    PRICE_SIDES.map((side) => [side.id, { amount: EMPTY_DRAFT, customRate: EMPTY_DRAFT, currencyId: side.defaultCurrencyId }]),
  ) as PricesState;

export function PriceComparisonScreen() {
  const [prices, setPrices] = useState<PricesState>(initialPrices);

  const mode = useSettingsStore((s) => s.amountInputMode);
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);

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

  // Read each draft once, here, under the user's active entry mode — the amounts the blocks display and
  // the amounts the comparison uses are the same numbers, by construction.
  const amountConfig: KeypadConfig = { mode, decimalSeparator, precision: AMOUNT_PRECISION };
  const rateConfig: KeypadConfig = { mode, decimalSeparator, precision: RATE_PRECISION };

  const optionsBySide = Object.fromEntries(
    PRICE_SIDES.map((side) => {
      const price = prices[side.id];
      return [
        side.id,
        getComparisonOption(
          {
            amount: toNumber(price.amount, amountConfig) ?? 0,
            customRate: toNumber(price.customRate, rateConfig) ?? 0,
            currencyId: price.currencyId,
          },
          ratesById,
        ),
      ];
    }),
  ) as Record<PriceSideId, ReturnType<typeof getComparisonOption>>;

  const [firstSide, secondSide] = PRICE_SIDES;
  const result = getComparisonResult(optionsBySide[firstSide.id], optionsBySide[secondSide.id]);

  const handleDraftChange = (sideId: PriceSideId, field: PriceKeypadFieldId, next: AmountDraft) => {
    setPrices((prev) => ({ ...prev, [sideId]: { ...prev[sideId], [field]: next } }));
  };

  const handleCurrencySelect = (sideId: PriceSideId, currencyId: string) => {
    setPrices((prev) => ({ ...prev, [sideId]: { ...prev[sideId], currencyId: currencyId as PriceCurrencyId } }));
  };

  return (
    <View style={styles.screenContent}>
      <TopNavbar title="Compara precios" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.comparePanel}>
          {PRICE_SIDES.map((side, index) => (
            <Fragment key={side.id}>
              {index > 0 ? (
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <View style={styles.compareIcon}>
                    <UniRemixIcon
                      name="arrow-left-right-line"
                      size={22}
                      uniProps={(theme: AppTheme) => ({
                        color: theme.colors.primaryText,
                      })}
                    />
                  </View>
                  <View style={styles.dividerLine} />
                </View>
              ) : null}

              <InputComparisonBlock
                label={side.label}
                currency={priceCurrencyMeta[prices[side.id].currencyId]}
                options={currencyOptions}
                selectedCurrencyId={prices[side.id].currencyId}
                onCurrencySelect={(currencyId) => handleCurrencySelect(side.id, currencyId)}
                drafts={{ amount: prices[side.id].amount, customRate: prices[side.id].customRate }}
                onDraftChange={(field, next) => handleDraftChange(side.id, field, next)}
                rate={optionsBySide[side.id].rate}
              />
            </Fragment>
          ))}
        </View>

        <ComparisonSummary firstOption={optionsBySide[firstSide.id]} secondOption={optionsBySide[secondSide.id]} result={result} />

        {ratesError ? (
          <AppText variant="tab" style={styles.errorText} numberOfLines={1}>
            {ratesError}
          </AppText>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  screenContent: {
    paddingTop: rt.insets.top,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
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
