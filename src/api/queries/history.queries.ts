import { mapRateHistoryResponse } from "@/api/mapper";
import type { ExchangeRateId, RatesHistoryAPIResponse } from "@/models/exchange.models";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

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

  getInfiniteRateHistory: (id: ExchangeRateId, size = 20) =>
    infiniteQueryOptions({
      queryKey: ["exchange-rate-history-infinite", id, size],
      queryFn: async ({ pageParam }) => {
        const cursorParam = pageParam ? `&cursor=${encodeURIComponent(pageParam as string)}` : "";
        const url = `${ENDPOINTS[id]}?size=${size}${cursorParam}`;
        console.log(`[InfiniteHistoryQuery] Fetching: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`[InfiniteHistoryQuery] Failed HTTP ${response.status} for ${url}`);
          throw new Error(`No se pudo cargar el historial de la tasa ${id}`);
        }

        const payload = (await response.json()) as RatesHistoryAPIResponse;
        console.log(`[InfiniteHistoryQuery] Received ${payload.history?.length ?? 0} items for ${id}. next_cursor: ${payload.next_cursor}, has_more: ${payload.has_more}`);

        return {
          ...payload,
          items: mapRateHistoryResponse(id, payload),
        };
      },
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    }),
};
