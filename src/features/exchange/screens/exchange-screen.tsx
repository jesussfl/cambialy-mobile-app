import { ScrollView, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { TrueSheet } from "@lodev09/react-native-true-sheet";

import { AppText } from "@/components/ui/app-text";
import { TouchZone } from "@/components/ui/button";
import { TopNavbar } from "@/components/ui/top-navbar";
import { ConversionDetails } from "@/features/exchange/components/conversion-details";
import { RateHistorySheet } from "@/features/exchange/components/rate-history-sheet";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
import { SwapInputBlock } from "@/features/exchange/components/swap-input-block";
import { SwapOutputBlock } from "@/features/exchange/components/swap-output-block";
import { useExchangeStore } from "@/features/exchange/store/exchange-store";
import { useExchangeConversion } from "@/features/exchange/hooks/use-exchange-conversion";
import { useExchangeRatesList } from "@/features/exchange/hooks/use-exchange-rates-list";
import { formatHistoricalDate } from "@/features/exchange/utils";

const UniRemixIcon = withUnistyles(RemixIcon);

export function ExchangeScreen() {
  const selectedBaseRateId = useExchangeStore((s) => s.selectedBaseRateId);
  const customRateValue = useExchangeStore((s) => s.customRateValue);
  const selectedTargetCurrencyId = useExchangeStore((s) => s.selectedTargetCurrencyId);
  const inputAmount = useExchangeStore((s) => s.inputAmount);
  const isReversed = useExchangeStore((s) => s.isReversed);
  const selectedDate = useExchangeStore((s) => s.selectedDate);
  const setSelectedDate = useExchangeStore((s) => s.setSelectedDate);

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
      <TopNavbar
        title="Cambialy"
        rightContent={
          <TouchZone
            hitSlop={8}
            style={[styles.historyIconButton, !!selectedDate && styles.activeHistoryIconButton]}
            onPress={() => TrueSheet.present("rate-history-sheet")}
          >
            <UniRemixIcon
              name="history-line"
              size={22}
              uniProps={(theme: any) => ({
                color: selectedDate ? theme.colors.primary : theme.colors.textPrimary,
              })}
            />
            {selectedDate ? <View style={styles.historyBadgeDot} /> : null}
          </TouchZone>
        }
      />

      {selectedDate ? (
        <View style={styles.historyBanner}>
          <View style={styles.historyBannerText}>
            <UniRemixIcon
              name="calendar-event-line"
              size={16}
              uniProps={(theme: any) => ({ color: theme.colors.primary })}
            />
            <AppText variant="subtitle" style={styles.historyBannerDate}>
              {`Tasa histórica: ${formatHistoricalDate(selectedDate ?? "")}`}
            </AppText>
          </View>
          <TouchZone style={styles.resetBannerButton} onPress={() => setSelectedDate(null)}>
            <AppText variant="label" style={styles.resetBannerText}>
              Usar tasa hoy
            </AppText>
          </TouchZone>
        </View>
      ) : null}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.swapPanel}>
          <SwapInputBlock />
          <SwapDivider />
          <SwapOutputBlock />
        </View>

        {conversionDetails.length ? <ConversionDetails details={conversionDetails} formula="Otros cambios" /> : null}
      </ScrollView>

      <RateHistorySheet />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    height: 44,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyIconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  activeHistoryIconButton: {
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  historyBadgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  historyBanner: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  historyBannerText: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  historyBannerDate: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: 12,
  },
  resetBannerButton: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  resetBannerText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  screenContent: {
    paddingTop: rt.insets.top,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopRightRadius: theme.radius.lg,
    borderTopLeftRadius: theme.radius.lg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 150,
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
