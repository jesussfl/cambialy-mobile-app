import { useRef, useState } from "react";
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useWindowDimensions } from "react-native";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import type { OnboardingSlide } from "../lib/types";

type UseOnboardingCarouselParams = {
  slideCount: number;
  onComplete: () => void;
};

/**
 * Owns carousel navigation state.
 *
 * `slideProgress` is the single animated source of truth: a continuous slide
 * index (2.5 means halfway between slides 2 and 3) written only from the UI
 * thread by the scroll handler. Every animation downstream derives from it, so
 * nothing ever writes it from JS and races the scroll.
 */
export function useOnboardingCarousel({ slideCount, onComplete }: UseOnboardingCarouselParams) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideProgress = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        slideProgress.value = event.contentOffset.x / width;
      },
    },
    [width]
  );

  const scrollToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentSlideIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const goToNextSlide = () => {
    const nextIndex = currentSlideIndex + 1;

    if (nextIndex >= slideCount) {
      onComplete();
      return;
    }

    scrollToSlide(nextIndex);
  };

  return {
    currentSlideIndex,
    goToNextSlide,
    handleMomentumScrollEnd,
    handleScroll,
    isLastSlide: currentSlideIndex === slideCount - 1,
    listRef,
    scrollToSlide,
    slideProgress,
    width,
  };
}
