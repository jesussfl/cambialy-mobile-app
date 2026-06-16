import { Pressable, ScrollView, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { ExchangeHeader } from "@/features/exchange/components/exchange-header";
import { ExchangeInputBlock } from "@/features/exchange/components/exchange-input-block";
import { ExchangeOutputBlock } from "@/features/exchange/components/exchange-output-block";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
import { ExchangeProvider } from "@/features/exchange/context/exchange-context";
import { useExchangeScreen } from "@/features/exchange/hooks/use-exchange-screen";

const UniRemixIcon = withUnistyles(RemixIcon);

export default function ExchangeScreen() {
  const { theme } = useUnistyles();

  return (
    <ExchangeProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={["top"]}>
        <ExchangeScreenContent />
      </SafeAreaView>
    </ExchangeProvider>
  );
}

function ExchangeScreenContent() {
  const { ratesError, resetExchange } = useExchangeScreen();

  return (
    <View style={styles.screenContent}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reiniciar cambio"
        hitSlop={10}
        onPress={resetExchange}
        style={({ pressed }) => [styles.resetButton, pressed ? styles.resetButtonPressed : null]}
      >
        <UniRemixIcon
          name="restart-line"
          size={24}
          uniProps={(theme: any) => ({
            color: theme.colors.primaryText,
          })}
        />
      </Pressable>
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
