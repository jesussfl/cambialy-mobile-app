import type { FC } from "react";
import { View, useWindowDimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import type { OnboardingSlide } from "../lib/types";
import { PaginationItem } from "./pagination-item";

type PaginationProps = {
  slides: OnboardingSlide[];
  currentSlideIndex: number;
  animatedSlideIndex: SharedValue<number>;
  isDragging: SharedValue<boolean>;
  handleScrollToIndex: (index: number) => void;
  translateY: SharedValue<number>;
  topCarouselOffset: number;
};

export const Pagination: FC<PaginationProps> = ({
  slides,
  currentSlideIndex,
  animatedSlideIndex,
  isDragging,
  handleScrollToIndex,
  translateY,
  topCarouselOffset,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const horizontalPadding = screenWidth * 0.25;
  const gap = 3;
  const totalPaginationWidth = screenWidth - horizontalPadding;
  const totalGaps = (slides.length - 1) * gap;
  const totalItems = slides.length + 2;
  const itemWidth = (totalPaginationWidth - totalGaps) / totalItems;
  const inactiveWidth = itemWidth;
  const activeWidth = itemWidth * 3;

  return (
    <View style={[styles.container, { gap, paddingHorizontal: horizontalPadding / 2 }]}>
      {slides.map((slide, index) => (
        <PaginationItem
          key={slide.title}
          index={index}
          currentSlideIndex={currentSlideIndex}
          animatedSlideIndex={animatedSlideIndex}
          inactiveWidth={inactiveWidth}
          activeWidth={activeWidth}
          totalSlides={slides.length}
          isDragging={isDragging}
          slideDuration={slide.duration}
          handleScrollToIndex={handleScrollToIndex}
          translateY={translateY}
          topCarouselOffset={topCarouselOffset}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: theme.spacing.sm,
  },
}));
