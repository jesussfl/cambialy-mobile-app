import type { ReactNode } from "react";

import { useExchangeStore, type ExchangeState } from "../store/exchange-store";

type ExchangeActions = {
  setInputAmount: (amount: string, displayAmount?: string) => void;
  setSelectedBaseRateId: (id: ExchangeState["selectedBaseRateId"]) => void;
  setSelectedTargetCurrencyId: (id: ExchangeState["selectedTargetCurrencyId"]) => void;
  setCustomRate: (input: string) => void;
  toggleReverse: () => void;
  resetExchange: () => void;
};

export type ExchangeContextValue = ExchangeState & ExchangeActions;

export function useExchangeContext(): ExchangeContextValue {
  return useExchangeStore() as ExchangeContextValue;
}

export function useExchangeInputAmount() {
  return useExchangeStore((s) => s.inputAmount);
}

export function useExchangeInputAmountDisplay() {
  return useExchangeStore((s) => s.inputAmountDisplay);
}

export function useSelectedBaseRateId() {
  return useExchangeStore((s) => s.selectedBaseRateId);
}

export function useSelectedTargetCurrencyId() {
  return useExchangeStore((s) => s.selectedTargetCurrencyId);
}

export function useCustomRateInput() {
  return useExchangeStore((s) => s.customRateInput);
}

export function useCustomRateValue() {
  return useExchangeStore((s) => s.customRateValue);
}

export function useIsReversed() {
  return useExchangeStore((s) => s.isReversed);
}

export function useResetKey() {
  return useExchangeStore((s) => s.resetKey);
}

export function useSetInputAmount() {
  return useExchangeStore((s) => s.setInputAmount);
}

export function useSetSelectedBaseRateId() {
  return useExchangeStore((s) => s.setSelectedBaseRateId);
}

export function useSetSelectedTargetCurrencyId() {
  return useExchangeStore((s) => s.setSelectedTargetCurrencyId);
}

export function useSetCustomRate() {
  return useExchangeStore((s) => s.setCustomRate);
}

export function useToggleReverse() {
  return useExchangeStore((s) => s.toggleReverse);
}

export function useResetExchange() {
  return useExchangeStore((s) => s.resetExchange);
}

export interface ExchangeProviderProps {
  children: ReactNode;
}

export function ExchangeProvider({ children }: ExchangeProviderProps) {
  return children;
}

export type { ExchangeState } from "../store/exchange-store";
