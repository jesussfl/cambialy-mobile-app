import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition, type AnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type AnimatedAmountTextProps = {
  children?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  style?: StyleProp<TextStyle | AnimatedStyle<TextStyle>>;
  text: string;
};

const ENTERING = FadeInDown.duration(120);
const EXITING = FadeOutUp.duration(80);
const LAYOUT = LinearTransition.duration(130);

export function AnimatedAmountText({ children, containerStyle, numberOfLines = 1, style, text }: AnimatedAmountTextProps) {
  return (
    <Animated.View layout={LAYOUT} style={[styles.amountTextRow, containerStyle]}>
      {text.split("").map((character, index) => (
        <Animated.Text
          entering={ENTERING.delay(Math.min(index * 6, 42))}
          exiting={EXITING}
          key={`${index}-${character}`}
          layout={LAYOUT}
          numberOfLines={numberOfLines}
          style={style}
        >
          {character === " " ? "\u00A0" : character}
        </Animated.Text>
      ))}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create(() => ({
  amountTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    minWidth: 0,
    overflow: "hidden",
  },
}));
