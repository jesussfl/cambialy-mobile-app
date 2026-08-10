import type { ExchangeRateId } from "./api/rates-api";
import { priceCurrencyMeta } from "./constants";
import type { ComparisonOption, ComparisonResult, PriceCurrencyId } from "./types";

/**
 * The already-interpreted inputs for one price.
 *
 * These arrive as numbers, read once from the entry drafts under the user's active entry mode. This
 * function used to re-parse the raw strings itself with a defaulted mode, which read a manual-mode
 * user's `"25"` as `0.25` — a hundredfold error in a price comparison.
 */
export type ComparisonInput = {
  amount: number;
  customRate: number;
  currencyId: PriceCurrencyId;
};

export function getComparisonOption(input: ComparisonInput, ratesById: Map<ExchangeRateId, { value: number }>): ComparisonOption {
  const safeAmount = Number.isFinite(input.amount) && input.amount > 0 ? input.amount : 0;
  const safeCustomRate = Number.isFinite(input.customRate) && input.customRate > 0 ? input.customRate : 0;
  const rate =
    input.currencyId === "ves" ? 1 : input.currencyId === "custom" ? safeCustomRate : (ratesById.get(input.currencyId)?.value ?? 0);

  return {
    amount: safeAmount,
    currency: priceCurrencyMeta[input.currencyId],
    rate,
    valueInVes: safeAmount > 0 && rate > 0 ? safeAmount * rate : 0,
  };
}

export function getComparisonResult(firstOption: ComparisonOption, secondOption: ComparisonOption): ComparisonResult | null {
  if (firstOption.valueInVes <= 0 || secondOption.valueInVes <= 0) {
    return null;
  }

  const differenceVes = Math.abs(firstOption.valueInVes - secondOption.valueInVes);
  const isEquivalent = differenceVes < 0.01;
  const betterSide = isEquivalent ? null : firstOption.valueInVes < secondOption.valueInVes ? "first" : "second";
  const cheaperValue = betterSide === "first" ? firstOption.valueInVes : secondOption.valueInVes;
  const expensiveValue = betterSide === "first" ? secondOption.valueInVes : firstOption.valueInVes;
  const savingPercent = betterSide && expensiveValue > 0 ? (differenceVes / expensiveValue) * 100 : 0;

  return {
    betterSide,
    differenceVes,
    isEquivalent,
    savingPercent,
    cheaperValue,
  };
}
