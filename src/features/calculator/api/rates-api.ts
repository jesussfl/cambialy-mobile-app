import { IconName } from "react-native-remix-icon";

export type ExchangeRateId = "bcv" | "usdt" | "eur";

export type ExchangeRate = {
  id: ExchangeRateId;
  label: string;
  value: number;
  updatedAt?: string;
  icon: IconName;
};

type AhorraVeRatesResponse = {
  source?: string;
  last_updated?: string;
  rates?: Partial<Record<"USD" | "EUR", number>>;
};

const API_BASE_URL = "https://ahorrave-api.onrender.com/api/v1";

const endpoints = {
  bcv: `${API_BASE_URL}/rates/bcv`,
  usdt: `${API_BASE_URL}/rates/binance`,
  eur: `${API_BASE_URL}/rates/bcv`,
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

function mapRate(id: ExchangeRateId, data: AhorraVeRatesResponse): ExchangeRate {
  const currency = getRateCurrency(id);
  const value = data.rates?.[currency];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`La tasa ${id} no incluye ${currency} valido`);
  }

  return {
    id,
    label: rateMetadata[id].label,
    value,
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
  const [binanceRates, bcvRates] = await Promise.all([fetchRatePayload("usdt"), fetchRatePayload("bcv")]);

  return [mapRate("usdt", binanceRates), mapRate("bcv", bcvRates), mapRate("eur", bcvRates)];
}
