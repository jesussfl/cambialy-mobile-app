import { useState } from "react";

import { QUICK_AMOUNTS, targetCurrencyInfo } from "@/features/exchange/constants";
import type { ConversionDetail, TargetCurrencyId, TargetCurrencyOption } from "@/features/exchange/types";
import { formatCompactAmount, formatNumber, formatRate, getDisplayAmount, parseCurrencyAmount, sanitizeAmountInput } from "@/features/exchange/utils";

import { CUSTOM_RATE_ID, type BaseRateId } from "./exchange-screen.types";
import { useCopyResult } from "./use-copy-result";
import { useExchangeHistory } from "./use-exchange-history";
import { useExchangeRates } from "./use-exchange-rates";

export function useExchangeScreen() {
  const [inputAmount, setInputAmount] = useState("1");

  const [selectedBaseRateId, setSelectedBaseRateId] = useState<BaseRateId>("bcv");
  const [selectedTargetCurrency, setSelectedTargetCurrency] = useState<TargetCurrencyOption>(targetCurrencyInfo.ves);

  const [customRateInput, setCustomRateInput] = useState("");
  const [customRateValue, setCustomRateValue] = useState(0);
  const [isReversed, setIsReversed] = useState(false);

  const { rates, ratesById, errorMessage: ratesError, isFetching: isRatesFetching } = useExchangeRates(customRateValue);

  const selectedBaseRate = ratesById[selectedBaseRateId] ?? rates[rates.length - 1]!;

  const { historyPickerOptions, isHistoryFetching } = useExchangeHistory({
    selectedBaseRate,
    customRateValue,
    selectedBaseRateId: selectedBaseRate.id,
  });

  const bcvRate = ratesById.bcv.value;

  const inputMeta = isReversed ? selectedTargetCurrency : selectedBaseRate.info;
  const outputMeta = isReversed ? selectedBaseRate.info : selectedTargetCurrency;
  const baseRateOptions = rates.map((rate) => rate.info);
  const targetCurrencyOptions = Object.values(targetCurrencyInfo);
  const inputOptions = isReversed ? targetCurrencyOptions : baseRateOptions;
  const outputOptions = isReversed ? baseRateOptions : targetCurrencyOptions;
  const inputSelectedOptionId = isReversed ? selectedTargetCurrency.id : selectedBaseRate.id;
  const outputSelectedOptionId = isReversed ? selectedBaseRate.id : selectedTargetCurrency.id;
  const parsedAmount = parseCurrencyAmount(inputAmount);
  const safeAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const inputAmountInVes = isReversed
    ? selectedTargetCurrency.id === "ves"
      ? safeAmount
      : bcvRate > 0
        ? safeAmount * bcvRate
        : 0
    : safeAmount * selectedBaseRate.value;
  const convertedAmount = isReversed
    ? selectedBaseRate.value > 0
      ? inputAmountInVes / selectedBaseRate.value
      : 0
    : selectedTargetCurrency.id === "ves"
      ? inputAmountInVes
      : bcvRate > 0
        ? inputAmountInVes / bcvRate
        : 0;
  const selectedEquivalentValue =
    selectedTargetCurrency.id === "ves"
      ? selectedBaseRate.value > 0
        ? `${selectedTargetCurrency.symbol} ${formatNumber(selectedBaseRate.value)}`
        : "Sin datos"
      : bcvRate > 0
        ? `${formatNumber(selectedBaseRate.value / bcvRate)} ${selectedTargetCurrency.code}`
        : "Sin datos";
  const selectedBaseRateHint = `1 ${selectedBaseRate.info.code} equivale ${selectedEquivalentValue}`;
  const customRateHint = customRateValue > 0 ? selectedBaseRateHint : "Ingresa la tasa personalizada";
  const outputAmountText = formatCompactAmount(convertedAmount);
  const outputCopyText = `${outputMeta.symbol} ${outputAmountText} ${outputMeta.code}`;
  const { handleCopyResult: handleCopyOutput, resultCopied: outputCopied } = useCopyResult(outputCopyText);

  const conversionDetails = (): ConversionDetail[] => {
    if (isReversed) {
      return rates
        .filter((rate) => rate.id !== selectedBaseRate.id)
        .map((rate) => {
          const convertedValue = rate.value > 0 ? inputAmountInVes / rate.value : 0;
          const rateValue =
            selectedTargetCurrency.id === "ves"
              ? formatRate(rate.value)
              : bcvRate > 0
                ? `${formatNumber(rate.value / bcvRate)} ${selectedTargetCurrency.code}`
                : "Sin datos";

          return {
            amountText: `${rate.info.symbol} ${formatCompactAmount(convertedValue)}`,
            icon: rate.icon,
            id: rate.id,
            label: rate.info.code,
            rateText: `1 ${rate.info.code} = ${rateValue}`,
          };
        });
    }

    return rates
      .filter((rate) => rate.id !== selectedBaseRate.id)
      .map((rate) => {
        const convertedValue = selectedTargetCurrency.id === "ves" ? safeAmount * rate.value : bcvRate > 0 ? (safeAmount * rate.value) / bcvRate : 0;
        const rateValue =
          selectedTargetCurrency.id === "ves" ? formatRate(rate.value) : bcvRate > 0 ? `${formatNumber(rate.value / bcvRate)} BCV` : "Sin datos";

        return {
          amountText: `${selectedTargetCurrency.symbol} ${formatCompactAmount(convertedValue)}`,
          icon: rate.icon,
          id: rate.id,
          label: rate.info.code,
          rateText: `1 ${rate.info.code} = ${rateValue}`,
        };
      });
  };

  const handleInputAmountChange = (value: string) => {
    setInputAmount(sanitizeAmountInput(value));
  };

  const handleCustomRateChange = (value: string) => {
    const nextCustomRateInput = sanitizeAmountInput(value);
    const nextCustomRateValue = parseCurrencyAmount(nextCustomRateInput);

    setCustomRateInput(nextCustomRateInput);
    setCustomRateValue(Number.isFinite(nextCustomRateValue) && nextCustomRateValue > 0 ? nextCustomRateValue : 0);
  };

  const handleInputCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedTargetCurrency(targetCurrencyInfo[optionId as TargetCurrencyId]);
      return;
    }

    setSelectedBaseRateId(optionId as BaseRateId);
  };

  const handleOutputCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedBaseRateId(optionId as BaseRateId);
      return;
    }

    setSelectedTargetCurrency(targetCurrencyInfo[optionId as TargetCurrencyId]);
  };

  const handleSwapDirection = () => {
    setInputAmount(convertedAmount > 0 ? convertedAmount.toFixed(2).replace(/\.00$/, "") : "");
    setIsReversed((currentValue) => !currentValue);
  };

  return {
    inputAmountText: getDisplayAmount(inputAmount),
    conversionDetails,
    customRate: customRateInput,
    customRateHint,
    handleInputAmountChange,
    handleCopyOutput,
    handleCustomRateChange,
    handleOutputCurrencySelect,
    handleInputCurrencySelect,
    handleSwapDirection,
    historyPickerOptions,
    isHistoryFetching,
    isRatesFetching,
    quickAmounts: QUICK_AMOUNTS,
    ratesError,
    outputAmountText,
    outputCopied,
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
