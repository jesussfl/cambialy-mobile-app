import { Tabs } from "expo-router";
import { type ComponentProps, useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { useExchangeStore } from "@/features/exchange/store/exchange-store";
import { IconButton } from "../ui/button";
import { UniRemixIcon } from "../ui/icon";

type ExpoTabsProps = ComponentProps<typeof Tabs>;
type BottomTabBarProps = Parameters<NonNullable<ExpoTabsProps["tabBar"]>>[0];

type TabConfig = {
  icon: IconName;
  label: string;
};

const BOTTOM_NAV_CONFIG: Record<string, TabConfig> = {
  index: {
    icon: "exchange-2-line",
    label: "Cambiar",
  },
  "(compare)": {
    icon: "calculator-line",
    label: "Comparar",
  },
  "(settings)": {
    icon: "settings-3-line",
    label: "Ajustes",
  },
};

const UniAppText = withUnistyles(AppText);

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const isExchangeRoute = state.index === 0;
  const resetExchange = useExchangeStore((s) => s.resetExchange);

  const pillTranslateX = useSharedValue(0);
  const resetButtonOpacity = useSharedValue(0);

  useEffect(() => {
    const show = isExchangeRoute;
    pillTranslateX.value = withTiming(show ? 0 : 28, { duration: 250 });
    resetButtonOpacity.value = withTiming(show ? 1 : 0, { duration: 250 });
  }, [isExchangeRoute]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillTranslateX.value }],
  }));

  const resetButtonStyle = useAnimatedStyle(() => ({
    opacity: resetButtonOpacity.value,
  }));

  return (
    <View style={styles.tabBar}>
      <Animated.View style={pillStyle}>
        <View style={styles.tabBarContent}>
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
      </Animated.View>
      <Animated.View style={resetButtonStyle}>
        <IconButton icon="reset-left-line" onPress={resetExchange} style={styles.resetButton} />
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create((theme, rt) => ({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "android" ? rt.insets.bottom + 16 : rt.insets.bottom,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "75%",
    gap: theme.spacing.md,
  },
  tabBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.tabSurface,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: 8,
  },
  tabButton: {
    minWidth: 80,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.xxs,
  },

  tabLabel: {
    lineHeight: theme.typography.lineHeight.xs,
  },

  resetButton: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.floating,
  },
}));
