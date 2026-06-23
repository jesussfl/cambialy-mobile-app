import { mapBCVRatesResponse, mapBinanceRateResponse } from "@/api/mapper";
import type { ExchangeRateAPIResponse } from "@/models/exchange.models";
import RatesWidget from "@/widgets/rates-widget";

export type WidgetRates = {
  usdBcv: number;
  eurBcv: number;
  usdtBinance: number;
  updatedAt: number;
  sourceUpdatedAt?: string | null;
};

const ENDPOINTS = {
  bcv: "https://ahorrave-api.onrender.com/api/v1/rates/bcv",
  binance: "https://ahorrave-api.onrender.com/api/v1/rates/binance",
} as const;

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
  const [bcvPayload, binancePayload] = await Promise.all([fetchJson(ENDPOINTS.bcv), fetchJson(ENDPOINTS.binance)]);
  const [usdBcv, eurBcv] = mapBCVRatesResponse(bcvPayload);
  const usdtBinance = mapBinanceRateResponse(binancePayload);

  return {
    usdBcv: usdBcv.value,
    eurBcv: eurBcv.value,
    usdtBinance: usdtBinance.value,
    updatedAt: Date.now(),
    sourceUpdatedAt: bcvPayload.last_updated ?? binancePayload.last_updated ?? null,
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
