import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { DEV_SHOW_ONBOARDING_EVERY_LAUNCH } from "../constants";
import { hasSeenOnboarding, markOnboardingSeen } from "../lib/onboarding-storage";

/**
 * Owns whether the onboarding flow should be shown. The component that renders
 * it stays presentational.
 */
export function useOnboardingGate() {
  const [isReady, setIsReady] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveOnboardingState = async () => {
      const seen = await hasSeenOnboarding();

      if (!isMounted) {
        return;
      }

      setShouldShowOnboarding(DEV_SHOW_ONBOARDING_EVERY_LAUNCH || !seen);
      setIsReady(true);
    };

    void resolveOnboardingState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  const finishOnboarding = () => {
    setShouldShowOnboarding(false);
    void markOnboardingSeen();
  };

  return { finishOnboarding, isReady, shouldShowOnboarding };
}
