import { IconName } from "react-native-remix-icon";

export type ExchangeRateId = "bcv" | "usdt" | "eur";

export type ExchangeRate = {
  id: ExchangeRateId;
  label: string;
  value: number;
  updatedAt?: string;
  icon: IconName;
};

export type ExchangeRateHistoryOption = ExchangeRate & {
  bcvValue?: number;
  eurValue?: number;
};

type AhorraVeRatesResponse = {
  source?: string;
  target_currency?: string;
  rate_value?: number;
  last_updated?: string;
  rates?: Partial<Record<"USD" | "EUR", number>>;
};

type AhorraVeHistoryResponse = {
  category?: string;
  page?: number;
  size?: number;
  total_records?: number;
  history?: AhorraVeRatesResponse[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://cambialy-backend.onrender.com/api/v2";

const endpoints = {
  bcv: `${API_BASE_URL}/rates/usd`,
  usdt: `${API_BASE_URL}/rates/usdt`,
  eur: `${API_BASE_URL}/rates/eur`,
} as const;

const historyEndpoints = {
  bcv: `${API_BASE_URL}/rates/history/bcv`,
  usdt: `${API_BASE_URL}/rates/history/binance`,
  eur: `${API_BASE_URL}/rates/history/bcv`,
} as const;

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

function getRateCurrency(id: ExchangeRateId) {
  return id === "eur" ? "EUR" : "USD";
}

function mapRate(id: ExchangeRateId, data: AhorraVeRatesResponse): ExchangeRateHistoryOption {
  const currency = getRateCurrency(id);
  const value = typeof data.rate_value === "number" && Number.isFinite(data.rate_value)
    ? data.rate_value
    : data.rates?.[currency];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`La tasa ${id} no incluye ${currency} valido`);
  }

  return {
    id,
    label: rateMetadata[id].label,
    value,
    bcvValue: data.rates?.USD ?? (id === "bcv" ? value : undefined),
    eurValue: data.rates?.EUR ?? (id === "eur" ? value : undefined),
    updatedAt: data.last_updated,
    icon: rateMetadata[id].icon,
  };
}

async function fetchRatePayload(id: ExchangeRateId): Promise<AhorraVeRatesResponse> {
  const response = await fetch(endpoints[id]);

  if (!response.ok) {
    throw new Error(`No se pudo cargar la tasa ${id}`);
  }

  return (await response.json()) as AhorraVeRatesResponse;
}

export async function fetchExchangeRates() {
  const [binanceRates, bcvUsdRates, bcvEurRates] = await Promise.all([
    fetchRatePayload("usdt"),
    fetchRatePayload("bcv"),
    fetchRatePayload("eur"),
  ]);

  return [mapRate("usdt", binanceRates), mapRate("bcv", bcvUsdRates), mapRate("eur", bcvEurRates)];
}

export async function fetchExchangeRateHistory(id: ExchangeRateId, limit = 20): Promise<ExchangeRateHistoryOption[]> {
  const response = await fetch(`${historyEndpoints[id]}?page=1&size=${limit}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`No se pudo cargar el historial de la tasa ${id}`);
  }

  const payload = (await response.json()) as AhorraVeHistoryResponse;

  return (payload.history ?? []).map((historyItem) => mapRate(id, historyItem));
}
