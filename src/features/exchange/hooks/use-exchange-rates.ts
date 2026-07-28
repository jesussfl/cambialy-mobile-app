import { useQueries } from "@tanstack/react-query";

import { exchangeQueries } from "@/api/queries/exchange.queries";
import { currencyInfo, fallbackRates, RATE_ORDER, RATES_CACHE_TIME, RATES_STALE_TIME } from "@/features/exchange/constants";
import type { ExchangeRate } from "@/models/exchange.models";

import type { BaseRate } from "./exchange-screen.types";

import { useSelectedDate } from "@/features/exchange/context/exchange-context";

export function useExchangeRates() {
  const selectedDate = useSelectedDate();

  return useQueries({
    queries: [
      {
        ...exchangeQueries.getUSDRate(selectedDate),
        staleTime: RATES_STALE_TIME,
        gcTime: RATES_CACHE_TIME,
      },
      {
        ...exchangeQueries.getEURRate(selectedDate),
        staleTime: RATES_STALE_TIME,
        gcTime: RATES_CACHE_TIME,
      },
      {
        ...exchangeQueries.getUSDTRate(selectedDate),
        staleTime: RATES_STALE_TIME,
        gcTime: RATES_CACHE_TIME,
      },
    ],
    combine: (results) => {
      const [usdQuery, eurQuery, usdtQuery] = results;
      const rates: ExchangeRate[] = [];
      if (usdQuery.data) rates.push(usdQuery.data);
      if (eurQuery.data) rates.push(eurQuery.data);
      if (usdtQuery.data) rates.push(usdtQuery.data);

      const ratesWithFallback = mergeWithFallbackRates(rates);
      const sortedRates = [...ratesWithFallback].sort((leftRate, rightRate) => RATE_ORDER[leftRate.id] - RATE_ORDER[rightRate.id]);
      const baseRates: BaseRate[] = sortedRates.map((rate) => ({
        ...rate,
        info: currencyInfo[rate.id],
      }));

      return {
        baseRates,
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
