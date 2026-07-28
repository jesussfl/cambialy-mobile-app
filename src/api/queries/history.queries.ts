import { mapRateHistoryResponse } from "@/api/mapper";
import type { ExchangeRateId, RatesHistoryAPIResponse } from "@/models/exchange.models";
import { queryOptions } from "@tanstack/react-query";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://cambialy-backend.onrender.com/api/v2";

const ENDPOINTS = {
  bcv: `${API_BASE_URL}/rates/history/bcv`,
  usdt: `${API_BASE_URL}/rates/history/binance`,
  eur: `${API_BASE_URL}/rates/history/bcv`,
} satisfies Record<ExchangeRateId, string>;

export const historyQueries = {
  getRateHistory: (id: ExchangeRateId, limit = 20) =>
    queryOptions({
      queryKey: ["exchange-rate-history", id, limit],
      queryFn: async () => {
        const url = `${ENDPOINTS[id]}?page=1&size=${limit}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`No se pudo cargar el historial de la tasa ${id}`);
        }

        const payload = (await response.json()) as RatesHistoryAPIResponse;

        return mapRateHistoryResponse(id, payload);
      },
    }),
};
