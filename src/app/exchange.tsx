import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { fetchExchangeRateHistory, fetchExchangeRates, type ExchangeRateHistoryOption, type ExchangeRateId } from "@/features/calculator/api/rates-api";
import { ExchangeHeader, type ExchangeHistoryPickerOption } from "@/features/exchange/components/exchange-header";
import { SwapAmountBlock } from "@/features/exchange/components/swap-amount-block";
import { SwapDivider } from "@/features/exchange/components/swap-divider";
import { currencyMeta, fallbackRates, QUICK_AMOUNTS, RATE_ORDER, RATES_CACHE_TIME, RATES_STALE_TIME, targetCurrencyMeta } from "@/features/exchange/constants";
import type { ConversionDetail, TargetCurrencyId } from "@/features/exchange/types";
import {
  formatCompactAmount,
  formatHistoryDate,
  formatNumber,
  formatRate,
  getDisplayAmount,
  parseCurrencyAmount,
  sanitizeAmountInput,
} from "@/features/exchange/utils";

const LIVE_HISTORY_VALUE = "live";

export default function ExchangeScreen() {
  const [amount, setAmount] = useState("1");
  const [selectedRateId, setSelectedRateId] = useState<ExchangeRateId>("bcv");
  const [selectedHistoryValue, setSelectedHistoryValue] = useState(LIVE_HISTORY_VALUE);
  const [targetCurrencyId, setTargetCurrencyId] = useState<TargetCurrencyId>("ves");
  const [isReversed, setIsReversed] = useState(false);
  const [copiedResultText, setCopiedResultText] = useState<string | null>(null);

  const ratesQuery = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });

  console.log("ExchangeScreen render", {
    rates: ratesQuery.data,
    ratesError: ratesQuery.error,
  });

  const rateHistoryQuery = useQuery({
    queryKey: ["exchange-rate-history", selectedRateId],
    queryFn: () => fetchExchangeRateHistory(selectedRateId),
    staleTime: RATES_STALE_TIME,
    gcTime: RATES_CACHE_TIME,
  });

  const rates = ratesQuery.data ?? fallbackRates;
  const liveSortedRates = useMemo(() => [...rates].sort((leftRate, rightRate) => RATE_ORDER[leftRate.id] - RATE_ORDER[rightRate.id]), [rates]);
  const liveSelectedRate = liveSortedRates.find((rate) => rate.id === selectedRateId) ?? liveSortedRates[0] ?? fallbackRates[0];
  const historyRates = useMemo(() => rateHistoryQuery.data ?? [], [rateHistoryQuery.data]);
  const selectedHistoryRate = useMemo(() => {
    if (selectedHistoryValue === LIVE_HISTORY_VALUE) {
      return null;
    }

    return historyRates.find((historyRate, index) => getHistoryRateKey(historyRate, index) === selectedHistoryValue) ?? null;
  }, [historyRates, selectedHistoryValue]);
  const sortedRates = useMemo(
    () =>
      liveSortedRates.map((rate) => {
        if (!selectedHistoryRate) {
          return rate;
        }

        if (rate.id === selectedRateId) {
          return selectedHistoryRate;
        }

        if (selectedRateId === "bcv" && rate.id === "eur" && isFiniteRate(selectedHistoryRate.eurValue)) {
          return { ...rate, value: selectedHistoryRate.eurValue, updatedAt: selectedHistoryRate.updatedAt };
        }

        if (selectedRateId === "eur" && rate.id === "bcv" && isFiniteRate(selectedHistoryRate.bcvValue)) {
          return { ...rate, value: selectedHistoryRate.bcvValue, updatedAt: selectedHistoryRate.updatedAt };
        }

        return rate;
      }),
    [liveSortedRates, selectedHistoryRate, selectedRateId],
  );
  const selectedRate = sortedRates.find((rate) => rate.id === selectedRateId) ?? sortedRates[0] ?? fallbackRates[0];
  const selectedMeta = currencyMeta[selectedRate.id];
  const targetMeta = targetCurrencyMeta[targetCurrencyId];
  const bcvRate = sortedRates.find((rate) => rate.id === "bcv")?.value ?? fallbackRates.find((rate) => rate.id === "bcv")?.value ?? 0;
  const sourceMeta = isReversed ? targetMeta : selectedMeta;
  const resultMeta = isReversed ? selectedMeta : targetMeta;
  const sourceOptions = isReversed ? Object.values(targetCurrencyMeta) : sortedRates.map((rate) => currencyMeta[rate.id]);
  const resultOptions = isReversed ? sortedRates.map((rate) => currencyMeta[rate.id]) : Object.values(targetCurrencyMeta);
  const sourceSelectedOptionId = isReversed ? targetCurrencyId : selectedRate.id;
  const resultSelectedOptionId = isReversed ? selectedRate.id : targetCurrencyId;
  const parsedAmount = parseCurrencyAmount(amount);
  const safeAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const sourceAmountInVes = isReversed ? (targetCurrencyId === "ves" ? safeAmount : bcvRate > 0 ? safeAmount * bcvRate : 0) : safeAmount * selectedRate.value;
  const convertedAmount = isReversed
    ? selectedRate.value > 0
      ? sourceAmountInVes / selectedRate.value
      : 0
    : targetCurrencyId === "ves"
      ? sourceAmountInVes
      : bcvRate > 0
        ? sourceAmountInVes / bcvRate
        : 0;
  const selectedEquivalentValue =
    targetCurrencyId === "ves"
      ? selectedRate.value > 0
        ? `${targetMeta.symbol} ${formatNumber(selectedRate.value)}`
        : "Sin datos"
      : bcvRate > 0
        ? `${formatNumber(selectedRate.value / bcvRate)} ${targetMeta.code}`
        : "Sin datos";
  const selectedRateHint = `1 ${selectedMeta.code} equivale ${selectedEquivalentValue}`;
  const resultAmountText = formatCompactAmount(convertedAmount);
  const resultCopyText = `${resultMeta.symbol} ${resultAmountText} ${resultMeta.code}`;
  const resultCopied = copiedResultText === resultCopyText;
  const conversionDetails = useMemo<ConversionDetail[]>(() => {
    if (isReversed) {
      return sortedRates
        .filter((rate) => rate.id !== selectedRate.id)
        .map((rate) => {
          const rateMeta = currencyMeta[rate.id];
          const convertedValue = rate.value > 0 ? sourceAmountInVes / rate.value : 0;
          const rateValue =
            targetCurrencyId === "ves" ? formatRate(rate.value) : bcvRate > 0 ? `${formatNumber(rate.value / bcvRate)} ${targetMeta.code}` : "Sin datos";

          return {
            amountText: `${rateMeta.symbol} ${formatCompactAmount(convertedValue)}`,
            icon: rate.icon,
            id: rate.id,
            label: rateMeta.code,
            rateText: `1 ${rateMeta.code} = ${rateValue}`,
          };
        });
    }

    return sortedRates
      .filter((rate) => rate.id !== selectedRate.id)
      .map((rate) => {
        const rateMeta = currencyMeta[rate.id];
        const convertedValue = targetCurrencyId === "ves" ? safeAmount * rate.value : bcvRate > 0 ? (safeAmount * rate.value) / bcvRate : 0;
        const rateValue = targetCurrencyId === "ves" ? formatRate(rate.value) : bcvRate > 0 ? `${formatNumber(rate.value / bcvRate)} BCV` : "Sin datos";

        return {
          amountText: `${targetMeta.symbol} ${formatCompactAmount(convertedValue)}`,
          icon: rate.icon,
          id: rate.id,
          label: rateMeta.code,
          rateText: `1 ${rateMeta.code} = ${rateValue}`,
        };
      });
  }, [bcvRate, isReversed, safeAmount, selectedRate.id, sortedRates, sourceAmountInVes, targetCurrencyId, targetMeta.code, targetMeta.symbol]);
  const ratesError = ratesQuery.isError ? "No se pudieron cargar las tasas actualizadas." : null;
  const historyPickerOptions = useMemo<ExchangeHistoryPickerOption[]>(() => {
    const liveRateText = formatRate(liveSelectedRate.value);
    const liveDateText = formatHistoryDate(liveSelectedRate.updatedAt);
    const liveOption = {
      value: LIVE_HISTORY_VALUE,
      label: liveRateText,
      description: liveDateText,
      headerDescription: `${liveRateText} - ${liveDateText}`,
    };

    const historyOptions = historyRates
      .filter((historyRate) => historyRate.updatedAt !== liveSelectedRate.updatedAt)
      .map((historyRate, index) => {
        const rateText = formatRate(historyRate.value);
        const dateText = formatHistoryDate(historyRate.updatedAt);

        return {
          value: getHistoryRateKey(historyRate, index),
          label: rateText,
          description: dateText,
          headerDescription: `${rateText} - ${dateText}`,
        };
      });

    return [liveOption, ...historyOptions];
  }, [historyRates, liveSelectedRate.updatedAt, liveSelectedRate.value]);

  const handleChangeAmount = (value: string) => {
    setAmount(sanitizeAmountInput(value));
  };

  const handleSourceCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setTargetCurrencyId(optionId as TargetCurrencyId);
      return;
    }

    setSelectedHistoryValue(LIVE_HISTORY_VALUE);
    setSelectedRateId(optionId as ExchangeRateId);
  };

  const handleResultCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedHistoryValue(LIVE_HISTORY_VALUE);
      setSelectedRateId(optionId as ExchangeRateId);
      return;
    }

    setTargetCurrencyId(optionId as TargetCurrencyId);
  };

  const handleSwapDirection = () => {
    setAmount(convertedAmount > 0 ? convertedAmount.toFixed(2).replace(/\.00$/, "") : "");
    setIsReversed((currentValue) => !currentValue);
  };

  const handleCopyResult = useCallback(async () => {
    await Clipboard.setStringAsync(resultCopyText);
    setCopiedResultText(resultCopyText);
  }, [resultCopyText]);

  useEffect(() => {
    if (!copiedResultText) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCopiedResultText(null);
    }, 1600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [copiedResultText]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <ExchangeHeader
          historyOptions={historyPickerOptions}
          isFetching={ratesQuery.isFetching}
          isHistoryFetching={rateHistoryQuery.isFetching}
          label={selectedRate.label}
          onHistorySelect={setSelectedHistoryValue}
          selectedHistoryValue={selectedHistoryValue}
        />

        <View style={styles.swapPanel}>
          <SwapAmountBlock
            amount={getDisplayAmount(amount)}
            code={sourceMeta.code}
            editable
            icon={sourceMeta.icon}
            label="Monto"
            onAmountChange={handleChangeAmount}
            onCurrencySelect={handleSourceCurrencySelect}
            onQuickAmountSelect={setAmount}
            options={sourceOptions}
            quickAmounts={QUICK_AMOUNTS}
            supportingHint={selectedRateHint}
            selectedOptionId={sourceSelectedOptionId}
            symbol={sourceMeta.symbol}
          />

          <SwapDivider onPress={handleSwapDirection} />

          <SwapAmountBlock
            amount={resultAmountText}
            code={resultMeta.code}
            icon={resultMeta.icon}
            label="Cambio estimado"
            onCopyAmount={handleCopyResult}
            onCurrencySelect={handleResultCurrencySelect}
            options={resultOptions}
            resultCopied={resultCopied}
            selectedOptionId={resultSelectedOptionId}
            supportingDetails={conversionDetails}
            supportingFormula="Otros cambios"
            symbol={resultMeta.symbol}
          />
        </View>

        <View style={styles.rateMeta}>
          {ratesError ? (
            <AppText variant="tab" style={styles.errorText} numberOfLines={1}>
              {ratesError}
            </AppText>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getHistoryRateKey(rate: ExchangeRateHistoryOption, index: number) {
  return `${rate.updatedAt ?? "sin-fecha"}-${index}`;
}

function isFiniteRate(value?: number): value is number {
  return typeof value === "number" && Number.isFinite(value);
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
