import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";

import { PressableScale } from "pressto";
import { AmountKeypad } from "./amount-keypad";

type AmountKeypadSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  showFieldSwitch: boolean;
  activeField: "amount" | "customRate";
  onFieldChange: (field: "amount" | "customRate") => void;
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
};

export function AmountKeypadSheet({
  isVisible,
  onClose,
  title,
  showFieldSwitch,
  activeField,
  onFieldChange,
  onKeyPress,
  onDelete,
  onClear,
}: AmountKeypadSheetProps) {
  const sheetRef = useRef<TrueSheet>(null);
  const isPresented = useRef(false);

  useEffect(() => {
    if (isVisible && !isPresented.current) {
      void sheetRef.current?.present();
    } else if (!isVisible && isPresented.current) {
      void sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <TrueSheet
      ref={sheetRef}
      detents={["auto"]}
      dismissible={false}
      draggable={false}
      dimmed={false}
      grabber={false}
      cornerRadius={24}
      onDidPresent={() => {
        isPresented.current = true;
      }}
      onDidDismiss={() => {
        isPresented.current = false;
        onClose();
      }}
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
