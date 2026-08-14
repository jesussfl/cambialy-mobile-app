import { View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/button";

import { ONBOARDING_SLIDES } from "../constants";
import { useOnboardingCarousel } from "../hooks/use-onboarding-carousel";
import type { OnboardingSlide } from "../lib/types";
import { Pagination } from "./pagination";
import { SlideItem } from "./slide-item";

type OnboardingScreenProps = {
  onFinish: () => void;
};

const AnimatedFlatList = Animated.FlatList<OnboardingSlide>;
const UniAppText = withUnistyles(AppText);

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { goToNextSlide, handleMomentumScrollEnd, handleScroll, isLastSlide, listRef, scrollToSlide, slideProgress, width } =
    useOnboardingCarousel({ slideCount: ONBOARDING_SLIDES.length, onComplete: onFinish });

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <UniAppText variant="cardTitle" uniProps={(theme) => ({ color: theme.colors.textPrimary })}>
            Cambialy
          </UniAppText>
          <AppButton variant="ghost" onPress={onFinish} style={styles.skipButton} label="Omitir" labelVariant="button" />
        </View>

        <AnimatedFlatList
          ref={listRef}
          data={ONBOARDING_SLIDES}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          horizontal
          keyExtractor={(item) => item.title}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={handleScroll}
          pagingEnabled
          renderItem={({ item, index }) => <SlideItem index={index} item={item} slideProgress={slideProgress} width={width} />}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Pagination slides={ONBOARDING_SLIDES} slideProgress={slideProgress} onSelectSlide={scrollToSlide} />
          <AppButton label={isLastSlide ? "Comenzar" : "Siguiente"} icon="arrow-right-line" onPress={goToNextSlide} />
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
