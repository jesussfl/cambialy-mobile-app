import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";

import { createExchangeStore, type ExchangeStore } from "../store/exchange-store";

export const ExchangeContext = createContext<ReturnType<typeof createExchangeStore> | null>(null);

export interface ExchangeProviderProps {
  children: ReactNode;
  initialState?: Partial<ExchangeStore>;
}

export function ExchangeProvider({ children, initialState }: ExchangeProviderProps) {
  const [store] = useState(() => createExchangeStore(initialState));

  return <ExchangeContext.Provider value={store}>{children}</ExchangeContext.Provider>;
}

export function useExchangeContext<T>(selector: (state: ExchangeStore) => T): T {
  const store = useContext(ExchangeContext);
  if (!store) {
    throw new Error("useExchangeContext must be used within an ExchangeProvider");
  }

  return useStore(store, selector);
}
