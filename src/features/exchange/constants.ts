import type { ExchangeRate, ExchangeRateId } from "@/features/calculator/api/rates-api";

import type { CurrencyOption, TargetCurrencyId } from "./types";

export const fallbackRates: ExchangeRate[] = [
  {
    id: "usdt",
    label: "Binance USDT",
    value: 0,
    icon: "copper-coin-line",
  },
  {
    id: "bcv",
    label: "BCV USD",
    value: 0,
    icon: "money-dollar-circle-line",
  },
  {
    id: "eur",
    label: "EUR BCV",
    value: 0,
    icon: "money-euro-circle-line",
  },
];

export const currencyMeta: Record<ExchangeRateId, CurrencyOption> = {
  usdt: {
    id: "usdt",
    code: "USDT",
    name: "Binance",
    symbol: "$",
    icon: "copper-coin-line",
  },
  bcv: {
    id: "bcv",
    code: "BCV",
    name: "Dólar BCV",
    symbol: "$",
    icon: "money-dollar-circle-line",
  },
  eur: {
    id: "eur",
    code: "EUR",
    name: "Euro",
    symbol: "€",
    icon: "money-euro-circle-line",
  },
};

export const targetCurrencyMeta: Record<TargetCurrencyId, CurrencyOption> = {
  ves: {
    id: "ves",
    code: "VES",
    name: "Bolívares",
    symbol: "Bs.",
    icon: "bank-line",
  },
  bcv: {
    id: "bcv",
    code: "BCV",
    name: "Dólar BCV",
    symbol: "$",
    icon: "money-dollar-circle-line",
  },
};

export const RATES_CACHE_TIME = 1000 * 60 * 10;
export const RATES_STALE_TIME = 1000 * 60 * 5;
export const QUICK_AMOUNTS = ["5", "10", "15", "20", "30", "50", "100"];

export const RATE_ORDER: Record<ExchangeRateId, number> = { usdt: 0, bcv: 1, eur: 2 };
