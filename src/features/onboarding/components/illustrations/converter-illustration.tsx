import type { FC } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { UniRemixIcon } from "@/components/ui/icon";

import { ILLUSTRATION_INK } from "../../constants";
import type { IllustrationProps } from "../../lib/types";

export const ConverterIllustration: FC<IllustrationProps> = ({ accentColor }) => (
  <View style={styles.container}>
    <View style={styles.currencyDisc}>
      <AppText variant="title" color={ILLUSTRATION_INK}>
        $
      </AppText>
    </View>
    <View style={[styles.swapCircle, { backgroundColor: accentColor }]}>
      <UniRemixIcon name="exchange-2-line" size={38} color={ILLUSTRATION_INK} />
    </View>
    <View style={[styles.currencyDisc, styles.currencyDiscRight]}>
      <AppText variant="title" color={ILLUSTRATION_INK}>
        Bs.
      </AppText>
    </View>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  currencyDisc: {
    position: "absolute",
    left: theme.spacing.lg,
    top: theme.spacing.xl,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  currencyDiscRight: {
    left: undefined,
    right: theme.spacing.lg,
    top: undefined,
    bottom: theme.spacing.xl,
  },
  swapCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  line: {
    position: "absolute",
    width: "72%",
    height: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: [{ rotate: "-18deg" }],
  },
}));
