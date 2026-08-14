import { mapRateResponse } from "@/api/mapper";
import type { ExchangeRateAPIResponse } from "@/models/exchange.models";
import RateWidget from "@/widgets/rate-widget";
import RatesWidget, { type RatesWidgetStatus } from "@/widgets/rates-widget";
import TrendWidget, { type TrendWidgetProps } from "@/widgets/trend-widget";

export type WidgetRates = {
  usdBcv: number;
  eurBcv: number;
  usdtBinance: number;
  updatedAt: number;
  sourceUpdatedAt?: string | null;
};

/** The nullable shape actually rendered — a rate may be unavailable. */
type WidgetSnapshot = {
  usdBcv: number | null;
  eurBcv: number | null;
  usdtBinance: number | null;
  updatedAt: number;
  sourceUpdatedAt?: string | null;
};

/** A carried-forward previous value and the moment it was superseded. */
type PreviousRate = { value: number; changedAt: number } | null;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://cambialy-backend-production.up.railway.app/api/v2";

const ENDPOINTS = {
  usd: `${API_BASE_URL}/rates/usd`,
  eur: `${API_BASE_URL}/rates/eur`,
  usdt: `${API_BASE_URL}/rates/usdt`,
};

export async function refreshRatesWidget() {
  try {
    const rates = await fetchRatesForWidget();
    await publishSnapshot(rates, "updated");
  } catch {
    const previous = await getLatestWidgetProps();

    await publishSnapshot(
      {
        usdBcv: previous?.usdBcv ?? null,
        eurBcv: previous?.eurBcv ?? null,
        usdtBinance: previous?.usdtBinance ?? null,
        updatedAt: previous?.updatedAt ?? Date.now(),
        sourceUpdatedAt: previous?.sourceUpdatedAt ?? null,
      },
      previous ? "stale" : "empty"
    );
  }
}

/**
 * Single fan-out point: every widget is fed from one fetch and one status, so widgets on
 * the same home screen can never disagree about a rate or its freshness.
 *
 * All rates go to every widget because the configurable ones only learn which currency
 * they display at render time, from the user's widget configuration.
 */
async function publishSnapshot(snapshot: WidgetSnapshot, status: RatesWidgetStatus) {
  const trendProps = await buildTrendProps(snapshot, status);

  RatesWidget.updateSnapshot(withoutNullValues({ ...snapshot, status }));
  RateWidget.updateSnapshot(withoutNullValues({ ...snapshot, status }));
  TrendWidget.updateSnapshot(withoutNullValues(trendProps));
}

/**
 * Widget props cross into native as `[String: Any]`, and expo-modules-core throws
 * `NullCastException` on any `null` value while silently skipping `undefined`
 * (DynamicDictionaryType.cast / DynamicRawType.cast). Dropping the keys entirely is the
 * only shape that survives the bridge; widget bodies already treat a missing value and
 * an unavailable value identically.
 */
function withoutNullValues<T extends object>(props: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }

  // Safe: only nullable fields are dropped, and they are optional on every props type.
  return result as T;
}

/**
 * Mirrors Android's RatesWidgetRepository.carryPrevious: a rate only becomes "previous"
 * when it is actually superseded by a different value, so the trend keeps describing the
 * last real move instead of resetting to zero on every refresh.
 */
function carryPrevious(cachedValue: number | null, nextValue: number | null, existing: PreviousRate, now: number): PreviousRate {
  if (typeof cachedValue === "number" && Number.isFinite(cachedValue) && cachedValue !== nextValue) {
    return { value: cachedValue, changedAt: now };
  }

  return existing;
}

async function buildTrendProps(snapshot: WidgetSnapshot, status: RatesWidgetStatus): Promise<TrendWidgetProps> {
  const cached = await getLatestTrendProps();
  const now = Date.now();

  const usd = carryPrevious(cached?.usdBcv ?? null, snapshot.usdBcv, toPrevious(cached?.previousUsdBcv, cached?.previousUsdChangedAt), now);
  const eur = carryPrevious(cached?.eurBcv ?? null, snapshot.eurBcv, toPrevious(cached?.previousEurBcv, cached?.previousEurChangedAt), now);
  const usdt = carryPrevious(
    cached?.usdtBinance ?? null,
    snapshot.usdtBinance,
    toPrevious(cached?.previousUsdtBinance, cached?.previousUsdtChangedAt),
    now
  );

  return {
    usdBcv: snapshot.usdBcv,
    eurBcv: snapshot.eurBcv,
    usdtBinance: snapshot.usdtBinance,
    previousUsdBcv: usd?.value ?? null,
    previousEurBcv: eur?.value ?? null,
    previousUsdtBinance: usdt?.value ?? null,
    previousUsdChangedAt: usd?.changedAt ?? null,
    previousEurChangedAt: eur?.changedAt ?? null,
    previousUsdtChangedAt: usdt?.changedAt ?? null,
    updatedAt: snapshot.updatedAt,
    status,
  };
}

function toPrevious(value: number | null | undefined, changedAt: number | null | undefined): PreviousRate {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return { value, changedAt: typeof changedAt === "number" ? changedAt : Date.now() };
}

export async function getCachedRatesWidget(): Promise<WidgetRates | null> {
  const props = await getLatestWidgetProps();

  // Absent keys read back as undefined, not null, because publishSnapshot strips them.
  if (
    !props ||
    typeof props.usdBcv !== "number" ||
    typeof props.eurBcv !== "number" ||
    typeof props.usdtBinance !== "number"
  ) {
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

/** The Rates widget carries the full payload, so it is the authoritative timeline. */
async function getLatestWidgetProps() {
  const timeline = await RatesWidget.getTimeline();

  return timeline.at(-1)?.props ?? null;
}

/** The Trend widget is the only one that persists previous values, so it carries them. */
async function getLatestTrendProps() {
  const timeline = await TrendWidget.getTimeline();

  return timeline.at(-1)?.props ?? null;
}
