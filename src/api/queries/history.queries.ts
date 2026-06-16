import { mapRateHistoryResponse } from "@/api/mapper";
import type { ExchangeRateId, RatesHistoryAPIResponse } from "@/models/exchange.models";
import { queryOptions } from "@tanstack/react-query";

const ENDPOINTS = {
  bcv: "https://ahorrave-api.onrender.com/api/v1/rates/history/bcv",
  usdt: "https://ahorrave-api.onrender.com/api/v1/rates/history/binance",
  eur: "https://ahorrave-api.onrender.com/api/v1/rates/history/bcv",
} as const satisfies Record<ExchangeRateId, string>;

export const historyQueries = {
  getRateHistory: (id: ExchangeRateId, limit = 20) =>
    queryOptions({
      queryKey: ["exchange-rate-history", id, limit],
      queryFn: async () => {
        const response = await fetch(`${ENDPOINTS[id]}?limit=${limit}`);

        if (!response.ok) {
          throw new Error(`No se pudo cargar el historial de la tasa ${id}`);
        }

        const payload = (await response.json()) as RatesHistoryAPIResponse;

        return mapRateHistoryResponse(id, payload);
      },
    }),
};
