import { useCallback, useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { StyleSheet } from "react-native-unistyles";

import { CustomPressableProps, PressableScale } from "pressto";
import { UniRemixIcon } from "./icon";

type CopyIconButtonProps = Omit<CustomPressableProps, "onPress"> & {
  text: string;
  copied?: boolean;
  onCopy?: () => void;
  size?: number;
};

export const CopyIconButton: React.FC<CopyIconButtonProps> = ({
  text,
  copied: copiedProp,
  onCopy,
  size = 18,
  style,
  ...rest
}) => {
  const [internalCopied, setInternalCopied] = useState(false);
  const isControlled = copiedProp !== undefined;
  const isCopied = isControlled ? copiedProp : internalCopied;

  const handlePress = useCallback(async () => {
    if (!text) return;

    await Clipboard.setStringAsync(text);
    onCopy?.();

    if (!isControlled) {
      setInternalCopied(true);
    }
  }, [text, onCopy, isControlled]);

  useEffect(() => {
    if (isControlled || !internalCopied) return;

    const timeoutId = setTimeout(() => {
      setInternalCopied(false);
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [isControlled, internalCopied]);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={isCopied ? "Resultado copiado" : "Copiar resultado"}
      hitSlop={10}
      onPress={handlePress}
      style={[styles.copyButton, isCopied ? styles.copyButtonActive : null, style]}
      {...rest}
    >
      <UniRemixIcon
        name={isCopied ? "check-line" : "file-copy-line"}
        size={size}
        uniProps={(theme: any) => ({
          color: isCopied ? theme.colors.primaryText : theme.colors.primary,
        })}
      />
    </PressableScale>
  );
};

const styles = StyleSheet.create((theme) => ({
  copyButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  copyButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
}));
