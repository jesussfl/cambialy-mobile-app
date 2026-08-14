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

export type RateWidgetStatus = "updated" | "stale" | "empty" | "loading";

/**
 * Nullable fields are optional because publishSnapshot strips null values before they
 * cross into native: expo-modules-core throws on `null` inside a `[String: Any]` props
 * dictionary and skips `undefined`. An absent key means "unavailable".
 */
export type RateWidgetProps = {
  usdBcv?: number | null;
  eurBcv?: number | null;
  usdtBinance?: number | null;
  updatedAt: number;
  status?: RateWidgetStatus;
};

export type RateWidgetConfiguration = {
  currency: string;
  theme: string;
};

/**
 * RATE widget — one user-selected currency, rendered large.
 *
 * Visual spec mirrors Android's res/layout/rate_widget.xml: 16pt frame padding, a
 * bordered 18pt-radius surface, a 30pt circular refresh button, and the Android type
 * scale (badge 11, source 12, value 32, status 11).
 *
 * Modifier ORDER is semantic in SwiftUI: padding must precede background so the fill
 * covers the padded area, matching how an Android <shape> fills its view.
 *
 * IMPORTANT: a `"widget"` function body is handed to native as source text and evaluated
 * standalone, so it cannot reference imported modules or shared constants. Every palette
 * entry below must stay inline. Keep in sync with trend-widget.tsx, rates-widget.tsx and
 * Android's res/values + res/values-night.
 */
function RateWidget(props: RateWidgetProps, environment: WidgetEnvironment<RateWidgetConfiguration>) {
  "widget";

  const safeProps = props ?? { usdBcv: null, eurBcv: null, usdtBinance: null, updatedAt: 0, status: "empty" };

  const configuration = environment.configuration;
  const currency = configuration?.currency ?? "usd";
  const themePreference = configuration?.theme ?? "system";

  // User override wins; "system" defers to the environment.
  const isDark = themePreference === "dark" || (themePreference === "system" && environment.colorScheme === "dark");

  const backgroundColor = isDark ? "#0F172A" : "#F8FAFC";
  const surface = isDark ? "#1E293B" : "#FFFFFF";
  const cardStroke = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const refreshBg = isDark ? "#1E3A8A" : "#EFF6FF";
  const refreshIcon = isDark ? "#93C5FD" : "#0350FF";

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
        spacing={0}
        alignment="leading"
        modifiers={[
          padding({ horizontal: 14, vertical: 12 }),
          background(surface),
          cornerRadius(18),
          strokeBorder({ color: cardStroke, style: { lineWidth: 1 }, shape: "roundedRectangle", cornerRadius: 18 }),
        ]}
      >
        {/* Trailing Spacers stretch each row to the full width, which is how this card
            matches Android's match_parent without relying on an infinite maxWidth. */}
        <HStack spacing={0}>
          <Text modifiers={[font({ weight: "bold", size: 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>Bs.</Text>
          <Spacer minLength={0} />
        </HStack>
        <HStack spacing={0}>
          <Text
            modifiers={[
              font({ weight: "bold", size: 32 }),
              foregroundStyle(textPrimary),
              lineLimit(1),
              // Shrink rather than truncate: a clipped rate is a wrong number on screen.
              minimumScaleFactor(0.6),
            ]}
          >
            {amount}
          </Text>
          <Spacer minLength={0} />
        </HStack>
      </VStack>

      <Spacer minLength={0} />

      <Text modifiers={[font({ size: 11 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusText}</Text>
    </VStack>
  );
}

export default createWidget<RateWidgetProps, RateWidgetConfiguration>("RateWidget", RateWidget);
