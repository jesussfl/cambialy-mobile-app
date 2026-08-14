import type { FC } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { UniRemixIcon } from "@/components/ui/icon";

import { ILLUSTRATION_INK } from "../../constants";
import type { IllustrationProps } from "../../lib/types";

const RATE_LABELS = ["BCV", "USDT", "EUR"] as const;

export const RatesIllustration: FC<IllustrationProps> = ({ accentColor }) => (
  <View style={styles.container}>
    <View style={styles.phoneShell}>
      <View style={[styles.phoneHeader, { backgroundColor: accentColor }]} />
      {RATE_LABELS.map((label, index) => (
        <View key={label} style={styles.rateRow}>
          <View style={[styles.rateIcon, index === 0 ? { backgroundColor: accentColor } : null]}>
            <UniRemixIcon name={index === 0 ? "bank-line" : "copper-coin-line"} size={18} color={ILLUSTRATION_INK} />
          </View>
          <View style={styles.rateCopy}>
            <AppText variant="tab" color={ILLUSTRATION_INK}>
              {label}
            </AppText>
            <View style={[styles.rateBar, { width: `${74 - index * 12}%` }]} />
          </View>
        </View>
      ))}
    </View>

    <View style={[styles.updateBadge, { backgroundColor: accentColor }]}>
      <UniRemixIcon name="refresh-line" size={24} color={ILLUSTRATION_INK} />
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneShell: {
    width: 210,
    minHeight: 238,
    borderRadius: theme.radius.xl,
    backgroundColor: "rgba(255,255,255,0.94)",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  phoneHeader: {
    width: 70,
    height: 8,
    borderRadius: theme.radius.pill,
    alignSelf: "center",
    marginBottom: theme.spacing.xs,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  rateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(7,16,31,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  rateCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rateBar: {
    height: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(7,16,31,0.16)",
  },
  updateBadge: {
    position: "absolute",
    right: theme.spacing.xl,
    bottom: theme.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
}));
