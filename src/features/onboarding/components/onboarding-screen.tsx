import { useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlatList, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppButton } from "@/components/ui/button";
import { AppText } from "@/components/ui/app-text";

import { ONBOARDING_SLIDES } from "../constants";
import type { OnboardingSlide } from "../lib/types";
import { Pagination } from "./pagination";
import { SlideItem } from "./slide-item";

type OnboardingScreenProps = {
  onFinish: () => void;
};

const AnimatedFlatList = Animated.FlatList<OnboardingSlide>;
const UniAppText = withUnistyles(AppText);

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const animatedSlideIndex = useSharedValue(0);
  const scrollOffsetX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const translateY = useSharedValue(0);
  const topCarouselOffset = 230;

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffsetX.value = event.contentOffset.x;
      animatedSlideIndex.value = event.contentOffset.x / width;
    },
  });

  const handleScrollToIndex = (index: number) => {
    setCurrentSlideIndex(index);
    listRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlideIndex(nextIndex);
    animatedSlideIndex.value = nextIndex;
    isDragging.value = false;
  };

  const handleNext = () => {
    const nextIndex = currentSlideIndex + 1;

    if (nextIndex >= ONBOARDING_SLIDES.length) {
      onFinish();
      return;
    }

    handleScrollToIndex(nextIndex);
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <UniAppText variant="cardTitle" uniProps={(theme) => ({ color: theme.colors.textPrimary })}>
            Cambialy
          </UniAppText>
          <Pressable accessibilityRole="button" onPress={onFinish} style={styles.skipButton}>
            <AppText variant="button">Omitir</AppText>
          </Pressable>
        </View>

        <AnimatedFlatList
          ref={listRef}
          data={ONBOARDING_SLIDES}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          horizontal
          keyExtractor={(item) => item.title}
          onMomentumScrollEnd={handleMomentumEnd}
          onScroll={handleScroll}
          onScrollBeginDrag={() => {
            isDragging.value = true;
          }}
          pagingEnabled
          renderItem={({ item, index }) => <SlideItem item={item} index={index} width={width} scrollOffsetX={scrollOffsetX} />}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Pagination
            slides={ONBOARDING_SLIDES}
            currentSlideIndex={currentSlideIndex}
            animatedSlideIndex={animatedSlideIndex}
            isDragging={isDragging}
            handleScrollToIndex={handleScrollToIndex}
            translateY={translateY}
            topCarouselOffset={topCarouselOffset}
          />
          <AppButton label={currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "Comenzar" : "Siguiente"} icon="arrow-right-line" onPress={handleNext} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
  },
  skipButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
}));
