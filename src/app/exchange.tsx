import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import RemixIcon, { type IconName } from "react-native-remix-icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { AppTextField } from "@/components/ui/text-field";
import { fetchExchangeRates, type ExchangeRate, type ExchangeRateId } from "@/features/calculator/api/rates-api";

const fallbackRates: ExchangeRate[] = [
  {
    id: "usdt",
    label: "Binance USDT",
    value: 0,
    icon: "copper-coin-line",
  },
  {
    id: "bcv",
    label: "BCV USD",
    value: 0,
    icon: "money-dollar-circle-line",
  },
  {
    id: "eur",
    label: "EUR BCV",
    value: 0,
    icon: "money-euro-circle-line",
  },
];

const currencyMeta: Record<ExchangeRateId, { code: string; shortLabel: string; symbol: string }> = {
  usdt: {
    code: "USDT",
    shortLabel: "Binance",
    symbol: "USDT",
  },
  bcv: {
    code: "USD",
    shortLabel: "BCV",
    symbol: "$",
  },
  eur: {
    code: "EUR",
    shortLabel: "Euro",
    symbol: "EUR",
  },
};

const quickAmounts = ["1", "5", "10", "20", "50", "100"];
const RATES_CACHE_TIME = 1000 * 60 * 10;
const RATES_STALE_TIME = 1000 * 60 * 5;

const UniRemixIcon = withUnistyles(RemixIcon);
const UniAppText = withUnistyles(AppText);

const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.includes(",") && trimmedValue.includes(".") ? trimmedValue.replace(/,/g, "") : trimmedValue.replace(",", ".");

  return Number(normalizedValue);
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatVes = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatRate = (value: number) => (value > 0 ? `${formatNumber(value)} Bs.` : "Sin datos");

