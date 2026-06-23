import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { background, containerBackground, cornerRadius, font, foregroundStyle, frame, lineLimit, padding, widgetURL } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type RatesWidgetStatus = "updated" | "stale" | "empty" | "loading";

export type RatesWidgetProps = {
  usdBcv: number | null;
  eurBcv: number | null;
  usdtBinance: number | null;
  updatedAt: number;
  sourceUpdatedAt?: string | null;
  status?: RatesWidgetStatus;
};

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
  const backgroundColor = "#F8FAFC";
  const rowColor = "#FFFFFF";
  const textColor = "#07101F";
  const mutedColor = "#64748B";
  const primaryColor = "#0350FF";
  const formatWidgetRate = (value: number | null) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return "No disponible";
    }

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
        modifiers={[containerBackground(backgroundColor, "widget"), padding({ all: 12 }), widgetURL("cambialy://exchange")]}
      >
        <HStack spacing={6} alignment="center">
          <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(textColor), lineLimit(1)]}>Tasas Cambialy</Text>
          <Spacer minLength={0} />
          <Text modifiers={[font({ weight: "bold", size: 12 }), foregroundStyle(primaryColor)]}>↻</Text>
        </HStack>
        <VStack spacing={2}>
          <Text modifiers={[font({ weight: "semibold", size: 11 }), foregroundStyle(mutedColor), lineLimit(1)]}>USD BCV</Text>
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(primaryColor), lineLimit(1)]}>{usdBcv}</Text>
        </VStack>
        <VStack spacing={2}>
          <Text modifiers={[font({ weight: "semibold", size: 11 }), foregroundStyle(mutedColor), lineLimit(1)]}>USDT Binance</Text>
          <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(primaryColor), lineLimit(1)]}>{usdtBinance}</Text>
        </VStack>
        <Spacer minLength={0} />
        <Text modifiers={[font({ size: 10 }), foregroundStyle(mutedColor), lineLimit(1)]}>{statusText}</Text>
      </VStack>
    );
  }

  const isLarge = family === "systemLarge";
  const isMedium = family === "systemMedium";
  const statusWithSource = isLarge && safeProps.sourceUpdatedAt ? `${statusText} · ${safeProps.sourceUpdatedAt}` : statusText;

  if (isMedium) {
    return (
      <VStack
        spacing={8}
        modifiers={[containerBackground(backgroundColor, "widget"), padding({ horizontal: 12, vertical: 10 }), widgetURL("cambialy://exchange")]}
      >
        <HStack spacing={6} alignment="center">
          <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(textColor), lineLimit(1)]}>Tasas Cambialy</Text>
          <Spacer minLength={0} />
          <Text modifiers={[font({ weight: "bold", size: 13 }), foregroundStyle(primaryColor)]}>↻</Text>
        </HStack>

        <HStack spacing={8}>
          <VStack
            spacing={3}
            alignment="leading"
            modifiers={[background(rowColor), cornerRadius(10), padding({ horizontal: 9, vertical: 8 }), frame({ minHeight: 54 })]}
          >
            <Text modifiers={[font({ weight: "semibold", size: 10 }), foregroundStyle(mutedColor), lineLimit(1)]}>USD BCV</Text>
            <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(primaryColor), lineLimit(1)]}>{usdBcv}</Text>
          </VStack>
          <VStack
            spacing={3}
            alignment="leading"
            modifiers={[background(rowColor), cornerRadius(10), padding({ horizontal: 9, vertical: 8 }), frame({ minHeight: 54 })]}
          >
            <Text modifiers={[font({ weight: "semibold", size: 10 }), foregroundStyle(mutedColor), lineLimit(1)]}>EUR BCV</Text>
            <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(primaryColor), lineLimit(1)]}>{eurBcv}</Text>
          </VStack>
          <VStack
            spacing={3}
            alignment="leading"
            modifiers={[background(rowColor), cornerRadius(10), padding({ horizontal: 9, vertical: 8 }), frame({ minHeight: 54 })]}
          >
            <Text modifiers={[font({ weight: "semibold", size: 10 }), foregroundStyle(mutedColor), lineLimit(1)]}>USDT</Text>
            <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(primaryColor), lineLimit(1)]}>{usdtBinance}</Text>
          </VStack>
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack
      spacing={isLarge ? 12 : 8}
      modifiers={[containerBackground(backgroundColor, "widget"), padding({ all: isLarge ? 18 : 12 }), widgetURL("cambialy://exchange")]}
    >
      <HStack spacing={6} alignment="center">
        <Text modifiers={[font({ weight: "bold", size: 15 }), foregroundStyle(textColor), lineLimit(1)]}>Tasas Cambialy</Text>
        <Spacer minLength={0} />
        <Text modifiers={[font({ weight: "bold", size: 14 }), foregroundStyle(primaryColor)]}>↻</Text>
      </HStack>
      <VStack spacing={isLarge ? 10 : 6}>
        <HStack
          spacing={8}
          alignment="center"
          modifiers={[background(rowColor), cornerRadius(12), padding({ horizontal: 10, vertical: isLarge ? 12 : 8 }), frame({ minHeight: isLarge ? 44 : 34 })]}
        >
          <Text modifiers={[font({ weight: "bold", size: isLarge ? 14 : 12 }), foregroundStyle(textColor), lineLimit(1)]}>USD BCV</Text>
          <Spacer minLength={4} />
          <Text modifiers={[font({ weight: "bold", size: isLarge ? 15 : 12 }), foregroundStyle(primaryColor), lineLimit(1)]}>{usdBcv}</Text>
        </HStack>
        <HStack
          spacing={8}
          alignment="center"
          modifiers={[background(rowColor), cornerRadius(12), padding({ horizontal: 10, vertical: isLarge ? 12 : 8 }), frame({ minHeight: isLarge ? 44 : 34 })]}
        >
          <Text modifiers={[font({ weight: "bold", size: isLarge ? 14 : 12 }), foregroundStyle(textColor), lineLimit(1)]}>EUR BCV</Text>
          <Spacer minLength={4} />
          <Text modifiers={[font({ weight: "bold", size: isLarge ? 15 : 12 }), foregroundStyle(primaryColor), lineLimit(1)]}>{eurBcv}</Text>
        </HStack>
        <HStack
          spacing={8}
          alignment="center"
          modifiers={[background(rowColor), cornerRadius(12), padding({ horizontal: 10, vertical: isLarge ? 12 : 8 }), frame({ minHeight: isLarge ? 44 : 34 })]}
        >
          <Text modifiers={[font({ weight: "bold", size: isLarge ? 14 : 12 }), foregroundStyle(textColor), lineLimit(1)]}>USDT Binance</Text>
          <Spacer minLength={4} />
          <Text modifiers={[font({ weight: "bold", size: isLarge ? 15 : 12 }), foregroundStyle(primaryColor), lineLimit(1)]}>{usdtBinance}</Text>
        </HStack>
      </VStack>
      <Spacer minLength={0} />
      <Text modifiers={[font({ size: 11 }), foregroundStyle(mutedColor), lineLimit(1)]}>{statusWithSource}</Text>
    </VStack>
  );
}

export default createWidget<RatesWidgetProps>("RatesWidget", RatesWidget);
