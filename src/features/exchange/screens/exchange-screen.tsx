import { ConversionDetails } from "@/features/exchange/components/conversion-details";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
import { SwapInputBlock } from "@/features/exchange/components/swap-input-block";
import { SwapOutputBlock } from "@/features/exchange/components/swap-output-block";
import { ExchangeProvider, useExchangeContext } from "@/features/exchange/context/exchange-context";
import { useExchangeConversion } from "@/features/exchange/hooks/use-exchange-conversion";
import { useExchangeRatesList } from "@/features/exchange/hooks/use-exchange-rates-list";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function ExchangeScreen() {
  return (
    <ExchangeProvider>
      <ExchangeScreenContent />
    </ExchangeProvider>
  );
}

function ExchangeScreenContent() {
  const { selectedBaseRateId, customRateValue, selectedTargetCurrencyId, inputAmount, isReversed, resetExchange } = useExchangeContext();

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const { conversionDetails } = useExchangeConversion({
    inputAmount,
    isReversed,
    rates,
    selectedBaseRate,
    selectedTargetCurrencyId,
    customRateValue,
  });

  return (
    <View style={styles.screenContent}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.swapPanel}>
          <SwapInputBlock />
          <SwapDivider />
          <SwapOutputBlock />
        </View>

        {conversionDetails.length ? <ConversionDetails details={conversionDetails} formula="Otros cambios" /> : null}
      </ScrollView>

      {/* <IconButton icon="reset-left-line" onPress={resetExchange} style={styles.resetButton} /> */}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  screenContent: {
    paddingTop: rt.insets.top,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 150,

    gap: theme.spacing.lg,
  },
  swapPanel: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },

  resetButton: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadows.floating,
  },
}));
