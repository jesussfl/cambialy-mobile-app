import { Select } from "heroui-native";
import { ScrollView, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

const UniRemixIcon = withUnistyles(RemixIcon);

export type ExchangeHistoryPickerOption = {
  description: string;
  headerDescription: string;
  label: string;
  value: string;
};

type ExchangeHeaderProps = {
  isFetching: boolean;
  isHistoryFetching: boolean;
  historyOptions: ExchangeHistoryPickerOption[];
  label: string;
};

export function ExchangeHeader({ historyOptions, isFetching, isHistoryFetching, label }: ExchangeHeaderProps) {
  const selectedOption = historyOptions[0];
  // const isLoading = isFetching || isHistoryFetching;

  return (
    <View style={styles.header}>
      <Select presentation="dialog" value={selectedOption}>
        <Select.Trigger variant="unstyled" style={styles.historyTrigger}>
          {/* <View style={[styles.statusDot, isLoading ? styles.statusDotLoading : null]} /> */}
          <View style={styles.historyTriggerText} pointerEvents="none">
            <AppText variant="tab" style={styles.historyLabel} numberOfLines={1}>
              {label}
            </AppText>
            {selectedOption?.headerDescription ? (
              <AppText variant="subtitle" style={styles.historyDescription} numberOfLines={1}>
                {selectedOption.headerDescription}
              </AppText>
            ) : null}
          </View>
          <View style={styles.triggerIndicator}>
            <UniRemixIcon
              name="arrow-down-s-line"
              size={22}
              uniProps={(theme: any) => ({
                color: theme.colors.textSecondary,
              })}
            />
          </View>
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay style={styles.overlay} />
          <Select.Content presentation="dialog" styles={{ content: styles.dialogContent }}>
            <Select.Close />
            <ScrollView contentContainerStyle={styles.historyListContent} showsVerticalScrollIndicator={false}>
              <Select.ListLabel>Precio historico</Select.ListLabel>
              {historyOptions.map((option) => (
                <Select.Item key={option.value} value={option.value} label={option.label}>
                  <View style={styles.historyOptionText}>
                    <Select.ItemLabel />
                    <Select.ItemDescription>{option.description}</Select.ItemDescription>
                  </View>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </ScrollView>
          </Select.Content>
        </Select.Portal>
      </Select>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    minHeight: 66,
    flexDirection: "row",
  },
  dialogContent: {
    maxHeight: 440,
    width: "92%",
    alignSelf: "center",
  },
  overlay: {
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  historyListContent: {
    paddingBottom: theme.spacing.xl,
  },
  historyLabel: {
    color: theme.colors.textMuted,
  },
  historyOptionText: {
    flex: 1,
    minWidth: 0,
  },
  historyTrigger: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  historyTriggerText: {
    gap: theme.spacing.xxs,
  },
  historyDescription: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusDot: {
    position: "absolute",
    left: theme.spacing.md,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  statusDotLoading: {
    opacity: 0.45,
  },
  triggerIndicator: {
    marginLeft: theme.spacing.sm,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
}));
