// eslint-disable-sort-imports
import "../../global.css";
// Must be imported before any other file that uses unistyles
import "@/theme/unistyles";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { CustomTabBar } from "@/components/custom-tabbar/custom-tabbar";
import { OnboardingGate } from "@/features/onboarding/components/onboarding-gate";

type TabConfig = {
  icon: IconName;
  label: string;
};

const tabConfig: Record<string, TabConfig> = {
  exchange: {
    icon: "exchange-2-line",
    label: "Intercambio",
  },
  compare: {
    icon: "calculator-line",
    label: "Comparar",
  },

  settings: {
    icon: "settings-3-line",
    label: "Ajustes",
  },
};

const queryClient = new QueryClient();

SplashScreen.setOptions({
  duration: 350,
  fade: true,
});
void SplashScreen.preventAutoHideAsync();

const UniTabs = withUnistyles(Tabs);

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <HeroUINativeProvider>
          <StatusBar style="dark" />
          <OnboardingGate>
            <UniTabs
              initialRouteName="exchange"
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
              <Tabs.Screen name="exchange" options={{ title: tabConfig.exchange.label }} />
              <Tabs.Screen name="compare" options={{ title: tabConfig.compare.label }} />
              <Tabs.Screen name="settings" options={{ title: tabConfig.settings.label }} />
            </UniTabs>
          </OnboardingGate>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}));
