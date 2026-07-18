import type { ExchangeRate, ExchangeRateId } from "@/models/exchange.models";

import type { CurrencyOption, TargetCurrencyId, TargetCurrencyOption } from "./types";

export const CUSTOM_RATE_ID = "custom";

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

export const currencyInfo: Record<ExchangeRateId, CurrencyOption> = {
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

export const customCurrencyInfo: CurrencyOption = {
  id: CUSTOM_RATE_ID,
  code: "PERS",
  name: "Personalizado",
  symbol: "$",
  icon: "edit-2-line",
};

export const targetCurrencyInfo: Record<TargetCurrencyId, TargetCurrencyOption> = {
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
export const QUICK_AMOUNTS = ["5", "10", "15", "20", "30", "50", "10000"];
export const VES_QUICK_AMOUNTS = ["100000", "500000", "1000000", "2000000", "5000000", "10000000"];

export const RATE_ORDER: Record<ExchangeRateId, number> = { bcv: 0, usdt: 1, eur: 2 };
