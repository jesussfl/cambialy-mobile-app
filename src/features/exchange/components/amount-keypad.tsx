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
            labelColor="#000"
            label="1"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("1")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="2"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("2")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="3"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("3")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="÷"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("÷")}
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="4"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("4")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="5"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("5")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="6"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("6")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="×"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("×")}
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="7"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("7")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="8"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("8")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="9"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("9")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="-"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("-")}
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label=","
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress(",")}
          />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="0"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("0")}
          />
          <IconButton icon="delete-back-2-line" variant="secondary" style={styles.iconButton} onPress={onDelete} />
          <AppButton
            labelVariant="sectionTitle"
            labelColor="#000"
            label="+"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.operatorButton}
            onPress={() => onOperatorPress("+")}
          />
        </View>
      </View>
      <View style={styles.sideActions}>
        <AppButton labelVariant="cardTitle" label="C" variant="primary" contentStyle={styles.keyContent} style={styles.resetButton} onPress={onClear} />
        <AppButton labelVariant="cardTitle" label="=" variant="primary" contentStyle={styles.keyContent} style={styles.equalsButton} onPress={onEvaluate} />
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
    backgroundColor: "white",
  },
  operatorButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.gray[300],
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
    backgroundColor: theme.gray[300],
    borderWidth: 1,
    borderColor: theme.gray[200],
  },
  sideActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  resetButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.gray[400],
  },
  equalsButton: {
    flex: 2,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
}));
