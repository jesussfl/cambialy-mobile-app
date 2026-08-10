import type { AmountDraft } from "@/features/amount-input/model/types";
import type { CurrencyOption } from "@/features/exchange/types";

import type { ExchangeRateId } from "./api/rates-api";

export type PriceCurrencyId = ExchangeRateId | "ves" | "custom";

/** The two keypad-backed fields a price block owns. Each keeps its own independent entry state. */
export type PriceKeypadFieldId = "amount" | "customRate";

export type PriceInputState = {
  amount: AmountDraft;
  customRate: AmountDraft;
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

export type InputComparisonBlockProps = {
  label: string;
  currency: CurrencyOption;
  options: CurrencyOption[];
  selectedCurrencyId: PriceCurrencyId;
  onCurrencySelect: (currencyId: string) => void;
  /** Entry state for this block's two fields, owned by the screen. */
  drafts: Record<PriceKeypadFieldId, AmountDraft>;
  onDraftChange: (field: PriceKeypadFieldId, next: AmountDraft) => void;
  rate: number;
};

export type ComparisonSummaryProps = {
  firstOption: ComparisonOption;
  secondOption: ComparisonOption;
  result: ComparisonResult | null;
};
