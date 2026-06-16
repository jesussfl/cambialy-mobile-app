import { useQueries } from "@tanstack/react-query";

import { exchangeQueries } from "@/api/queries/exchange.queries";
import { currencyInfo, CUSTOM_RATE_ID, customCurrencyInfo, fallbackRates, RATE_ORDER, RATES_CACHE_TIME, RATES_STALE_TIME } from "@/features/exchange/constants";
import type { ExchangeRate } from "@/models/exchange.models";

import type { BaseRate, BaseRateId } from "./exchange-screen.types";

export function useExchangeRates(customRateValue: number) {
  return useQueries({
    queries: [
      {
        ...exchangeQueries.getBCVRates,
        staleTime: RATES_STALE_TIME,
        gcTime: RATES_CACHE_TIME,
      },
      {
        ...exchangeQueries.getBinanceUSDT,
        staleTime: RATES_STALE_TIME,
        gcTime: RATES_CACHE_TIME,
      },
    ],
    combine: (results) => {
      const [bcvRatesQuery, binanceRateQuery] = results;
      const bcvRates = bcvRatesQuery.data ?? [];
      const binanceRates = binanceRateQuery.data ? [binanceRateQuery.data] : [];
      const rates = [...bcvRates, ...binanceRates];
      const ratesWithFallback = mergeWithFallbackRates(rates);
      const sortedRates = [...ratesWithFallback].sort((leftRate, rightRate) => RATE_ORDER[leftRate.id] - RATE_ORDER[rightRate.id]);
      const baseRates: BaseRate[] = sortedRates.map((rate) => ({
        ...rate,
        info: currencyInfo[rate.id],
      }));
      const customBaseRate: BaseRate = {
        id: CUSTOM_RATE_ID,
        label: "Tasa personalizada",
        value: customRateValue,
        icon: customCurrencyInfo.icon,
        info: customCurrencyInfo,
      };
      const allRates = [...baseRates, customBaseRate];
      const ratesById = allRates.reduce(
        (ratesIndex, rate) => ({
          ...ratesIndex,
          [rate.id]: rate,
        }),
        {} as Record<BaseRateId, BaseRate>,
      );

      return {
        rates: allRates,
        ratesById,
        isFetching: results.some((query) => query.isFetching),
        errorMessage: results.some((query) => query.isError) ? "No se pudieron cargar las tasas actualizadas." : null,
      };
    },
  });
}

function mergeWithFallbackRates(liveRates: ExchangeRate[]) {
  if (!liveRates.length) {
    return fallbackRates;
  }

  return fallbackRates.map((fallbackRate) => liveRates.find((liveRate) => liveRate.id === fallbackRate.id) ?? fallbackRate);
}
