import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

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
};

type ExchangeContextValue = ExchangeState & {
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
};

const ExchangeContext = createContext<ExchangeContextValue | null>(null);

export interface ExchangeProviderProps {
  children: ReactNode;
  initialState?: Partial<ExchangeState>;
}

export function ExchangeProvider({ children, initialState: initialStateProp }: ExchangeProviderProps) {
  const resolvedInitialState = useMemo(() => ({ ...defaultState, ...initialStateProp }), [initialStateProp]);

  const [state, setState] = useState<ExchangeState>(resolvedInitialState);

  const setInputAmount = useCallback((amount: string, displayAmount?: string) => {
    const sanitizedAmount = sanitizeAmountInput(amount);
    const nextDisplayAmount = displayAmount ?? getDisplayAmount(sanitizedAmount);
    setState((prev) => ({ ...prev, inputAmount: sanitizedAmount, inputAmountDisplay: nextDisplayAmount }));
  }, []);

  const setSelectedBaseRateId = useCallback((id: BaseRateId) => {
    setState((prev) => ({ ...prev, selectedBaseRateId: id }));
  }, []);

  const setSelectedTargetCurrencyId = useCallback((id: TargetCurrencyId) => {
    setState((prev) => ({ ...prev, selectedTargetCurrencyId: id }));
  }, []);

  const setCustomRate = useCallback((input: string) => {
    const sanitized = sanitizeAmountInput(input);
    const value = parseCurrencyAmount(sanitized);
    setState((prev) => ({
      ...prev,
      customRateInput: sanitized,
      customRateValue: Number.isFinite(value) && value > 0 ? value : 0,
    }));
  }, []);

  const toggleReverse = useCallback(() => {
    setState((prev) => ({ ...prev, isReversed: !prev.isReversed }));
  }, []);

  const resetExchange = useCallback(() => {
    setState(resolvedInitialState);
  }, [resolvedInitialState]);

  const value = useMemo(
    () => ({
      ...state,
      setInputAmount,
      setSelectedBaseRateId,
      setSelectedTargetCurrencyId,
      setCustomRate,
      toggleReverse,
      resetExchange,
    }),
    [state, setInputAmount, setSelectedBaseRateId, setSelectedTargetCurrencyId, setCustomRate, toggleReverse, resetExchange],
  );

  return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>;
}

export function useExchangeContext(): ExchangeContextValue {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error("useExchangeContext must be used within an ExchangeProvider");
  }

  return context;
}
