import { mapBCVRatesResponse, mapBinanceRateResponse } from "@/api/mapper";
import type { ExchangeRateAPIResponse } from "@/models/exchange.models";
import { queryOptions } from "@tanstack/react-query";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://ahorrave-api.onrender.com/api/v1";

const ENDPOINTS = {
  bcv: `${API_BASE_URL}/rates/bcv`,
  binance: `${API_BASE_URL}/rates/binance`,
};

export const exchangeQueries = {
  getBCVRates: queryOptions({
    queryKey: ["exchange", "bcv"],
    queryFn: async () => {
      const response = await fetch(ENDPOINTS.bcv);

      if (!response.ok) {
        throw new Error("No se pudo cargar la tasa BCV");
      }

      const payload = (await response.json()) as ExchangeRateAPIResponse;
      return mapBCVRatesResponse(payload);
    },
  }),

  getBinanceUSDT: queryOptions({
    queryKey: ["exchange", "binance"],
    queryFn: async () => {
      const response = await fetch(ENDPOINTS.binance);

      if (!response.ok) {
        throw new Error("No se pudo cargar la tasa Binance USDT");
      }

      const payload = (await response.json()) as ExchangeRateAPIResponse;

      return mapBinanceRateResponse(payload);
    },
  }),
};
