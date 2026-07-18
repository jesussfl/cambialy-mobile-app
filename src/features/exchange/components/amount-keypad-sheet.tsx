import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { PressableScale } from "pressto";
import { AmountKeypad } from "./amount-keypad";

type AmountKeypadSheetProps = {
  title: string;
  showFieldSwitch: boolean;
  activeField: "amount" | "customRate";
  onFieldChange: (field: "amount" | "customRate") => void;
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
};

export function AmountKeypadSheet({ showFieldSwitch, activeField, onFieldChange, onKeyPress, onDelete, onClear }: AmountKeypadSheetProps) {
  const sheetRef = useRef<TrueSheet>(null);
  const onClose = () => {
    sheetRef.current?.dismiss();
  };
  return (
    <TrueSheet
      ref={sheetRef}
      name="amount-keypad-sheet"
      detents={["auto"]}
      draggable={false}
      dimmed={false}
      backgroundBlur="default" // 👈 Overrides the default iOS Liquid Glass effect
      blurOptions={{
        intensity: 0,
        interaction: false, // 👈 Prevents extra gesture-based tint/shimmer shifts
      }}
      grabber={false}
      cornerRadius={24}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.container}>
          <View style={styles.header}>
            <PressableScale onPress={onClose} style={styles.closeButton}>
              <AppText variant="tab" style={styles.closeLabel}>
                Cerrar
              </AppText>
            </PressableScale>
          </View>

          {showFieldSwitch ? (
            <View style={styles.fieldSwitchRow}>
              <PressableScale
                style={[styles.fieldSwitchButton, activeField === "amount" ? styles.fieldSwitchButtonActive : null]}
                onPress={() => onFieldChange("amount")}
              >
                <AppText variant="tab" style={[styles.fieldSwitchLabel, activeField === "amount" ? styles.fieldSwitchLabelActive : null]}>
                  Monto
                </AppText>
              </PressableScale>
              <PressableScale
                style={[styles.fieldSwitchButton, activeField === "customRate" ? styles.fieldSwitchButtonActive : null]}
                onPress={() => onFieldChange("customRate")}
              >
                <AppText variant="tab" style={[styles.fieldSwitchLabel, activeField === "customRate" ? styles.fieldSwitchLabelActive : null]}>
                  Tasa
                </AppText>
              </PressableScale>
            </View>
          ) : null}

          <AmountKeypad onKeyPress={onKeyPress} onDelete={onDelete} onClear={onClear} />
        </View>
      </GestureHandlerRootView>
    </TrueSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  gestureRoot: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  closeButton: {
    paddingVertical: theme.spacing.xs,
  },
  closeLabel: {
    color: theme.colors.primary,
  },
  fieldSwitchRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  fieldSwitchButton: {
    flex: 1,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  fieldSwitchButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  fieldSwitchLabel: {
    color: theme.colors.textMuted,
  },
  fieldSwitchLabelActive: {
    color: theme.colors.primaryText,
  },
}));
