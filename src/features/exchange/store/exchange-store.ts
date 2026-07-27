import { create } from "zustand";

import { useSettingsStore } from "@/features/settings/context/settings-context";
import type { BaseRateId } from "../hooks/exchange-screen.types";
import type { TargetCurrencyId } from "../types";
import { getDisplayAmount, parseCurrencyAmount, sanitizeAmountInput } from "../utils";

export type ExchangeState = {
  inputAmount: string;
  inputAmountDisplay: string;
  selectedBaseRateId: BaseRateId;
  selectedTargetCurrencyId: TargetCurrencyId;
  customRateInput: string;
  customRateValue: number;
  isReversed: boolean;
  resetKey: number;
};

type ExchangeActions = {
  setInputAmount: (amount: string, displayAmount?: string) => void;
  setSelectedBaseRateId: (id: BaseRateId) => void;
  setSelectedTargetCurrencyId: (id: TargetCurrencyId) => void;
  setCustomRate: (input: string) => void;
  toggleReverse: () => void;
  resetExchange: () => void;
};

const defaultState: ExchangeState = {
  inputAmount: "1.00",
  inputAmountDisplay: "1,00",
  selectedBaseRateId: "bcv",
  selectedTargetCurrencyId: "ves",
  customRateInput: "",
  customRateValue: 0,
  isReversed: false,
  resetKey: 0,
};

export const useExchangeStore = create<ExchangeState & ExchangeActions>()((set) => ({
  ...defaultState,

  setInputAmount: (amount, displayAmount) => {
    const { amountInputMode, decimalSeparator } = useSettingsStore.getState();
    const sanitizedAmount = sanitizeAmountInput(amount, amountInputMode);
    const nextDisplayAmount = displayAmount ?? getDisplayAmount(sanitizedAmount, amountInputMode, decimalSeparator);
    set({ inputAmount: sanitizedAmount, inputAmountDisplay: nextDisplayAmount });
  },

  setSelectedBaseRateId: (id) => set({ selectedBaseRateId: id }),

  setSelectedTargetCurrencyId: (id) => set({ selectedTargetCurrencyId: id }),

  setCustomRate: (input) => {
    const { amountInputMode } = useSettingsStore.getState();
    const sanitized = sanitizeAmountInput(input, amountInputMode);
    const value = parseCurrencyAmount(sanitized);
    set({
      customRateInput: sanitized,
      customRateValue: Number.isFinite(value) && value > 0 ? value : 0,
    });
  },

  toggleReverse: () => set((prev) => ({ isReversed: !prev.isReversed })),

  resetExchange: () => set((prev) => ({ ...defaultState, resetKey: prev.resetKey + 1 })),
}));

// Automatically update inputAmountDisplay whenever settings change
useSettingsStore.subscribe((settings) => {
  const { inputAmount } = useExchangeStore.getState();
  if (inputAmount) {
    const nextDisplay = getDisplayAmount(inputAmount, settings.amountInputMode, settings.decimalSeparator);
    useExchangeStore.setState({ inputAmountDisplay: nextDisplay });
  }
});

