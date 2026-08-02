import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useSettingsStore } from "@/features/settings/context/settings-context";
import { KeypadButton, KeypadIconButton } from "./keypad";

type AmountKeypadProps = {
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onOperatorPress: (op: "+" | "-" | "×" | "÷") => void;
  onEvaluate: () => void;
};

export function AmountKeypad({ onKeyPress, onDelete, onClear, onOperatorPress, onEvaluate }: AmountKeypadProps) {
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);
  const decimalChar = decimalSeparator === "comma" ? "," : ".";

  return (
    <View style={styles.keypad}>
      <View style={styles.keypadGrid}>
        <View style={styles.keypadRow}>
          <KeypadButton label="1" onPress={() => onKeyPress("1")} />
          <KeypadButton label="2" onPress={() => onKeyPress("2")} />
          <KeypadButton label="3" onPress={() => onKeyPress("3")} />
          <KeypadButton label="÷" variant="operator" onPress={() => onOperatorPress("÷")} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton label="4" onPress={() => onKeyPress("4")} />
          <KeypadButton label="5" onPress={() => onKeyPress("5")} />
          <KeypadButton label="6" onPress={() => onKeyPress("6")} />
          <KeypadButton label="×" variant="operator" onPress={() => onOperatorPress("×")} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton label="7" onPress={() => onKeyPress("7")} />
          <KeypadButton label="8" onPress={() => onKeyPress("8")} />
          <KeypadButton label="9" onPress={() => onKeyPress("9")} />
          <KeypadButton label="-" variant="operator" onPress={() => onOperatorPress("-")} />
        </View>
        <View style={styles.keypadRow}>
          <KeypadButton label={decimalChar} onPress={() => onKeyPress(decimalChar)} />
          <KeypadButton label="0" onPress={() => onKeyPress("0")} />
          <KeypadIconButton icon="delete-back-2-line" onPress={onDelete} />
          <KeypadButton label="+" variant="operator" onPress={() => onOperatorPress("+")} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  keypad: {
    flexDirection: "column",
    gap: theme.spacing.sm,
  },
  keypadGrid: {
    gap: theme.spacing.sm,
  },
  keypadRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
}));
