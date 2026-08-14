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

export type RatesWidgetStatus = "updated" | "stale" | "empty" | "loading";

/**
 * Nullable fields are optional because publishSnapshot strips null values before they
 * cross into native: expo-modules-core throws on `null` inside a `[String: Any]` props
 * dictionary and skips `undefined`. An absent key means "unavailable".
 */
export type RatesWidgetProps = {
  usdBcv?: number | null;
  eurBcv?: number | null;
  usdtBinance?: number | null;
  updatedAt: number;
  sourceUpdatedAt?: string | null;
  status?: RatesWidgetStatus;
};

/**
 * FULL widget — all three rates.
 *
 * Visual spec mirrors Android's res/layout/rates_widget.xml and its row includes: 14pt
 * frame padding, title at 15, bordered 12pt-radius rows with 12pt horizontal padding,
 * badge at 11, label at 12 secondary, and the value at 13 in the PRIMARY colour (not
 * text_primary) — that colour choice comes straight from the Android row layout.
 *
 * Modifier order is semantic: padding precedes background so the fill covers the padded
 * area, the way an Android <shape> fills its view.
 *
 * IMPORTANT: a `"widget"` function body is handed to native as source text and evaluated
 * standalone, so it cannot reference imported modules or shared constants. Every palette
 * entry below must stay inline — this is why it is duplicated across rate-widget.tsx and
 * trend-widget.tsx. Keep all three in sync with Android's res/values +
 * res/values-night/colors.xml.
 */
function RatesWidget(props: RatesWidgetProps, environment: WidgetEnvironment) {
  "widget";

  const safeProps = props ?? {
    usdBcv: null,
    eurBcv: null,
    usdtBinance: null,
    updatedAt: 0,
    sourceUpdatedAt: null,
    status: "empty",
  };

  const family = environment.widgetFamily;
  const isDark = environment.colorScheme === "dark";

  const backgroundColor = isDark ? "#0F172A" : "#F8FAFC";
  const surface = isDark ? "#1E293B" : "#FFFFFF";
  const cardStroke = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#3B82F6" : "#0350FF";
  const refreshBg = isDark ? "#1E3A8A" : "#EFF6FF";
  const refreshIcon = isDark ? "#93C5FD" : "#0350FF";

  const usdBadgeBg = isDark ? "#1E3A8A" : "#EFF6FF";
  const usdBadgeText = isDark ? "#93C5FD" : "#1D4ED8";
  const eurBadgeBg = isDark ? "#14532D" : "#F0FDF4";
  const eurBadgeText = isDark ? "#86EFAC" : "#15803D";
  const usdtBadgeBg = isDark ? "#78350F" : "#FEF3C7";
  const usdtBadgeText = isDark ? "#FDE68A" : "#B45309";

  const formatWidgetRate = (value: number | null | undefined) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "No disponible";
    }

    // en-US deliberately: matches Android's String.format(Locale.US, "Bs. %,.2f", …) so
    // both platforms render the same digits. Do not "localize" this in isolation.
    return `Bs. ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const usdBcv = formatWidgetRate(safeProps.usdBcv);
  const eurBcv = formatWidgetRate(safeProps.eurBcv);
  const usdtBinance = formatWidgetRate(safeProps.usdtBinance);

  let statusText = "Tasas actualizadas";

  if (safeProps.status === "loading") {
    statusText = "Actualizando tasas...";
  }

  if (safeProps.status === "stale") {
    statusText = "Mostrando ultimo valor guardado";
  }

  if (safeProps.status === "empty") {
    statusText = "Tasas no disponibles";
  }

  const isSmall = family === "systemSmall";
  const isLarge = family === "systemLarge";
  const statusWithSource = isLarge && safeProps.sourceUpdatedAt ? `${statusText} · ${safeProps.sourceUpdatedAt}` : statusText;

  // Built by a local function rather than .map(): the native renderer reads
  // props.children with `compactMap { $0 as? [String: Any] }`, which flattens exactly one
  // level, so a nested array child would be dropped silently rather than error.
  const renderRow = (ticker: string, label: string, value: string, badgeBg: string, badgeText: string) => (
    <HStack
      spacing={8}
      alignment="center"
      modifiers={[
        padding({ horizontal: 12, vertical: isLarge ? 12 : 10 }),
        background(surface),
        cornerRadius(12),
        strokeBorder({ color: cardStroke, style: { lineWidth: 1 }, shape: "roundedRectangle", cornerRadius: 12 }),
      ]}
    >
      <Text
        modifiers={[
          font({ weight: "bold", size: 11 }),
          foregroundStyle(badgeText),
          padding({ horizontal: 8, vertical: 3 }),
          background(badgeBg),
          cornerRadius(6),
          lineLimit(1),
        ]}
      >
        {ticker}
      </Text>
      <Text modifiers={[font({ weight: "bold", size: 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>{label}</Text>
      <Spacer minLength={4} />
      <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(primary), lineLimit(1), minimumScaleFactor(0.7)]}>
        {value}
      </Text>
    </HStack>
  );

  return (
    <VStack
      spacing={10}
      alignment="leading"
      modifiers={[containerBackground(backgroundColor, "widget"), padding({ all: 14 }), widgetURL("cambialy://exchange")]}
    >
      <HStack spacing={6} alignment="center">
        <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textPrimary), lineLimit(1)]}>
          {isSmall ? "Tasas" : "Tasas Cambialy"}
        </Text>
        <Spacer minLength={0} />
        <Text
          modifiers={[
            font({ weight: "bold", size: 15 }),
            foregroundStyle(refreshIcon),
            frame({ width: 32, height: 32 }),
            background(refreshBg),
            clipShape("circle"),
          ]}
        >
          ↻
        </Text>
      </HStack>

      {/* systemSmall is narrower than any Android cell this widget supports, so it drops
          EUR rather than truncating values. A null child is discarded by the same
          compactMap that flattens the children array. */}
      <VStack spacing={6} alignment="leading">
        {renderRow("USD", "BCV", usdBcv, usdBadgeBg, usdBadgeText)}
        {isSmall ? null : renderRow("EUR", "BCV", eurBcv, eurBadgeBg, eurBadgeText)}
        {renderRow("USDT", "Binance", usdtBinance, usdtBadgeBg, usdtBadgeText)}
      </VStack>

      <Spacer minLength={0} />

      <Text modifiers={[font({ size: 11 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusWithSource}</Text>
    </VStack>
  );
}

export default createWidget<RatesWidgetProps>("RatesWidget", RatesWidget);
