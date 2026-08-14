import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { background, containerBackground, cornerRadius, font, foregroundStyle, frame, lineLimit, padding, widgetURL } from "@expo/ui/swift-ui/modifiers";
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
 * IMPORTANT: the body of a `"widget"` function is handed to native as source text and
 * evaluated in a standalone JS context whose only dependencies are the globals injected
 * by expo-widgets. It therefore CANNOT reference imported modules, shared constants or
 * helpers from elsewhere in this repo — every palette entry and helper below must stay
 * inline. This is why the palette is duplicated across rate-widget.tsx and
 * trend-widget.tsx rather than extracted; keep the three in sync by hand, and keep them
 * in sync with the Android res/values/colors.xml + res/values-night/colors.xml pair.
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

  const background_ = isDark ? "#0F172A" : "#F8FAFC";
  const surface = isDark ? "#1E293B" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const accent = isDark ? "#3B82F6" : "#0350FF";

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

    // en-US deliberately: matches Android's String.format(Locale.US, "Bs. %,.2f", …)
    // so both platforms render the same digits. Do not "localize" this in isolation.
    return `Bs. ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  if (family === "systemSmall") {
    return (
      <VStack
        spacing={8}
        modifiers={[containerBackground(background_, "widget"), padding({ all: 12 }), widgetURL("cambialy://exchange")]}
      >
        <HStack spacing={6} alignment="center">
          <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(textPrimary), lineLimit(1)]}>Tasas</Text>
          <Spacer minLength={0} />
          <Text modifiers={[font({ weight: "bold", size: 12 }), foregroundStyle(accent)]}>↻</Text>
        </HStack>

        <VStack
          spacing={2}
          alignment="leading"
          modifiers={[background(surface), cornerRadius(12), padding({ horizontal: 10, vertical: 8 }), frame({ minHeight: 46 })]}
        >
          <Text modifiers={[font({ weight: "bold", size: 10 }), foregroundStyle(usdBadgeText), lineLimit(1)]}>USD BCV</Text>
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textPrimary), lineLimit(1)]}>{usdBcv}</Text>
        </VStack>

        <VStack
          spacing={2}
          alignment="leading"
          modifiers={[background(surface), cornerRadius(12), padding({ horizontal: 10, vertical: 8 }), frame({ minHeight: 46 })]}
        >
          <Text modifiers={[font({ weight: "bold", size: 10 }), foregroundStyle(usdtBadgeText), lineLimit(1)]}>USDT BINANCE</Text>
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textPrimary), lineLimit(1)]}>{usdtBinance}</Text>
        </VStack>

        <Spacer minLength={0} />
        <Text modifiers={[font({ size: 9 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusText}</Text>
      </VStack>
    );
  }

  const isLarge = family === "systemLarge";
  const statusWithSource = isLarge && safeProps.sourceUpdatedAt ? `${statusText} · ${safeProps.sourceUpdatedAt}` : statusText;

  if (family === "systemMedium") {
    return (
      <VStack
        spacing={9}
        modifiers={[containerBackground(background_, "widget"), padding({ horizontal: 14, vertical: 12 }), widgetURL("cambialy://exchange")]}
      >
        <HStack spacing={6} alignment="center">
          <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(textPrimary), lineLimit(1)]}>Tasas Cambialy</Text>
          <Spacer minLength={0} />
          <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(accent)]}>↻</Text>
        </HStack>

        <HStack spacing={8}>
          <VStack
            spacing={4}
            alignment="leading"
            modifiers={[background(surface), cornerRadius(12), padding({ horizontal: 10, vertical: 9 }), frame({ minHeight: 58 })]}
          >
            <Text
              modifiers={[font({ weight: "bold", size: 9 }), foregroundStyle(usdBadgeText), background(usdBadgeBg), cornerRadius(5), padding({ horizontal: 5, vertical: 2 }), lineLimit(1)]}
            >
              USD
            </Text>
            <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(textPrimary), lineLimit(1)]}>{usdBcv}</Text>
          </VStack>

          <VStack
            spacing={4}
            alignment="leading"
            modifiers={[background(surface), cornerRadius(12), padding({ horizontal: 10, vertical: 9 }), frame({ minHeight: 58 })]}
          >
            <Text
              modifiers={[font({ weight: "bold", size: 9 }), foregroundStyle(eurBadgeText), background(eurBadgeBg), cornerRadius(5), padding({ horizontal: 5, vertical: 2 }), lineLimit(1)]}
            >
              EUR
            </Text>
            <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(textPrimary), lineLimit(1)]}>{eurBcv}</Text>
          </VStack>

          <VStack
            spacing={4}
            alignment="leading"
            modifiers={[background(surface), cornerRadius(12), padding({ horizontal: 10, vertical: 9 }), frame({ minHeight: 58 })]}
          >
            <Text
              modifiers={[font({ weight: "bold", size: 9 }), foregroundStyle(usdtBadgeText), background(usdtBadgeBg), cornerRadius(5), padding({ horizontal: 5, vertical: 2 }), lineLimit(1)]}
            >
              USDT
            </Text>
            <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(textPrimary), lineLimit(1)]}>{usdtBinance}</Text>
          </VStack>
        </HStack>

        <Text modifiers={[font({ size: 10 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusText}</Text>
      </VStack>
    );
  }

  return (
    <VStack
      spacing={12}
      modifiers={[containerBackground(background_, "widget"), padding({ all: 18 }), widgetURL("cambialy://exchange")]}
    >
      <HStack spacing={6} alignment="center">
        <Text modifiers={[font({ weight: "bold", size: 16 }), foregroundStyle(textPrimary), lineLimit(1)]}>Tasas Cambialy</Text>
        <Spacer minLength={0} />
        <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(accent)]}>↻</Text>
      </HStack>

      <VStack spacing={10}>
        <HStack
          spacing={10}
          alignment="center"
          modifiers={[background(surface), cornerRadius(14), padding({ horizontal: 12, vertical: 12 }), frame({ minHeight: 46 })]}
        >
          <Text
            modifiers={[font({ weight: "bold", size: 10 }), foregroundStyle(usdBadgeText), background(usdBadgeBg), cornerRadius(6), padding({ horizontal: 6, vertical: 3 }), lineLimit(1)]}
          >
            USD
          </Text>
          <Text modifiers={[font({ weight: "semibold", size: 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>BCV</Text>
          <Spacer minLength={4} />
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textPrimary), lineLimit(1)]}>{usdBcv}</Text>
        </HStack>

        <HStack
          spacing={10}
          alignment="center"
          modifiers={[background(surface), cornerRadius(14), padding({ horizontal: 12, vertical: 12 }), frame({ minHeight: 46 })]}
        >
          <Text
            modifiers={[font({ weight: "bold", size: 10 }), foregroundStyle(eurBadgeText), background(eurBadgeBg), cornerRadius(6), padding({ horizontal: 6, vertical: 3 }), lineLimit(1)]}
          >
            EUR
          </Text>
          <Text modifiers={[font({ weight: "semibold", size: 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>BCV</Text>
          <Spacer minLength={4} />
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textPrimary), lineLimit(1)]}>{eurBcv}</Text>
        </HStack>

        <HStack
          spacing={10}
          alignment="center"
          modifiers={[background(surface), cornerRadius(14), padding({ horizontal: 12, vertical: 12 }), frame({ minHeight: 46 })]}
        >
          <Text
            modifiers={[font({ weight: "bold", size: 10 }), foregroundStyle(usdtBadgeText), background(usdtBadgeBg), cornerRadius(6), padding({ horizontal: 6, vertical: 3 }), lineLimit(1)]}
          >
            USDT
          </Text>
          <Text modifiers={[font({ weight: "semibold", size: 12 }), foregroundStyle(textSecondary), lineLimit(1)]}>Binance</Text>
          <Spacer minLength={4} />
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textPrimary), lineLimit(1)]}>{usdtBinance}</Text>
        </HStack>
      </VStack>

      <Spacer minLength={0} />
      <Text modifiers={[font({ size: 11 }), foregroundStyle(textSecondary), lineLimit(1)]}>{statusWithSource}</Text>
    </VStack>
  );
}

export default createWidget<RatesWidgetProps>("RatesWidget", RatesWidget);
