import type { CurrencyOption } from "@/features/exchange/types";

import type { ExchangeRateId } from "./api/rates-api";

export type PriceCurrencyId = ExchangeRateId | "ves" | "custom";
export type PriceSide = "first" | "second";

export type PriceInputState = {
  amount: string;
  customRate: string;
  currencyId: PriceCurrencyId;
};

export type ComparisonOption = {
  amount: number;
  currency: CurrencyOption;
  rate: number;
  valueInVes: number;
};

export type ComparisonResult = {
  betterSide: "first" | "second" | null;
  differenceVes: number;
  isEquivalent: boolean;
  savingPercent: number;
  cheaperValue: number;
};

export type PriceComparisonBlockProps = {
  amount: string;
  currency: CurrencyOption;
  customRate: string;
  label: string;
  onAmountChange: (value: string) => void;
  onCustomRateChange: (value: string) => void;
  onCurrencySelect: (currencyId: string) => void;
  options: CurrencyOption[];
  rate: number;
  selectedCurrencyId: PriceCurrencyId;
  valueInVes: number;
};

export type ComparisonSummaryProps = {
  firstOption: ComparisonOption;
  secondOption: ComparisonOption;
  result: ComparisonResult | null;
};

export type SummaryMetricProps = {
  isActive: boolean;
  label: string;
  value: string;
};
