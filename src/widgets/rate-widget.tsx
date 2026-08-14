import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { background, containerBackground, cornerRadius, font, foregroundStyle, lineLimit, padding, widgetURL } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type RateWidgetStatus = "updated" | "stale" | "empty" | "loading";

export type RateWidgetProps = {
  usdBcv: number | null;
  eurBcv: number | null;
  usdtBinance: number | null;
  updatedAt: number;
  status?: RateWidgetStatus;
};

/**
 * Chosen by the user in the widget editor. Values mirror the enum cases declared in
 * app.config.ts and the ids in Android's WidgetCurrency, so both platforms and both
 * layers speak one vocabulary.
 */
export type RateWidgetConfiguration = {
  currency: string;
  theme: string;
};

/**
 * RATE widget — one user-selected currency, rendered large.
 *
 * All three rates travel in props because the currency is only known at render time,
 * from `environment.configuration`.
 *
 * IMPORTANT: a `"widget"` function body is handed to native as source text and evaluated
 * standalone, so it cannot reference imported modules or shared constants. Every palette
 * entry and helper below must stay inline, duplicated across widget files by necessity.
 * Keep in sync with trend-widget.tsx and with Android's res/values + res/values-night.
 */
function RateWidget(props: RateWidgetProps, environment: WidgetEnvironment<RateWidgetConfiguration>) {
  "widget";

  const safeProps = props ?? {
    usdBcv: null,
    eurBcv: null,
    usdtBinance: null,
    updatedAt: 0,
    status: "empty",
  };

  const configuration = environment.configuration;
  const currency = configuration?.currency ?? "usd";
  const themePreference = configuration?.theme ?? "system";

  // User override wins; "system" defers to the environment.
  const isDark = themePreference === "dark" || (themePreference === "system" && environment.colorScheme === "dark");

  const backgroundColor = isDark ? "#0F172A" : "#F8FAFC";
  const surface = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const accent = isDark ? "#3B82F6" : "#0350FF";

  let value = safeProps.usdBcv;
  let ticker = "USD";
  let source = "BCV";
  let badgeBg = isDark ? "#1E3A8A" : "#EFF6FF";
  let badgeText = isDark ? "#93C5FD" : "#1D4ED8";

  if (currency === "eur") {
    value = safeProps.eurBcv;
    ticker = "EUR";
    source = "BCV";
    badgeBg = isDark ? "#14532D" : "#F0FDF4";
    badgeText = isDark ? "#86EFAC" : "#15803D";
  } else if (currency === "usdt") {
    value = safeProps.usdtBinance;
    ticker = "USDT";
    source = "Binance";
    badgeBg = isDark ? "#78350F" : "#FEF3C7";
    badgeText = isDark ? "#FDE68A" : "#B45309";
  }

  const hasValue = typeof value === "number" && Number.isFinite(value);

  // en-US deliberately: matches Android's String.format(Locale.US, "%,.2f", …) so both
  // platforms render the same digits. Do not "localize" this in isolation.
  const amount = hasValue
    ? (value as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

  let statusText = "";

  if (safeProps.status === "loading") {
    statusText = "Actualizando...";
  } else if (safeProps.status === "stale") {
    statusText = "Ultimo valor guardado";
  } else if (safeProps.status === "empty" || !hasValue) {
    statusText = "No disponible";
  } else if (safeProps.updatedAt > 0) {
    const updated = new Date(safeProps.updatedAt);
    const hours = `${updated.getHours()}`.padStart(2, "0");
    const minutes = `${updated.getMinutes()}`.padStart(2, "0");
    statusText = `Actualizado ${hours}:${minutes}`;
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
        spacing={0}
        alignment="leading"
        modifiers={[background(surface), cornerRadius(16), padding({ horizontal: 12, vertical: 10 })]}
      >
        <Text modifiers={[font({ weight: "semibold", size: isSmall ? 11 : 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>Bs.</Text>
        <Text modifiers={[font({ weight: "bold", size: isSmall ? 26 : 34 }), foregroundStyle(textPrimary), lineLimit(1)]}>{amount}</Text>
      </VStack>

      <Spacer minLength={0} />

      <Text modifiers={[font({ size: isSmall ? 9 : 10 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusText}</Text>
    </VStack>
  );
}

export default createWidget<RateWidgetProps, RateWidgetConfiguration>("RateWidget", RateWidget);
