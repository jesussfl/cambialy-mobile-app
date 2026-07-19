import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { UniRemixIcon } from "../ui/icon";

type ExpoTabsProps = ComponentProps<typeof Tabs>;
type BottomTabBarProps = Parameters<NonNullable<ExpoTabsProps["tabBar"]>>[0];

type TabConfig = {
  icon: IconName;
  label: string;
};

const BOTTOM_NAV_CONFIG: Record<string, TabConfig> = {
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

SplashScreen.setOptions({
  duration: 350,
  fade: true,
});
void SplashScreen.preventAutoHideAsync();

const UniAppText = withUnistyles(AppText);

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const config = BOTTOM_NAV_CONFIG[route.name];
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
              uniProps={(theme) => ({
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
};
const styles = StyleSheet.create((theme, rt) => ({
  tabBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    minHeight: 92,
    paddingTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.tabSurface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.tabBorder,
    paddingBottom: Math.max(rt.insets.bottom, theme.spacing.sm),
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.xxs,
    minHeight: 68,
  },
  activeDot: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    lineHeight: theme.typography.lineHeight.xs,
  },
}));
