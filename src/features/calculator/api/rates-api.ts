import { IconName } from "react-native-remix-icon";

export type ExchangeRateId = "bcv" | "usdt" | "eur";

export type ExchangeRate = {
  id: ExchangeRateId;
  label: string;
  value: number;
  updatedAt?: string;
  icon: IconName;
};

type DolarApiRate = {
  fuente?: string;
  promedio?: number;
  fechaActualizacion?: string;
};

const endpoints = {
  bcv: "https://ve.dolarapi.com/v1/dolares/oficial",
  usdt: "https://ve.dolarapi.com/v1/dolares/paralelo",
  eur: "https://ve.dolarapi.com/v1/euros",
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

async function fetchRate(id: ExchangeRateId): Promise<ExchangeRate> {
  const response = await fetch(endpoints[id]);

  if (!response.ok) {
    throw new Error(`No se pudo cargar la tasa ${id}`);
  }

  const payload = (await response.json()) as DolarApiRate | DolarApiRate[];
  const data = Array.isArray(payload) ? payload.find((rate) => rate.fuente === "oficial") : payload;

  if (!data || typeof data.promedio !== "number" || !Number.isFinite(data.promedio)) {
    throw new Error(`La tasa ${id} no incluye promedio valido`);
  }

  return {
    id,
    label: rateMetadata[id].label,
    value: data.promedio,
    updatedAt: data.fechaActualizacion,
    icon: rateMetadata[id].icon,
  };
}

export function fetchExchangeRates() {
  return Promise.all([fetchRate("usdt"), fetchRate("bcv"), fetchRate("eur")]);
}
