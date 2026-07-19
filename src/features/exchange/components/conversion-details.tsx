import { View, type StyleProp, type ViewStyle } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { CopyIconButton } from "@/components/ui/copy-icon-button";

import { useEffect, useState } from "react";
import type { ConversionDetail } from "../types";
import { AnimatedAmountText } from "./animated-amount-text";
const UniRemixIcon = withUnistyles(RemixIcon);

type ConversionDetailsProps = {
  details: ConversionDetail[];
  formula?: string;
  style?: StyleProp<ViewStyle>;
};

export function ConversionDetails({ details, formula, style }: ConversionDetailsProps) {
  const [copiedDetailId, setCopiedDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedDetailId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCopiedDetailId(null);
    }, 1600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [copiedDetailId]);

  if (!details.length) {
    return null;
  }

  return (
    <View style={[styles.conversionDetails, style]}>
      {formula ? (
        <AppText variant="tab" style={styles.conversionFormula} numberOfLines={1}>
          {formula}
        </AppText>
      ) : null}
      {details.map((detail) => (
        <View key={detail.id} style={styles.conversionDetailRow}>
          <View style={styles.conversionDetailMeta}>
            <View style={styles.conversionDetailIcon}>
              <UniRemixIcon
                name={detail.icon}
                size={14}
                uniProps={(theme: any) => ({
                  color: theme.colors.primary,
                })}
              />
            </View>
            <View style={styles.conversionDetailCopy}>
              <AppText variant="tab" numberOfLines={1}>
                {detail.label}
              </AppText>
              <AppText variant="tab" style={styles.conversionDetailRate} numberOfLines={1}>
                {detail.rateText}
              </AppText>
            </View>
          </View>

          <View style={{ flex: 1, maxWidth: "44%", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <AnimatedAmountText containerStyle={styles.conversionDetailAmountRow} style={styles.conversionDetailAmount} text={detail.amountText} />

            <CopyIconButton
              text={detail.amountText}
              copied={copiedDetailId === detail.id}
              onCopy={() => setCopiedDetailId(detail.id)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  conversionDetails: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  conversionFormula: {
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.xs,
  },
  conversionDetailRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.sm,
  },
  conversionDetailMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  conversionDetailIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
  },
  conversionDetailCopy: {
    flex: 1,
    minWidth: 0,
  },
  conversionDetailRate: {
    color: theme.colors.textMuted,
  },
  conversionDetailAmountRow: {
    justifyContent: "flex-end",
  },
  conversionDetailAmount: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: "right",
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
}));
