import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { ExchangeProvider } from "@/features/exchange/context/exchange-context";
import { ExchangeInputBlock } from "@/features/exchange/components/exchange-input-block";
import { ExchangeOutputBlock } from "@/features/exchange/components/exchange-output-block";
import { ExchangeHeader } from "@/features/exchange/components/exchange-header";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
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
  const { ratesError } = useExchangeScreen();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
      <ExchangeHeader />

      <View style={styles.swapPanel}>
        <ExchangeInputBlock />
        <SwapDivider />
        <ExchangeOutputBlock />
      </View>

      <View style={styles.rateMeta}>
        {ratesError ? (
          <AppText variant="tab" style={styles.errorText} numberOfLines={1}>
            {ratesError}
          </AppText>
        ) : null}
      </View>
    </ScrollView>
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
