import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  containerBackground,
  cornerRadius,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  padding,
  strokeBorder,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type TrendWidgetStatus = "updated" | "stale" | "empty" | "loading";

/**
 * Nullable fields are optional because publishSnapshot strips null values before they
 * cross into native: expo-modules-core throws on `null` inside a `[String: Any]` props
 * dictionary and skips `undefined`. An absent key means "unavailable" — which is the
 * normal state here until a rate has moved at least once.
 */
export type TrendWidgetProps = {
  usdBcv?: number | null;
  eurBcv?: number | null;
  usdtBinance?: number | null;
  /** Last value that actually differed from the current one, per currency. */
  previousUsdBcv?: number | null;
  previousEurBcv?: number | null;
  previousUsdtBinance?: number | null;
  /** When each previous value was superseded. */
  previousUsdChangedAt?: number | null;
  previousEurChangedAt?: number | null;
  previousUsdtChangedAt?: number | null;
  updatedAt: number;
  status?: TrendWidgetStatus;
};

export type TrendWidgetConfiguration = {
  currency: string;
  theme: string;
};

/**
 * TREND widget — one user-selected currency plus how far it moved since its last
 * different value.
 *
 * Visual spec mirrors Android's res/layout/trend_widget.xml: 16pt frame padding, a
 * bordered 18pt-radius surface, a 30pt circular refresh button, value at 26 and delta
 * at 14. Modifier order is semantic — padding precedes background so the fill covers the
 * padded area, matching how an Android <shape> fills its view.
 *
 * IMPORTANT: see rate-widget.tsx. A `"widget"` body is evaluated from source text, so
 * every constant here must stay inline.
 */
