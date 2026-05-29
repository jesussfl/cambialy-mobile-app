import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { appTheme as theme } from "@/theme/app-theme";

type RateCardProps = {
  label: string;
  value: string;
  icon: ComponentProps<typeof SymbolView>["name"];
};

export function RateCard({ label, value, icon }: RateCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        <SymbolView name={icon} size={28} tintColor={theme.colors.textPrimary} />
      </View>
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="value">{value}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create(() => ({
  card: {
    flex: 1,
    minWidth: 0,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
  },
  iconWrap: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textSecondary,
  },
}));
