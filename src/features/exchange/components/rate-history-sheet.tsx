import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import RemixIcon from "react-native-remix-icon";
import { StyleSheet, useUnistyles, withUnistyles } from "react-native-unistyles";

import { historyQueries } from "@/api/queries/history.queries";
import { AppText } from "@/components/ui/app-text";
import { useExchangeStore } from "@/features/exchange/store/exchange-store";
import { formatHistoricalDate, formatVesRateString } from "@/features/exchange/utils";
import type { ExchangeRateHistoryOption, ExchangeRateId } from "@/models/exchange.models";

const UniRemixIcon = withUnistyles(RemixIcon);

export function RateHistorySheet() {
  const selectedDate = useExchangeStore((s) => s.selectedDate);
  const setSelectedDate = useExchangeStore((s) => s.setSelectedDate);
  const [selectedCategory, setSelectedCategory] = useState<ExchangeRateId>("bcv");
  const { theme } = useUnistyles();
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...historyQueries.getInfiniteRateHistory(selectedCategory, 20),
    staleTime: 5 * 60 * 1000,
  });

  const historyItems: ExchangeRateHistoryOption[] = data?.pages.flatMap((page) => page.items) ?? [];

  if (isError) {
    console.error("[RateHistorySheet] Query Error:", error);
  }

  const handleSelectDate = (updatedAt?: string) => {
    if (!updatedAt) return;
    setSelectedDate(updatedAt);
    TrueSheet.dismiss("rate-history-sheet");
  };

  const handleResetToToday = () => {
    setSelectedDate(null);
    TrueSheet.dismiss("rate-history-sheet");
  };

  const renderHistoryItem = ({ item }: { item: ExchangeRateHistoryOption }) => {
    const isSelected = selectedDate === item.updatedAt;
    return (
      <Pressable style={[styles.historyRow, isSelected && styles.activeRow]} onPress={() => handleSelectDate(item.updatedAt)}>
        <View style={styles.rowInfo}>
          <AppText variant="body" style={styles.rowDate}>
            {formatHistoricalDate(item.updatedAt)}
          </AppText>
          <AppText variant="subtitle" style={styles.rowLabel}>
            {item.label}
          </AppText>
        </View>

        <View style={styles.rowValueContainer}>
          <AppText variant="body" style={styles.rowValue}>
            {formatVesRateString(item.value)}
          </AppText>
          {isSelected ? <UniRemixIcon name="checkbox-circle-fill" size={20} uniProps={(theme: any) => ({ color: theme.colors.primary })} /> : null}
        </View>
      </Pressable>
    );
  };

  return (
    <TrueSheet name="rate-history-sheet" detents={[0.65, 0.95]} cornerRadius={24} grabber scrollable backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <UniRemixIcon name="history-line" size={22} uniProps={(theme: any) => ({ color: theme.colors.primary })} />
            <AppText variant="cardTitle" style={{ fontWeight: "bold" }}>
              Historial de Tasas
            </AppText>
          </View>
          <AppText variant="subtitle" style={styles.subtitle}>
            Selecciona una fecha histórica para calcular el cambio
          </AppText>
        </View>

        <View style={styles.tabsRow}>
          <Pressable style={[styles.tab, selectedCategory === "bcv" && styles.activeTab]} onPress={() => setSelectedCategory("bcv")}>
            <AppText variant="label" style={[styles.tabText, selectedCategory === "bcv" && styles.activeTabText]}>
              BCV (USD / EUR)
            </AppText>
          </Pressable>
          <Pressable style={[styles.tab, selectedCategory === "usdt" && styles.activeTab]} onPress={() => setSelectedCategory("usdt")}>
            <AppText variant="label" style={[styles.tabText, selectedCategory === "usdt" && styles.activeTabText]}>
              Binance USDT
            </AppText>
          </Pressable>
        </View>

        {selectedDate ? (
          <Pressable style={styles.resetButton} onPress={handleResetToToday}>
            <UniRemixIcon name="refresh-line" size={18} uniProps={(theme: any) => ({ color: theme.colors.primary })} />
            <AppText variant="label" style={styles.resetButtonText}>
              Restablecer a Tasa Actual (Hoy)
            </AppText>
          </Pressable>
        ) : null}

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" />
            <AppText variant="body" style={{ color: "#94a3b8", marginTop: 8 }}>
              Cargando historial...
            </AppText>
          </View>
        ) : isError ? (
          <View style={styles.centerState}>
            <AppText variant="body" style={{ color: "#ef4444" }}>
              Error al cargar el historial.
            </AppText>
          </View>
        ) : historyItems.length === 0 ? (
          <View style={styles.centerState}>
            <AppText variant="body" style={{ color: "#94a3b8" }}>
              No hay datos de historial disponibles.
            </AppText>
          </View>
        ) : (
          <View style={styles.listWrapper}>
            <FlashList
              data={historyItems}
              renderItem={renderHistoryItem}
              onEndReached={() => {
                console.log(`[RateHistorySheet] onEndReached. hasNextPage: ${hasNextPage}, isFetchingNextPage: ${isFetchingNextPage}`);
                if (hasNextPage && !isFetchingNextPage) {
                  console.log("[RateHistorySheet] Calling fetchNextPage()...");
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" />
                  </View>
                ) : null
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </TrueSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.md,
    flex: 1,
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.xxs,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceMuted,
    padding: 4,
    borderRadius: theme.radius.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows?.floating,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  activeTabText: {
    color: theme.colors.textPrimary,
    fontWeight: "bold",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfaceMuted,
  },
  resetButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
    flexGrow: 1,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.background,
  },
  activeRow: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSoft,
  },
  rowInfo: {
    gap: 2,
  },
  rowDate: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  rowLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  rowValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  rowValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  listWrapper: {
    flex: 1,
    minHeight: 200,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  centerState: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
}));
