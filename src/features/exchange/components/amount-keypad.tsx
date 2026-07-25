import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppButton, IconButton } from "@/components/ui/button";

type AmountKeypadProps = {
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onOperatorPress: (op: "+" | "-" | "×" | "÷") => void;
  onEvaluate: () => void;
};

export function AmountKeypad({ onKeyPress, onDelete, onClear, onOperatorPress, onEvaluate }: AmountKeypadProps) {
  return (
    <View style={styles.keypad}>
      <View style={styles.keypadGrid}>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="1"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("1")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="2"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("2")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="3"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("3")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="÷"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("÷")}
            isPressableOpacity
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="4"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("4")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="5"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("5")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="6"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("6")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="×"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("×")}
            isPressableOpacity
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="7"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("7")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="8"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("8")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="9"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("9")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="-"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("-")}
            isPressableOpacity
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label=","
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress(",")}
            isPressableOpacity
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="0"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("0")}
            isPressableOpacity
          />
          <IconButton icon="delete-back-2-line" variant="secondary" style={styles.iconButton} onPress={onDelete} />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#fff"
            label="+"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("+")}
            isPressableOpacity
          />
        </View>
      </View>
      <View style={styles.sideActions}>
        {/* <AppButton labelVariant="cardTitle" label="=" variant="primary" contentStyle={styles.keyContent} style={styles.equalsButton} onPress={onEvaluate} /> */}
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
  keyButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.gray[700],
  },
  operatorButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.gray[800],
  },
  keyContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  iconButton: {
    flex: 1,
    width: "100%",
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.gray[1000],
    borderWidth: 1,
    borderColor: theme.gray[800],
  },
  sideActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  resetButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.gray[800],
  },
  equalsButton: {
    flex: 2,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
}));
