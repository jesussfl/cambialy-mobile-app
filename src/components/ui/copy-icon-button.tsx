import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { TouchZone, TouchZoneProps } from "./button";
import { UniRemixIcon } from "./icon";

type CopyIconButtonProps = Omit<TouchZoneProps, "onPress"> & {
  text: string;
  copied?: boolean;
  onCopy?: () => void;
  size?: number;
};

export const CopyIconButton: React.FC<CopyIconButtonProps> = ({ text, copied: copiedProp, onCopy, size = 18, style, ...rest }) => {
  const [internalCopied, setInternalCopied] = useState(false);
  const isControlled = copiedProp !== undefined;
  const isCopied = isControlled ? copiedProp : internalCopied;
  const scale = useSharedValue(1);

  const handlePress = async () => {
    if (!text) return;

    await Clipboard.setStringAsync(text);
    onCopy?.();

    if (!isControlled) {
      setInternalCopied(true);
    }
  };

  useEffect(() => {
    if (isCopied) {
      scale.value = withSequence(withTiming(1.2, { duration: 100 }), withSpring(1, { damping: 15 }));
    }
  }, [isCopied]);

  useEffect(() => {
    if (isControlled || !internalCopied) return;

    const timeoutId = setTimeout(() => {
      setInternalCopied(false);
    }, 1600);

    return () => clearTimeout(timeoutId);
  }, [isControlled, internalCopied]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchZone hitSlop={10} onPress={handlePress} style={[styles.copyButton({ isCopied }), style]} {...rest}>
      <Animated.View style={iconStyle}>
        <UniRemixIcon
          name={isCopied ? "check-line" : "file-copy-line"}
          size={size}
          uniProps={(theme: any) => ({
            color: isCopied ? theme.colors.primaryText : theme.colors.primary,
          })}
        />
      </Animated.View>
    </TouchZone>
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
