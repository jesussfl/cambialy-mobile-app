import type { FC } from "react";
import { useWindowDimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { getPaginationLayout } from "../lib/pagination-layout";
import type { OnboardingSlide } from "../lib/types";
import { PaginationItem } from "./pagination-item";

type PaginationProps = {
  onSelectSlide: (index: number) => void;
  slideProgress: SharedValue<number>;
  slides: OnboardingSlide[];
};

export const Pagination: FC<PaginationProps> = ({ onSelectSlide, slideProgress, slides }) => {
  const { width: screenWidth } = useWindowDimensions();
  const { activeWidth, gap, horizontalInset, inactiveWidth } = getPaginationLayout(screenWidth, slides.length);

  return (
    <View style={[styles.container, { gap, paddingHorizontal: horizontalInset }]}>
      {slides.map((slide, index) => (
        <PaginationItem
          key={slide.title}
          accessibilityLabel={`Ir al paso ${index + 1} de ${slides.length}`}
          activeWidth={activeWidth}
          inactiveWidth={inactiveWidth}
          index={index}
          onPress={onSelectSlide}
          slideProgress={slideProgress}
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
