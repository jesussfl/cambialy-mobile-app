import type { FC } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { TouchZone } from "@/components/ui/button";

type PaginationItemProps = {
  accessibilityLabel: string;
  activeWidth: number;
  currentSlideIndex: number;
  inactiveWidth: number;
  index: number;
  onPress: (index: number) => void;
  slideProgress: SharedValue<number>;
  timerProgress: SharedValue<number>;
};

/**
 * The fill wrapper must carry real dimensions of its own: an absolutely
 * positioned child contributes no layout height, so a plain flex wrapper would
 * collapse to zero and the fill would never paint.
 */
const FILL_LAYOUT: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  transformOrigin: "left center",
};

export const PaginationItem: FC<PaginationItemProps> = ({
  accessibilityLabel,
  activeWidth,
  currentSlideIndex,
  inactiveWidth,
  index,
  onPress,
  slideProgress,
  timerProgress,
}) => {
  const trackStyle = useAnimatedStyle(() => {
    const distanceFromActive = Math.abs(slideProgress.value - index);

    return {
      width: interpolate(distanceFromActive, [0, 1], [activeWidth, inactiveWidth], Extrapolation.CLAMP),
      opacity: interpolate(distanceFromActive, [0, 1], [1, 0.42], Extrapolation.CLAMP),
    };
  }, [activeWidth, inactiveWidth, index]);

  // Two fills compete for the same bar and the larger one wins.
  //
  // `passedFill` is scroll-derived and grows only as the deck moves *beyond*
  // this slide, so swiping away completes the bar instead of snapping it.
  // `timerFill` is the dwell countdown, and applies to the active bar alone.
  // Taking the max means the countdown reads as elapsed time while the slide is
  // held, then hands over to the gesture the moment the user starts swiping —
  // the bar never jumps backwards, whichever is driving it.
  const fillStyle = useAnimatedStyle(() => {
    const passedFill = interpolate(slideProgress.value, [index, index + 1], [0, 1], Extrapolation.CLAMP);
    const timerFill = currentSlideIndex === index ? timerProgress.value : 0;

    return {
      transform: [{ scaleX: Math.max(passedFill, timerFill) }],
    };
  }, [currentSlideIndex, index]);

  return (
    <TouchZone
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(index)}
      style={styles.pressable}
    >
      <Animated.View style={trackStyle}>
        <View style={styles.track}>
          <View style={styles.trackBase} />
          <Animated.View style={[FILL_LAYOUT, fillStyle]}>
            <View style={styles.fill} />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchZone>
  );
};

const styles = StyleSheet.create((theme) => ({
  pressable: {
    height: 28,
    justifyContent: "center",
  },
  track: {
    height: 6,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  trackBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.borderSubtle,
  },
  fill: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
  },
}));
