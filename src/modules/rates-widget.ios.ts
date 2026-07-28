import { mapRateResponse } from "@/api/mapper";
import type { ExchangeRateAPIResponse } from "@/models/exchange.models";
import RatesWidget from "@/widgets/rates-widget";

export type WidgetRates = {
  usdBcv: number;
  eurBcv: number;
  usdtBinance: number;
  updatedAt: number;
  sourceUpdatedAt?: string | null;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://cambialy-backend.onrender.com/api/v2";

const ENDPOINTS = {
  usd: `${API_BASE_URL}/rates/usd`,
  eur: `${API_BASE_URL}/rates/eur`,
  usdt: `${API_BASE_URL}/rates/usdt`,
};

export async function refreshRatesWidget() {
  try {
    const rates = await fetchRatesForWidget();

    RatesWidget.updateSnapshot({
      ...rates,
      status: "updated",
    });
  } catch {
    const previousProps = await getLatestWidgetProps();

    RatesWidget.updateSnapshot({
      usdBcv: previousProps?.usdBcv ?? null,
      eurBcv: previousProps?.eurBcv ?? null,
      usdtBinance: previousProps?.usdtBinance ?? null,
      updatedAt: previousProps?.updatedAt ?? Date.now(),
      sourceUpdatedAt: previousProps?.sourceUpdatedAt ?? null,
      status: previousProps ? "stale" : "empty",
    });
  }
}

export async function getCachedRatesWidget(): Promise<WidgetRates | null> {
  const props = await getLatestWidgetProps();

  if (!props || props.usdBcv === null || props.eurBcv === null || props.usdtBinance === null) {
    return null;
  }

  return {
    usdBcv: props.usdBcv,
    eurBcv: props.eurBcv,
    usdtBinance: props.usdtBinance,
    updatedAt: props.updatedAt,
    sourceUpdatedAt: props.sourceUpdatedAt,
  };
}

async function fetchRatesForWidget(): Promise<WidgetRates> {
  const [usdPayload, eurPayload, usdtPayload] = await Promise.all([
    fetchJson(ENDPOINTS.usd),
    fetchJson(ENDPOINTS.eur),
    fetchJson(ENDPOINTS.usdt),
  ]);

  const usdBcv = mapRateResponse("bcv", usdPayload);
  const eurBcv = mapRateResponse("eur", eurPayload);
  const usdtBinance = mapRateResponse("usdt", usdtPayload);

  return {
    usdBcv: usdBcv.value,
    eurBcv: eurBcv.value,
    usdtBinance: usdtBinance.value,
    updatedAt: Date.now(),
    sourceUpdatedAt: usdPayload.last_updated ?? usdtPayload.last_updated ?? null,
  };
}

async function fetchJson(url: string): Promise<ExchangeRateAPIResponse> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las tasas del widget (${response.status})`);
  }

  return (await response.json()) as ExchangeRateAPIResponse;
}

async function getLatestWidgetProps() {
  const timeline = await RatesWidget.getTimeline();

  return timeline.at(-1)?.props ?? null;
}
