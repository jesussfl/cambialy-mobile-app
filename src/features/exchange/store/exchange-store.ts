import { create } from "zustand";

import { draftFromValue, toDisplay, toNumber } from "@/features/amount-input/model/amount-draft";
import { AMOUNT_PRECISION, RATE_PRECISION } from "@/features/amount-input/model/constants";
import { EMPTY_DRAFT, type AmountDraft, type KeypadConfig } from "@/features/amount-input/model/types";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import type { BaseRateId } from "../hooks/exchange-screen.types";
import type { TargetCurrencyId } from "../types";

export type ExchangeState = {
  /** Source of truth for the amount field. Everything below is derived from it. */
  amountDraft: AmountDraft;
  /** Source of truth for the custom-rate field. */
  customRateDraft: AmountDraft;

  // --- Derived mirrors. Never assigned directly; see `project`. ---
  inputAmount: string;
  inputAmountDisplay: string;
  amountValue: number;
  customRateInput: string;
  customRateValue: number;

  selectedBaseRateId: BaseRateId;
  selectedTargetCurrencyId: TargetCurrencyId;
  selectedDate: string | null;
  isReversed: boolean;
};

type ExchangeActions = {
  setAmountDraft: (draft: AmountDraft) => void;
  setCustomRateDraft: (draft: AmountDraft) => void;
  /** For amounts arriving from outside the keypad: quick-amount pills, paste, direction swap. */
  setAmountValue: (value: number) => void;
  setSelectedBaseRateId: (id: BaseRateId) => void;
  setSelectedTargetCurrencyId: (id: TargetCurrencyId) => void;
  setSelectedDate: (date: string | null) => void;
  toggleReverse: () => void;
  resetExchange: () => void;
};

type KeypadConfigs = { amount: KeypadConfig; rate: KeypadConfig };

function currentConfigs(): KeypadConfigs {
  const { amountInputMode: mode, decimalSeparator } = useSettingsStore.getState();
  return {
    amount: { mode, decimalSeparator, precision: AMOUNT_PRECISION },
    rate: { mode, decimalSeparator, precision: RATE_PRECISION },
  };
}

type ProjectedInput = Pick<
  ExchangeState,
  "amountDraft" | "customRateDraft" | "inputAmount" | "inputAmountDisplay" | "amountValue" | "customRateInput" | "customRateValue"
>;

/**
 * The single writer for everything derived from the drafts.
 *
 * The store previously kept `inputAmount` and `inputAmountDisplay` as two independently assigned
 * values, which meant any action could update one and leave the other stale. Routing every write
 * through here makes that impossible: the drafts are the only input, and all five mirrors are
 * recomputed together.
 */
function project(amountDraft: AmountDraft, customRateDraft: AmountDraft): ProjectedInput {
  const configs = currentConfigs();

  const amountValue = toNumber(amountDraft, configs.amount) ?? 0;
  const rateValue = toNumber(customRateDraft, configs.rate) ?? 0;

  return {
    amountDraft,
    customRateDraft,
    amountValue,
    inputAmount: amountDraft.buffer ? String(amountValue) : "",
    inputAmountDisplay: toDisplay(amountDraft, configs.amount),
    customRateInput: customRateDraft.buffer ? String(rateValue) : "",
    customRateValue: rateValue > 0 ? rateValue : 0,
  };
}

function makeDefaultState(): ExchangeState {
  return {
    ...project(draftFromValue(1, currentConfigs().amount), EMPTY_DRAFT),
    selectedBaseRateId: "bcv",
    selectedTargetCurrencyId: "ves",
    selectedDate: null,
    isReversed: false,
  };
}

export const useExchangeStore = create<ExchangeState & ExchangeActions>()((set) => ({
  ...makeDefaultState(),

  setAmountDraft: (draft) => set((prev) => project(draft, prev.customRateDraft)),

  setCustomRateDraft: (draft) => set((prev) => project(prev.amountDraft, draft)),

  setAmountValue: (value) => set((prev) => project(draftFromValue(value, currentConfigs().amount), prev.customRateDraft)),

  setSelectedBaseRateId: (id) => set({ selectedBaseRateId: id }),

  setSelectedTargetCurrencyId: (id) => set({ selectedTargetCurrencyId: id }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  toggleReverse: () => set((prev) => ({ isReversed: !prev.isReversed })),

  // Clearing the drafts clears the fields outright, so the block no longer has to be remounted through
  // a changing `key` to discard entry state it kept locally.
  resetExchange: () => set(makeDefaultState()),
}));
