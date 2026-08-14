import type { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { useOnboardingGate } from "../hooks/use-onboarding-gate";
import { OnboardingScreen } from "./onboarding-screen";

// Plain styles: Animated.View must not receive Unistyles styles directly.
// The overlay is absolute so the app underneath keeps its full height while
// the onboarding fades out, instead of both sharing the flex column.
const FILL: ViewStyle = { flex: 1 };
const OVERLAY: ViewStyle = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 };

export function OnboardingGate({ children }: PropsWithChildren) {
  const { finishOnboarding, isReady, shouldShowOnboarding } = useOnboardingGate();

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      {shouldShowOnboarding ? (
        <Animated.View style={OVERLAY} exiting={FadeOut.duration(220)}>
          <OnboardingScreen onFinish={finishOnboarding} />
        </Animated.View>
      ) : (
        <Animated.View style={FILL} entering={FadeIn.duration(260)}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
