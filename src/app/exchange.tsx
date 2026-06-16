import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { ExchangeHeader } from "@/features/exchange/components/exchange-header";
import { SwapAmountBlock } from "@/features/exchange/components/swap-amount-block";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
import { useExchangeScreen } from "@/features/exchange/hooks/use-exchange-screen";

export default function ExchangeScreen() {
  const exchange = useExchangeScreen();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <ExchangeHeader
          historyOptions={exchange.historyPickerOptions}
          isFetching={exchange.isRatesFetching}
          isHistoryFetching={exchange.isHistoryFetching}
          label={exchange.selectedBaseRate.label}
        />

        <View style={styles.swapPanel}>
          <SwapAmountBlock
            amount={exchange.inputAmountText}
            code={exchange.inputMeta.code}
            editable
            icon={exchange.inputMeta.icon}
            label="Monto"
            onAmountChange={exchange.handleInputAmountChange}
            onCustomRateChange={exchange.handleCustomRateChange}
            onCurrencySelect={exchange.handleInputCurrencySelect}
            onQuickAmountSelect={exchange.setInputAmount}
            options={exchange.inputOptions}
            quickAmounts={exchange.quickAmounts}
            customRate={exchange.customRate}
            showCustomRateInput={exchange.showInputCustomRateInput}
            supportingHint={exchange.showInputCustomRateInput ? exchange.customRateHint : exchange.selectedBaseRateHint}
            selectedOptionId={exchange.inputSelectedOptionId}
            symbol={exchange.inputMeta.symbol}
          />

          <SwapDivider onPress={exchange.handleSwapDirection} />

          <SwapAmountBlock
            amount={exchange.outputAmountText}
            code={exchange.outputMeta.code}
            icon={exchange.outputMeta.icon}
            label="Cambio estimado"
            onCopyAmount={exchange.handleCopyOutput}
            onCustomRateChange={exchange.handleCustomRateChange}
            onCurrencySelect={exchange.handleOutputCurrencySelect}
            options={exchange.outputOptions}
            resultCopied={exchange.outputCopied}
            selectedOptionId={exchange.outputSelectedOptionId}
            customRate={exchange.customRate}
            showCustomRateInput={exchange.showOutputCustomRateInput}
            supportingDetails={exchange.conversionDetails}
            supportingFormula="Otros cambios"
            symbol={exchange.outputMeta.symbol}
          />
        </View>

        <View style={styles.rateMeta}>
          {exchange.ratesError ? (
            <AppText variant="tab" style={styles.errorText} numberOfLines={1}>
              {exchange.ratesError}
            </AppText>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["3xl"],
    gap: theme.spacing.lg,
  },
  swapPanel: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  rateMeta: {
    minHeight: 22,
    gap: theme.spacing.xxs,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
}));
