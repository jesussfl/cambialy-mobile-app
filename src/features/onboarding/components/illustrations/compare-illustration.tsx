import type { FC } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { UniRemixIcon } from "@/components/ui/icon";

import { ILLUSTRATION_INK } from "../../constants";
import type { IllustrationProps } from "../../lib/types";

export const CompareIllustration: FC<IllustrationProps> = ({ accentColor }) => (
  <View style={styles.container}>
    <View style={[styles.priceCard, styles.priceCardLeft]}>
      <AppText variant="tab" color={ILLUSTRATION_INK}>
        Precio A
      </AppText>
      <AppText variant="title" color={ILLUSTRATION_INK}>
        $24
      </AppText>
      <View style={[styles.savingPill, { backgroundColor: accentColor }]}>
        <AppText variant="tab" color={ILLUSTRATION_INK}>
          Mejor
        </AppText>
      </View>
    </View>

    <View style={[styles.priceCard, styles.priceCardRight]}>
      <AppText variant="tab" color={ILLUSTRATION_INK}>
        Precio B
      </AppText>
      <AppText variant="title" color={ILLUSTRATION_INK}>
        Bs.
      </AppText>
      <View style={styles.mutedLine} />
    </View>

    <View style={[styles.centerOrb, { backgroundColor: accentColor }]}>
      <UniRemixIcon name="arrow-left-right-line" size={34} color={ILLUSTRATION_INK} />
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  priceCard: {
    position: "absolute",
    width: 142,
    minHeight: 148,
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(255,255,255,0.94)",
    padding: theme.spacing.md,
    justifyContent: "space-between",
  },
  priceCardLeft: {
    left: theme.spacing.xs,
    transform: [{ rotate: "-7deg" }],
  },
  priceCardRight: {
    right: theme.spacing.xs,
    transform: [{ rotate: "8deg" }],
  },
  savingPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  mutedLine: {
    width: "72%",
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(7,16,31,0.14)",
  },
  centerOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
}));
