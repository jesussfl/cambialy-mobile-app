import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";

import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppTextField } from "@/components/ui/text-field";
import { appTheme as theme } from "@/theme/app-theme";

import { fetchExchangeRates, type ExchangeRate } from "../api/rates-api";
import { RateCard } from "../components/rate-card";

const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.includes(",") && trimmedValue.includes(".") ? trimmedValue.replace(/,/g, "") : trimmedValue.replace(",", ".");

  return Number(normalizedValue);
};

const currencyAmountSchema = z
  .string()
  .trim()
  .min(1, "Ingresa un precio")
  .refine((value) => Number.isFinite(parseCurrencyAmount(value)), "Ingresa un numero valido")
  .refine((value) => parseCurrencyAmount(value) > 0, "Ingresa un precio mayor a cero");

const isValidCurrencyAmount = (value?: string) => {
  if (!value?.trim()) {
    return false;
  }

  const parsedValue = parseCurrencyAmount(value);

  return Number.isFinite(parsedValue) && parsedValue > 0;
};

const calculatorSchema = z.object({
  usdValue: currencyAmountSchema,
  comparisonValue: currencyAmountSchema,
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;
type CalculatorTextFieldProps = ComponentProps<typeof AppTextField>;

type CalculationResult = {
  usdAmount: number;
  comparisonAmount: number;
  comparisonMode: ComparisonMode;
  referenceRate: number;
  currencyRate: number;
  currencyPaymentVes: number;
  bcvPaymentVes: number;
  bcvPaymentUsd: number;
  differenceVes: number;
  recommendation: string;
  bcvLabel: "Mejor opcion" | "Mas caro" | "Equivalente";
  currencyLabel: "Mejor opcion" | "Mas caro" | "Equivalente";
};

type ComparisonMode = "ves" | "bcvUsd";

const fallbackRates: ExchangeRate[] = [
  {
    id: "usdt",
    label: "Binance USDT",
    value: 0,
    icon: {
      ios: "bitcoinsign.circle",
      android: "currency_bitcoin",
    },
  },
  {
    id: "bcv",
    label: "BCV USD",
    value: 0,
    icon: {
      ios: "dollarsign.circle",
      android: "attach_money",
    },
  },
  {
    id: "eur",
    label: "EUR BCV",
    value: 0,
    icon: {
      ios: "eurosign.circle",
      android: "euro_symbol",
    },
  },
];

const formatVes = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatUsd = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatRate = (value: number) =>
  value > 0
    ? `${new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)} Bs.`
    : "Sin datos";

const RATES_CACHE_TIME = 1000 * 60 * 10;
const RATES_STALE_TIME = 1000 * 60 * 5;

export function CalculatorScreen() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("ves");
  const ratesQuery = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });
  const rates = ratesQuery.data ?? fallbackRates;
  const isLoadingRates = ratesQuery.isPending;
  const ratesError = ratesQuery.isError ? "No se pudieron cargar las tasas actualizadas." : null;

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
  });

  const usdValue = useWatch({ control, name: "usdValue" });
  const comparisonValue = useWatch({ control, name: "comparisonValue" });

  const bcvRate = useMemo(() => rates.find((rate) => rate.id === "bcv")?.value ?? 0, [rates]);
  const usdtRate = useMemo(() => rates.find((rate) => rate.id === "usdt")?.value ?? 0, [rates]);
  const canCalculate = isValidCurrencyAmount(usdValue) && isValidCurrencyAmount(comparisonValue) && !isLoadingRates && bcvRate > 0 && usdtRate > 0;

  const handleToggleComparisonMode = () => {
    if (bcvRate <= 0) {
      return;
    }

    const comparisonValue = getValues("comparisonValue");
    const currentAmount = parseCurrencyAmount(comparisonValue ?? "");

    if (Number.isFinite(currentAmount) && currentAmount > 0) {
      const convertedAmount = comparisonMode === "ves" ? currentAmount / bcvRate : currentAmount * bcvRate;
      setValue("comparisonValue", convertedAmount.toFixed(2), { shouldValidate: true });
    }

    setComparisonMode((currentMode) => (currentMode === "ves" ? "bcvUsd" : "ves"));
  };

  const handleCalculate = (values: CalculatorFormValues) => {
    const usdAmount = parseCurrencyAmount(values.usdValue);
    const comparisonAmount = parseCurrencyAmount(values.comparisonValue);
    const referenceRate = bcvRate;
    const currencyRate = usdtRate;
    const currencyPaymentVes = usdAmount * currencyRate;
    const bcvPaymentVes = comparisonMode === "ves" ? comparisonAmount : comparisonAmount * referenceRate;
    const bcvPaymentUsd = comparisonMode === "ves" ? comparisonAmount / referenceRate : comparisonAmount;
    const differenceVes = Math.abs(bcvPaymentVes - currencyPaymentVes);
    const isEquivalent = differenceVes < 0.01;
    const isBcvCheaper = bcvPaymentVes < currencyPaymentVes;
    const recommendation = isEquivalent ? "Ambas opciones son equivalentes" : isBcvCheaper ? "Conviene pagar a tasa BCV" : "Conviene pagar en divisas";

    setResult({
      usdAmount,
      comparisonAmount,
      comparisonMode,
      referenceRate,
      currencyRate,
      currencyPaymentVes,
      bcvPaymentVes,
      bcvPaymentUsd,
      differenceVes,
      recommendation,
      bcvLabel: isEquivalent ? "Equivalente" : isBcvCheaper ? "Mejor opcion" : "Mas caro",
      currencyLabel: isEquivalent ? "Equivalente" : isBcvCheaper ? "Mas caro" : "Mejor opcion",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <AppText variant="title">Paga Claro</AppText>
          <AppText variant="subtitle">Compara precios en bolivares y divisas</AppText>
        </View>

        <View style={styles.ratesSection}>
          <AppText variant="sectionTitle" style={styles.centeredTitle}>
            Precios de hoy
          </AppText>

          <View style={styles.rateGrid}>
            {rates.map((rate) => (
              <RateCard key={rate.id} label={rate.label} value={formatRate(rate.value)} icon={rate.icon} />
            ))}
          </View>

          {isLoadingRates ? <AppText variant="body">Cargando tasas actualizadas...</AppText> : null}
          {ratesError ? (
            <AppText variant="body" color={theme.colors.error}>
              {ratesError}
            </AppText>
          ) : null}
        </View>

        <Card elevated style={styles.formCard}>
          <AppText variant="cardTitle">Ingresa los precios a comparar</AppText>

          <View style={styles.formFields}>
            <Controller
              control={control}
              name="usdValue"
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={styles.fieldGroup}>
                  <CalculatorTextField
                    label="Precio en Divisa (USD)"
                    value={value ?? ""}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon={{ ios: "dollarsign.square", android: "attach_money" }}
                  />
                  {errors.usdValue ? (
                    <AppText variant="body" color={theme.colors.error}>
                      {errors.usdValue.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="comparisonValue"
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={styles.fieldGroup}>
                  <CalculatorTextField
                    label={comparisonMode === "ves" ? "Precio en Bolivares (Bs.)" : "Precio en Dolares (BCV)"}
                    value={value ?? ""}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    prefix={comparisonMode === "ves" ? "Bs." : "$"}
                  />
                  {errors.comparisonValue ? (
                    <AppText variant="body" color={theme.colors.error}>
                      {errors.comparisonValue.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />
          </View>

          <AppButton
            label={comparisonMode === "ves" ? "Cambiar a dolares (BCV)" : "Volver a bolivares"}
            variant="secondary"
            onPress={handleToggleComparisonMode}
            disabled={isLoadingRates || bcvRate <= 0}
          />
          <AppButton label="Calcular" variant="primary" onPress={handleSubmit(handleCalculate)} disabled={!canCalculate} />
        </Card>
      </ScrollView>

      <Modal animationType="fade" transparent visible={Boolean(result)} onRequestClose={() => setResult(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="cardTitle">Comparacion de pago</AppText>
                <AppText variant="body">BCV {result ? formatRate(result.referenceRate) : ""} | USDT {result ? formatRate(result.currencyRate) : ""}</AppText>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setResult(null)} style={styles.closeButton}>
                <AppText variant="button">X</AppText>
              </Pressable>
            </View>

            {result ? (
              <>
                <View style={styles.optionGrid}>
                  <PaymentOptionCard
                    title={result.comparisonMode === "ves" ? "Pagar en bolivares" : "Pagar a tasa BCV"}
                    amount={result.comparisonMode === "ves" ? formatVes(result.comparisonAmount) : formatUsd(result.comparisonAmount)}
                    detail={
                      result.comparisonMode === "ves"
                        ? `Equivale a ${formatUsd(result.bcvPaymentUsd)} usando BCV`
                        : `Equivale a ${formatVes(result.bcvPaymentVes)} usando BCV`
                    }
                    label={result.bcvLabel}
                  />
                  <PaymentOptionCard
                    title="Pagar en divisa"
                    amount={formatUsd(result.usdAmount)}
                    detail={`Equivale a ${formatVes(result.currencyPaymentVes)} usando Binance USDT`}
                    label={result.currencyLabel}
                  />
                </View>

                <View style={styles.recommendationBox}>
                  <AppText variant="label">Recomendacion</AppText>
                  <AppText variant="cardTitle">{result.recommendation}</AppText>
                  <AppText variant="body">Diferencia: {formatVes(result.differenceVes)}</AppText>
                </View>

                <AppButton label="Cerrar" variant="secondary" icon="xmark" onPress={() => setResult(null)} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CalculatorTextField({ onBlur, onFocus, onPointerEnter, onPointerLeave, ...props }: CalculatorTextFieldProps) {
  const focusProgress = useSharedValue(0);
  const hoverProgress = useSharedValue(0);

  const animatedInputContainerStyle = useAnimatedStyle(() => {
    const activeProgress = Math.max(focusProgress.value, hoverProgress.value);

    return {
      borderWidth: 1,
      borderColor: interpolateColor(activeProgress, [0, 1], ["rgba(17, 194, 131, 0)", theme.colors.primary]),
    };
  });

  return (
    <AppTextField
      {...props}
      inputContainerStyle={animatedInputContainerStyle}
      onFocus={(event) => {
        focusProgress.value = withTiming(1, { duration: 180 });
        onFocus?.(event);
      }}
      onBlur={(event) => {
        focusProgress.value = withTiming(0, { duration: 180 });
        onBlur?.(event);
      }}
      onPointerEnter={(event) => {
        hoverProgress.value = withTiming(1, { duration: 180 });
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        hoverProgress.value = withTiming(0, { duration: 180 });
        onPointerLeave?.(event);
      }}
    />
  );
}

type PaymentOptionCardProps = {
  title: string;
  amount: string;
  detail: string;
  label: CalculationResult["bcvLabel"];
};

function PaymentOptionCard({ title, amount, detail, label }: PaymentOptionCardProps) {
  const isBestOption = label === "Mejor opcion";

  return (
    <View style={[styles.optionCard, isBestOption ? styles.bestOptionCard : null]}>
      <View style={[styles.resultBadge, isBestOption ? styles.bestBadge : styles.expensiveBadge]}>
        <AppText variant="tab" color={isBestOption ? theme.colors.primaryText : theme.colors.textSecondary}>
          {label}
        </AppText>
      </View>
      <AppText variant="label">{title}</AppText>
      <AppText variant="value" style={styles.optionAmount}>
        {amount}
      </AppText>
      <AppText variant="body">{detail}</AppText>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -140,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.backgroundAccent,
    opacity: 0.32,
  },
  backgroundGlowBottom: {
    position: "absolute",
    right: -120,
    bottom: 120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.backgroundAccent,
    opacity: 0.22,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing["3xl"],
    paddingBottom: theme.spacing["3xl"],
    gap: theme.spacing["3xl"],
  },
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  ratesSection: {
    gap: theme.spacing.lg,
  },
  centeredTitle: {
    textAlign: "center",
  },
  rateGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  formCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  formFields: {
    gap: theme.spacing.xl,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: "rgba(1, 8, 20, 0.72)",
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.floating,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondarySurface,
  },
  optionGrid: {
    gap: theme.spacing.sm,
  },
  optionCard: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  bestOptionCard: {
    borderColor: theme.colors.primary,
  },
  resultBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.pill,
  },
  bestBadge: {
    backgroundColor: theme.colors.primary,
  },
  expensiveBadge: {
    backgroundColor: theme.colors.secondarySurface,
  },
  optionAmount: {
    fontSize: theme.typography.fontSize.md,
  },
  recommendationBox: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.inputSurface,
  },
}));
