import { createStore } from "zustand";

import type { BaseRateId } from "../hooks/exchange-screen.types";
import type { TargetCurrencyId } from "../types";
import { getDisplayAmount, parseCurrencyAmount, sanitizeAmountInput } from "../utils";

export interface ExchangeState {
  inputAmount: string;
  inputAmountDisplay: string;
  selectedBaseRateId: BaseRateId;
  selectedTargetCurrencyId: TargetCurrencyId;
  customRateInput: string;
  customRateValue: number;
  isReversed: boolean;
}

export interface ExchangeActions {
  setInputAmount: (amount: string, displayAmount?: string) => void;
  setSelectedBaseRateId: (id: BaseRateId) => void;
  setSelectedTargetCurrencyId: (id: TargetCurrencyId) => void;
  setCustomRate: (input: string) => void;
  toggleReverse: () => void;
  setReverse: (isReversed: boolean) => void;
  resetExchange: () => void;
}

export type ExchangeStore = ExchangeState & ExchangeActions;

const initialExchangeState: ExchangeState = {
  inputAmount: "1",
  inputAmountDisplay: "1",
  selectedBaseRateId: "bcv",
  selectedTargetCurrencyId: "ves",
  customRateInput: "",
  customRateValue: 0,
  isReversed: false,
};

export const createExchangeStore = (initialState: Partial<ExchangeState> = {}) => {
  const resolvedInitialState = {
    ...initialExchangeState,
    ...initialState,
  };

  return createStore<ExchangeStore>((set) => ({
    ...resolvedInitialState,

    setInputAmount: (amount, displayAmount) => {
      const sanitizedAmount = sanitizeAmountInput(amount);
      const nextDisplayAmount = displayAmount ?? getDisplayAmount(sanitizedAmount);

      set({ inputAmount: sanitizedAmount, inputAmountDisplay: nextDisplayAmount });
    },
    setSelectedBaseRateId: (id) => set({ selectedBaseRateId: id }),
    setSelectedTargetCurrencyId: (id) => set({ selectedTargetCurrencyId: id }),
    setCustomRate: (input) => {
      const sanitized = sanitizeAmountInput(input);
      const value = parseCurrencyAmount(sanitized);
      set({
        customRateInput: sanitized,
        customRateValue: Number.isFinite(value) && value > 0 ? value : 0,
      });
    },
    toggleReverse: () => set((state) => ({ isReversed: !state.isReversed })),
    setReverse: (isReversed) => set({ isReversed }),
    resetExchange: () => set(resolvedInitialState),
  }));
};
