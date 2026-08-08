import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { NavigationBar } from "expo-navigation-bar";
import { useRef } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, UnistylesRuntime, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { TouchZone } from "@/components/ui/button";
import { AmountKeypad } from "./amount-keypad";

import RemixIcon from "react-native-remix-icon";

type AmountKeypadSheetProps = {
  name?: string;
  title: string;
  showFieldSwitch: boolean;
  activeField: "amount" | "customRate";
  onFieldChange: (field: "amount" | "customRate") => void;
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onPaste?: () => void;
  onOperatorPress: (op: "+" | "-" | "×" | "÷") => void;
  onEvaluate: () => void;
};
const UniTrueSheet = withUnistyles(TrueSheet);
const UniGestureHandlerRootView = withUnistyles(GestureHandlerRootView);
const UniRemixIcon = withUnistyles(RemixIcon);

const SHEET_BACKGROUND_COLOR = "#101828";

/**
 * `style` is the colour of the navigation bar *buttons*. The sheet draws behind the
 * navigation bar and is always dark, so the buttons must be light while it is open.
 *
 * On dismiss we can't use `auto` — that follows the system colour scheme, while the app
 * drives its own theme through Unistyles — so resolve the buttons from the app theme.
 */
function syncNavigationBarToSheet(isSheetVisible: boolean) {
  if (Platform.OS !== "android") return;

  const isAppDark = UnistylesRuntime.themeName === "dark";
  NavigationBar.setStyle(isSheetVisible || isAppDark ? "light" : "dark");
}

export function AmountKeypadSheet({
  name,
  showFieldSwitch,
  activeField,
  onFieldChange,
  onKeyPress,
  onDelete,
  onClear,
  onPaste,
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
      backgroundColor={SHEET_BACKGROUND_COLOR}
      onWillPresent={() => syncNavigationBarToSheet(true)}
      onWillDismiss={() => syncNavigationBarToSheet(false)}
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
            <TouchZone onPress={onClear} style={styles.headerButton}>
              <AppText variant="cardTitle" style={styles.closeLabel}>
                C
              </AppText>
            </TouchZone>

            {onPaste ? (
              <TouchZone onPress={onPaste} style={styles.pasteHeaderButton}>
                <UniRemixIcon name="clipboard-line" size={18} uniProps={(theme: any) => ({ color: "white" })} />
                <AppText variant="tab" style={styles.closeLabel}>
                  Pegar
                </AppText>
              </TouchZone>
            ) : null}

            <TouchZone onPress={onClose} style={styles.closeButton}>
              <AppText variant="tab" style={styles.closeLabel}>
                Cerrar
              </AppText>
            </TouchZone>
          </View>

          {showFieldSwitch ? (
            <View style={styles.fieldSwitchRow}>
              <TouchZone
                style={[styles.fieldSwitchButton, activeField === "amount" ? styles.fieldSwitchButtonActive : null]}
                onPress={() => onFieldChange("amount")}
              >
                <AppText variant="tab" style={[styles.fieldSwitchLabel, activeField === "amount" ? styles.fieldSwitchLabelActive : null]}>
                  Monto
                </AppText>
              </TouchZone>
              <TouchZone
                style={[styles.fieldSwitchButton, activeField === "customRate" ? styles.fieldSwitchButtonActive : null]}
                onPress={() => onFieldChange("customRate")}
              >
                <AppText variant="tab" style={[styles.fieldSwitchLabel, activeField === "customRate" ? styles.fieldSwitchLabelActive : null]}>
                  Tasa
                </AppText>
              </TouchZone>
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
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,

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
  pasteHeaderButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    height: 42,
    flexDirection: "row",
    gap: theme.spacing.xs,
    backgroundColor: theme.gray["800"],
    borderWidth: 1,
    borderColor: theme.gray["700"],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.pill,
  },
}));
