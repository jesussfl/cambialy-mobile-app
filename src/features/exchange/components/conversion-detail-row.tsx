import * as Clipboard from "expo-clipboard";
import { View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { TouchZone } from "@/components/ui/button";

import type { ConversionDetail } from "../types";

const UniRemixIcon = withUnistyles(RemixIcon);

type ConversionDetailRowProps = {
  detail: ConversionDetail;
  isCopied: boolean;
  onCopy: () => void;
  isHighlight?: boolean;
};

export function ConversionDetailRow({ detail, isCopied, onCopy, isHighlight }: ConversionDetailRowProps) {
  const highlighted = isHighlight ?? detail.isHighlight;

  const handlePress = async () => {
    if (!detail.amountText) return;
    await Clipboard.setStringAsync(detail.amountText);
    onCopy();
  };

  return (
    <TouchZone style={[styles.conversionDetailRow, highlighted && styles.conversionDetailRowHighlighted]} onPress={handlePress}>
      <View style={[styles.conversionDetailIcon, highlighted && styles.conversionDetailIconHighlighted]}>
        <UniRemixIcon
          name={detail.icon}
          size={20}
          uniProps={(theme: any) => ({
            color: theme.colors.primary,
          })}
        />
      </View>

      <View style={styles.conversionDetailContent}>
        <View style={styles.conversionDetailHeader}>
          <AppText variant="label" style={[styles.conversionDetailTitle, highlighted && styles.conversionDetailTitleHighlighted]} numberOfLines={1}>
            {detail.label}
          </AppText>
          <AppText variant="label" style={[styles.conversionDetailRate, highlighted && styles.conversionDetailRateHighlighted]} numberOfLines={1}>
            {detail.rateText}
          </AppText>
        </View>

        <View style={styles.conversionDetailFooter}>
          <AppText style={styles.conversionDetailAmount} numberOfLines={1}>
            {detail.amountText}
          </AppText>

          <CopyIconButton text={detail.amountText} style={{ width: 32, height: 32 }} copied={isCopied} onCopy={onCopy} size={16} />
        </View>
      </View>
    </TouchZone>
  );
}

const styles = StyleSheet.create((theme) => ({
  conversionDetailRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  conversionDetailRowHighlighted: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSoft,
  },
  conversionDetailIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.inputSurface,
  },
  conversionDetailIconHighlighted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  conversionDetailContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  conversionDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  conversionDetailTitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
    flexShrink: 1,
  },
  conversionDetailTitleHighlighted: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  conversionDetailRate: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textMuted,
  },
  conversionDetailRateHighlighted: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  conversionDetailFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
  },
  conversionDetailAmount: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
}));
