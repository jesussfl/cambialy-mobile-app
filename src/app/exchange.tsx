import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { IconButton } from "@/components/ui/button";
import { ConversionDetails } from "@/features/exchange/components/conversion-details";
import { ExchangeHeader } from "@/features/exchange/components/exchange-header";
import { ExchangeInputBlock } from "@/features/exchange/components/exchange-input-block";
import { ExchangeOutputBlock } from "@/features/exchange/components/exchange-output-block";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
import { ExchangeProvider } from "@/features/exchange/context/exchange-context";
import { useExchangeScreen } from "@/features/exchange/hooks/use-exchange-screen";

export default function ExchangeScreen() {
  return (
    <ExchangeProvider>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ExchangeScreenContent />
      </SafeAreaView>
    </ExchangeProvider>
  );
}

function ExchangeScreenContent() {
  const { conversionDetails, resetExchange } = useExchangeScreen();
  const details = conversionDetails();

  return (
    <View style={styles.screenContent}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <ExchangeHeader />

        <View style={styles.swapPanel}>
          <ExchangeInputBlock />
          <SwapDivider />
          <ExchangeOutputBlock />
        </View>

        {details.length ? <ConversionDetails details={details} formula="Otros cambios" style={styles.conversionDetails} /> : null}
      </ScrollView>

      <IconButton icon="refresh-line" onPress={resetExchange} style={styles.resetButton} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenContent: {
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing["5xl"] + theme.spacing["3xl"],
    gap: theme.spacing.lg,
  },
  swapPanel: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  conversionDetails: {
    marginTop: theme.spacing.xs,
  },
  rateMeta: {
    minHeight: 22,
    gap: theme.spacing.xxs,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
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
  resetButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
}));
