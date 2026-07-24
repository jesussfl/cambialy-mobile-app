// eslint-disable-sort-imports
import "../../global.css";
// Must be imported before any other file that uses unistyles
import "@/theme/unistyles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import React, { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, useUnistyles, withUnistyles } from "react-native-unistyles";

import { CustomTabBar } from "@/components/custom-tabbar/custom-tabbar";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";
import { refreshRatesWidget } from "@/modules/rates-widget";
import { ThemePreferenceProvider } from "@/theme/theme-preference";

const queryClient = new QueryClient();

// Prevent automatic hiding of splash screen
SplashScreen.setOptions({
  duration: 350,
  fade: true,
});
void SplashScreen.preventAutoHideAsync();

const UniTabs = withUnistyles(Tabs);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Any async initializations (storage, fonts, etc.) go here
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    void prepare();
  }, []);

  // Hide splash screen ONLY when the root layout view actually paints to the screen
  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
        <HeroUINativeProvider>
          <ThemePreferenceProvider>
            <AppTabs />
          </ThemePreferenceProvider>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

function AppTabs() {
  const { rt } = useUnistyles();
  const isDarkMode = rt.themeName === "dark";

  useEffect(() => {
    void refreshRatesWidget();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshRatesWidget();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <React.Fragment>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <OnboardingGate>
        <UniTabs
          initialRouteName="index"
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true,
          }}
          uniProps={(theme) => ({
            screenOptions: {
              sceneStyle: {
                backgroundColor: theme.colors.background,
              },
            },
          })}
        >
          <Tabs.Screen name="index" options={{ title: "Exchange" }} />
          <Tabs.Screen name="(compare)" options={{ title: "Compare" }} />
          <Tabs.Screen name="(settings)" options={{ title: "Settings" }} />
        </UniTabs>
      </OnboardingGate>
    </React.Fragment>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));