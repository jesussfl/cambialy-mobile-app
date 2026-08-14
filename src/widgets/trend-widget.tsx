import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { background, containerBackground, cornerRadius, font, foregroundStyle, lineLimit, padding, widgetURL } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type TrendWidgetStatus = "updated" | "stale" | "empty" | "loading";

export type TrendWidgetProps = {
  usdBcv: number | null;
  eurBcv: number | null;
  usdtBinance: number | null;
  /** Last value that actually differed from the current one, per currency. */
  previousUsdBcv: number | null;
  previousEurBcv: number | null;
  previousUsdtBinance: number | null;
  /** When each previous value was superseded. */
  previousUsdChangedAt: number | null;
  previousEurChangedAt: number | null;
  previousUsdtChangedAt: number | null;
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
 * IMPORTANT: see the note in rate-widget.tsx. A `"widget"` body is evaluated from source
 * text, so every constant and helper here must stay inline.
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
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const accent = isDark ? "#3B82F6" : "#0350FF";
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
  const hasPrevious =
    hasValue && typeof previous === "number" && Number.isFinite(previous) && previous !== 0;

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

  const isSmall = environment.widgetFamily === "systemSmall";

  return (
    <VStack
      spacing={isSmall ? 6 : 10}
      alignment="leading"
      modifiers={[containerBackground(backgroundColor, "widget"), padding({ all: isSmall ? 14 : 18 }), widgetURL("cambialy://exchange")]}
    >
      <HStack spacing={6} alignment="center">
        <Text
          modifiers={[
            font({ weight: "bold", size: isSmall ? 10 : 11 }),
            foregroundStyle(badgeText),
            background(badgeBg),
            cornerRadius(6),
            padding({ horizontal: 6, vertical: 3 }),
            lineLimit(1),
          ]}
        >
          {ticker}
        </Text>
        <Text modifiers={[font({ weight: "semibold", size: isSmall ? 11 : 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>
          {source}
        </Text>
        <Spacer minLength={0} />
        <Text modifiers={[font({ weight: "bold", size: isSmall ? 12 : 13 }), foregroundStyle(accent)]}>↻</Text>
      </HStack>

      <Spacer minLength={0} />

      <VStack
        spacing={2}
        alignment="leading"
        modifiers={[background(surface), cornerRadius(16), padding({ horizontal: 12, vertical: 10 })]}
      >
        <Text modifiers={[font({ weight: "bold", size: isSmall ? 20 : 26 }), foregroundStyle(textPrimary), lineLimit(1)]}>{amount}</Text>

        {hasPrevious && !isFlat ? (
          <Text modifiers={[font({ weight: "bold", size: isSmall ? 12 : 14 }), foregroundStyle(deltaColor), lineLimit(1)]}>{deltaText}</Text>
        ) : (
          <Text modifiers={[font({ weight: "bold", size: isSmall ? 12 : 14 }), foregroundStyle(textSecondary), lineLimit(1)]}>
            {hasPrevious ? "Sin cambios" : "Sin referencia previa"}
          </Text>
        )}
      </VStack>

      <Spacer minLength={0} />

      <Text modifiers={[font({ size: isSmall ? 9 : 10 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusText}</Text>
    </VStack>
  );
}

export default createWidget<TrendWidgetProps, TrendWidgetConfiguration>("TrendWidget", TrendWidget);