const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return "Actualizacion pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Actualizacion pendiente";
  }

  return `Actualizado ${new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
};

export default function ExchangeScreen() {
  const [amount, setAmount] = useState("1");
  const [selectedRateId, setSelectedRateId] = useState<ExchangeRateId>("usdt");
  const ratesQuery = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });

  const rates = ratesQuery.data ?? fallbackRates;
  const selectedRate = rates.find((rate) => rate.id === selectedRateId) ?? rates[0];
  const parsedAmount = parseCurrencyAmount(amount);
  const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const selectedTotal = hasValidAmount && selectedRate.value > 0 ? parsedAmount * selectedRate.value : 0;
  const ratesError = ratesQuery.isError ? "No se pudieron cargar las tasas actualizadas." : null;
  const inputPrefix = selectedRate ? currencyMeta[selectedRate.id].symbol : "$";

  const sortedRates = useMemo(
    () =>
      [...rates].sort((leftRate, rightRate) => {
        const order: Record<ExchangeRateId, number> = { usdt: 0, bcv: 1, eur: 2 };

        return order[leftRate.id] - order[rightRate.id];
      }),
    [rates],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppText variant="title">Convertidor</AppText>
          <AppText variant="subtitle">Convierte divisas a bolivares al instante</AppText>
        </View>

        <Card elevated style={styles.converterCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleGroup}>
              <AppText variant="cardTitle">Monto a convertir</AppText>
              <AppText variant="body">Elige la moneda y compara el resultado en Bs.</AppText>
            </View>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, ratesQuery.isFetching ? styles.statusDotLoading : null]} />
              <AppText variant="tab">{ratesQuery.isFetching ? "Cargando" : "En vivo"}</AppText>
            </View>
          </View>

          <View style={styles.currencySelector}>
            {sortedRates.map((rate) => (
              <CurrencyOption
                key={rate.id}
                icon={rate.icon}
                code={currencyMeta[rate.id].code}
                label={currencyMeta[rate.id].shortLabel}
                selected={rate.id === selectedRateId}
                onPress={() => setSelectedRateId(rate.id)}
              />
            ))}
          </View>

          <AppTextField
            label={`Cantidad en ${selectedRate ? currencyMeta[selectedRate.id].code : "divisa"}`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
            prefix={inputPrefix}
            placeholder="0,00"
          />

          <View style={styles.quickAmountList}>
            {quickAmounts.map((quickAmount) => (
              <Pressable key={quickAmount} accessibilityRole="button" onPress={() => setAmount(quickAmount)} style={styles.quickAmountButton}>
                <AppText variant="tab">
                  {quickAmount} {selectedRate ? currencyMeta[selectedRate.id].code : ""}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.totalPanel}>
            <AppText variant="label">Resultado principal</AppText>
            <AppText variant="title" style={styles.totalAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
              {selectedTotal > 0 ? formatVes(selectedTotal) : "Bs. 0,00"}
            </AppText>
            <AppText variant="body">
              {selectedRate ? `${formatRate(selectedRate.value)} por ${currencyMeta[selectedRate.id].code}` : "Selecciona una moneda"}
            </AppText>
          </View>

          {ratesError ? (
            <AppText variant="body" style={styles.errorText}>
              {ratesError}
            </AppText>
          ) : null}
        </Card>

        <View style={styles.resultsSection}>
          <View style={styles.sectionHeader}>
            <AppText variant="sectionTitle">Todas las conversiones</AppText>
            <AppText variant="body">{hasValidAmount ? `${formatNumber(parsedAmount)} por moneda` : "Ingresa un monto valido"}</AppText>
          </View>

          <Card style={styles.resultsCard}>
            {sortedRates.map((rate, index) => (
              <ConversionRow
                key={rate.id}
                amount={hasValidAmount ? parsedAmount : 0}
                code={currencyMeta[rate.id].code}
                icon={rate.icon}
                isLast={index === sortedRates.length - 1}
                label={rate.label}
                rate={rate.value}
                updatedAt={rate.updatedAt}
                selected={rate.id === selectedRateId}
                onPress={() => setSelectedRateId(rate.id)}
              />
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type CurrencyOptionProps = {
  icon: IconName;
  code: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

function CurrencyOption({ icon, code, label, selected, onPress }: CurrencyOptionProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={selected ? { selected: true } : undefined} onPress={onPress} style={[styles.currencyOption, selected ? styles.selectedCurrencyOption : null]}>
      <UniRemixIcon
        name={icon}
        size={22}
        uniProps={(theme: any) => ({
          color: selected ? theme.colors.primaryText : theme.colors.textSecondary,
        })}
      />
      <View style={styles.currencyCopy}>
        <UniAppText
          variant="button"
          uniProps={(theme) => ({
            color: selected ? theme.colors.primaryText : undefined,
          })}
        >
          {code}
        </UniAppText>
        <UniAppText
          variant="tab"
          numberOfLines={1}
          uniProps={(theme) => ({
            color: selected ? theme.colors.primaryText : theme.colors.textMuted,
          })}
        >
          {label}
        </UniAppText>
      </View>
    </Pressable>
  );
}

type ConversionRowProps = {
  amount: number;
  code: string;
  icon: IconName;
  isLast: boolean;
  label: string;
  rate: number;
  selected: boolean;
  updatedAt?: string;
  onPress: () => void;
};

function ConversionRow({ amount, code, icon, isLast, label, rate, selected, updatedAt, onPress }: ConversionRowProps) {
  const convertedAmount = amount > 0 && rate > 0 ? amount * rate : 0;

  return (
    <Pressable accessibilityRole="button" accessibilityState={selected ? { selected: true } : undefined} onPress={onPress} style={[styles.conversionRow, isLast ? null : styles.rowDivider]}>
      <View style={[styles.conversionIconWrap, selected ? styles.selectedConversionIconWrap : null]}>
        <UniRemixIcon
          name={icon}
          size={22}
          uniProps={(theme: any) => ({
            color: selected ? theme.colors.primaryText : theme.colors.primary,
          })}
        />
      </View>

      <View style={styles.conversionMeta}>
        <AppText variant="button" numberOfLines={1}>
          {label}
        </AppText>
        <AppText variant="body" numberOfLines={1}>
          1 {code} = {formatRate(rate)}
        </AppText>
        <AppText variant="tab" style={styles.updatedText} numberOfLines={1}>
          {formatUpdatedAt(updatedAt)}
        </AppText>
      </View>

      <View style={styles.conversionValueGroup}>
        <AppText variant="value" style={styles.conversionValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
          {convertedAmount > 0 ? formatVes(convertedAmount) : "Bs. 0,00"}
        </AppText>
        {selected ? (
          <View style={styles.selectedPill}>
            <AppText variant="tab" style={styles.selectedPillText}>
              Activo
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing["2xl"],
    paddingBottom: theme.spacing["3xl"],
    gap: theme.spacing["2xl"],
  },
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  converterCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  cardTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xxs,
  },
  statusPill: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondarySurface,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  statusDotLoading: {
    opacity: 0.45,
  },
  currencySelector: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  currencyOption: {
    flex: 1,
    minHeight: 74,
    minWidth: 0,
    justifyContent: "center",
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.secondarySurface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  selectedCurrencyOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  currencyCopy: {
    minWidth: 0,
  },
  quickAmountList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  quickAmountButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.inputSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  totalPanel: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundAccent,
  },
  totalAmount: {
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: theme.colors.error,
  },
  resultsSection: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    gap: theme.spacing.xxs,
  },
  resultsCard: {
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
  },
  conversionRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  conversionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
  },
  selectedConversionIconWrap: {
    backgroundColor: theme.colors.primary,
  },
  conversionMeta: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xxs,
  },
  updatedText: {
    color: theme.colors.textMuted,
  },
  conversionValueGroup: {
    maxWidth: "42%",
    alignItems: "flex-end",
    gap: theme.spacing.xs,
  },
  conversionValue: {
    textAlign: "right",
  },
  selectedPill: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  selectedPillText: {
    color: theme.colors.accentText,
  },
}));
