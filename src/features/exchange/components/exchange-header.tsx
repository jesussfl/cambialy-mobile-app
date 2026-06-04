import { View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

const UniRemixIcon = withUnistyles(RemixIcon);

type ExchangeHeaderProps = {
  isFetching: boolean;
  subtitle: string;
};

export function ExchangeHeader({ isFetching, subtitle }: ExchangeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleGroup}>
        <AppText variant="cardTitle" style={styles.headerTitle}>
          Intercambio
        </AppText>
        <AppText variant="tab" style={styles.headerSubtitle} numberOfLines={2}>
          {subtitle}
        </AppText>
      </View>
      <View style={styles.headerButton}>
        <View style={[styles.statusDot, isFetching ? styles.statusDotLoading : null]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  headerTitleGroup: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  headerTitle: {},
  headerSubtitle: {
    color: theme.colors.textMuted,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  statusDotLoading: {
    opacity: 0.45,
  },
}));
