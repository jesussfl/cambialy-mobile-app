import { View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";

type RateCardProps = {
  label: string;
  value: string;
  icon: string;
};

const UniRemixIcon = withUnistyles(RemixIcon);

export function RateCard({ label, value, icon }: RateCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        <UniRemixIcon
          name={icon}
          size={28}
          uniProps={(theme: any) => ({
            color: theme.colors.primary,
          })}
        />
      </View>
      <AppText variant="body" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="value">{value}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    minWidth: 0,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
  },
  iconWrap: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textSecondary,
  },
}));
