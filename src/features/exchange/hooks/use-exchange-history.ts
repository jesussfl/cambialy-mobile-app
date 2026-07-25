import { useQuery } from "@tanstack/react-query";

import { historyQueries } from "@/api/queries/history.queries";
import { RATES_CACHE_TIME, RATES_STALE_TIME } from "@/features/exchange/constants";
import type { ExchangeHistoryPickerOption } from "@/features/exchange/types";
import { formatHistoryDate, formatRate } from "@/features/exchange/utils";
import type { ExchangeRateHistoryOption } from "@/models/exchange.models";

import { CUSTOM_RATE_ID, LIVE_HISTORY_VALUE, type BaseRate, type BaseRateId } from "./exchange-screen.types";

type UseExchangeHistoryParams = {
  selectedBaseRate: BaseRate;
  customRateValue: number;
  selectedBaseRateId: BaseRateId;
};

export function useExchangeHistory({ selectedBaseRate, customRateValue, selectedBaseRateId }: UseExchangeHistoryParams) {
  const historyRateId = selectedBaseRateId === CUSTOM_RATE_ID ? null : selectedBaseRateId;

  const rateHistoryQuery = useQuery({
    ...historyQueries.getRateHistory(historyRateId ?? "bcv"),
    enabled: historyRateId !== null,
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });

  const historyRates = rateHistoryQuery.data ?? [];
  const historyPickerOptions: ExchangeHistoryPickerOption[] = (() => {
    if (selectedBaseRateId === CUSTOM_RATE_ID) {
      const customRateText = formatRate(customRateValue);

      return [
        {
          value: LIVE_HISTORY_VALUE,
          label: customRateText,
          description: "Tasa personalizada",
          headerDescription: customRateText,
        },
      ];
    }

    const liveRateText = formatRate(selectedBaseRate.value);
    const liveDateText = formatHistoryDate(selectedBaseRate.updatedAt);
    const liveOption = {
      value: LIVE_HISTORY_VALUE,
      label: liveRateText,
      description: liveDateText,
      headerDescription: `${liveDateText}`,
    };

    const historyOptions = historyRates
      .filter((historyRate) => historyRate.updatedAt !== selectedBaseRate.updatedAt)
      .map((historyRate, index) => {
        const rateText = formatRate(historyRate.value);
        const dateText = formatHistoryDate(historyRate.updatedAt);

        return {
          value: getHistoryRateKey(historyRate, index),
          label: rateText,
          description: dateText,
          headerDescription: `${dateText}`,
        };
      });

    return [liveOption, ...historyOptions];
  })();

  return {
    historyPickerOptions,
    isHistoryFetching: rateHistoryQuery.isFetching,
  };
}

function getHistoryRateKey(rate: ExchangeRateHistoryOption, index: number) {
  return `${rate.updatedAt ?? "sin-fecha"}-${index}`;
}
