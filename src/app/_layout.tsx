import "@/theme/unistyles";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

type ExpoTabsProps = ComponentProps<typeof Tabs>;
type BottomTabBarProps = Parameters<NonNullable<ExpoTabsProps["tabBar"]>>[0];

type TabConfig = {
  icon: IconName;
  label: string;
};

const tabConfig: Record<string, TabConfig> = {
  index: {
    icon: "calculator-line",
    label: "Calcular",
  },
  history: {
    icon: "history-line",
    label: "Historial",
  },
  settings: {
    icon: "settings-3-line",
    label: "Ajustes",
  },
};

const queryClient = new QueryClient();

const UniRemixIcon = withUnistyles(RemixIcon);
const UniAppText = withUnistyles(AppText);
const UniTabs = withUnistyles(Tabs);

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const config = tabConfig[route.name];
        const options = descriptors[route.key]?.options;
        const isFocused = state.index === index;

        if (!config) {
          return null;
        }

        const handlePress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const handleLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : undefined}
            onLongPress={handleLongPress}
            onPress={handlePress}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.activeDot,
                {
                  opacity: isFocused ? 1 : 0,
                },
              ]}
            />
            <UniRemixIcon
              name={config.icon}
              size={22}
              uniProps={(theme: any) => ({
                color: isFocused ? theme.colors.primary : theme.colors.textMuted,
              })}
            />
            <UniAppText
              variant="tab"
              style={styles.tabLabel}
              uniProps={(theme: any) => ({
                color: isFocused ? theme.colors.primary : theme.colors.textMuted,
              })}
            >
              {config.label}
            </UniAppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <UniTabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        uniProps={(theme: any) => ({
          screenOptions: {
            sceneStyle: {
              backgroundColor: theme.colors.background,
            },
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: tabConfig.index.label }} />
        <Tabs.Screen name="history" options={{ title: tabConfig.history.label }} />
        <Tabs.Screen name="settings" options={{ title: tabConfig.settings.label }} />
      </UniTabs>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    minHeight: 96,
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.tabSurface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.tabBorder,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.xxs,
    minHeight: 68,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    lineHeight: theme.typography.lineHeight.xs,
  },
}));
