import { createStore } from "zustand";

import type { TargetCurrencyId } from "../types";
import type { BaseRateId } from "../hooks/exchange-screen.types";
import { parseCurrencyAmount, sanitizeAmountInput } from "../utils";

export interface ExchangeState {
  inputAmount: string;
  selectedBaseRateId: BaseRateId;
  selectedTargetCurrencyId: TargetCurrencyId;
  customRateInput: string;
  customRateValue: number;
  isReversed: boolean;
}

export interface ExchangeActions {
  setInputAmount: (amount: string) => void;
  setSelectedBaseRateId: (id: BaseRateId) => void;
  setSelectedTargetCurrencyId: (id: TargetCurrencyId) => void;
  setCustomRate: (input: string) => void;
  toggleReverse: () => void;
  setReverse: (isReversed: boolean) => void;
}

export type ExchangeStore = ExchangeState & ExchangeActions;

export const createExchangeStore = (initialState: Partial<ExchangeState> = {}) => {
  return createStore<ExchangeStore>((set) => ({
    inputAmount: "1",
    selectedBaseRateId: "bcv",
    selectedTargetCurrencyId: "ves",
    customRateInput: "",
    customRateValue: 0,
    isReversed: false,
    ...initialState,

    setInputAmount: (amount) => set({ inputAmount: sanitizeAmountInput(amount) }),
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
  }));
};
