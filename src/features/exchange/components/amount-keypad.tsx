import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppButton, IconButton } from "@/components/ui/button";

type AmountKeypadProps = {
  onKeyPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
};

export function AmountKeypad({ onKeyPress, onDelete, onClear }: AmountKeypadProps) {
  return (
    <View style={styles.keypad}>
      <View style={styles.keypadGrid}>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="cardTitle"
            label="1"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("1")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="2"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("2")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="3"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("3")}
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="cardTitle"
            label="4"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("4")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="5"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("5")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="6"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("6")}
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="cardTitle"
            label="7"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("7")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="8"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("8")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="9"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("9")}
          />
        </View>
        <View style={styles.keypadRow}>
          <AppButton
            labelVariant="cardTitle"
            label=","
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress(",")}
          />
          <AppButton
            labelVariant="cardTitle"
            label="0"
            variant="secondary"
            contentStyle={styles.keyContent}
            style={styles.keyButton}
            onPress={() => onKeyPress("0")}
          />
          <IconButton icon="delete-back-2-line" variant="secondary" style={styles.iconButton} onPress={onDelete} />
        </View>
      </View>
      <AppButton labelVariant="cardTitle" label="C" variant="primary" contentStyle={styles.keyContent} style={styles.resetButton} onPress={onClear} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  keypad: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  keypadGrid: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  keypadRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  keyButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
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
    borderRadius: theme.radius.md,
  },
  resetButton: {
    alignSelf: "stretch",
    width: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
}));
