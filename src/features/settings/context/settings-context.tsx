import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AmountInputMode = "automatic" | "manual";

type SettingsState = {
  amountInputMode: AmountInputMode;
  setAmountInputMode: (mode: AmountInputMode) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      amountInputMode: "automatic",
      setAmountInputMode: (mode) => set({ amountInputMode: mode }),
    }),
    {
      name: "cambialy:settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ amountInputMode: state.amountInputMode }),
    },
  ),
);

/** Convenience alias matching the plan's hook name */
export const useSettings = useSettingsStore;
