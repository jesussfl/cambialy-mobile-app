import type { FC } from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { UniRemixIcon } from "@/components/ui/icon";

import { ILLUSTRATION_INK } from "../constants";
import type { OnboardingSlide } from "../lib/types";
import { ILLUSTRATIONS } from "./illustrations";

type SlideItemProps = {
  index: number;
  item: OnboardingSlide;
  slideProgress: SharedValue<number>;
  width: number;
};

export const SlideItem: FC<SlideItemProps> = ({ index, item, slideProgress, width }) => {
  const isReducedMotion = useReducedMotion();
  const Illustration = ILLUSTRATIONS[item.illustration];

  const animatedStyle = useAnimatedStyle(() => {
    if (isReducedMotion) {
      return { transform: [{ translateY: 0 }, { rotate: "0deg" }, { scale: 1 }] };
    }

    const inputRange = [index - 1, index, index + 1];
    const translateY = interpolate(slideProgress.value, inputRange, [8, 0, 8], Extrapolation.CLAMP);
    const rotate = interpolate(slideProgress.value, inputRange, [2, 0, -2], Extrapolation.CLAMP);
    const scale = interpolate(slideProgress.value, inputRange, [0.96, 1, 0.96], Extrapolation.CLAMP);

    return { transform: [{ translateY }, { rotate: `${rotate}deg` }, { scale }] };
  }, [index, isReducedMotion]);

  // Only plain styles may be array-merged with an animated style on an
  // Animated.View — Unistyles styles live on the inner views.
  return (
    <Animated.View style={[{ flex: 1, width }, animatedStyle]}>
      <View style={styles.slideFrame}>
        <View style={[styles.card, { backgroundColor: item.bgColor }]}>
          <View style={styles.copy}>
            <View style={[styles.badge, { backgroundColor: item.accentColor }]}>
              <UniRemixIcon name="exchange-dollar-line" size={18} color={ILLUSTRATION_INK} />
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
            <Illustration accentColor={item.accentColor} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

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
}));
