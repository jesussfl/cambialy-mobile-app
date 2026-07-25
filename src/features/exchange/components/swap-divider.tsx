import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { IconButton } from "@/components/ui/button";
import { useSelectedBaseRateId, useSelectedTargetCurrencyId, useCustomRateValue, useExchangeInputAmount, useIsReversed } from "../context/exchange-context";
import { useExchangeConversion } from "../hooks/use-exchange-conversion";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";

export function SwapDivider() {
  const selectedBaseRateId = useSelectedBaseRateId();
  const customRateValue = useCustomRateValue();
  const selectedTargetCurrencyId = useSelectedTargetCurrencyId();
  const inputAmount = useExchangeInputAmount();
  const isReversed = useIsReversed();

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const { handleSwapDirection } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const { convertedAmount } = useExchangeConversion({
    inputAmount,
    isReversed,
    rates,
    selectedBaseRate,
    selectedTargetCurrencyId,
    customRateValue,
  });

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isReversed ? 180 : 0, { duration: 300 });
  }, [isReversed]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.swapDividerRow}>
      <View style={styles.dividerLine} />
      <Animated.View style={arrowStyle}>
        <IconButton icon="arrow-up-down-line" onPress={() => handleSwapDirection(convertedAmount)} />
      </Animated.View>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  swapDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
  },
}));
