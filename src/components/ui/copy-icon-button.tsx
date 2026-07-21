import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { CustomPressableProps, PressableScale } from "pressto";
import { UniRemixIcon } from "./icon";
type CopyIconButtonProps = Omit<CustomPressableProps, "onPress"> & {
  text: string;
  copied?: boolean;
  onCopy?: () => void;
  size?: number;
};
const UniPressableScale = withUnistyles(PressableScale);

export const CopyIconButton: React.FC<CopyIconButtonProps> = ({ text, copied: copiedProp, onCopy, size = 18, style, ...rest }) => {
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
    <UniPressableScale hitSlop={10} onPress={handlePress} style={[styles.copyButton({ isCopied }), style]} {...rest}>
      <UniRemixIcon
        name={isCopied ? "check-line" : "file-copy-line"}
        size={size}
        uniProps={(theme: any) => ({
          color: isCopied ? theme.colors.primaryText : theme.colors.primary,
        })}
      />
    </UniPressableScale>
  );
};

const styles = StyleSheet.create((theme) => ({
  copyButton: ({ isCopied }: { isCopied: boolean }) => ({
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isCopied ? theme.colors.primary : theme.colors.secondarySurface,
    borderWidth: 1,
    borderColor: isCopied ? theme.colors.primary : theme.colors.borderSubtle,
  }),
}));
