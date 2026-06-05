import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { DEV_SHOW_ONBOARDING_EVERY_LAUNCH, ONBOARDING_STORAGE_KEY } from "../constants";
import { OnboardingScreen } from "./onboarding-screen";

const ONBOARDING_SEEN_VALUE = "seen";

export function OnboardingGate({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOnboardingState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        const shouldShow = DEV_SHOW_ONBOARDING_EVERY_LAUNCH || storedValue !== ONBOARDING_SEEN_VALUE;

        if (isMounted) {
          setShouldShowOnboarding(shouldShow);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadOnboardingState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  const handleFinish = async () => {
    setShouldShowOnboarding(false);
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);
  };

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      {shouldShowOnboarding ? <OnboardingScreen onFinish={handleFinish} /> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
