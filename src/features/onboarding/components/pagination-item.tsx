import { useEffect, type FC } from "react";
import { View } from "react-native";
import { TouchZone } from "@/components/ui/button";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type PaginationItemProps = {
  index: number;
  currentSlideIndex: number;
  animatedSlideIndex: SharedValue<number>;
  inactiveWidth: number;
  activeWidth: number;
  totalSlides: number;
  isDragging: SharedValue<boolean>;
  slideDuration: number;
  handleScrollToIndex: (index: number) => void;
  translateY: SharedValue<number>;
  topCarouselOffset: number;
};

export const PaginationItem: FC<PaginationItemProps> = ({
  index,
  currentSlideIndex,
  animatedSlideIndex,
  inactiveWidth,
  activeWidth,
  slideDuration,
  handleScrollToIndex,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (currentSlideIndex === index) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: slideDuration });
      return;
    }

    progress.value = 0;
  }, [currentSlideIndex, index, progress, slideDuration]);

  const containerStyle = useAnimatedStyle(() => {
    const distanceFromActive = Math.abs(animatedSlideIndex.value - index);
    const width = interpolate(distanceFromActive, [0, 1], [activeWidth, inactiveWidth], Extrapolation.CLAMP);
    const opacity = interpolate(distanceFromActive, [0, 1], [1, 0.42], Extrapolation.CLAMP);

    return {
      opacity,
      width,
    };
  }, [activeWidth, inactiveWidth, index]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: currentSlideIndex === index ? progress.value : 0 }],
  }));

  return (
    <TouchZone accessibilityRole="button" onPress={() => handleScrollToIndex(index)} style={styles.pressable}>
      <Animated.View style={containerStyle}>
        <View style={styles.track}>
          <View style={styles.trackBase} />
          <Animated.View style={[{ transformOrigin: 'left center' }, progressStyle]}>
            <View style={styles.progress} />
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
  progress: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    transformOrigin: "left center",
  },
}));
