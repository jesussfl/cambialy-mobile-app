import { useCallback, useMemo } from "react";

import {
  customCurrencyInfo,
  QUICK_AMOUNTS,
  targetCurrencyInfo,
  VES_QUICK_AMOUNTS,
} from "@/features/exchange/constants";
import type { ConversionDetail, TargetCurrencyId } from "@/features/exchange/types";
import {
  formatCompactAmount,
  formatExchangeRate,
  fromVes,
  getCurrencyRate,
  getDisplayAmount,
  normalizeAmountInputChange,
  parseCurrencyAmount,
  toVes,
} from "@/features/exchange/utils";

import { useExchangeContext } from "../context/exchange-context";
import { CUSTOM_RATE_ID, type BaseRate, type BaseRateId } from "./exchange-screen.types";
import { useExchangeHistory } from "./use-exchange-history";
import { useExchangeRates } from "./use-exchange-rates";

export function useExchangeScreen() {
  const {
    inputAmount,
    selectedBaseRateId,
    selectedTargetCurrencyId,
    customRateInput,
    customRateValue,
    isReversed,
    setInputAmount,
    setSelectedBaseRateId,
    setSelectedTargetCurrencyId,
    setCustomRate,
    toggleReverse,
    resetExchange,
  } = useExchangeContext((state) => state);

  const selectedTargetCurrency = useMemo(() => targetCurrencyInfo[selectedTargetCurrencyId], [selectedTargetCurrencyId]);

  const { baseRates = [], errorMessage: ratesError, isFetching: isRatesFetching } = useExchangeRates();

  const rates = useMemo<BaseRate[]>(() => {
    const customBaseRate: BaseRate = {
      id: CUSTOM_RATE_ID,
      label: "Tasa personalizada",
      value: customRateValue,
      icon: customCurrencyInfo.icon,
      info: customCurrencyInfo,
    };
    return [...baseRates, customBaseRate];
  }, [baseRates, customRateValue]);

  const ratesById = useMemo<Record<BaseRateId, BaseRate>>(() => {
    return rates.reduce(
      (ratesIndex, rate) => ({
        ...ratesIndex,
        [rate.id]: rate,
      }),
      {} as Record<BaseRateId, BaseRate>,
    );
  }, [rates]);

  const selectedBaseRate = useMemo(() => ratesById[selectedBaseRateId] ?? rates[rates.length - 1]!, [ratesById, selectedBaseRateId, rates]);

  const { historyPickerOptions, isHistoryFetching } = useExchangeHistory({
    selectedBaseRate,
    customRateValue,
    selectedBaseRateId: selectedBaseRate.id,
  });

  const bcvRate = useMemo(() => ratesById.bcv?.value ?? 0, [ratesById]);
  const targetCurrencyRate = useMemo(() => getCurrencyRate(selectedTargetCurrency.id, bcvRate), [selectedTargetCurrency.id, bcvRate]);

  const inputMeta = useMemo(() => (isReversed ? selectedTargetCurrency : selectedBaseRate.info), [isReversed, selectedTargetCurrency, selectedBaseRate]);
  const outputMeta = useMemo(() => (isReversed ? selectedBaseRate.info : selectedTargetCurrency), [isReversed, selectedBaseRate, selectedTargetCurrency]);

  const baseRateOptions = useMemo(() => rates.map((rate) => rate.info), [rates]);

  const targetCurrencyOptions = useMemo(() => Object.values(targetCurrencyInfo), []);

  const inputOptions = useMemo(() => (isReversed ? targetCurrencyOptions : baseRateOptions), [isReversed, targetCurrencyOptions, baseRateOptions]);
  const outputOptions = useMemo(() => (isReversed ? baseRateOptions : targetCurrencyOptions), [isReversed, baseRateOptions, targetCurrencyOptions]);

  const inputSelectedOptionId = useMemo(() => (isReversed ? selectedTargetCurrency.id : selectedBaseRate.id), [isReversed, selectedTargetCurrency, selectedBaseRate]);
  const outputSelectedOptionId = useMemo(() => (isReversed ? selectedBaseRate.id : selectedTargetCurrency.id), [isReversed, selectedBaseRate, selectedTargetCurrency]);

  const parsedAmount = useMemo(() => parseCurrencyAmount(inputAmount), [inputAmount]);
  const safeAmount = useMemo(() => (Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0), [parsedAmount]);

  const inputRate = useMemo(() => (isReversed ? targetCurrencyRate : selectedBaseRate.value), [isReversed, targetCurrencyRate, selectedBaseRate.value]);
  const outputRate = useMemo(() => (isReversed ? selectedBaseRate.value : targetCurrencyRate), [isReversed, selectedBaseRate.value, targetCurrencyRate]);

  const inputAmountInVes = useMemo(() => toVes(safeAmount, inputRate), [safeAmount, inputRate]);
  const convertedAmount = useMemo(() => fromVes(inputAmountInVes, outputRate), [inputAmountInVes, outputRate]);

  const selectedEquivalentValue = useMemo(() => formatExchangeRate(selectedBaseRate.value, selectedTargetCurrency, bcvRate), [selectedBaseRate.value, selectedTargetCurrency, bcvRate]);
  const selectedBaseRateHint = useMemo(() => `1 ${selectedBaseRate.info.code} equivale ${selectedEquivalentValue}`, [selectedBaseRate.info.code, selectedEquivalentValue]);
  const customRateHint = useMemo(() => (customRateValue > 0 ? selectedBaseRateHint : "Ingresa la tasa personalizada"), [customRateValue, selectedBaseRateHint]);
  const outputAmountText = useMemo(() => formatCompactAmount(convertedAmount), [convertedAmount]);
  const outputCopyText = useMemo(() => `${outputMeta.symbol} ${outputAmountText} ${outputMeta.code}`, [outputMeta.symbol, outputAmountText, outputMeta.code]);

  const conversionDetails = useMemo<ConversionDetail[]>(() => {
    if (isReversed) {
      return rates
        .filter((rate) => rate.id !== selectedBaseRate.id)
        .map((rate) => {
          const convertedValue = fromVes(inputAmountInVes, rate.value);
          const rateValue = formatExchangeRate(rate.value, selectedTargetCurrency, bcvRate);

          return {
            amountText: `${rate.info.symbol} ${formatCompactAmount(convertedValue)}`,
            icon: rate.icon,
            id: rate.id,
            label: rate.info.code,
            rateText: `${rateValue}`,
          };
        });
    }

    return rates
      .filter((rate) => rate.id !== selectedBaseRate.id)
      .map((rate) => {
        const itemAmountInVes = toVes(safeAmount, rate.value);
        const convertedValue = fromVes(itemAmountInVes, targetCurrencyRate);
        const rateValue = formatExchangeRate(rate.value, selectedTargetCurrency, bcvRate);

        return {
          amountText: `${selectedTargetCurrency.symbol} ${formatCompactAmount(convertedValue)}`,
          icon: rate.icon,
          id: rate.id,
          label: rate.info.code,
          rateText: `${rateValue}`,
        };
      });
  }, [
    isReversed,
    rates,
    selectedBaseRate.id,
    selectedTargetCurrency,
    bcvRate,
    inputAmountInVes,
    safeAmount,
    targetCurrencyRate,
  ]);

  const handleInputAmountChange = useCallback((value: string) => {
    setInputAmount(normalizeAmountInputChange(value, ""));
  }, [setInputAmount]);

  const handleQuickAmountSelect = useCallback((value: string) => {
    const num = Number(value);
    setInputAmount(Number.isFinite(num) ? num.toFixed(2) : value);
  }, [setInputAmount]);

  const handleCustomRateChange = useCallback((value: string) => {
    setCustomRate(value);
  }, [setCustomRate]);

  const handleInputCurrencySelect = useCallback((optionId: string) => {
    if (isReversed) {
      setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
      return;
    }

    setSelectedBaseRateId(optionId as BaseRateId);
  }, [isReversed, setSelectedTargetCurrencyId, setSelectedBaseRateId]);

  const handleOutputCurrencySelect = useCallback((optionId: string) => {
    if (isReversed) {
      setSelectedBaseRateId(optionId as BaseRateId);
      return;
    }

    setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
  }, [isReversed, setSelectedBaseRateId, setSelectedTargetCurrencyId]);

  const handleSwapDirection = useCallback(() => {
    if (convertedAmount > 0) {
      setInputAmount(convertedAmount.toFixed(2));
    }
    toggleReverse();
  }, [convertedAmount, setInputAmount, toggleReverse]);

  const quickAmounts = useMemo(() => (isReversed ? VES_QUICK_AMOUNTS : QUICK_AMOUNTS), [isReversed]);

  return {
    inputAmountText: getDisplayAmount(inputAmount),
    conversionDetails,
    customRate: customRateInput,
    customRateHint,
    handleInputAmountChange,
    handleQuickAmountSelect,
    handleCustomRateChange,
    handleOutputCurrencySelect,
    handleInputCurrencySelect,
    handleSwapDirection,
    resetExchange,
    historyPickerOptions,
    isHistoryFetching,
    isRatesFetching,
    quickAmounts,
    ratesError,
    outputAmountText,
    outputCopyText,
    outputMeta,
    outputOptions,
    outputSelectedOptionId,
    selectedBaseRate,
    selectedBaseRateHint,
    setInputAmount,
    showOutputCustomRateInput: outputSelectedOptionId === CUSTOM_RATE_ID,
    showInputCustomRateInput: inputSelectedOptionId === CUSTOM_RATE_ID,
    inputMeta,
    inputOptions,
    inputSelectedOptionId,
  };
}
