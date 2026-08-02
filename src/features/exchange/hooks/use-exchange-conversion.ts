import { useSettingsStore } from "@/features/settings/context/settings-context";
import { targetCurrencyInfo } from "../constants";
import type { ConversionDetail, TargetCurrencyId } from "../types";
import { formatCompactAmount, formatConversionRateLabel, convertVesToCurrency, getRateRelativeToVes, parseLocalizedAmountToNumber, convertCurrencyToVes } from "../utils";
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
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);
  const targetCurrency = targetCurrencyInfo[selectedTargetCurrencyId];
  const bcvRate = rates.find((r) => r.id === "bcv")?.value ?? 0;
  const targetCurrencyRate = getRateRelativeToVes(targetCurrency.id, bcvRate);

  const amount = parseLocalizedAmountToNumber(inputAmount);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  // Input/output rates flip based on direction
  const inputRate = isReversed ? targetCurrencyRate : selectedBaseRate.value;
  const outputRate = isReversed ? selectedBaseRate.value : targetCurrencyRate;

  // Core conversion: input → VES → output currency
  const inputAmountInVes = convertCurrencyToVes(safeAmount, inputRate);
  const convertedAmount = convertVesToCurrency(inputAmountInVes, outputRate);

  // Formatted display values
  const selectedEquivalentValue = formatConversionRateLabel(selectedBaseRate.value, targetCurrency, bcvRate, decimalSeparator);
  const selectedBaseRateHint = `1 ${selectedBaseRate.info.code} equivale ${selectedEquivalentValue}`;
  const customRateHint = customRateValue > 0 ? selectedBaseRateHint : "Ingresa la tasa personalizada";
  const outputCurrency = isReversed ? selectedBaseRate.info : targetCurrency;
  const outputAmountText = formatCompactAmount(convertedAmount, decimalSeparator);
  const outputCopyText = `${outputCurrency.symbol} ${outputAmountText} ${outputCurrency.code}`;

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
    decimalSeparator,
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
  decimalSeparator: import("@/features/settings/context/settings-context").DecimalSeparator;
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
  decimalSeparator,
}: DetailParams): ConversionDetail[] {
  return rates
    .filter((rate) => rate.id !== selectedBaseRateId)
    .map((rate) => {
      // When reversed: convert the same VES amount using each rate
      // When normal: convert the input amount through each rate's own VES path
      const convertedValue = isReversed
        ? convertVesToCurrency(inputAmountInVes, rate.value)
        : convertVesToCurrency(convertCurrencyToVes(safeAmount, rate.value), targetCurrencyRate);

      const rateValue = formatConversionRateLabel(rate.value, targetCurrency, bcvRate, decimalSeparator);
      const displaySymbol = isReversed ? rate.info.symbol : targetCurrency.symbol;

      return {
        amountText: `${displaySymbol} ${formatCompactAmount(convertedValue, decimalSeparator)}`,
        icon: rate.icon,
        id: rate.id,
        label: rate.info.code,
        rateText: `${rateValue}`,
      };
    });
}

