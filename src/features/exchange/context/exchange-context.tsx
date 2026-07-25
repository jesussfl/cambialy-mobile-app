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

export interface ExchangeProviderProps {
  children: ReactNode;
}

export function ExchangeProvider({ children }: ExchangeProviderProps) {
  return children;
}

export type { ExchangeState } from "../store/exchange-store";
