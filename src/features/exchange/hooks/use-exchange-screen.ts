import { QUICK_AMOUNTS, targetCurrencyInfo } from "@/features/exchange/constants";
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
import { CUSTOM_RATE_ID, type BaseRateId } from "./exchange-screen.types";
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

  const selectedTargetCurrency = targetCurrencyInfo[selectedTargetCurrencyId];

  const { rates, ratesById, errorMessage: ratesError, isFetching: isRatesFetching } = useExchangeRates(customRateValue);

  const selectedBaseRate = ratesById[selectedBaseRateId] ?? rates[rates.length - 1]!;

  const { historyPickerOptions, isHistoryFetching } = useExchangeHistory({
    selectedBaseRate,
    customRateValue,
    selectedBaseRateId: selectedBaseRate.id,
  });

  const bcvRate = ratesById.bcv.value;
  const targetCurrencyRate = getCurrencyRate(selectedTargetCurrency.id, bcvRate);

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

  const inputRate = isReversed ? targetCurrencyRate : selectedBaseRate.value;
  const outputRate = isReversed ? selectedBaseRate.value : targetCurrencyRate;

  const inputAmountInVes = toVes(safeAmount, inputRate);
  const convertedAmount = fromVes(inputAmountInVes, outputRate);

  const selectedEquivalentValue = formatExchangeRate(selectedBaseRate.value, selectedTargetCurrency, bcvRate);
  const selectedBaseRateHint = `1 ${selectedBaseRate.info.code} equivale ${selectedEquivalentValue}`;
  const customRateHint = customRateValue > 0 ? selectedBaseRateHint : "Ingresa la tasa personalizada";
  const outputAmountText = formatCompactAmount(convertedAmount);
  const outputCopyText = `${outputMeta.symbol} ${outputAmountText} ${outputMeta.code}`;

  const conversionDetails = (): ConversionDetail[] => {
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
            rateText: `1 ${rate.info.code} = ${rateValue}`,
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
          rateText: `1 ${rate.info.code} = ${rateValue}`,
        };
      });
  };

  const handleInputAmountChange = (value: string) => {
    setInputAmount(normalizeAmountInputChange(value, inputAmount));
  };

  const handleCustomRateChange = (value: string) => {
    setCustomRate(value);
  };

  const handleInputCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
      return;
    }

    setSelectedBaseRateId(optionId as BaseRateId);
  };

  const handleOutputCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedBaseRateId(optionId as BaseRateId);
      return;
    }

    setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
  };

  const handleSwapDirection = () => {
    if (convertedAmount > 0) {
      setInputAmount(convertedAmount.toFixed(2).replace(/\.00$/, ""));
    }
    toggleReverse();
  };

  return {
    inputAmountText: getDisplayAmount(inputAmount),
    conversionDetails,
    customRate: customRateInput,
    customRateHint,
    handleInputAmountChange,
    handleCustomRateChange,
    handleOutputCurrencySelect,
    handleInputCurrencySelect,
    handleSwapDirection,
    resetExchange,
    historyPickerOptions,
    isHistoryFetching,
    isRatesFetching,
    quickAmounts: QUICK_AMOUNTS,
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
