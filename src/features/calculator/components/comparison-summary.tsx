import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { ConversionDetailRow } from "@/features/exchange/components/conversion-detail-row";
import type { ConversionDetail } from "@/features/exchange/types";
import { formatCompactAmount, formatDecimalNumber } from "@/features/exchange/utils";
import { useSettingsStore } from "@/features/settings/context/settings-context";

import type { ComparisonSummaryProps } from "../types";

export function ComparisonSummary({ firstOption, secondOption, result }: ComparisonSummaryProps) {
  const { decimalSeparator } = useSettingsStore();
  const [copiedDetailId, setCopiedDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedDetailId) return;

    const timeoutId = setTimeout(() => {
      setCopiedDetailId(null);
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [copiedDetailId]);

  const hasValues = firstOption.valueInVes > 0 || secondOption.valueInVes > 0;

  if (!hasValues) {
    return null;
  }

  const details: ConversionDetail[] = [
    {
      id: "first-price",
      label: `Precio A (${firstOption.currency.name})`,
      rateText:
        result?.betterSide === "first"
          ? "Conviene más"
          : firstOption.currency.symbol !== "Bs." && firstOption.rate > 0
            ? `@ Bs. ${formatCompactAmount(firstOption.rate, decimalSeparator)}`
            : "",
      amountText: `Bs. ${formatCompactAmount(firstOption.valueInVes, decimalSeparator)}`,
      icon: firstOption.currency.icon || "price-tag-3-line",
      isHighlight: result?.betterSide === "first",
    },
    {
      id: "second-price",
      label: `Precio B (${secondOption.currency.name})`,
      rateText:
        result?.betterSide === "second"
          ? "Conviene más"
          : secondOption.currency.symbol !== "Bs." && secondOption.rate > 0
            ? `@ Bs. ${formatCompactAmount(secondOption.rate, decimalSeparator)}`
            : "",
      amountText: `Bs. ${formatCompactAmount(secondOption.valueInVes, decimalSeparator)}`,
      icon: secondOption.currency.icon || "price-tag-3-line",
      isHighlight: result?.betterSide === "second",
    },
  ];

  if (result) {
    const winnerLabel = result.isEquivalent
      ? "Precios equivalentes"
      : result.betterSide === "first"
        ? "Precio A conviene más"
        : "Precio B conviene más";
    const savingText = result.isEquivalent
      ? "Mismo costo"
      : `Ahorras ${formatDecimalNumber(result.savingPercent, 2, decimalSeparator)}%`;

    details.push({
      id: "result-difference",
      label: winnerLabel,
      rateText: savingText,
      amountText: `Diferencia: Bs. ${formatCompactAmount(result.differenceVes, decimalSeparator)}`,
      icon: result.isEquivalent ? "equal-line" : "scales-3-line",
      isHighlight: false,
    });
  }

  return (
    <Animated.View entering={FadeIn.duration(300).springify().damping(20)} exiting={FadeOut.duration(200)}>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <AppText variant="subtitle" style={styles.headerTitle} numberOfLines={1}>
            Resultado de comparación
          </AppText>
        </Animated.View>

        {details.map((detail) => (
          <ConversionDetailRow
            key={detail.id}
            detail={detail}
            isCopied={copiedDetailId === detail.id}
            onCopy={() => setCopiedDetailId(detail.id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  headerTitle: {
    marginBottom: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.xxs,
  },
}));
