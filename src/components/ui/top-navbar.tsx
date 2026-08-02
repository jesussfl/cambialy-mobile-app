import { ReactNode } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

export interface TopNavbarProps {
  title?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export function TopNavbar({ title, leftContent, rightContent }: TopNavbarProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {leftContent}
        {title ? (
          <AppText variant="cardTitle" style={styles.titleText}>
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={styles.rightContainer}>
        {rightContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  titleText: {
    fontWeight: "bold",
  },
}));
