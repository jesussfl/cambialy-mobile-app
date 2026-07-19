import { useEffect } from "react";
import type { ReactNode } from "react";
import { TextInput } from "react-native";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import Animated, { type AnimatedStyle, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type AnimatedAmountTextProps = {
  children?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  style?: StyleProp<TextStyle | AnimatedStyle<TextStyle>>;
  text: string;
};

type AnimatedTextInputProps = TextInputProps & {
  text?: string;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const TEXT_TRANSITION_DISTANCE = 3;

export function AnimatedAmountText({ children, containerStyle, numberOfLines = 1, style, text }: AnimatedAmountTextProps) {
  const animatedText = useSharedValue(text);
  const transition = useSharedValue(1);

  useEffect(() => {
    animatedText.value = text;
    transition.value = 0;
    transition.value = withTiming(1, { duration: 90 });
  }, [animatedText, text, transition]);

  const animatedProps = useAnimatedProps<AnimatedTextInputProps>(() => ({
    text: animatedText.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - transition.value) * TEXT_TRANSITION_DISTANCE }],
  }));

  return (
    <Animated.View style={[styles.amountTextRow, containerStyle]}>
      <AnimatedTextInput
        animatedProps={animatedProps}
        accessibilityLabel={text}
        defaultValue={text}
        editable={false}
        numberOfLines={numberOfLines}
        pointerEvents="none"
        style={[styles.amountText, style, animatedTextStyle]}
      />
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
  amountText: {
    minWidth: 0,
    padding: 0,
  },
}));
