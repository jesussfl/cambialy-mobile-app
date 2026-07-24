import { useCallback } from "react";

import { QUICK_AMOUNTS, targetCurrencyInfo, VES_QUICK_AMOUNTS } from "../constants";
import type { CurrencyOption, TargetCurrencyId } from "../types";
import { useExchangeContext } from "../context/exchange-context";
import type { BaseRate, BaseRateId } from "./exchange-screen.types";

type UseExchangeInputParams = {
  selectedBaseRate: BaseRate;
  baseRateOptions: CurrencyOption[];
};

/**
 * Manages input state, direction toggle, currency/rate selection,
 * and user interaction handlers for the exchange form.
 */
export function useExchangeInput({ selectedBaseRate, baseRateOptions }: UseExchangeInputParams) {
  const {
    inputAmount,
    inputAmountDisplay,
    customRateInput,
    isReversed,
    setInputAmount,
    setSelectedBaseRateId,
    setSelectedTargetCurrencyId,
    setCustomRate,
    toggleReverse,
    selectedTargetCurrencyId,
  } = useExchangeContext();

  // --- Currency metadata (flips when reversed) ---

  const inputCurrency = isReversed ? targetCurrencyInfo[selectedTargetCurrencyId] : selectedBaseRate.info;
  const outputCurrency = isReversed ? selectedBaseRate.info : targetCurrencyInfo[selectedTargetCurrencyId];

  // --- Picker options (flips when reversed) ---

  const targetOptions = Object.values(targetCurrencyInfo);

  const inputOptions = isReversed ? targetOptions : baseRateOptions;
  const outputOptions = isReversed ? baseRateOptions : targetOptions;

  const inputSelectedOptionId = isReversed ? selectedTargetCurrencyId : selectedBaseRate.id;
  const outputSelectedOptionId = isReversed ? selectedBaseRate.id : selectedTargetCurrencyId;

  // --- Handlers ---

  const handleInputAmountChange = useCallback(
    (value: string) => setInputAmount(value),
    [setInputAmount],
  );

  const handleQuickAmountSelect = useCallback(
    (value: string) => {
      const num = Number(value);
      setInputAmount(Number.isFinite(num) ? num.toFixed(2) : value);
    },
    [setInputAmount],
  );

  const handleCustomRateChange = useCallback(
    (value: string) => setCustomRate(value),
    [setCustomRate],
  );

  const handleInputCurrencySelect = useCallback(
    (optionId: string) => {
      if (isReversed) {
        setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
      } else {
        setSelectedBaseRateId(optionId as BaseRateId);
      }
    },
    [isReversed, setSelectedTargetCurrencyId, setSelectedBaseRateId],
  );

  const handleOutputCurrencySelect = useCallback(
    (optionId: string) => {
      if (isReversed) {
        setSelectedBaseRateId(optionId as BaseRateId);
      } else {
        setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
      }
    },
    [isReversed, setSelectedBaseRateId, setSelectedTargetCurrencyId],
  );

  const handleSwapDirection = useCallback(
    (convertedAmount: number) => {
      if (convertedAmount > 0) {
        setInputAmount(convertedAmount.toFixed(2));
      }
      toggleReverse();
    },
    [setInputAmount, toggleReverse],
  );

  const quickAmounts = isReversed ? VES_QUICK_AMOUNTS : QUICK_AMOUNTS;

  return {
    inputAmount,
    inputAmountDisplay,
    customRateInput,
    inputCurrency,
    outputCurrency,
    inputOptions,
    outputOptions,
    inputSelectedOptionId,
    outputSelectedOptionId,
    quickAmounts,
    handleInputAmountChange,
    handleQuickAmountSelect,
    handleCustomRateChange,
    handleInputCurrencySelect,
    handleOutputCurrencySelect,
    handleSwapDirection,
  };
}
