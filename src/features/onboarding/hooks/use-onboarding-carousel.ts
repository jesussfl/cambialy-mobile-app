import { useCallback, useRef, useState } from "react";
import type { FlatList, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useWindowDimensions } from "react-native";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import type { OnboardingSlide } from "../lib/types";
import { useSlideTimer } from "./use-slide-timer";

type UseOnboardingCarouselParams = {
  slides: OnboardingSlide[];
  onComplete: () => void;
};

/**
 * Owns carousel navigation state.
 *
 * `slideProgress` is the single animated source of truth for position: a
 * continuous slide index (2.5 means halfway between slides 2 and 3) written
 * only from the UI thread by the scroll handler. Every position-derived
 * animation reads it, so nothing writes it from JS and races the scroll.
 *
 * `timerProgress` is the one value that is *not* position-derived: it measures
 * how much of the active slide's dwell time has elapsed, and advancing on it is
 * what makes the deck play on its own.
 */
export function useOnboardingCarousel({ slides, onComplete }: UseOnboardingCarouselParams) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideProgress = useSharedValue(0);

  const slideCount = slides.length;
  const isLastSlide = currentSlideIndex === slideCount - 1;

  const scrollToSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const goToNextSlide = useCallback(() => {
    const nextIndex = currentSlideIndex + 1;

    if (nextIndex >= slideCount) {
      onComplete();
      return;
    }

    scrollToSlide(nextIndex);
  }, [currentSlideIndex, onComplete, scrollToSlide, slideCount]);

  const { pauseTimer, resumeTimer, timerProgress } = useSlideTimer({
    activeIndex: currentSlideIndex,
    durationMs: slides[currentSlideIndex].durationMs,
    onElapsed: goToNextSlide,
  });

  const handleScroll = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        slideProgress.value = event.contentOffset.x / width;
      },
    },
    [width]
  );

  const handleScrollBeginDrag = useCallback(() => {
    pauseTimer();
  }, [pauseTimer]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const settledIndex = Math.round(event.nativeEvent.contentOffset.x / width);

      // Landing back on the same slide leaves the effect untouched, so the held
      // timer has to be released by hand or the deck would stall there.
      if (settledIndex === currentSlideIndex) {
        resumeTimer();
        return;
      }

      setCurrentSlideIndex(settledIndex);
    },
    [currentSlideIndex, resumeTimer, width]
  );

  return {
    currentSlideIndex,
    goToNextSlide,
    handleMomentumScrollEnd,
    handleScroll,
    handleScrollBeginDrag,
    isLastSlide,
    listRef,
    scrollToSlide,
    slideProgress,
    timerProgress,
    width,
  };
}
