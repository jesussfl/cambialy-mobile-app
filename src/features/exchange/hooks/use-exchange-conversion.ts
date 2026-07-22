import { targetCurrencyInfo } from "../constants";
import type { ConversionDetail, TargetCurrencyId } from "../types";
import { formatCompactAmount, formatExchangeRate, fromVes, getCurrencyRate, parseCurrencyAmount, toVes } from "../utils";
import type { BaseRate } from "./exchange-screen.types";

type ConversionParams = {
  inputAmount: string;
  isReversed: boolean;
  rates: BaseRate[];
  selectedBaseRate: BaseRate;
  selectedTargetCurrencyId: TargetCurrencyId;
  customRateValue: number;
};

/**
 * Pure conversion logic: parses the input amount, computes the converted
 * value in both directions, and builds the comparison details for other rates.
 */
export function useExchangeConversion({
  inputAmount,
  isReversed,
  rates,
  selectedBaseRate,
  selectedTargetCurrencyId,
  customRateValue,
}: ConversionParams) {
  const targetCurrency = targetCurrencyInfo[selectedTargetCurrencyId];
  const bcvRate = rates.find((r) => r.id === "bcv")?.value ?? 0;
  const targetCurrencyRate = getCurrencyRate(targetCurrency.id, bcvRate);

  const amount = parseCurrencyAmount(inputAmount);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  // Input/output rates flip based on direction
  const inputRate = isReversed ? targetCurrencyRate : selectedBaseRate.value;
  const outputRate = isReversed ? selectedBaseRate.value : targetCurrencyRate;

  // Core conversion: input → VES → output currency
  const inputAmountInVes = toVes(safeAmount, inputRate);
  const convertedAmount = fromVes(inputAmountInVes, outputRate);

  // Formatted display values
  const selectedEquivalentValue = formatExchangeRate(selectedBaseRate.value, targetCurrency, bcvRate);
  const selectedBaseRateHint = `1 ${selectedBaseRate.info.code} equivale ${selectedEquivalentValue}`;
  const customRateHint = customRateValue > 0 ? selectedBaseRateHint : "Ingresa la tasa personalizada";
  const outputAmountText = formatCompactAmount(convertedAmount);
  const outputCopyText = `${targetCurrency.symbol} ${outputAmountText} ${targetCurrency.code}`;

  // Comparison: show what each other rate would produce
  const conversionDetails = buildConversionDetails({
    rates,
    selectedBaseRateId: selectedBaseRate.id,
    targetCurrency,
    bcvRate,
    inputAmountInVes,
    safeAmount,
    targetCurrencyRate,
    isReversed,
  });

  return {
    convertedAmount,
    conversionDetails,
    outputAmountText,
    outputCopyText,
    selectedBaseRateHint,
    customRateHint,
  };
}

type DetailParams = {
  rates: BaseRate[];
  selectedBaseRateId: string;
  targetCurrency: (typeof targetCurrencyInfo)[TargetCurrencyId];
  bcvRate: number;
  inputAmountInVes: number;
  safeAmount: number;
  targetCurrencyRate: number;
  isReversed: boolean;
};

/** Maps each non-selected rate into a comparison row */
function buildConversionDetails({
  rates,
  selectedBaseRateId,
  targetCurrency,
  bcvRate,
  inputAmountInVes,
  safeAmount,
  targetCurrencyRate,
  isReversed,
}: DetailParams): ConversionDetail[] {
  return rates
    .filter((rate) => rate.id !== selectedBaseRateId)
    .map((rate) => {
      // When reversed: convert the same VES amount using each rate
      // When normal: convert the input amount through each rate's own VES path
      const convertedValue = isReversed
        ? fromVes(inputAmountInVes, rate.value)
        : fromVes(toVes(safeAmount, rate.value), targetCurrencyRate);

      const rateValue = formatExchangeRate(rate.value, targetCurrency, bcvRate);

      return {
        amountText: `${rate.info.symbol} ${formatCompactAmount(convertedValue)}`,
        icon: rate.icon,
        id: rate.id,
        label: rate.info.code,
        rateText: `${rateValue}`,
      };
    });
}
