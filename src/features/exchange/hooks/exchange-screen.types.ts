import type { ExchangeRate, ExchangeRateId } from "@/models/exchange.models";
import type { CurrencyOption } from "@/features/exchange/types";
import { CUSTOM_RATE_ID } from "@/features/exchange/constants";

export const LIVE_HISTORY_VALUE = "live";
export { CUSTOM_RATE_ID };

export type BaseRateId = ExchangeRateId | typeof CUSTOM_RATE_ID;
export type BaseRate = Omit<ExchangeRate, "id"> & {
  id: BaseRateId;
  info: CurrencyOption;
};
