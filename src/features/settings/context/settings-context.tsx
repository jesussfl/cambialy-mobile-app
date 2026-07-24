import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AmountInputMode = "automatic" | "manual";
export type DecimalSeparator = "comma" | "dot";

type SettingsState = {
  amountInputMode: AmountInputMode;
  decimalSeparator: DecimalSeparator;
  setAmountInputMode: (mode: AmountInputMode) => void;
  setDecimalSeparator: (separator: DecimalSeparator) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      amountInputMode: "automatic",
      decimalSeparator: "comma",
      setAmountInputMode: (mode) => set({ amountInputMode: mode }),
      setDecimalSeparator: (separator) => set({ decimalSeparator: separator }),
    }),
    {
      name: "cambialy:settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ amountInputMode: state.amountInputMode, decimalSeparator: state.decimalSeparator }),
    },
  ),
);

/** Convenience alias matching the plan's hook name */
export const useSettings = useSettingsStore;
