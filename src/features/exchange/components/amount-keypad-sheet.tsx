import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { PressableOpacity, PressableScale } from "pressto";
import { AmountKeypad } from "./amount-keypad";

type AmountKeypadSheetProps = {
  name?: string;
  title: string;
  showFieldSwitch: boolean;
  activeField: "amount" | "customRate";
  onFieldChange: (field: "amount" | "customRate") => void;
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onOperatorPress: (op: "+" | "-" | "×" | "÷") => void;
  onEvaluate: () => void;
};
const UniTrueSheet = withUnistyles(TrueSheet);
const UniGestureHandlerRootView = withUnistyles(GestureHandlerRootView);
export function AmountKeypadSheet({
  name,
  showFieldSwitch,
  activeField,
  onFieldChange,
  onKeyPress,
  onDelete,
  onClear,
  onOperatorPress,
  onEvaluate,
}: AmountKeypadSheetProps) {
  const sheetRef = useRef<TrueSheet>(null);
  const onClose = () => {
    sheetRef.current?.dismiss();
  };
  return (
    <UniTrueSheet
      ref={sheetRef}
      name={name ?? "amount-keypad-sheet"}
      detents={["auto"]}
      backgroundColor={"#101828"}
      dismissible={true}
      draggable={true}
      dimmed={false}
      backgroundBlur="default" // 👈 Overrides the default iOS Liquid Glass effect
      blurOptions={{
        intensity: 0,
        interaction: false, // 👈 Prevents extra gesture-based tint/shimmer shifts
      }}
      grabber={false}
      cornerRadius={24}
      // footer={<View style={styles.footer} />}
    >
      <UniGestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.container}>
          <View style={styles.header}>
            <PressableOpacity onPress={onClear} style={styles.headerButton}>
              <AppText variant="cardTitle" style={styles.closeLabel}>
                C
              </AppText>
            </PressableOpacity>

            <PressableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText variant="tab" style={styles.closeLabel}>
                Cerrar
              </AppText>
            </PressableOpacity>
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

          <AmountKeypad onKeyPress={onKeyPress} onDelete={onDelete} onClear={onClear} onOperatorPress={onOperatorPress} onEvaluate={onEvaluate} />
        </View>
      </UniGestureHandlerRootView>
    </UniTrueSheet>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  gestureRoot: {
    flexGrow: 1,
    backgroundColor: theme.gray[900],
  },
  footer: {
    paddingBottom: rt.insets.bottom,
    backgroundColor: theme.gray[200],
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeLabel: {
    color: "white",
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
  headerButton: {
    paddingVertical: theme.spacing.xs,
    minWidth: 84,
    height: 42,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.pill,
  },
  closeButton: {
    paddingVertical: theme.spacing.xs,
    minWidth: 84,
    height: 42,
    backgroundColor: theme.gray["700"],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.pill,
  },
}));
