import { QUICK_AMOUNTS, targetCurrencyInfo, VES_QUICK_AMOUNTS } from "../constants";
import type { CurrencyOption, TargetCurrencyId } from "../types";
import { useExchangeStore } from "../store/exchange-store";
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
  const inputAmount = useExchangeStore((s) => s.inputAmount);
  const inputAmountDisplay = useExchangeStore((s) => s.inputAmountDisplay);
  const customRateInput = useExchangeStore((s) => s.customRateInput);
  const isReversed = useExchangeStore((s) => s.isReversed);
  const setInputAmount = useExchangeStore((s) => s.setInputAmount);
  const setSelectedBaseRateId = useExchangeStore((s) => s.setSelectedBaseRateId);
  const setSelectedTargetCurrencyId = useExchangeStore((s) => s.setSelectedTargetCurrencyId);
  const setCustomRate = useExchangeStore((s) => s.setCustomRate);
  const toggleReverse = useExchangeStore((s) => s.toggleReverse);
  const selectedTargetCurrencyId = useExchangeStore((s) => s.selectedTargetCurrencyId);

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

  const handleInputAmountChange = (value: string) => setInputAmount(value);

  const handleQuickAmountSelect = (value: string) => {
    const num = Number(value);
    setInputAmount(Number.isFinite(num) ? num.toFixed(2) : value);
  };

  const handleCustomRateChange = (value: string) => setCustomRate(value);

  const handleInputCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
    } else {
      setSelectedBaseRateId(optionId as BaseRateId);
    }
  };

  const handleOutputCurrencySelect = (optionId: string) => {
    if (isReversed) {
      setSelectedBaseRateId(optionId as BaseRateId);
    } else {
      setSelectedTargetCurrencyId(optionId as TargetCurrencyId);
    }
  };

  const handleSwapDirection = (convertedAmount: number) => {
    if (convertedAmount > 0) {
      setInputAmount(convertedAmount.toFixed(2));
    }
    toggleReverse();
  };

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
