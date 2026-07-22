import { customCurrencyInfo } from "../constants";
import { CUSTOM_RATE_ID, type BaseRate, type BaseRateId } from "./exchange-screen.types";
import { useExchangeHistory } from "./use-exchange-history";
import { useExchangeRates as useFetchRates } from "./use-exchange-rates";

/**
 * Builds the complete rates list (fetched rates + custom rate),
 * resolves the selected base rate, and fetches history options.
 */
export function useExchangeRatesList(selectedBaseRateId: BaseRateId, customRateValue: number) {
  const { baseRates, isFetching } = useFetchRates();

  // Append the user-defined custom rate at the end of the fetched rates
  const rates: BaseRate[] = [
    ...baseRates,
    { id: CUSTOM_RATE_ID, label: "Tasa personalizada", value: customRateValue, icon: customCurrencyInfo.icon, info: customCurrencyInfo },
  ];

  // Fall back to the last rate if the selected id is no longer valid
  const selectedBaseRate = rates.find((r) => r.id === selectedBaseRateId) ?? rates[rates.length - 1]!;

  const { historyPickerOptions } = useExchangeHistory({
    selectedBaseRate,
    customRateValue,
    selectedBaseRateId: selectedBaseRate.id,
  });

  return { rates, selectedBaseRate, historyPickerOptions, isRatesFetching: isFetching };
}