function TrendWidget(props: TrendWidgetProps, environment: WidgetEnvironment<TrendWidgetConfiguration>) {
  "widget";

  const safeProps = props ?? {
    usdBcv: null,
    eurBcv: null,
    usdtBinance: null,
    previousUsdBcv: null,
    previousEurBcv: null,
    previousUsdtBinance: null,
    previousUsdChangedAt: null,
    previousEurChangedAt: null,
    previousUsdtChangedAt: null,
    updatedAt: 0,
    status: "empty",
  };

  const configuration = environment.configuration;
  const currency = configuration?.currency ?? "usd";
  const themePreference = configuration?.theme ?? "system";

  const isDark = themePreference === "dark" || (themePreference === "system" && environment.colorScheme === "dark");

  const backgroundColor = isDark ? "#0F172A" : "#F8FAFC";
  const surface = isDark ? "#1E293B" : "#FFFFFF";
  const cardStroke = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const refreshBg = isDark ? "#1E3A8A" : "#EFF6FF";
  const refreshIcon = isDark ? "#93C5FD" : "#0350FF";
  const upColor = isDark ? "#4ADE80" : "#15803D";
  const downColor = isDark ? "#F87171" : "#B91C1C";

  let value = safeProps.usdBcv;
  let previous = safeProps.previousUsdBcv;
  let changedAt = safeProps.previousUsdChangedAt;
  let ticker = "USD";
  let source = "BCV";
  let badgeBg = isDark ? "#1E3A8A" : "#EFF6FF";
  let badgeText = isDark ? "#93C5FD" : "#1D4ED8";

  if (currency === "eur") {
    value = safeProps.eurBcv;
    previous = safeProps.previousEurBcv;
    changedAt = safeProps.previousEurChangedAt;
    ticker = "EUR";
    source = "BCV";
    badgeBg = isDark ? "#14532D" : "#F0FDF4";
    badgeText = isDark ? "#86EFAC" : "#15803D";
  } else if (currency === "usdt") {
    value = safeProps.usdtBinance;
    previous = safeProps.previousUsdtBinance;
    changedAt = safeProps.previousUsdtChangedAt;
    ticker = "USDT";
    source = "Binance";
    badgeBg = isDark ? "#78350F" : "#FEF3C7";
    badgeText = isDark ? "#FDE68A" : "#B45309";
  }

  const hasValue = typeof value === "number" && Number.isFinite(value);
  const hasPrevious = hasValue && typeof previous === "number" && Number.isFinite(previous) && previous !== 0;

  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const amount = hasValue ? `Bs. ${formatAmount(value as number)}` : "No disponible";

  const delta = hasPrevious ? (value as number) - (previous as number) : 0;
  const percent = hasPrevious ? (delta / (previous as number)) * 100 : 0;
  const isUp = delta > 0;
  const isFlat = delta === 0;

  const sign = isUp ? "+" : "-";
  const arrow = isUp ? "▲" : "▼";
  const deltaText = `${arrow} ${sign}${formatAmount(Math.abs(delta))} (${sign}${Math.abs(percent).toFixed(2)}%)`;
  const deltaColor = isUp ? upColor : downColor;
  const showDelta = hasPrevious && !isFlat;

  // Manual month names rather than Intl: the widget JS context is minimal and a missing
  // locale would silently degrade a user-facing date.
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  const formatMoment = (timestamp: number) => {
    const moment = new Date(timestamp);
    const hours = `${moment.getHours()}`.padStart(2, "0");
    const minutes = `${moment.getMinutes()}`.padStart(2, "0");
    return `${moment.getDate()} ${months[moment.getMonth()]}, ${hours}:${minutes}`;
  };

  let statusText = "";

  if (safeProps.status === "loading") {
    statusText = "Actualizando...";
  } else if (safeProps.status === "stale") {
    statusText = "Ultimo valor guardado";
  } else if (safeProps.status === "empty" || !hasValue) {
    statusText = "No disponible";
  } else if (hasPrevious && typeof changedAt === "number" && changedAt > 0) {
    statusText = `Desde ${formatMoment(changedAt)}`;
  } else if (safeProps.updatedAt > 0) {
    statusText = `Actualizado ${formatMoment(safeProps.updatedAt)}`;
  }

  return (
    <VStack
      spacing={12}
      alignment="leading"
      modifiers={[containerBackground(backgroundColor, "widget"), padding({ all: 16 }), widgetURL("cambialy://exchange")]}
    >
      <HStack spacing={7} alignment="center">
        <Text
          modifiers={[
            font({ weight: "bold", size: 11 }),
            foregroundStyle(badgeText),
            padding({ horizontal: 7, vertical: 3 }),
            background(badgeBg),
            cornerRadius(6),
            lineLimit(1),
          ]}
        >
          {ticker}
        </Text>
        <Text modifiers={[font({ weight: "bold", size: 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>{source}</Text>
        <Spacer minLength={0} />
        <Text
          modifiers={[
            font({ weight: "bold", size: 14 }),
            foregroundStyle(refreshIcon),
            frame({ width: 30, height: 30 }),
            background(refreshBg),
            clipShape("circle"),
          ]}
        >
          ↻
        </Text>
      </HStack>

      <VStack
        spacing={2}
        alignment="leading"
        modifiers={[
          padding({ horizontal: 14, vertical: 12 }),
          background(surface),
          cornerRadius(18),
          strokeBorder({ color: cardStroke, style: { lineWidth: 1 }, shape: "roundedRectangle", cornerRadius: 18 }),
        ]}
      >
        <HStack spacing={0}>
          <Text
            modifiers={[
              font({ weight: "bold", size: 26 }),
              foregroundStyle(textPrimary),
              lineLimit(1),
              minimumScaleFactor(0.6),
            ]}
          >
            {amount}
          </Text>
          <Spacer minLength={0} />
        </HStack>
        <HStack spacing={0}>
          <Text
            modifiers={[
              font({ weight: "bold", size: 14 }),
              foregroundStyle(showDelta ? deltaColor : textSecondary),
              lineLimit(1),
              minimumScaleFactor(0.7),
            ]}
          >
            {showDelta ? deltaText : hasPrevious ? "Sin cambios" : "Sin referencia previa"}
          </Text>
          <Spacer minLength={0} />
        </HStack>
      </VStack>

      <Spacer minLength={0} />

      <Text modifiers={[font({ size: 11 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusText}</Text>
    </VStack>
  );
}

export default createWidget<TrendWidgetProps, TrendWidgetConfiguration>("TrendWidget", TrendWidget);
