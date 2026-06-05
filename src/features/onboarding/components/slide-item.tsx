import type { FC } from "react";
import { View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import type { OnboardingSlide } from "../lib/types";

type SlideItemProps = {
  item: OnboardingSlide;
  index: number;
  width: number;
  scrollOffsetX: SharedValue<number>;
};

const UniRemixIcon = withUnistyles(RemixIcon);

export const SlideItem: FC<SlideItemProps> = ({ item, index, width, scrollOffsetX }) => {
  const rStyle = useAnimatedStyle(() => {
    const inputRange = [width * (index - 1), width * index, width * (index + 1)];
    const rotate = interpolate(scrollOffsetX.value, inputRange, [2, 0, -2], Extrapolation.CLAMP);
    const translateY = interpolate(scrollOffsetX.value, inputRange, [8, 0, 8], Extrapolation.CLAMP);
    const scale = interpolate(scrollOffsetX.value, inputRange, [0.96, 1, 0.96], Extrapolation.CLAMP);

    return {
      transform: [{ translateY }, { rotate: `${rotate}deg` }, { scale }],
    };
  }, [scrollOffsetX, index, width]);

  return (
    <Animated.View style={[styles.slideFrame, { width }, rStyle]}>
      <View style={[styles.card, { backgroundColor: item.bgColor }]}>
        <View style={styles.copy}>
          <View style={[styles.badge, { backgroundColor: item.accentColor }]}>
            <UniRemixIcon name="exchange-dollar-line" size={18} color="#07101F" />
          </View>
          <AppText variant="title" color="#FFFFFF" style={styles.title}>
            {item.title}
          </AppText>
          <AppText variant="body" color="rgba(255,255,255,0.78)" style={styles.subtitle}>
            {item.subtitle}
          </AppText>
        </View>

        <View style={styles.visualWrap}>
          <View style={[styles.visualGlow, { backgroundColor: item.accentColor }]} />
          <SlideIllustration type={item.illustration} accentColor={item.accentColor} />
        </View>
      </View>
    </Animated.View>
  );
};

function SlideIllustration({ type, accentColor }: { type: OnboardingSlide["illustration"]; accentColor: string }) {
  if (type === "compare") {
    return (
      <View style={styles.compareIllustration}>
        <View style={[styles.priceCard, styles.priceCardLeft]}>
          <AppText variant="tab" color="#07101F">
            Precio A
          </AppText>
          <AppText variant="title" color="#07101F">
            $24
          </AppText>
          <View style={[styles.savingPill, { backgroundColor: accentColor }]}>
            <AppText variant="tab" color="#07101F">
              Mejor
            </AppText>
          </View>
        </View>
        <View style={[styles.priceCard, styles.priceCardRight]}>
          <AppText variant="tab" color="#07101F">
            Precio B
          </AppText>
          <AppText variant="title" color="#07101F">
            Bs.
          </AppText>
          <View style={styles.mutedLine} />
        </View>
        <View style={[styles.centerOrb, { backgroundColor: accentColor }]}>
          <UniRemixIcon name="arrow-left-right-line" size={34} color="#07101F" />
        </View>
      </View>
    );
  }

  if (type === "rates") {
    return (
      <View style={styles.ratesIllustration}>
        <View style={styles.phoneShell}>
          <View style={[styles.phoneHeader, { backgroundColor: accentColor }]} />
          {["BCV", "USDT", "EUR"].map((label, index) => (
            <View key={label} style={styles.rateRow}>
              <View style={[styles.rateIcon, index === 0 ? { backgroundColor: accentColor } : null]}>
                <UniRemixIcon name={index === 0 ? "bank-line" : "copper-coin-line"} size={18} color="#07101F" />
              </View>
              <View style={styles.rateCopy}>
                <AppText variant="tab" color="#07101F">
                  {label}
                </AppText>
                <View style={[styles.rateBar, { width: `${74 - index * 12}%` }]} />
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.updateBadge, { backgroundColor: accentColor }]}>
          <UniRemixIcon name="refresh-line" size={24} color="#07101F" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.converterIllustration}>
      <View style={styles.currencyDisc}>
        <AppText variant="title" color="#07101F">
          $
        </AppText>
      </View>
      <View style={[styles.swapCircle, { backgroundColor: accentColor }]}>
        <UniRemixIcon name="exchange-2-line" size={38} color="#07101F" />
      </View>
      <View style={[styles.currencyDisc, styles.currencyDiscRight]}>
        <AppText variant="title" color="#07101F">
          Bs.
        </AppText>
      </View>
      <View style={styles.converterLine} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  slideFrame: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing["3xl"],
    paddingBottom: theme.spacing.xl,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  copy: {
    gap: theme.spacing.md,
    zIndex: 2,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    maxWidth: 290,
  },
  subtitle: {
    maxWidth: 300,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.md,
  },
  visualWrap: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  visualGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.18,
  },
  converterIllustration: {
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
  converterLine: {
    position: "absolute",
    width: "72%",
    height: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: [{ rotate: "-18deg" }],
  },
  compareIllustration: {
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
  ratesIllustration: {
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
