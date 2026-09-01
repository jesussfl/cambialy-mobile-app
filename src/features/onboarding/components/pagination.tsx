import type { FC } from "react";
import { useWindowDimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { getPaginationLayout } from "../lib/pagination-layout";
import type { OnboardingSlide } from "../lib/types";
import { PaginationItem } from "./pagination-item";

type PaginationProps = {
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  slideProgress: SharedValue<number>;
  slides: OnboardingSlide[];
  timerProgress: SharedValue<number>;
};

export const Pagination: FC<PaginationProps> = ({
  currentSlideIndex,
  onSelectSlide,
  slideProgress,
  slides,
  timerProgress,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeWidth, gap, horizontalInset, inactiveWidth } = getPaginationLayout(screenWidth, slides.length);

  return (
    <View style={[styles.container, { gap, paddingHorizontal: horizontalInset }]}>
      {slides.map((slide, index) => (
        <PaginationItem
          key={slide.title}
          accessibilityLabel={`Ir al paso ${index + 1} de ${slides.length}`}
          activeWidth={activeWidth}
          currentSlideIndex={currentSlideIndex}
          inactiveWidth={inactiveWidth}
          index={index}
          onPress={onSelectSlide}
          slideProgress={slideProgress}
          timerProgress={timerProgress}
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
