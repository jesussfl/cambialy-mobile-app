import { Popover } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { PressableOpacity } from "pressto";
import type { CurrencyOption } from "../types";

const UniRemixIcon = withUnistyles(RemixIcon);
const UniPressableOpacity = withUnistyles(PressableOpacity);

type CurrencyPickerProps = {
  code: string;
  icon: IconName;
  onSelect: (optionId: string) => void;
  options: CurrencyOption[];
  selectedOptionId: string;
};

export function CurrencyPicker({ code, icon, onSelect, options, selectedOptionId }: CurrencyPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelectOption = (optionId: string) => {
    onSelect(optionId);
    setIsPickerOpen(false);
  };

  return (
    <Popover isOpen={isPickerOpen} onOpenChange={setIsPickerOpen}>
      <Popover.Trigger asChild>
        <UniPressableOpacity accessibilityRole="button" style={styles.currencyPill}>
          <View style={styles.currencyIcon}>
            <UniRemixIcon
              name={icon}
              size={18}
              uniProps={(theme: any) => ({
                color: theme.colors.primary,
              })}
            />
          </View>
          <AppText variant="button" numberOfLines={1}>
            {code}
          </AppText>
          <UniRemixIcon
            name="arrow-down-s-line"
            size={18}
            uniProps={(theme: any) => ({
              color: theme.colors.textSecondary,
            })}
          />
        </UniPressableOpacity>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay />
        <Popover.Content presentation="popover" placement="bottom" align="end" width={220} style={styles.currencyPopover}>
          {options.map((option) => {
            const isSelected = option.id === selectedOptionId;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.id}
                onPress={() => handleSelectOption(option.id)}
                style={[styles.currencyOption, isSelected ? styles.currencyOptionSelected : null]}
              >
                <View style={styles.currencyIcon}>
                  <UniRemixIcon
                    name={option.icon}
                    size={18}
                    uniProps={(theme: any) => ({
                      color: theme.colors.primary,
                    })}
                  />
                </View>
                <View style={styles.currencyOptionText}>
                  <AppText variant="button" numberOfLines={1}>
                    {option.code}
                  </AppText>
                  <AppText variant="tab" style={styles.currencyOptionName} numberOfLines={1}>
                    {option.name}
                  </AppText>
                </View>
                {isSelected ? (
                  <UniRemixIcon
                    name="check-line"
                    size={18}
                    uniProps={(theme: any) => ({
                      color: theme.colors.primary,
                    })}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
}

const styles = StyleSheet.create((theme) => ({
  currencyPill: {
    maxWidth: 116,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  currencyIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
  },
  currencyPopover: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    ...theme.shadows.card,
  },
  currencyOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  currencyOptionSelected: {
    backgroundColor: theme.colors.secondarySurface,
  },
  currencyOptionText: {
    flex: 1,
    minWidth: 0,
  },
  currencyOptionName: {
    color: theme.colors.textMuted,
  },
}));
