import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { UniRemixIcon } from "@/components/ui/icon";
import { formatCompactAmount, formatNumber } from "@/features/exchange/utils";

import { useSettingsStore } from "@/features/settings/context/settings-context";
import type { ComparisonSummaryProps, SummaryMetricProps } from "../types";

export function ComparisonSummary({ firstOption, secondOption, result }: ComparisonSummaryProps) {
  const { decimalSeparator } = useSettingsStore();
  const hasValues = firstOption.valueInVes > 0 || secondOption.valueInVes > 0;
  const winnerLabel = result?.isEquivalent ? "Precios equivalentes" : result?.betterSide === "first" ? "Precio A conviene mas" : "Precio B conviene mas";

  return (
    <Card elevated style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTitleGroup}>
          <AppText variant="tab" style={styles.summaryEyebrow}>
            Resultado
          </AppText>
          <AppText variant="cardTitle" style={styles.summaryTitle}>
            {result ? winnerLabel : "Ingresa ambos precios"}
          </AppText>
        </View>
        <View style={styles.summaryBadge}>
          <UniRemixIcon
            name={result?.isEquivalent ? "equal-line" : "price-tag-3-line"}
            size={18}
            uniProps={(theme: any) => ({
              color: theme.colors.accentText,
            })}
          />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryMetric
          label="Precio A en Bs."
          value={`Bs. ${formatCompactAmount(firstOption.valueInVes, decimalSeparator)}`}
          isActive={result?.betterSide === "first"}
        />
        <SummaryMetric
          label="Precio B en Bs."
          value={`Bs. ${formatCompactAmount(secondOption.valueInVes, decimalSeparator)}`}
          isActive={result?.betterSide === "second"}
        />
      </View>

      <View style={styles.differenceBox}>
        <AppText variant="label">Diferencia</AppText>
        <AppText variant="title" style={styles.differenceValue} numberOfLines={1}>
          {result ? `Bs. ${formatCompactAmount(result.differenceVes, decimalSeparator)}` : "Bs. 0"}
        </AppText>
        <AppText variant="body">
          {result
            ? result.isEquivalent
              ? "Ambos precios tienen el mismo costo en bolivares."
              : `Ahorras ${formatNumber(result.savingPercent, 2, decimalSeparator)}% frente a la opcion mas cara.`
            : hasValues
              ? "Falta completar uno de los precios para comparar."
              : "Compara precios usando VES, BCV, Divisa (USDT), EUR o una tasa personalizada."}
        </AppText>
      </View>
    </Card>
  );
}

function SummaryMetric({ isActive, label, value }: SummaryMetricProps) {
  return (
    <View style={[styles.summaryMetric, isActive ? styles.summaryMetricActive : null]}>
      <AppText variant="tab" style={styles.summaryMetricLabel}>
        {label}
      </AppText>
      <AppText variant="value" style={styles.summaryMetricValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  summaryCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  summaryTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  summaryEyebrow: {
    color: theme.colors.textMuted,
  },
  summaryTitle: {
    flexShrink: 1,
  },
  summaryBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.accent,
  },
  summaryGrid: {
    gap: theme.spacing.sm,
  },
  summaryMetric: {
    gap: theme.spacing.xxs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  summaryMetricActive: {
    borderColor: theme.colors.accent,
  },
  summaryMetricLabel: {
    color: theme.colors.textMuted,
  },
  summaryMetricValue: {
    fontSize: theme.typography.fontSize.md,
  },
  differenceBox: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundAccent,
  },
  differenceValue: {
    color: theme.colors.textPrimary,
  },
}));
