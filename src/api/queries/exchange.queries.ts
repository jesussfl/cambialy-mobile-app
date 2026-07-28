import { mapBCVRatesResponse, mapBinanceRateResponse, mapRateResponse } from "@/api/mapper";
import type { ExchangeRateAPIResponse } from "@/models/exchange.models";
import { queryOptions } from "@tanstack/react-query";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://cambialy-backend.onrender.com/api/v2";

const ENDPOINTS = {
  usd: `${API_BASE_URL}/rates/usd`,
  eur: `${API_BASE_URL}/rates/eur`,
  usdt: `${API_BASE_URL}/rates/usdt`,
  legacyBcv: `${API_BASE_URL}/rates/bcv`,
  legacyBinance: `${API_BASE_URL}/rates/binance`,
};

function buildUrl(endpoint: string, date?: string | null) {
  if (!date) return endpoint;
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}date=${encodeURIComponent(date)}`;
}

export const exchangeQueries = {
  getUSDRate: (date?: string | null) =>
    queryOptions({
      queryKey: ["exchange", "usd", date ?? "latest"],
      queryFn: async () => {
        const url = buildUrl(ENDPOINTS.usd, date);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("No se pudo cargar la tasa BCV USD");
        }
        const payload = (await response.json()) as ExchangeRateAPIResponse;
        return mapRateResponse("bcv", payload);
      },
    }),

  getEURRate: (date?: string | null) =>
    queryOptions({
      queryKey: ["exchange", "eur", date ?? "latest"],
      queryFn: async () => {
        const url = buildUrl(ENDPOINTS.eur, date);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("No se pudo cargar la tasa BCV EUR");
        }
        const payload = (await response.json()) as ExchangeRateAPIResponse;
        return mapRateResponse("eur", payload);
      },
    }),

  getUSDTRate: (date?: string | null) =>
    queryOptions({
      queryKey: ["exchange", "usdt", date ?? "latest"],
      queryFn: async () => {
        const url = buildUrl(ENDPOINTS.usdt, date);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("No se pudo cargar la tasa Binance USDT");
        }
        const payload = (await response.json()) as ExchangeRateAPIResponse;
        return mapRateResponse("usdt", payload);
      },
    }),

  getBCVRates: queryOptions({
    queryKey: ["exchange", "bcv"],
    queryFn: async () => {
      const [usdRes, eurRes] = await Promise.all([
        fetch(ENDPOINTS.usd),
        fetch(ENDPOINTS.eur),
      ]);

      if (usdRes.ok && eurRes.ok) {
        const [usdPayload, eurPayload] = await Promise.all([
          usdRes.json() as Promise<ExchangeRateAPIResponse>,
          eurRes.json() as Promise<ExchangeRateAPIResponse>,
        ]);
        return [mapRateResponse("bcv", usdPayload), mapRateResponse("eur", eurPayload)];
      }

      // Fallback for V1 legacy
      const response = await fetch(ENDPOINTS.legacyBcv);
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
      const response = await fetch(ENDPOINTS.usdt);
      if (response.ok) {
        const payload = (await response.json()) as ExchangeRateAPIResponse;
        return mapRateResponse("usdt", payload);
      }

      // Fallback for V1 legacy
      const legacyRes = await fetch(ENDPOINTS.legacyBinance);
      if (!legacyRes.ok) {
        throw new Error("No se pudo cargar la tasa Binance USDT");
      }
      const payload = (await legacyRes.json()) as ExchangeRateAPIResponse;
      return mapBinanceRateResponse(payload);
    },
  }),
};
