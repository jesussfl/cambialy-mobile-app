import type { ExchangeRate, ExchangeRateAPIResponse, ExchangeRateHistoryOption, ExchangeRateId, RatesHistoryAPIResponse } from "@/models/exchange.models";

const rateMetadata = {
  bcv: {
    label: "BCV USD",
    icon: "money-dollar-circle-line",
  },
  usdt: {
    label: "Binance USDT",
    icon: "copper-coin-line",
  },
  eur: {
    label: "EUR BCV",
    icon: "money-euro-circle-line",
  },
} as const;

const rateCurrencyById = {
  bcv: "USD",
  usdt: "USD",
  eur: "EUR",
} as const satisfies Record<ExchangeRateId, "USD" | "EUR">;

export function mapBCVRatesResponse(data: ExchangeRateAPIResponse): ExchangeRate[] {
  return [mapRateResponse("bcv", data), mapRateResponse("eur", data)];
}

export function mapBinanceRateResponse(data: ExchangeRateAPIResponse): ExchangeRate {
  return mapRateResponse("usdt", data);
}

export function mapRateHistoryResponse(id: ExchangeRateId, data: RatesHistoryAPIResponse): ExchangeRateHistoryOption[] {
  return (data.history ?? []).map((historyItem) => mapRateResponse(id, historyItem));
}

function mapRateResponse(id: ExchangeRateId, data: ExchangeRateAPIResponse): ExchangeRateHistoryOption {
  const currency = rateCurrencyById[id];
  const value = data.rates?.[currency];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`La tasa ${rateMetadata[id].label} no incluye ${currency} valido`);
  }

  return {
    id,
    label: rateMetadata[id].label,
    value,
    bcvValue: data.rates?.USD,
    eurValue: data.rates?.EUR,
    updatedAt: data.last_updated,
    icon: rateMetadata[id].icon,
  };
}
