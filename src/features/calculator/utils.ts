import { parseCurrencyAmount } from "@/features/exchange/utils";

import type { ExchangeRateId } from "./api/rates-api";
import { priceCurrencyMeta } from "./constants";
import type { ComparisonOption, ComparisonResult, PriceInputState } from "./types";

export function getComparisonOption(price: PriceInputState, ratesById: Map<ExchangeRateId, { value: number }>): ComparisonOption {
  const amount = parseCurrencyAmount(price.amount);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const customRate = parseCurrencyAmount(price.customRate);
  const safeCustomRate = Number.isFinite(customRate) && customRate > 0 ? customRate : 0;
  const rate = price.currencyId === "ves" ? 1 : price.currencyId === "custom" ? safeCustomRate : (ratesById.get(price.currencyId)?.value ?? 0);

  return {
    amount: safeAmount,
    currency: priceCurrencyMeta[price.currencyId],
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
